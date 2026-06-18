import { NextRequest, NextResponse } from "next/server";
import { getCashfree } from "@/lib/cashfree";
import { recordPayment } from "@/lib/db";

export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get("order_id");
  if (!orderId) {
    return NextResponse.json({ error: "order_id is required" }, { status: 400 });
  }

  try {
    const cashfree = getCashfree();
    const order = (await cashfree.PGFetchOrder(orderId)).data;
    const paid = order.order_status === "PAID";

    if (paid && order.customer_details?.customer_email && order.order_id) {
      recordPayment({
        amountCents: Math.round(Number(order.order_amount) * 100),
        currency: (order.order_currency || "INR").toUpperCase(),
        email: order.customer_details.customer_email,
        provider: "cashfree",
        referenceId: order.order_id,
      });
    }

    return NextResponse.json({ paid, status: order.order_status });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not verify this payment.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
