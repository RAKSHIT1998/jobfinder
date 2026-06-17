import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

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
