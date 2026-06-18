import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { isAdminAuthed } from "@/lib/adminAuth";

export async function GET() {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const [[{ c: totalUsers }], [{ c: totalCvs }], [{ c: totalPayments }], [{ s: revenueCents }], [{ c: totalApplications }], recentUsers] =
    await Promise.all([
      query<{ c: number }>("SELECT COUNT(*)::int AS c FROM users"),
      query<{ c: number }>("SELECT COUNT(*)::int AS c FROM cvs"),
      query<{ c: number }>("SELECT COUNT(*)::int AS c FROM payments WHERE status = 'paid'"),
      query<{ s: number }>("SELECT COALESCE(SUM(amount_cents), 0)::int AS s FROM payments WHERE status = 'paid'"),
      query<{ c: number }>("SELECT COUNT(*)::int AS c FROM applications"),
      query("SELECT id, email, name, created_at FROM users ORDER BY created_at DESC LIMIT 5"),
    ]);

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
