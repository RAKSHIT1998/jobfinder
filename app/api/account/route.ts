import { NextResponse } from "next/server";
import { getCurrentUserId, clearSessionCookie } from "@/lib/auth";
import { deleteUserAccount } from "@/lib/db";

export async function DELETE() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  }
  await deleteUserAccount(userId);
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
