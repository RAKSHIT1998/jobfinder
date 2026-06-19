import { NextRequest, NextResponse } from "next/server";
import { getCvDataByEmail } from "@/lib/db";
import { generateText } from "@/lib/anthropic";
import { formatCvForPrompt } from "@/lib/cvFormat";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, company, role, jobDescription } = body;
  if (!email || !company || !role) {
    return NextResponse.json({ error: "email, company and role are required" }, { status: 400 });
  }

  const data = await getCvDataByEmail(email);
  if (!data) return NextResponse.json({ error: "No CV found for this account yet." }, { status: 404 });

  const cv = JSON.parse(data);
  const cvText = formatCvForPrompt(cv);

  let letter: string;
  try {
    letter = await generateText({
      system:
        "You write concise, specific, professional cover letters. Use only facts present in the candidate's CV — never invent experience, skills, or achievements. " +
        "Reference concrete details from the job description when one is given. Keep it under 350 words, no placeholder brackets, no generic filler. Output only the letter body.",
      prompt: `Candidate CV:\n${cvText}\n\nJob: ${role} at ${company}\n${jobDescription ? `Job description:\n${jobDescription}` : "(No job description provided — write a strong general cover letter for this role and company.)"}`,
      maxTokens: 800,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not generate cover letter.";
    const notConfigured = message.includes("ANTHROPIC_API_KEY");
    return NextResponse.json(
      { error: notConfigured ? "AI features aren't configured yet — add ANTHROPIC_API_KEY." : message },
      { status: notConfigured ? 503 : 502 }
    );
  }

  return NextResponse.json({ letter });
}
