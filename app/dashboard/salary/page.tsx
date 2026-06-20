"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Target } from "lucide-react";
import { useCountry } from "@/lib/useCountry";
import { FadeIn as Reveal, StaggerGroup as RevealGroup, StaggerItem as RevealItem } from "@/components/motion/Reveal";
import { TiltCard } from "@/components/motion/TiltCard";

interface SalaryIntel {
  analyzedCount: number;
  disclosedCount: number;
  min: number | null;
  max: number | null;
  median: number | null;
  currency: string;
  desired: { min: number; max: number } | null;
}

const negotiationScript = [
  { step: "Get the offer in writing", tip: "Always ask: 'Can you send that over in writing?' This gives you time to think and research." },
  { step: "Express excitement first", tip: "'I'm really excited about this offer and the team. I'm very much looking forward to joining.' Never sound desperate or disappointed." },
  { step: "Ask for time", tip: "'I want to give this the consideration it deserves — can I have 48-72 hours?' This is normal and expected." },
  { step: "Research and counter", tip: "Use the real range above plus sites like levels.fyi and Glassdoor. Counter 10-20% above base, and negotiate equity, signing bonus, and remote policy too." },
  { step: "The counter script", tip: "\"I'm very excited about [Company]. Based on my experience and what similar roles are paying right now, I was expecting something closer to [your target figure]. Is there flexibility?\" Then stop talking." },
  { step: "If they say no", tip: "Ask: 'Is there flexibility on signing bonus, equity, or remote days?' Total comp matters, not just base." },
];

export default function Salary() {
  const { country } = useCountry();
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
    setLoading(true);
    fetch(`/api/salary?email=${encodeURIComponent(cvEmail)}&currency=${country.currency}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setData(d);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Could not analyze salary data."))
      .finally(() => setLoading(false));
  }, [country.currency]);

  const fmt = (n: number) =>
    new Intl.NumberFormat(undefined, { style: "currency", currency: data?.currency || "USD", maximumFractionDigits: 0 }).format(n);

  const verdict = (() => {
    if (!data?.desired || data.min === null || data.max === null) return null;
    if (data.desired.min > data.max) return { label: "Your ask is above what these postings show — be ready to justify it.", tone: "text-amber-600" };
    if (data.desired.max < data.min) return { label: "You might be underselling yourself — postings show higher pay than you're asking for.", tone: "text-cyan-600" };
    return { label: "Your expectations line up well with the market.", tone: "text-emerald-600" };
  })();

  if (!email) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4 text-center">
        <p className="text-foreground/50">Build your CV first so we can pull real pay data for matching roles.</p>
        <Link href="/create-cv" className="btn-primary px-6 py-3 rounded-2xl text-sm font-bold">Build Your CV</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-black text-foreground">Salary Intelligence</h1>
        <p className="text-foreground/40 text-sm mt-1">
          {loading ? "Scanning live postings for disclosed pay..." : `Pay figures extracted from real postings matching your profile.`}
        </p>
      </div>

      {error && <div className="glass rounded-2xl p-5 text-red-600 text-sm border border-red-500/20">{error}</div>}

      {!loading && data && (
        <Reveal>
          <TiltCard className="iridescent-border rounded-3xl p-px" max={5}>
            <div className="glass-strong shine-sweep rounded-3xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-32 pointer-events-none opacity-20" style={{ background: "radial-gradient(circle, #7c3aed, transparent)", filter: "blur(40px)" }} />
              <div className="relative">
                {data.min !== null && data.max !== null ? (
                  <>
                    <p className="text-foreground/50 text-sm mb-2">Based on real disclosed pay in matching postings</p>
                    <p className="text-5xl font-black gradient-text mb-2">{fmt(data.min)} - {fmt(data.max)}</p>
                    <p className="text-foreground/40 text-sm">median {fmt(data.median!)} · per year</p>
                    <div className="flex flex-wrap gap-3 mt-4">
                      <span className="glass px-3 py-1.5 rounded-xl text-xs text-violet-700 font-semibold inline-flex items-center gap-1.5">
                        <Target className="w-3.5 h-3.5" /> {data.disclosedCount} of {data.analyzedCount} matching postings disclosed pay
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-foreground/50 text-sm mb-2">No pay data available yet</p>
                    <p className="text-2xl font-black text-foreground/70 mb-2">
                      None of the {data.analyzedCount} live postings closely matching your profile disclosed a salary figure.
                    </p>
                    <p className="text-foreground/40 text-sm">This is common outside the US, where pay transparency in listings is rarer. We don&apos;t estimate a number when there&apos;s no real data behind it.</p>
                  </>
                )}
              </div>
            </div>
          </TiltCard>
        </Reveal>
      )}

      {!loading && data?.desired && (
        <Reveal className="glass rounded-2xl p-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-foreground/30 text-xs uppercase tracking-widest mb-1">Your expectation (from your CV)</p>
            <p className="text-2xl font-black text-foreground">{fmt(data.desired.min)} - {fmt(data.desired.max)}</p>
          </div>
          {verdict && <p className={`text-sm font-semibold max-w-xs text-right ${verdict.tone}`}>{verdict.label}</p>}
        </Reveal>
      )}

      <div>
        <h2 className="text-sm font-semibold text-foreground/50 uppercase tracking-widest mb-4">Negotiation Playbook</h2>
        <RevealGroup className="space-y-3" stagger={0.06}>
          {negotiationScript.map((s, i) => (
            <RevealItem key={i}>
              <TiltCard className="glass glass-hover rounded-2xl p-5 flex gap-4" max={5}>
                <div className="w-8 h-8 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-violet-700 font-black text-sm shrink-0">
                  {i + 1}
                </div>
                <div>
                  <h3 className="text-foreground font-bold text-sm mb-1">{s.step}</h3>
                  <p className="text-foreground/50 text-sm leading-relaxed">{s.tip}</p>
                </div>
              </TiltCard>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </div>
  );
}
