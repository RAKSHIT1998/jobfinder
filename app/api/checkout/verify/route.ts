import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { recordStripePayment } from "@/lib/db";

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json({ error: "session_id is required" }, { status: 400 });
  }

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const paid = session.payment_status === "paid";

  if (paid) {
    const email = session.customer_email || (session.metadata?.email as string | undefined);
    if (email) {
      recordStripePayment({ sessionId: session.id, amountCents: session.amount_total ?? 0, email });
    }
  }

  return NextResponse.json({ paid });
}
