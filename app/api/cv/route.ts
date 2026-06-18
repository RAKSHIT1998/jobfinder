import { NextRequest, NextResponse } from "next/server";
import { query, upsertUser, getUserByEmail, setUserPassword, nowStamp } from "@/lib/db";
import { hashPassword, setSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, name, password, ...cvFields } = body;
  if (!email) {
    return NextResponse.json({ error: "email is required" }, { status: 400 });
  }

  const user = await upsertUser(email, name);

  if (password) {
    const existingUser = await getUserByEmail(email);
    if (!existingUser?.password_hash) {
      await setUserPassword(user.id, hashPassword(password));
    }
    await setSessionCookie(user.id);
  }

  const [existing] = await query<{ id: number }>("SELECT id FROM cvs WHERE user_id = $1", [user.id]);
  const cvJson = JSON.stringify({ email, name, ...cvFields });
  if (existing) {
    await query("UPDATE cvs SET data = $1, updated_at = $2 WHERE user_id = $3", [cvJson, nowStamp(), user.id]);
  } else {
    await query("INSERT INTO cvs (user_id, data, updated_at) VALUES ($1, $2, $3)", [user.id, cvJson, nowStamp()]);
  }

  return NextResponse.json({ ok: true });
}

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  if (!email) {
    return NextResponse.json({ error: "email is required" }, { status: 400 });
  }
  const [row] = await query<{ data: string }>(
    `SELECT cvs.data FROM cvs JOIN users ON users.id = cvs.user_id WHERE users.email = $1`,
    [email]
  );

  if (!row) return NextResponse.json({ cv: null });
  return NextResponse.json({ cv: JSON.parse(row.data) });
}
