import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { isAdminAuthed } from "@/lib/adminAuth";

export async function GET() {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const db = getDb();
  const totalUsers = (db.prepare("SELECT COUNT(*) AS c FROM users").get() as { c: number }).c;
  const totalCvs = (db.prepare("SELECT COUNT(*) AS c FROM cvs").get() as { c: number }).c;
  const totalPayments = (db.prepare("SELECT COUNT(*) AS c FROM payments WHERE status = 'paid'").get() as { c: number }).c;
  const revenueCents = (db.prepare("SELECT COALESCE(SUM(amount_cents), 0) AS s FROM payments WHERE status = 'paid'").get() as { s: number }).s;
  const totalApplications = (db.prepare("SELECT COUNT(*) AS c FROM applications").get() as { c: number }).c;
  const recentUsers = db
    .prepare("SELECT id, email, name, created_at FROM users ORDER BY created_at DESC LIMIT 5")
    .all();

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
