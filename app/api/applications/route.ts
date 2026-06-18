import { NextRequest, NextResponse } from "next/server";
import { query, upsertUser, nowStamp } from "@/lib/db";

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  if (!email) return NextResponse.json({ error: "email is required" }, { status: 400 });
  const rows = await query(
    `SELECT applications.* FROM applications JOIN users ON users.id = applications.user_id
     WHERE users.email = $1 ORDER BY applications.created_at DESC`,
    [email]
  );
  return NextResponse.json({ applications: rows });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, company, role, salary, status } = body;
  if (!email || !company || !role) {
    return NextResponse.json({ error: "email, company, role are required" }, { status: 400 });
  }
  const user = await upsertUser(email);
  const [row] = await query<{ id: number }>(
    "INSERT INTO applications (user_id, company, role, salary, status, created_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
    [user.id, company, role, salary ?? null, status ?? "Applied", nowStamp()]
  );
  return NextResponse.json({ ok: true, id: row.id });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, status, interviewAt, notes } = body;
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  if (status !== undefined) {
    await query("UPDATE applications SET status = $1 WHERE id = $2", [status, id]);
  }
  if (interviewAt !== undefined) {
    await query("UPDATE applications SET interview_at = $1 WHERE id = $2", [interviewAt, id]);
  }
  if (notes !== undefined) {
    await query("UPDATE applications SET notes = $1 WHERE id = $2", [notes, id]);
  }

  return NextResponse.json({ ok: true });
}
