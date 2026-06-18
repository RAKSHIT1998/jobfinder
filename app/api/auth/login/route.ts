import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail, getCv, getLatestPayment } from "@/lib/db";
import { verifyPassword, setSessionCookie } from "@/lib/auth";
import { ACCESS_DURATION_MS } from "@/lib/access";

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
  const latestPayment = await getLatestPayment(user.id);
  const paidAt = latestPayment ? new Date(latestPayment.created_at.replace(" ", "T") + "Z") : null;
  const paid = paidAt !== null && Date.now() - paidAt.getTime() < ACCESS_DURATION_MS;

  return NextResponse.json({
    ok: true,
    cv: cvData ? JSON.parse(cvData) : null,
    paid,
    paidAt: paidAt ? paidAt.toISOString() : null,
  });
}
