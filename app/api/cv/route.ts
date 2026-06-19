import { NextRequest, NextResponse } from "next/server";
import { upsertUser, getUserByEmail, setUserPassword, upsertCv, getCvDataByEmail } from "@/lib/db";
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

  const cvJson = JSON.stringify({ email, name, ...cvFields });
  await upsertCv(user.id, cvJson);

  return NextResponse.json({ ok: true });
}

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  if (!email) {
    return NextResponse.json({ error: "email is required" }, { status: 400 });
  }
  const data = await getCvDataByEmail(email);

  if (!data) return NextResponse.json({ cv: null });
  return NextResponse.json({ cv: JSON.parse(data) });
}
