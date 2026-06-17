import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { isAdminAuthed } from "@/lib/adminAuth";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, email, message } = body;
  if (!email || !message) {
    return NextResponse.json({ error: "email and message are required" }, { status: 400 });
  }
  const db = getDb();
  db.prepare("INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)").run(
    name || null,
    email,
    message
  );
  return NextResponse.json({ ok: true });
}

export async function GET() {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const db = getDb();
  const messages = db.prepare("SELECT * FROM contact_messages ORDER BY created_at DESC").all();
  return NextResponse.json({ messages });
}
