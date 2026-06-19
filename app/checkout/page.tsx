"use client";

import { useEffect, useState } from "react";
import { load } from "@cashfreepayments/cashfree-js";
import { useCountry } from "@/lib/useCountry";
import { useLocalizedPrice } from "@/lib/useLocalizedPrice";
import CountrySelector from "@/components/CountrySelector";
import LocalizedPrice from "@/components/LocalizedPrice";
import PriceTag from "@/components/PriceTag";
import { HeroEntrance, TapScale } from "@/components/motion/HeroEntrance";

const cashfreeMode =
  process.env.NEXT_PUBLIC_CASHFREE_MODE === "production" ? "production" : "sandbox";

export default function Checkout() {
  const { country } = useCountry();
  const { formatted: localizedPrice } = useLocalizedPrice();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    setExpired(new URLSearchParams(window.location.search).get("expired") === "1");
  }, []);

  const handlePay = async () => {
    setError("");
    setLoading(true);

    let email = "";
    let phone = "";
    let name = "";

    if (typeof window !== "undefined") {
      const storedCv = localStorage.getItem("jobfinder_cv");
      if (storedCv) {
        const parsed = JSON.parse(storedCv) as { email?: string; phone?: string; name?: string };
        email = parsed.email || "";
        phone = parsed.phone || "";
        name = parsed.name || "";
      }
    }

    try {
      const res = await fetch("/api/checkout/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, phone, name, currency: country.currency }),
      });
      const raw = await res.text();
      let data: { error?: string; paymentSessionId?: string } = {};
      if (raw) {
        try {
          data = JSON.parse(raw) as { error?: string; paymentSessionId?: string };
        } catch {
          throw new Error("Checkout server returned an invalid response. Please refresh and try again.");
        }
      }

      if (!res.ok || !data.paymentSessionId) {
        throw new Error(data.error || "Could not start checkout.");
      }

      const cashfree = await load({ mode: cashfreeMode });
      if (!cashfree) {
        throw new Error("Cashfree checkout failed to load.");
      }

      cashfree.checkout({
        paymentSessionId: data.paymentSessionId,
        redirectTarget: "_self",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start checkout.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-white flex items-center justify-center px-4 py-16 relative" style={{ background: "#050508" }}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="animate-blob absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full opacity-[0.12]" style={{ background: "radial-gradient(circle, #7c3aed, transparent)", filter: "blur(90px)" }} />
      </div>

      <HeroEntrance className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6 relative">
        <div className="glass-strong rounded-3xl p-8">
          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-400 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-white font-bold">JobFinder<span className="gradient-text">AI</span></span>
          </div>

          <div className="iridescent-border rounded-2xl p-5 mb-6">
            <div className="flex items-center justify-between mb-1">
              <span className="text-white font-bold">JobFinder AI - 7-Day Access</span>
              <span className="text-4xl font-black gradient-text"><PriceTag /></span>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-white/40 text-sm">One-time payment - valid for 7 days</p>
              <p className="text-white/30 text-xs"><LocalizedPrice /></p>
            </div>
          </div>
          <div className="flex justify-end mb-2">
            <CountrySelector />
          </div>

          <div className="space-y-3 mb-8">
            {[
              "Live job scanning across 4 real sources",
              "CV builder that powers every feature",
              "Real skill-based match scoring",
              "Application Tracker",
              "Interview Prep with calendar export",
              "AI Interview Coach",
              "Cover Letter Generator",
              "Skills Gap Analysis",
              "Salary Intelligence",
              "30-day money back guarantee",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-white/60 text-sm">{item}</span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-white/5 flex items-center justify-between">
            <span className="text-white/40">Total</span>
            <span className="text-xl font-black text-white">{localizedPrice}</span>
          </div>

          <div className="mt-5 flex items-center gap-2 text-white/25 text-xs">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Cashfree hosted checkout - instant access after successful payment
          </div>
        </div>

        <div className="glass-strong rounded-3xl p-8 flex flex-col">
          <h2 className="text-2xl font-black text-white mb-1">Secure Checkout</h2>
          <p className="text-white/40 text-sm mb-8">
            {expired ? "Your 7-day access has expired. Renew to keep going." : "You'll be redirected to Cashfree to pay - we never see or store your card details."}
          </p>

          <div className="flex-1 flex flex-col items-center justify-center gap-6 py-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-400 flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <p className="text-white/30 text-xs text-center max-w-xs">Powered by Cashfree - UPI, cards, netbanking, and wallets are handled on the next screen.</p>
          </div>

          {error && (
            <div className="glass rounded-xl px-4 py-3 text-red-400 text-sm border border-red-500/20 mb-4">
              {error}
            </div>
          )}

          <TapScale>
            <button
              onClick={handlePay}
              disabled={loading}
              className="btn-primary w-full py-4 rounded-2xl text-base font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Opening Cashfree...
                </span>
              ) : (
                `Pay ${localizedPrice} - Get 7-Day Access`
              )}
            </button>
          </TapScale>

          <p className="text-white/20 text-xs text-center mt-6">
            By purchasing you agree to our{" "}
            <span className="text-violet-400">Terms of Service</span>.
            30-day money back guarantee, no questions asked.
          </p>
        </div>
      </HeroEntrance>
    </div>
  );
}
