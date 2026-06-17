import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { isAdminAuthed } from "@/lib/adminAuth";

export async function GET() {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT
         users.id, users.email, users.name, users.created_at,
         (SELECT COUNT(*) FROM cvs WHERE cvs.user_id = users.id) AS has_cv,
         (SELECT COUNT(*) FROM payments WHERE payments.user_id = users.id AND payments.status = 'paid') AS paid_count,
         (SELECT COUNT(*) FROM applications WHERE applications.user_id = users.id) AS application_count
       FROM users
       ORDER BY users.created_at DESC`
    )
    .all();
  return NextResponse.json({ users: rows });
}
