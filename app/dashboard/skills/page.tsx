"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FadeIn as Reveal, StaggerGroup as RevealGroup, StaggerItem as RevealItem } from "@/components/motion/Reveal";
import { AnimatedCounter } from "@/components/motion/AnimatedCounter";
import { TiltCard } from "@/components/motion/TiltCard";

interface SkillGap {
  skill: string;
  count: number;
  percentOfPostings: number;
}

interface SkillsGapResult {
  analyzedCount: number;
  gaps: SkillGap[];
  haveSkills: string[];
  coveragePercent: number | null;
}

export default function Skills() {
  const [email, setEmail] = useState<string | null>(null);
  const [data, setData] = useState<SkillsGapResult | null>(null);
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
    fetch(`/api/skills-gap?email=${encodeURIComponent(cvEmail)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setData(d);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Could not analyze skills."))
      .finally(() => setLoading(false));
  }, []);

  if (!email) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4 text-center">
        <p className="text-foreground/50">Build your CV first so we can compare it against real live postings.</p>
        <Link href="/create-cv" className="btn-primary px-6 py-3 rounded-2xl text-sm font-bold">Build Your CV</Link>
      </div>
    );
  }

  const circumference = 2 * Math.PI * 54;
  const coverage = data?.coveragePercent ?? 0;
  const offset = circumference - (coverage / 100) * circumference;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-black text-foreground">Skills Gap Analysis</h1>
        <p className="text-foreground/40 text-sm mt-1">
          {loading ? "Scanning live postings..." : `Compared your CV against ${data?.analyzedCount ?? 0} live postings closely matching your profile.`}
        </p>
      </div>

      {error && (
        <div className="glass rounded-2xl p-5 text-red-600 text-sm border border-red-500/20">{error}</div>
      )}

      {!loading && data && data.analyzedCount === 0 && (
        <div className="glass rounded-2xl p-8 text-center text-foreground/40 text-sm">
          Not enough closely-matching live postings right now to run a gap analysis. Try again later, or broaden your target role.
        </div>
      )}

      {!loading && data && data.analyzedCount > 0 && (
        <RevealGroup className="grid grid-cols-1 lg:grid-cols-3 gap-6" stagger={0.1}>
          <RevealItem>
            <TiltCard className="glass rounded-2xl p-6 flex flex-col items-center text-center h-full" max={6}>
              <h3 className="text-foreground/60 text-sm font-semibold mb-4">Skill Coverage</h3>
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(20,18,35,0.06)" strokeWidth="10" />
                  <circle
                    cx="60" cy="60" r="54"
                    fill="none"
                    stroke="url(#grad)"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    style={{ transition: "stroke-dashoffset 1s ease" }}
                  />
                  <defs>
                    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#7c3aed" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black gradient-text">
                    {data.coveragePercent !== null ? <AnimatedCounter value={data.coveragePercent} suffix="%" /> : "—"}
                  </span>
                  <span className="text-foreground/40 text-xs">coverage</span>
                </div>
              </div>
              <p className="text-foreground/50 text-xs mt-4 leading-relaxed">
                Of the named skills appearing in postings that match you, you already have {data.coveragePercent ?? 0}% of them.
              </p>
            </TiltCard>
          </RevealItem>

          <RevealItem className="lg:col-span-2">
            <TiltCard className="glass rounded-2xl p-6 h-full" max={5}>
              <h3 className="text-foreground font-semibold mb-5">Your Skills</h3>
              <div className="flex flex-wrap gap-2">
                {data.haveSkills.map((s) => (
                  <span key={s} className="px-3 py-1.5 rounded-xl text-xs font-semibold border bg-emerald-500/10 text-emerald-700 border-emerald-500/25 capitalize">
                    {s}
                  </span>
                ))}
                {data.haveSkills.length === 0 && <p className="text-foreground/30 text-sm">No skills listed on your CV yet.</p>}
              </div>
            </TiltCard>
          </RevealItem>
        </RevealGroup>
      )}

      {!loading && data && data.gaps.length > 0 && (
        <Reveal>
          <h2 className="text-sm font-semibold text-foreground/50 uppercase tracking-widest mb-4">
            Skills Showing Up in Real Postings You Don&apos;t Have Yet
          </h2>
          <RevealGroup className="space-y-3" stagger={0.06}>
            {data.gaps.map((g, i) => (
              <RevealItem key={g.skill}>
                <TiltCard className="glass glass-hover rounded-2xl p-5 flex items-center gap-5" max={5}>
                  <div className="text-2xl font-black text-foreground/20 w-8 shrink-0">0{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-foreground font-bold capitalize">{g.skill}</h3>
                    <p className="text-foreground/40 text-xs mt-1">
                      Appears in {g.count} of {data.analyzedCount} matching live postings ({g.percentOfPostings}%)
                    </p>
                  </div>
                </TiltCard>
              </RevealItem>
            ))}
          </RevealGroup>
        </Reveal>
      )}

      {!loading && data && data.analyzedCount > 0 && data.gaps.length === 0 && (
        <div className="glass rounded-2xl p-6 text-center text-foreground/40 text-sm">
          No common gaps found — your skills already cover what these live postings are asking for.
        </div>
      )}
    </div>
  );
}
