"use client";

import { useEffect, useState } from "react";
import { Gift, Copy, Check, Share2, MessageCircle } from "lucide-react";

interface ReferralInfo {
  code: string | null;
  referrals: number;
  bonusDaysRemaining: number;
  rewardDays: number;
}

// Dashboard widget that turns a paying user into a recruiter: shows their invite
// link plus how many friends joined and how many bonus days they've banked.
// Both sides get +rewardDays the moment an invited friend builds their CV.
export default function ReferralCard() {
  const [info, setInfo] = useState<ReferralInfo | null>(null);
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
    const stored = typeof window !== "undefined" ? localStorage.getItem("jobfinder_cv") : null;
    const email = stored ? JSON.parse(stored).email : null;
    if (!email) return;
    fetch(`/api/referral?email=${encodeURIComponent(email)}`)
      .then((r) => r.json())
      .then((d) => {
        if (!d.error) setInfo(d);
      })
      .catch(() => {});
  }, []);

  if (!info || !info.code) return null;

  const url = `${origin}/?ref=${info.code}`;
  const reward = info.rewardDays;
  const hook = `I'm using JobFinder AI to match my CV to the highest-paying jobs — grab ${reward} free days with my link:`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked — the input is selectable as a fallback */
    }
  }

  async function nativeShare() {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({ title: "JobFinder AI", text: hook, url });
      } catch {
        /* dismissed */
      }
    } else {
      copy();
    }
  }

  const whatsapp = `https://wa.me/?text=${encodeURIComponent(`${hook} ${url}`)}`;
  const linkedIn = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
  const x = `https://twitter.com/intent/tweet?text=${encodeURIComponent(hook)}&url=${encodeURIComponent(url)}`;

  return (
    <div className="iridescent-border rounded-3xl p-px">
      <div className="glass-strong shine-sweep rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-56 h-28 opacity-10 pointer-events-none" style={{ background: "radial-gradient(circle, #7c3aed, transparent)", filter: "blur(40px)" }} />
        <div className="relative flex flex-col lg:flex-row lg:items-center gap-5">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                <Gift className="w-4 h-4 text-violet-700" />
              </div>
              <h2 className="text-foreground font-black text-lg">Give {reward} days, get {reward} days</h2>
            </div>
            <p className="text-foreground/50 text-sm mb-4">
              When a friend builds their CV with your link, you <span className="font-semibold text-foreground/70">both</span> get {reward} bonus days of full access.
            </p>

            <div className="flex items-center gap-2 mb-3">
              <input
                readOnly
                value={url}
                onFocus={(e) => e.currentTarget.select()}
                className="input-glass text-xs flex-1"
              />
              <button onClick={copy} className="btn-glass inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl shrink-0">
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              <button onClick={nativeShare} className="btn-primary inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl">
                <Share2 className="w-3.5 h-3.5" /> Share
              </button>
              <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="btn-glass inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl">
                <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
              </a>
              <a href={linkedIn} target="_blank" rel="noopener noreferrer" className="btn-glass inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl">
                <span className="font-black tracking-tight">in</span> LinkedIn
              </a>
              <a href={x} target="_blank" rel="noopener noreferrer" className="btn-glass inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl">
                <span className="font-black">𝕏</span> Post
              </a>
            </div>
          </div>

          <div className="flex gap-3 lg:gap-4 lg:border-l lg:border-foreground/10 lg:pl-5 shrink-0">
            <div className="glass rounded-2xl px-4 py-3 text-center min-w-[88px]">
              <div className="text-2xl font-black gradient-text">{info.referrals}</div>
              <div className="text-foreground/40 text-[11px] mt-0.5">friends joined</div>
            </div>
            <div className="glass rounded-2xl px-4 py-3 text-center min-w-[88px]">
              <div className="text-2xl font-black gradient-text">{info.bonusDaysRemaining}</div>
              <div className="text-foreground/40 text-[11px] mt-0.5">bonus days left</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
