import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail, getCv, getAccessStatus } from "@/lib/db";
import { verifyPassword, setSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const user = await getUserByEmail(email);
  if (!user) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }
  if (!user.password_hash) {
    return NextResponse.json(
      { error: "No password set for this account yet. Build your CV again to set one." },
      { status: 401 }
    );
  }
  if (!verifyPassword(password, user.password_hash)) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  await setSessionCookie(user.id);

  const cvData = await getCv(user.id);
  const { paid, paidAt } = await getAccessStatus(user.id);

  return NextResponse.json({
    ok: true,
    cv: cvData ? JSON.parse(cvData) : null,
    paid,
    paidAt: paidAt ? paidAt.toISOString() : null,
  });
}
