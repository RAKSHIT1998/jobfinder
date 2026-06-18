import { NextRequest, NextResponse } from "next/server";
import { convertCurrency } from "@/lib/exchangeRates";
import { ACCESS_PRICE_USD, roundForCurrency } from "@/lib/currency";

export async function GET(req: NextRequest) {
  const currency = (req.nextUrl.searchParams.get("currency") || "USD").toUpperCase();

  if (currency === "USD") {
    return NextResponse.json({ currency: "USD", amount: ACCESS_PRICE_USD, converted: true });
  }

  const converted = await convertCurrency(ACCESS_PRICE_USD, "USD", currency).catch(() => null);
  if (converted === null) {
    return NextResponse.json({ currency: "USD", amount: ACCESS_PRICE_USD, converted: false });
  }

  return NextResponse.json({ currency, amount: roundForCurrency(converted, currency), converted: true });
}
