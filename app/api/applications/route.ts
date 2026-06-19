import { NextRequest, NextResponse } from "next/server";
import { getApplicationsByEmail, createApplication, updateApplication, upsertUser, isValidObjectId } from "@/lib/db";

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  if (!email) return NextResponse.json({ error: "email is required" }, { status: 400 });
  const applications = await getApplicationsByEmail(email);
  return NextResponse.json({ applications });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, company, role, salary, status } = body;
  if (!email || !company || !role) {
    return NextResponse.json({ error: "email, company, role are required" }, { status: 400 });
  }
  const user = await upsertUser(email);
  const { id } = await createApplication({ userId: user.id, company, role, salary, status });
  return NextResponse.json({ ok: true, id });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, status, interviewAt, notes } = body;
  if (!id || !isValidObjectId(id)) return NextResponse.json({ error: "id is required" }, { status: 400 });

  await updateApplication(id, { status, interviewAt, notes });

  return NextResponse.json({ ok: true });
}
