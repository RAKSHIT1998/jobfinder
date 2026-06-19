import { NextResponse } from "next/server";
import { getAdminUserDetail, deleteUserAccount, isValidObjectId } from "@/lib/db";
import { isAdminAuthed } from "@/lib/adminAuth";

export async function GET(_req: Request, ctx: RouteContext<"/api/admin/users/[id]">) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  if (!isValidObjectId(id)) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const detail = await getAdminUserDetail(id);
  if (!detail) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    user: detail.user,
    cv: detail.cv ? JSON.parse(detail.cv) : null,
    payments: detail.payments,
    applications: detail.applications,
  });
}

export async function DELETE(_req: Request, ctx: RouteContext<"/api/admin/users/[id]">) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  if (!isValidObjectId(id)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await deleteUserAccount(id);
  return NextResponse.json({ ok: true });
}
