import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { checkAdminPassword, createSessionToken, ADMIN_COOKIE, MAX_AGE_SECONDS } from "@/lib/adminAuth";

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  if (!checkAdminPassword(password)) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }
  const store = await cookies();
  store.set(ADMIN_COOKIE, createSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
  return NextResponse.json({ ok: true });
}
