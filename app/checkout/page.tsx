"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Checkout() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    card: "",
    expiry: "",
    cvv: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const formatCard = (val: string) => {
    const cleaned = val.replace(/\D/g, "").slice(0, 16);
    return cleaned.replace(/(.{4})/g, "$1 ").trim();
  };

  const formatExpiry = (val: string) => {
    const cleaned = val.replace(/\D/g, "").slice(0, 4);
    if (cleaned.length > 2) return cleaned.slice(0, 2) + "/" + cleaned.slice(2);
    return cleaned;
  };

  const handlePay = async () => {
    if (!form.name || !form.card || !form.expiry || !form.cvv) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    setLoading(true);

    // Simulate payment processing
    await new Promise((r) => setTimeout(r, 2000));

    if (typeof window !== "undefined") {
      localStorage.setItem("jobfinder_paid", "true");
      localStorage.setItem("jobfinder_paid_at", new Date().toISOString());
    }

    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Order Summary */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <span className="text-white font-bold text-xs">J</span>
            </div>
            <span className="text-white font-bold">JobFinder AI</span>
          </div>

          <div className="border border-purple-500/30 bg-purple-500/5 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-300 font-medium">JobFinder AI — Lifetime</span>
              <span className="text-2xl font-bold text-white">$10</span>
            </div>
            <p className="text-gray-500 text-sm">One-time payment, never expires</p>
          </div>

          <div className="space-y-3 mb-6">
            {[
              "AI agent running 24/7 for life",
              "CV builder with ATS optimization",
              "Unlimited searches across 12+ job boards",
              "Automatic interview scheduling",
              "Real-time match scoring",
              "Dashboard with all matches & meetings",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <svg className="w-4 h-4 text-green-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-300 text-sm">{item}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-800 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Total</span>
              <span className="text-xl font-bold text-white">$10.00 USD</span>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-2 text-gray-500 text-xs">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Secured by 256-bit SSL encryption
          </div>
        </div>

        {/* Right: Payment Form */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          <h2 className="text-xl font-bold mb-2">Payment Details</h2>
          <p className="text-gray-400 text-sm mb-6">Enter your card information below.</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Cardholder Name</label>
              <input
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="John Doe"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Card Number</label>
              <div className="relative">
                <input
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors pr-12"
                  placeholder="1234 5678 9012 3456"
                  value={form.card}
                  onChange={(e) => setForm({ ...form, card: formatCard(e.target.value) })}
                  maxLength={19}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                  <div className="w-6 h-4 bg-blue-600 rounded-sm text-white text-xs flex items-center justify-center font-bold" style={{ fontSize: "6px" }}>VISA</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Expiry Date</label>
                <input
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="MM/YY"
                  value={form.expiry}
                  onChange={(e) => setForm({ ...form, expiry: formatExpiry(e.target.value) })}
                  maxLength={5}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">CVV</label>
                <input
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="123"
                  value={form.cvv}
                  onChange={(e) => setForm({ ...form, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                  maxLength={4}
                  type="password"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              onClick={handlePay}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-xl text-base font-semibold transition-all mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Processing...
                </span>
              ) : (
                "Pay $10 — Get Lifetime Access"
              )}
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-500 text-xs">
              By completing purchase you agree to our{" "}
              <Link href="#" className="text-purple-400 hover:text-purple-300">Terms of Service</Link>.
              30-day money back guarantee.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
