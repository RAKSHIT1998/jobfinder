import { NextRequest, NextResponse } from "next/server";
import { extractCvFromPdfBase64, extractCvFromText, type ExtractedCV } from "@/lib/cvExtract";
import { fetchAllJobs } from "@/lib/jobSources";
import { rankJobs } from "@/lib/matching";

const MAX_FILE_BYTES = 5 * 1024 * 1024;

// This endpoint is intentionally ungated (no login) so it can work as a
// zero-friction top-of-funnel tool, but every call burns a real Anthropic
// request - a simple in-memory per-IP cap keeps an anonymous endpoint from
// becoming an open spend faucet. Resets on redeploy; that's an acceptable
// tradeoff for a single-instance app with no existing rate-limit infra.
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 15 * 60 * 1000;
const hits = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || now > entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many resumes parsed from this connection recently - try again in a few minutes." },
      { status: 429 }
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Upload a resume file or paste the text." }, { status: 400 });
  }
  const file = form.get("file");
  const pastedText = form.get("text");

  let cv: ExtractedCV;
  try {
    if (file instanceof File) {
      if (file.size > MAX_FILE_BYTES) {
        return NextResponse.json({ error: "That file is too large - keep it under 5MB." }, { status: 400 });
      }
      const lowerName = file.name.toLowerCase();
      if (file.type === "application/pdf" || lowerName.endsWith(".pdf")) {
        const buf = Buffer.from(await file.arrayBuffer());
        cv = await extractCvFromPdfBase64(buf.toString("base64"));
      } else if (file.type.startsWith("text/") || lowerName.endsWith(".txt")) {
        cv = await extractCvFromText(await file.text());
      } else {
        return NextResponse.json(
          { error: "We can read PDF or .txt files directly - for Word docs, paste the text instead." },
          { status: 400 }
        );
      }
    } else if (typeof pastedText === "string" && pastedText.trim()) {
      cv = await extractCvFromText(pastedText);
    } else {
      return NextResponse.json({ error: "Upload a resume file or paste the text." }, { status: 400 });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not read that resume.";
    const notConfigured = message.includes("ANTHROPIC_API_KEY");
    return NextResponse.json(
      {
        error: notConfigured
          ? "AI features aren't configured yet - add ANTHROPIC_API_KEY."
          : "Couldn't read that resume - try pasting the text instead.",
      },
      { status: notConfigured ? 503 : 502 }
    );
  }

  let matches: Awaited<ReturnType<typeof rankJobs>> = [];
  let sourcedFrom: string[] = [];
  try {
    const jobs = await fetchAllJobs();
    matches = (await rankJobs(cv, jobs)).slice(0, 8);
    sourcedFrom = [...new Set(jobs.map((j) => j.source))].sort();
  } catch {
    // The resume parsed fine - still return it even if live job sources are down.
  }

  return NextResponse.json({ cv, matches, sourcedFrom });
}
