import { NextRequest, NextResponse } from "next/server";
import { createContactMessage, getContactMessages } from "@/lib/db";
import { isAdminAuthed } from "@/lib/adminAuth";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, email, message } = body;
  if (!email || !message) {
    return NextResponse.json({ error: "email and message are required" }, { status: 400 });
  }
  await createContactMessage({ name: name || null, email, message });
  return NextResponse.json({ ok: true });
}

export async function GET() {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const messages = await getContactMessages();
  return NextResponse.json({ messages });
}
