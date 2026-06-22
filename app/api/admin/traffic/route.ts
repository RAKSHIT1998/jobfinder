import { NextResponse } from "next/server";
import { getTrafficSnapshot } from "@/lib/db";
import { isAdminAuthed } from "@/lib/adminAuth";

export async function GET() {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const snapshot = await getTrafficSnapshot();
  return NextResponse.json(snapshot);
}
