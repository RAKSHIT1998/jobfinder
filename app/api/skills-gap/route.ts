import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { fetchAllJobs } from "@/lib/jobSources";
import { rankJobs, type CVProfile } from "@/lib/matching";
import { analyzeSkillsGap } from "@/lib/skillsGap";

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  if (!email) return NextResponse.json({ error: "email is required" }, { status: 400 });

  const [row] = await query<{ data: string }>(
    `SELECT cvs.data FROM cvs JOIN users ON users.id = cvs.user_id WHERE users.email = $1`,
    [email]
  );
  if (!row) return NextResponse.json({ error: "No CV found for this account yet." }, { status: 404 });

  const cv = JSON.parse(row.data) as CVProfile;

  let jobs;
  try {
    jobs = await fetchAllJobs();
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not reach job sources." },
      { status: 502 }
    );
  }

  const ranked = await rankJobs(cv, jobs);
  const result = analyzeSkillsGap(cv, ranked);
  return NextResponse.json(result);
}
