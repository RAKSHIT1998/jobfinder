import { NextRequest, NextResponse } from "next/server";
import { getDb, upsertUser, getUserByEmail, setUserPassword } from "@/lib/db";
import { hashPassword, setSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, name, password, ...cvFields } = body;
  if (!email) {
    return NextResponse.json({ error: "email is required" }, { status: 400 });
  }

  const user = upsertUser(email, name);

  if (password) {
    const existingUser = getUserByEmail(email);
    if (!existingUser?.password_hash) {
      setUserPassword(user.id, hashPassword(password));
    }
    await setSessionCookie(user.id);
  }

  const db = getDb();
  const existing = db.prepare("SELECT id FROM cvs WHERE user_id = ?").get(user.id);
  const cvJson = JSON.stringify({ email, name, ...cvFields });
  if (existing) {
    db.prepare("UPDATE cvs SET data = ?, updated_at = datetime('now') WHERE user_id = ?").run(cvJson, user.id);
  } else {
    db.prepare("INSERT INTO cvs (user_id, data) VALUES (?, ?)").run(user.id, cvJson);
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
