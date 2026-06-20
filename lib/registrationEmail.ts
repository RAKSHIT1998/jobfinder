import { fetchAllJobs } from "./jobSources";
import { rankJobs, type CVProfile } from "./matching";
import { generateText } from "./anthropic";
import { sendMail } from "./mailer";

const SHORTLIST_SIZE = 5;

interface ShortlistedJob {
  title: string;
  company: string;
  location: string;
  url: string;
  match: number;
}

// Real, code-rendered postings only - the AI writes the greeting copy, never
// the job list itself, so nothing in the email can be a hallucinated company.
async function getShortlist(cv: CVProfile): Promise<ShortlistedJob[]> {
  try {
    const jobs = await fetchAllJobs();
    const ranked = await rankJobs(cv, jobs);
    return ranked
      .slice(0, SHORTLIST_SIZE)
      .map((j) => ({ title: j.title, company: j.company, location: j.location, url: j.url, match: j.match }));
  } catch {
    return [];
  }
}

async function generateGreeting(name: string, shortlist: ShortlistedJob[]): Promise<string> {
  const fallback = `Hi ${name},\n\nThank you for registering with JobFinderAI! We've already scanned live job postings and shortlisted roles that match your profile - you'll find them below, with more waiting in your dashboard.\n\nThe JobFinderAI Team`;
  if (!process.env.ANTHROPIC_API_KEY) return fallback;

  const companyList = shortlist.map((j) => `${j.title} at ${j.company}`).join(", ") || "your top matches";
  try {
    const text = await generateText({
      system:
        "You write short, warm, genuine welcome emails for a job-matching product. 3-4 sentences max. No corporate fluff, no excessive exclamation points, no emoji, no markdown, no subject line - output only the email body prose itself, nothing else. Never invent company names or job details beyond what's given to you.",
      prompt: `Write a warm thank-you note welcoming ${name} for completing their CV/registration on JobFinderAI. Mention that we've already scanned live postings and shortlisted roles that fit their profile, including roles like: ${companyList}. Tell them their shortlist is in this email and more are in their dashboard. Sign off as "The JobFinderAI Team".`,
      maxTokens: 300,
    });
    return text.trim() || fallback;
  } catch (err) {
    console.error("[registrationEmail] AI greeting generation failed, using fallback copy:", err);
    return fallback;
  }
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function renderHtml(greeting: string, shortlist: ShortlistedJob[]): string {
  const siteUrl = process.env.SITE_URL || "https://jobfinderai.com";
  const greetingHtml = greeting
    .split(/\n+/)
    .filter(Boolean)
    .map((p) => `<p style="margin:0 0 16px;color:#d4d4f5;font-size:15px;line-height:1.6;">${escapeHtml(p)}</p>`)
    .join("");

  const jobsHtml = shortlist.length
    ? shortlist
        .map(
          (j) => `
        <tr>
          <td style="padding:14px 0;border-bottom:1px solid rgba(255,255,255,0.08);">
            <a href="${j.url}" style="color:#c4b5fd;font-weight:700;text-decoration:none;font-size:15px;">${escapeHtml(j.title)}</a>
            <div style="color:#9ca3af;font-size:13px;margin-top:2px;">${escapeHtml(j.company)} &middot; ${escapeHtml(j.location)} &middot; ${j.match}% match</div>
          </td>
        </tr>`
        )
        .join("")
    : `<tr><td style="padding:14px 0;color:#9ca3af;font-size:14px;">Your dashboard is scanning live postings now - check back shortly for your shortlist.</td></tr>`;

  return `<body style="margin:0;background:#050508;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:560px;margin:0 auto;background:#0c0c14;border:1px solid rgba(255,255,255,0.08);border-radius:24px;padding:32px;">
      <div style="color:#ffffff;font-weight:900;font-size:18px;margin-bottom:24px;">JobFinder<span style="color:#a78bfa;">AI</span></div>
      ${greetingHtml}
      <table style="width:100%;border-collapse:collapse;margin-top:8px;">${jobsHtml}</table>
      <a href="${siteUrl}/dashboard/jobs" style="display:inline-block;margin-top:24px;background:linear-gradient(135deg,#7c3aed,#2563eb);color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 24px;border-radius:14px;">View Full Shortlist &rarr;</a>
      <p style="color:#52525b;font-size:12px;margin-top:32px;">You're receiving this because you registered at JobFinderAI.</p>
    </div>
  </body>`;
}

export async function sendRegistrationEmail(params: { email: string; name: string; cv: CVProfile }): Promise<void> {
  const name = params.name || "there";
  const shortlist = await getShortlist(params.cv);
  const greeting = await generateGreeting(name, shortlist);
  const html = renderHtml(greeting, shortlist);
  const text = [
    greeting,
    "",
    ...shortlist.map((j) => `${j.title} at ${j.company} (${j.location}) - ${j.match}% match - ${j.url}`),
  ].join("\n");

  await sendMail({
    to: params.email,
    subject: shortlist.length
      ? `Welcome to JobFinderAI - ${shortlist.length} roles shortlisted for you`
      : "Welcome to JobFinderAI",
    html,
    text,
  });
}
