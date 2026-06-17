import { NextRequest, NextResponse } from "next/server";
import { getDb, upsertUser } from "@/lib/db";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, name, card } = body;
  if (!email || !card) {
    return NextResponse.json({ error: "email and card are required" }, { status: 400 });
  }

  const user = upsertUser(email, name);
  const db = getDb();
  const last4 = String(card).replace(/\D/g, "").slice(-4);
  db.prepare(
    "INSERT INTO payments (user_id, amount_cents, status, card_last4) VALUES (?, ?, ?, ?)"
  ).run(user.id, 1000, "paid", last4);

  return NextResponse.json({ ok: true });
}

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  if (!email) return NextResponse.json({ error: "email is required" }, { status: 400 });
  const db = getDb();
  const row = db
    .prepare(
      `SELECT payments.* FROM payments JOIN users ON users.id = payments.user_id
       WHERE users.email = ? ORDER BY payments.created_at DESC LIMIT 1`
    )
    .get(email);
  return NextResponse.json({ paid: !!row, payment: row ?? null });
}
