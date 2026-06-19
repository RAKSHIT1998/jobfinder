import { NextResponse } from "next/server";
import { getAdminStats } from "@/lib/db";
import { isAdminAuthed } from "@/lib/adminAuth";

export async function GET() {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { totalUsers, totalCvs, totalPayments, revenueCents, totalApplications, recentUsers } = await getAdminStats(5);

  return NextResponse.json({
    totalUsers,
    totalCvs,
    totalPayments,
    revenueCents,
    totalApplications,
    conversionRate: totalUsers > 0 ? Math.round((totalPayments / totalUsers) * 100) : 0,
    recentUsers,
  });
}
