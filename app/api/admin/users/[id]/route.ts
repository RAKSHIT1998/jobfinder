import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { isAdminAuthed } from "@/lib/adminAuth";

export async function GET(_req: Request, ctx: RouteContext<"/api/admin/users/[id]">) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const [user] = await query("SELECT * FROM users WHERE id = $1", [id]);
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [cvRow] = await query<{ data: string }>("SELECT data FROM cvs WHERE user_id = $1", [id]);
  const payments = await query("SELECT * FROM payments WHERE user_id = $1 ORDER BY created_at DESC", [id]);
  const applications = await query(
    "SELECT * FROM applications WHERE user_id = $1 ORDER BY created_at DESC",
    [id]
  );

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
  await query("DELETE FROM users WHERE id = $1", [id]);
  return NextResponse.json({ ok: true });
}
