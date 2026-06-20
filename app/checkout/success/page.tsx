"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { HeroEntrance } from "@/components/motion/HeroEntrance";

export default function CheckoutSuccess() {
  const router = useRouter();
  const [status, setStatus] = useState<"verifying" | "failed">("verifying");

  useEffect(() => {
    const orderId = new URLSearchParams(window.location.search).get("order_id");
    if (!orderId) {
      setStatus("failed");
      return;
    }

    fetch(`/api/checkout/verify?order_id=${encodeURIComponent(orderId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.paid) {
          setStatus("failed");
          return;
        }
        localStorage.setItem("jobfinder_paid", "true");
        localStorage.setItem("jobfinder_paid_at", new Date().toISOString());
        router.replace("/dashboard");
      })
      .catch(() => setStatus("failed"));
  }, [router]);

  return (
    <div className="min-h-screen text-foreground flex items-center justify-center px-4 relative" style={{ background: "#ffffff" }}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[420px] h-[420px] rounded-full opacity-[0.12]" style={{ background: "radial-gradient(circle, #7c3aed, transparent)", filter: "blur(var(--blur-ambient))" }} />
      </div>

      <HeroEntrance className="glass-strong rounded-3xl p-10 max-w-sm text-center relative">
        {status === "verifying" ? (
          <>
            <svg className="animate-spin w-8 h-8 text-violet-600 mx-auto mb-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <h1 className="text-xl font-black text-foreground mb-2">Confirming your payment...</h1>
            <p className="text-foreground/40 text-sm">Hang tight, this only takes a second.</p>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-2xl bg-red-500/15 border border-red-500/25 flex items-center justify-center mx-auto mb-5">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-xl font-black text-foreground mb-2">We couldn't confirm payment</h1>
            <p className="text-foreground/40 text-sm mb-6">No successful Cashfree payment was confirmed yet. You can try again.</p>
            <Link href="/checkout" className="btn-primary inline-block px-6 py-3 rounded-2xl text-sm font-bold">Back to Checkout</Link>
          </>
        )}
      </HeroEntrance>
    </div>
  );
}
