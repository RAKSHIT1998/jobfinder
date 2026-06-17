import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { isAdminAuthed } from "@/lib/adminAuth";

export async function GET(_req: Request, ctx: RouteContext<"/api/admin/users/[id]">) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const db = getDb();
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const cvRow = db.prepare("SELECT data FROM cvs WHERE user_id = ?").get(id) as { data: string } | undefined;
  const payments = db.prepare("SELECT * FROM payments WHERE user_id = ? ORDER BY created_at DESC").all(id);
  const applications = db
    .prepare("SELECT * FROM applications WHERE user_id = ? ORDER BY created_at DESC")
    .all(id);

  return NextResponse.json({
    user,
    cv: cvRow ? JSON.parse(cvRow.data) : null,
    payments,
    applications,
  });
}

export async function DELETE(_req: Request, ctx: RouteContext<"/api/admin/users/[id]">) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const db = getDb();
  db.prepare("DELETE FROM users WHERE id = ?").run(id);
  return NextResponse.json({ ok: true });
}
