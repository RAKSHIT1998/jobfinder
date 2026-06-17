import { NextRequest, NextResponse } from "next/server";
import { ACCESS_PRICE_PAISE } from "@/lib/currency";
import { createCashfreeOrderId, getCashfree } from "@/lib/cashfree";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { email, phone, name } = body as { email?: string; phone?: string; name?: string };

  if (!email) {
    return NextResponse.json({ error: "Email is required before checkout." }, { status: 400 });
  }

  const orderId = createCashfreeOrderId();
  const origin = req.nextUrl.origin;
  const cashfree = getCashfree();

  try {
    const response = await cashfree.PGCreateOrder(
      {
        order_amount: ACCESS_PRICE_PAISE / 100,
        order_currency: "INR",
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
