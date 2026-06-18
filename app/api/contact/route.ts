import { NextRequest, NextResponse } from "next/server";
import { query, nowStamp } from "@/lib/db";
import { isAdminAuthed } from "@/lib/adminAuth";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, email, message } = body;
  if (!email || !message) {
    return NextResponse.json({ error: "email and message are required" }, { status: 400 });
  }
  await query("INSERT INTO contact_messages (name, email, message, created_at) VALUES ($1, $2, $3, $4)", [
    name || null,
    email,
    message,
    nowStamp(),
  ]);
  return NextResponse.json({ ok: true });
}

export async function GET() {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const messages = await query("SELECT * FROM contact_messages ORDER BY created_at DESC");
  return NextResponse.json({ messages });
}
