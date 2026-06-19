import { NextRequest, NextResponse } from "next/server";
import { getLatestPaymentByEmail } from "@/lib/db";

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  if (!email) return NextResponse.json({ error: "email is required" }, { status: 400 });
  const payment = await getLatestPaymentByEmail(email);
  return NextResponse.json({ paid: !!payment, payment: payment ?? null });
}
