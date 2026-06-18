import { NextRequest, NextResponse } from "next/server";
import { ACCESS_PRICE_USD, roundForCurrency } from "@/lib/currency";
import { convertCurrency } from "@/lib/exchangeRates";
import { createCashfreeOrderId, getCashfree } from "@/lib/cashfree";

// Cashfree only charges in currencies your merchant account has been approved
// for — INR works for every account out of the box; anything else needs the
// "Multi-Currency" / international payments feature enabled via Cashfree
// support. List the currencies you've had enabled here (comma separated);
// requests for anything else automatically fall back to the first one.
const SUPPORTED_CURRENCIES = (process.env.CASHFREE_SUPPORTED_CURRENCIES || "INR")
  .split(",")
  .map((c) => c.trim().toUpperCase())
  .filter(Boolean);

function resolveOrderCurrency(requested: string): string {
  if (SUPPORTED_CURRENCIES.includes(requested)) return requested;
  return SUPPORTED_CURRENCIES[0] || "INR";
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { email, phone, name, currency } = body as {
    email?: string;
    phone?: string;
    name?: string;
    currency?: string;
  };

  if (!email) {
    return NextResponse.json({ error: "Email is required before checkout." }, { status: 400 });
  }

  const requestedCurrency = (currency || "USD").toUpperCase();
  const orderCurrency = resolveOrderCurrency(requestedCurrency);

  let orderAmount = ACCESS_PRICE_USD;
  if (orderCurrency !== "USD") {
    const converted = await convertCurrency(ACCESS_PRICE_USD, "USD", orderCurrency).catch(() => null);
    orderAmount = converted !== null ? roundForCurrency(converted, orderCurrency) : ACCESS_PRICE_USD;
  }

  const orderId = createCashfreeOrderId();
  const origin = req.nextUrl.origin;

  try {
    const cashfree = getCashfree();
    const response = await cashfree.PGCreateOrder(
      {
        order_amount: orderAmount,
        order_currency: orderCurrency,
        order_id: orderId,
        customer_details: {
          customer_id: email.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 40) || orderId,
          customer_email: email,
          customer_name: name || undefined,
          customer_phone: phone || "9999999999",
        },
        order_meta: {
          return_url: `${origin}/checkout/success?order_id=${orderId}`,
          notify_url: `${origin}/api/cashfree/webhook`,
        },
        order_note: "JobFinder AI 7-day access",
      },
      orderId,
      crypto.randomUUID()
    );

    return NextResponse.json({
      orderId,
      paymentSessionId: response.data.payment_session_id,
      currency: orderCurrency,
      amount: orderAmount,
    });
  } catch (error) {
    const cashfreeError =
      typeof error === "object" &&
      error !== null &&
      "response" in error &&
      typeof (error as { response?: { data?: { message?: string } } }).response?.data?.message === "string"
        ? (error as { response: { data: { message: string } } }).response.data.message
        : null;
    const message =
      cashfreeError ||
      (error instanceof Error ? error.message : "Could not create your Cashfree order.");
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
