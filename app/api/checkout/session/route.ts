import { NextRequest, NextResponse } from "next/server";
import { getStripe, ACCESS_PRICE_CENTS } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { email } = body as { email?: string };

  const stripe = getStripe();
  const origin = req.nextUrl.origin;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: email || undefined,
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: ACCESS_PRICE_CENTS,
          product_data: {
            name: "JobFinder AI — 7-Day Access",
            description: "Full access to JobFinder AI for 7 days.",
          },
        },
        quantity: 1,
      },
    ],
    metadata: email ? { email } : undefined,
    success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/checkout`,
  });

  return NextResponse.json({ url: session.url });
}
