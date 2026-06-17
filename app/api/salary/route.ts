import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { fetchAllJobs } from "@/lib/jobSources";
import { rankJobs, type CVProfile } from "@/lib/matching";
import { analyzeSalary } from "@/lib/salary";
import { convertCurrency } from "@/lib/exchangeRates";

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  const currency = (req.nextUrl.searchParams.get("currency") || "USD").toUpperCase();
  if (!email) return NextResponse.json({ error: "email is required" }, { status: 400 });

  const db = getDb();
  const row = db
    .prepare(`SELECT cvs.data FROM cvs JOIN users ON users.id = cvs.user_id WHERE users.email = ?`)
    .get(email) as { data: string } | undefined;
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

  const ranked = rankJobs(cv, jobs);
  const result = analyzeSalary(ranked);

  if (result.min === null || result.max === null || result.median === null) {
    return NextResponse.json({ ...result, currency: "USD" });
  }

  if (currency === "USD") {
    return NextResponse.json({ ...result, currency: "USD" });
  }

  const [min, max, median] = await Promise.all([
    convertCurrency(result.min, "USD", currency),
    convertCurrency(result.max, "USD", currency),
    convertCurrency(result.median, "USD", currency),
  ]);

  if (min === null || max === null || median === null) {
    // Currency not covered by the exchange rate provider — fall back to USD.
    return NextResponse.json({ ...result, currency: "USD" });
  }

  return NextResponse.json({ ...result, min: Math.round(min), max: Math.round(max), median: Math.round(median), currency });
}
