import { NextRequest, NextResponse } from "next/server";
import { getCvDataByEmail } from "@/lib/db";
import { fetchAllJobs } from "@/lib/jobSources";
import { rankJobs, type CVProfile } from "@/lib/matching";
import { analyzeSalary } from "@/lib/salary";
import { convertCurrency } from "@/lib/exchangeRates";

async function convertDesiredRange(
  cv: CVProfile,
  currency: string
): Promise<{ min: number; max: number } | null> {
  const min = parseFloat(cv.salaryMin || "");
  const max = parseFloat(cv.salaryMax || "");
  if (!min || !max || min <= 0 || max <= 0) return null;

  const from = (cv.salaryCurrency || "INR").toUpperCase();
  if (from === currency) return { min: Math.round(min), max: Math.round(max) };

  const [convertedMin, convertedMax] = await Promise.all([
    convertCurrency(min, from, currency),
    convertCurrency(max, from, currency),
  ]);
  if (convertedMin === null || convertedMax === null) return null;
  return { min: Math.round(convertedMin), max: Math.round(convertedMax) };
}

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  const currency = (req.nextUrl.searchParams.get("currency") || "USD").toUpperCase();
  if (!email) return NextResponse.json({ error: "email is required" }, { status: 400 });

  const data = await getCvDataByEmail(email);
  if (!data) return NextResponse.json({ error: "No CV found for this account yet." }, { status: 404 });

  const cv = JSON.parse(data) as CVProfile;
  // First listed target role, used to label shareable result cards.
  const role = (cv.targetRoles || "").split(/[,\n/]/)[0]?.trim() || null;

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
  const result = analyzeSalary(ranked);

  if (result.min === null || result.max === null || result.median === null) {
    const desired = await convertDesiredRange(cv, "USD").catch(() => null);
    return NextResponse.json({ ...result, currency: "USD", desired, role });
  }

  if (currency === "USD") {
    const desired = await convertDesiredRange(cv, "USD").catch(() => null);
    return NextResponse.json({ ...result, currency: "USD", desired, role });
  }

  const [min, max, median, desired] = await Promise.all([
    convertCurrency(result.min, "USD", currency),
    convertCurrency(result.max, "USD", currency),
    convertCurrency(result.median, "USD", currency),
    convertDesiredRange(cv, currency).catch(() => null),
  ]);

  if (min === null || max === null || median === null) {
    // Currency not covered by the exchange rate provider — fall back to USD.
    const desiredUsd = await convertDesiredRange(cv, "USD").catch(() => null);
    return NextResponse.json({ ...result, currency: "USD", desired: desiredUsd, role });
  }

  return NextResponse.json({
    ...result,
    min: Math.round(min),
    max: Math.round(max),
    median: Math.round(median),
    currency,
    desired,
    role,
  });
}
