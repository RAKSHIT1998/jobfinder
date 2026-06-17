import { NextRequest, NextResponse } from "next/server";
import { findCountryByCurrency } from "@/lib/countries";

interface IpApiResponse {
  status: "success" | "fail";
  message?: string;
  country?: string;
  countryCode?: string;
  currency?: string;
}

function extractClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "";
}

export async function GET(req: NextRequest) {
  const ip = extractClientIp(req);

  try {
    // ip-api.com's free tier is HTTP-only; called server-side so there's no
    // mixed-content browser restriction.
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,currency`, {
      signal: AbortSignal.timeout(5000),
    });
    const data = (await res.json()) as IpApiResponse;

    if (data.status !== "success" || !data.countryCode || !data.currency) {
      return NextResponse.json({ detected: false, reason: data.message || "Could not detect location." });
    }

    const country = findCountryByCurrency(data.currency);
    return NextResponse.json({
      detected: true,
      countryCode: data.countryCode,
      countryName: data.country,
      currency: country?.currency || data.currency,
    });
  } catch (err) {
    return NextResponse.json({
      detected: false,
      reason: err instanceof Error ? err.message : "Geolocation lookup failed.",
    });
  }
}
