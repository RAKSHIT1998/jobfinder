import { NextRequest, NextResponse } from "next/server";
import { getReferralStats } from "@/lib/db";
import { REFERRAL_BONUS_MS } from "@/lib/access";

// Invite code + stats for the dashboard referral widget. Keyed by email to
// match how the rest of the dashboard fetches a user's data. The code isn't a
// secret (it's meant to be shared), so there's nothing sensitive to leak here.
export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  if (!email) return NextResponse.json({ error: "email is required" }, { status: 400 });

  const stats = await getReferralStats(email);
  if (!stats) return NextResponse.json({ error: "No account found for this email yet." }, { status: 404 });

  const bonusUntilMs = stats.bonusUntil
    ? new Date(stats.bonusUntil.replace(" ", "T") + "Z").getTime()
    : 0;
  const bonusDaysRemaining = bonusUntilMs > Date.now()
    ? Math.ceil((bonusUntilMs - Date.now()) / (24 * 60 * 60 * 1000))
    : 0;

  return NextResponse.json({
    code: stats.code,
    referrals: stats.referrals,
    bonusDaysRemaining,
    rewardDays: Math.round(REFERRAL_BONUS_MS / (24 * 60 * 60 * 1000)),
  });
}
