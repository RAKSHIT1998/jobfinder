import { NextRequest, NextResponse } from "next/server";
import { getDb, upsertUser } from "@/lib/db";

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  if (!email) return NextResponse.json({ error: "email is required" }, { status: 400 });
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT applications.* FROM applications JOIN users ON users.id = applications.user_id
       WHERE users.email = ? ORDER BY applications.created_at DESC`
    )
    .all(email);
  return NextResponse.json({ applications: rows });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, company, role, salary, status } = body;
  if (!email || !company || !role) {
    return NextResponse.json({ error: "email, company, role are required" }, { status: 400 });
  }
  const user = upsertUser(email);
  const db = getDb();
  const info = db
    .prepare(
      "INSERT INTO applications (user_id, company, role, salary, status) VALUES (?, ?, ?, ?, ?)"
    )
    .run(user.id, company, role, salary ?? null, status ?? "Applied");
  return NextResponse.json({ ok: true, id: info.lastInsertRowid });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, status, interviewAt, notes } = body;
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
  const db = getDb();

  if (status !== undefined) {
    db.prepare("UPDATE applications SET status = ? WHERE id = ?").run(status, id);
  }
  if (interviewAt !== undefined) {
    db.prepare("UPDATE applications SET interview_at = ? WHERE id = ?").run(interviewAt, id);
  }
  if (notes !== undefined) {
    db.prepare("UPDATE applications SET notes = ? WHERE id = ?").run(notes, id);
  }

  return NextResponse.json({ ok: true });
}
