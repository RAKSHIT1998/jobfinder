import { NextResponse } from "next/server";
import { getAdminUserList } from "@/lib/db";
import { isAdminAuthed } from "@/lib/adminAuth";

export async function GET() {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const users = await getAdminUserList();
  return NextResponse.json({ users });
}
