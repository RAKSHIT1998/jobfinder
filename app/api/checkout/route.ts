import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  if (!email) return NextResponse.json({ error: "email is required" }, { status: 400 });
  const [row] = await query(
    `SELECT payments.* FROM payments JOIN users ON users.id = payments.user_id
     WHERE users.email = $1 ORDER BY payments.created_at DESC LIMIT 1`,
    [email]
  );
  return NextResponse.json({ paid: !!row, payment: row ?? null });
}
