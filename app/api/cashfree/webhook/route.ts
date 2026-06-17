import { NextRequest, NextResponse } from "next/server";
import { getCashfree } from "@/lib/cashfree";
import { recordPayment } from "@/lib/db";

interface CashfreeWebhook {
  data?: {
    order?: {
      order_id?: string;
      order_amount?: number;
    };
    payment?: {
      payment_status?: string;
    };
    customer_details?: {
      customer_email?: string;
    };
  };
  type?: string;
}

export async function POST(req: NextRequest) {
  const signature = req.headers.get("x-webhook-signature");
  const timestamp = req.headers.get("x-webhook-timestamp");

  if (!signature || !timestamp) {
    return NextResponse.json({ error: "Missing Cashfree webhook headers" }, { status: 400 });
  }

  const rawBody = await req.text();

  try {
    const cashfree = getCashfree();
    cashfree.PGVerifyWebhookSignature(signature, rawBody, timestamp);
  } catch {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  const event = JSON.parse(rawBody) as CashfreeWebhook;
  const orderId = event.data?.order?.order_id;
  const amount = event.data?.order?.order_amount;
  const email = event.data?.customer_details?.customer_email;
  const paid = event.type === "PAYMENT_SUCCESS_WEBHOOK" && event.data?.payment?.payment_status === "SUCCESS";

  if (paid && orderId && typeof amount === "number" && email) {
    recordPayment({
      amountCents: Math.round(amount * 100),
      email,
      provider: "cashfree",
      referenceId: orderId,
    });
  }

  return NextResponse.json({ received: true });
}
