import { NextRequest, NextResponse } from "next/server";
import { getDb, upsertUser } from "@/lib/db";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, name } = body;
  if (!email) {
    return NextResponse.json({ error: "email is required" }, { status: 400 });
  }

  const user = upsertUser(email, name);
  const db = getDb();
  const existing = db.prepare("SELECT id FROM cvs WHERE user_id = ?").get(user.id);
  if (existing) {
    db.prepare("UPDATE cvs SET data = ?, updated_at = datetime('now') WHERE user_id = ?").run(
      JSON.stringify(body),
      user.id
    );
  } else {
    db.prepare("INSERT INTO cvs (user_id, data) VALUES (?, ?)").run(user.id, JSON.stringify(body));
  }

  return NextResponse.json({ ok: true });
}

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  if (!email) {
    return NextResponse.json({ error: "email is required" }, { status: 400 });
  }
  const db = getDb();
  const row = db
    .prepare(
      `SELECT cvs.data FROM cvs JOIN users ON users.id = cvs.user_id WHERE users.email = ?`
    )
    .get(email) as { data: string } | undefined;

  if (!row) return NextResponse.json({ cv: null });
  return NextResponse.json({ cv: JSON.parse(row.data) });
}
