"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { HeroEntrance, TapScale } from "@/components/motion/HeroEntrance";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.message) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setStatus("sent");
      setForm({ name: "", email: "", message: "" });
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "#050508" }}>
      <Navbar />
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[560px] h-[560px] rounded-full opacity-[0.13]" style={{ background: "radial-gradient(circle, #7c3aed, transparent)", filter: "blur(90px)" }} />
      </div>

      <main className="relative pt-36 pb-24 px-4">
        <HeroEntrance className="max-w-lg mx-auto">
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-2">Contact Us</h1>
          <p className="text-white/40 text-sm mb-10">
            Refund requests, account deletion, bugs, anything — send it here and it goes straight to our team.
          </p>

          <div className="glass-strong rounded-3xl p-8">
            {status === "sent" ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-white font-bold mb-1">Message sent</p>
                <p className="text-white/40 text-sm">We&apos;ll get back to you at the email you provided.</p>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                <input
                  className="input-glass"
                  placeholder="Your name (optional)"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                <input
                  className="input-glass"
                  type="email"
                  required
                  placeholder="Your email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                <textarea
                  className="input-glass resize-none"
                  style={{ minHeight: "140px" }}
                  required
                  placeholder="What's going on?"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                />
                {status === "error" && <p className="text-red-400 text-sm">Couldn&apos;t send that — try again in a moment.</p>}
                <TapScale className="block">
                  <button type="submit" disabled={status === "sending"} className="btn-primary w-full py-3.5 rounded-2xl text-sm font-bold disabled:opacity-50">
                    {status === "sending" ? "Sending..." : "Send Message"}
                  </button>
                </TapScale>
              </form>
            )}
          </div>
        </HeroEntrance>
      </main>

      <Footer />
    </div>
  );
}
