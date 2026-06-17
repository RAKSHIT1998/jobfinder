import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { generateText } from "@/lib/anthropic";
import { formatCvForPrompt } from "@/lib/cvFormat";

function loadCvText(email: string): string | null {
  const db = getDb();
  const row = db
    .prepare(`SELECT cvs.data FROM cvs JOIN users ON users.id = cvs.user_id WHERE users.email = ?`)
    .get(email) as { data: string } | undefined;
  if (!row) return null;
  return formatCvForPrompt(JSON.parse(row.data));
}

function aiError(err: unknown) {
  const message = err instanceof Error ? err.message : "AI request failed.";
  const notConfigured = message.includes("ANTHROPIC_API_KEY");
  return NextResponse.json(
    { error: notConfigured ? "AI features aren't configured yet — add ANTHROPIC_API_KEY." : message },
    { status: notConfigured ? 503 : 502 }
  );
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action, email, company, role, jobDescription, question, answer } = body;
  if (!email || !company || !role) {
    return NextResponse.json({ error: "email, company and role are required" }, { status: 400 });
  }

  const cvText = loadCvText(email);
  if (!cvText) return NextResponse.json({ error: "No CV found for this account yet." }, { status: 404 });

  if (action === "questions") {
    try {
      const raw = await generateText({
        system:
          "You generate realistic interview questions tailored to a specific role, company, and candidate background. " +
          "Output exactly 5 questions, one per line, no numbering, no preamble, no extra commentary.",
        prompt: `Candidate CV:\n${cvText}\n\nInterviewing for: ${role} at ${company}\n${jobDescription ? `Job description:\n${jobDescription}` : ""}`,
        maxTokens: 500,
      });
      const questions = raw.split("\n").map((q) => q.trim()).filter(Boolean).slice(0, 5);
      return NextResponse.json({ questions });
    } catch (err) {
      return aiError(err);
    }
  }

  if (action === "feedback") {
    if (!question || !answer) {
      return NextResponse.json({ error: "question and answer are required for feedback" }, { status: 400 });
    }
    try {
      const feedback = await generateText({
        system:
          "You are an experienced interview coach. Give honest, specific, constructive feedback on one interview answer — " +
          "what was strong, what was missing or vague, and one concrete way to improve it. 3-5 sentences. No generic praise.",
        prompt: `Candidate CV:\n${cvText}\n\nInterviewing for: ${role} at ${company}\n\nQuestion: ${question}\n\nCandidate's answer: ${answer}`,
        maxTokens: 400,
      });
      return NextResponse.json({ feedback });
    } catch (err) {
      return aiError(err);
    }
  }

  return NextResponse.json({ error: "action must be 'questions' or 'feedback'" }, { status: 400 });
}
