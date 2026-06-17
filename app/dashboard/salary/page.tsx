"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface SalaryIntel {
  analyzedCount: number;
  disclosedCount: number;
  min: number | null;
  max: number | null;
  median: number | null;
}

const negotiationScript = [
  { step: "Get the offer in writing", tip: "Always ask: 'Can you send that over in writing?' This gives you time to think and research." },
  { step: "Express excitement first", tip: "'I'm really excited about this offer and the team. I'm very much looking forward to joining.' Never sound desperate or disappointed." },
  { step: "Ask for time", tip: "'I want to give this the consideration it deserves — can I have 48-72 hours?' This is normal and expected." },
  { step: "Research and counter", tip: "Use the real range above plus sites like levels.fyi and Glassdoor. Counter 10-20% above base, and negotiate equity, signing bonus, and remote policy too." },
  { step: "The counter script", tip: "\"I'm very excited about [Company]. Based on my experience and what similar roles are paying right now, I was expecting something closer to $X. Is there flexibility?\" Then stop talking." },
  { step: "If they say no", tip: "Ask: 'Is there flexibility on signing bonus, equity, or remote days?' Total comp matters, not just base." },
];

const fmt = (n: number) => `$${Math.round(n / 1000)}k`;

export default function Salary() {
  const [email, setEmail] = useState<string | null>(null);
  const [data, setData] = useState<SalaryIntel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("jobfinder_cv") : null;
    const cvEmail = stored ? JSON.parse(stored).email : null;
    setEmail(cvEmail);
    if (!cvEmail) {
      setLoading(false);
      return;
    }
    fetch(`/api/salary?email=${encodeURIComponent(cvEmail)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setData(d);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Could not analyze salary data."))
      .finally(() => setLoading(false));
  }, []);

  if (!email) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4 text-center">
        <p className="text-white/50">Build your CV first so we can pull real pay data for matching roles.</p>
        <Link href="/create-cv" className="btn-primary px-6 py-3 rounded-2xl text-sm font-bold">Build Your CV</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-black text-white">Salary Intelligence</h1>
        <p className="text-white/40 text-sm mt-1">
          {loading ? "Scanning live postings for disclosed pay..." : `Pay figures extracted from real postings matching your profile.`}
        </p>
      </div>

      {error && <div className="glass rounded-2xl p-5 text-red-400 text-sm border border-red-500/20">{error}</div>}

      {!loading && data && (
        <div className="iridescent-border rounded-3xl p-px">
          <div className="glass-strong rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-32 pointer-events-none opacity-20" style={{ background: "radial-gradient(circle, #7c3aed, transparent)", filter: "blur(40px)" }} />
            <div className="relative">
              {data.min !== null && data.max !== null ? (
                <>
                  <p className="text-white/50 text-sm mb-2">Based on real disclosed pay in matching postings</p>
                  <p className="text-5xl font-black gradient-text mb-2">{fmt(data.min)} - {fmt(data.max)}</p>
                  <p className="text-white/40 text-sm">median {fmt(data.median!)} · per year</p>
                  <div className="flex flex-wrap gap-3 mt-4">
                    <span className="glass px-3 py-1.5 rounded-xl text-xs text-violet-300 font-semibold">
                      🎯 {data.disclosedCount} of {data.analyzedCount} matching postings disclosed pay
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-white/50 text-sm mb-2">No pay data available yet</p>
                  <p className="text-2xl font-black text-white/70 mb-2">
                    None of the {data.analyzedCount} live postings closely matching your profile disclosed a salary figure.
                  </p>
                  <p className="text-white/40 text-sm">This is common outside the US, where pay transparency in listings is rarer. We don&apos;t estimate a number when there&apos;s no real data behind it.</p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-sm font-semibold text-white/50 uppercase tracking-widest mb-4">Negotiation Playbook</h2>
        <div className="space-y-3">
          {negotiationScript.map((s, i) => (
            <div key={i} className="glass glass-hover rounded-2xl p-5 flex gap-4">
              <div className="w-8 h-8 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-violet-300 font-black text-sm shrink-0">
                {i + 1}
              </div>
              <div>
                <h3 className="text-white font-bold text-sm mb-1">{s.step}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{s.tip}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
