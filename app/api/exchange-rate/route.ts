import { NextRequest, NextResponse } from "next/server";
import { convertCurrency } from "@/lib/exchangeRates";
import { ACCESS_PRICE_INR } from "@/lib/currency";

export async function GET(req: NextRequest) {
  const currency = (req.nextUrl.searchParams.get("currency") || "USD").toUpperCase();

  if (currency === "INR") {
    return NextResponse.json({ currency, amount: ACCESS_PRICE_INR, converted: true });
  }

  const converted = await convertCurrency(ACCESS_PRICE_INR, "INR", currency).catch(() => null);
  if (converted === null) {
    return NextResponse.json({ currency: "INR", amount: ACCESS_PRICE_INR, converted: false });
  }

  return NextResponse.json({ currency, amount: Math.round(converted * 100) / 100, converted: true });
}
