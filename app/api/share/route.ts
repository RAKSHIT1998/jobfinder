import { NextRequest, NextResponse } from "next/server";
import { createShare } from "@/lib/db";
import { parseSharePayload } from "@/lib/shareTypes";

// Creates a public, shareable result snapshot and hands back its URL. Anyone
// can call this (it's how a free visitor turns their result into a link), so
// parseSharePayload is the only thing standing between the client and the DB —
// it whitelists and clamps every field.
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const payload = parseSharePayload(body);
  if (!payload) {
    return NextResponse.json({ error: "There's no result to share yet." }, { status: 400 });
  }

  try {
    const slug = await createShare(payload);
    return NextResponse.json({ slug, url: `${req.nextUrl.origin}/r/${slug}` });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not create a share link." },
      { status: 500 }
    );
  }
}
