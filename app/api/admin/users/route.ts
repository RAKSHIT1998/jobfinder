import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { isAdminAuthed } from "@/lib/adminAuth";

export async function GET() {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const rows = await query(
    `SELECT
       users.id, users.email, users.name, users.created_at,
       (SELECT COUNT(*) FROM cvs WHERE cvs.user_id = users.id)::int AS has_cv,
       (SELECT COUNT(*) FROM payments WHERE payments.user_id = users.id AND payments.status = 'paid')::int AS paid_count,
       (SELECT COUNT(*) FROM applications WHERE applications.user_id = users.id)::int AS application_count
     FROM users
     ORDER BY users.created_at DESC`
  );
  return NextResponse.json({ users: rows });
}
