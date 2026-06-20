"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { RotateCw, MapPin, ExternalLink, CheckCircle2, Check, X } from "lucide-react";
import { tokenize } from "@/lib/matching";
import { StaggerGroup as RevealGroup, StaggerItem as RevealItem } from "@/components/motion/Reveal";
import { TiltCard } from "@/components/motion/TiltCard";

const ANYWHERE_WORDS = new Set(["anywhere", "any", "flexible", "open"]);

function locationTokensFromCv(cv: { location?: string; preferredLocations?: string }): Set<string> | null {
  const raw = (cv.preferredLocations || cv.location || "").trim();
  if (!raw) return null;
  const tokens = tokenize(raw);
  if (tokens.length === 0 || tokens.every((t) => ANYWHERE_WORDS.has(t))) return null;
  return new Set(tokens);
}

interface ScoredJob {
  id: string;
  title: string;
  company: string;
  location: string;
  remote: boolean;
  url: string;
  source: string;
  tags: string[];
  description: string;
  match: number;
}

const sourceStyle: Record<string, string> = {
  Arbeitnow: "bg-violet-600/10 text-violet-700 border-violet-600/25",
  "The Muse": "bg-cyan-600/10 text-cyan-700 border-cyan-600/25",
  RemoteOK: "bg-emerald-600/10 text-emerald-700 border-emerald-600/25",
  Jobicy: "bg-amber-600/10 text-amber-700 border-amber-600/25",
  Adzuna: "bg-rose-600/10 text-rose-700 border-rose-600/25",
};

const matchBadge = (match: number) => {
  if (match >= 40) return "text-emerald-700 bg-emerald-500/10 border-emerald-500/30";
  if (match >= 20) return "text-cyan-700 bg-cyan-500/10 border-cyan-500/30";
  if (match >= 10) return "text-violet-700 bg-violet-500/10 border-violet-500/30";
  return "text-amber-700 bg-amber-500/10 border-amber-500/30";
};

export default function Jobs() {
  const [email, setEmail] = useState<string | null>(null);
  const [jobs, setJobs] = useState<ScoredJob[]>([]);
  const [sourcedFrom, setSourcedFrom] = useState<string[]>([]);
  const [appliedKeys, setAppliedKeys] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "remote" | "onsite" | "near">("all");
  const [locationTokens, setLocationTokens] = useState<Set<string> | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkApplying, setBulkApplying] = useState(false);

  const load = useCallback((userEmail: string) => {
    setLoading(true);
    setError("");
    Promise.all([
      fetch(`/api/jobs?email=${encodeURIComponent(userEmail)}`).then((r) => r.json()),
      fetch(`/api/applications?email=${encodeURIComponent(userEmail)}`).then((r) => r.json()),
    ])
      .then(([jobsData, appsData]) => {
        if (jobsData.error) throw new Error(jobsData.error);
        setJobs(jobsData.jobs || []);
        setSourcedFrom(jobsData.sourcedFrom || []);
        const applied = new Set<string>(
          (appsData.applications || []).map((a: { company: string; role: string }) => `${a.company}|${a.role}`)
        );
        setAppliedKeys(applied);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load jobs."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("jobfinder_cv") : null;
    const parsed = stored ? JSON.parse(stored) : null;
    const cvEmail = parsed?.email || null;
    setEmail(cvEmail);
    if (parsed) setLocationTokens(locationTokensFromCv(parsed));
    if (cvEmail) load(cvEmail);
    else setLoading(false);
  }, [load]);

  const handleApply = async (job: ScoredJob) => {
    window.open(job.url, "_blank", "noopener,noreferrer");
    if (!email) return;
    const key = `${job.company}|${job.title}`;
    if (appliedKeys.has(key)) return;
    setAppliedKeys((prev) => new Set(prev).add(key));
    setSelected((prev) => {
      if (!prev.has(job.id)) return prev;
      const next = new Set(prev);
      next.delete(job.id);
      return next;
    });
    await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, company: job.company, role: job.title, status: "Applied" }),
    }).catch(() => {});
  };

  const toggleSelected = (jobId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(jobId)) next.delete(jobId);
      else next.add(jobId);
      return next;
    });
  };

  // Opens every selected posting's real Apply page (same as the single Apply
  // Now button, just N times) and tracks each as Applied - no bot login to
  // other sites, no stored credentials, you still submit each application
  // yourself on the real job board.
  const handleBulkApply = async () => {
    if (!email || selected.size === 0) return;
    const targets = jobs.filter((j) => selected.has(j.id) && !appliedKeys.has(`${j.company}|${j.title}`));
    if (targets.length === 0) {
      setSelected(new Set());
      return;
    }

    setBulkApplying(true);
    // Opened synchronously in the same click handler (no setTimeout) so
    // browsers attribute every popup to this one user gesture - deferring
    // even slightly makes most browsers block all but the first.
    for (const job of targets) {
      window.open(job.url, "_blank", "noopener,noreferrer");
    }

    await Promise.all(
      targets.map((job) =>
        fetch("/api/applications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, company: job.company, role: job.title, status: "Applied" }),
        }).catch(() => {})
      )
    );

    setAppliedKeys((prev) => {
      const next = new Set(prev);
      targets.forEach((job) => next.add(`${job.company}|${job.title}`));
      return next;
    });
    setSelected(new Set());
    setBulkApplying(false);
  };

  if (!email) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4 text-center">
        <p className="text-foreground/50">Build your CV first so we know what to match jobs against.</p>
        <Link href="/create-cv" className="btn-primary px-6 py-3 rounded-2xl text-sm font-bold">Build Your CV</Link>
      </div>
    );
  }

  const isNear = (j: ScoredJob) => j.remote || (locationTokens ? tokenize(j.location).some((t) => locationTokens.has(t)) : false);

  const filtered = jobs.filter((j) => {
    if (filter === "remote") return j.remote;
    if (filter === "onsite") return !j.remote;
    if (filter === "near") return isNear(j);
    return true;
  });

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-black text-foreground">Jobs Matching Your CV</h1>
          <p className="text-foreground/40 text-sm mt-1">
            {loading ? "Scanning live job sources..." : `${jobs.length} real jobs ranked against your skills · Sourced from ${sourcedFrom.join(", ")}`}
          </p>
        </div>
        <button onClick={() => email && load(email)} disabled={loading} className="btn-glass px-4 py-2 rounded-xl text-sm font-semibold text-foreground/60 disabled:opacity-50 inline-flex items-center gap-2">
          <RotateCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Scanning..." : "Rescan"}
        </button>
      </div>

      {error && (
        <div className="glass rounded-2xl p-5 text-red-600 text-sm border border-red-500/20">
          Couldn&apos;t fetch live jobs right now: {error}
        </div>
      )}

      {!loading && !error && jobs.length === 0 && (
        <div className="glass rounded-2xl p-8 text-center text-foreground/40 text-sm">
          No live postings matched your profile this scan. Try adding more skills to your CV and rescan.
        </div>
      )}

      {!loading && jobs.length > 0 && (
        <div className="glass rounded-2xl p-1.5 inline-flex gap-1">
          {[
            { key: "all" as const, label: `All (${jobs.length})` },
            { key: "remote" as const, label: `Remote (${jobs.filter((j) => j.remote).length})` },
            { key: "onsite" as const, label: `Onsite (${jobs.filter((j) => !j.remote).length})` },
            ...(locationTokens ? [{ key: "near" as const, label: `Near Me (${jobs.filter(isNear).length})` }] : []),
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                filter === f.key ? "bg-violet-500/15 text-violet-700 border border-violet-500/30" : "text-foreground/40 hover:text-foreground/70"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      <RevealGroup className="space-y-3 pb-20" stagger={0.05}>
        {filtered.map((job) => {
          const isApplied = appliedKeys.has(`${job.company}|${job.title}`);
          const isSelected = selected.has(job.id);
          return (
            <RevealItem key={job.id}>
              <TiltCard className={`glass glass-hover rounded-2xl p-5 transition-all ${isSelected ? "ring-2 ring-violet-500/50" : ""}`} max={5}>
                <div className="flex items-start gap-4">
                  {!isApplied && (
                    <button
                      onClick={() => toggleSelected(job.id)}
                      aria-label={isSelected ? "Deselect job" : "Select job for bulk apply"}
                      className={`mt-2 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                        isSelected ? "bg-violet-600 border-violet-600" : "border-foreground/20 hover:border-violet-400"
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                    </button>
                  )}
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black shrink-0 bg-violet-500/10 border border-violet-500/25 text-violet-700">
                    {job.company[0]?.toUpperCase() || "?"}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <h3 className="text-foreground font-bold">{job.title}</h3>
                        <p className="text-foreground/40 text-sm">{job.company}</p>
                      </div>
                      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-sm font-black ${matchBadge(job.match)}`}>
                        {job.match}% match
                      </div>
                    </div>

                    <p className="text-foreground/40 text-sm mt-2 line-clamp-2">{job.description.slice(0, 180)}{job.description.length > 180 ? "..." : ""}</p>

                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="inline-flex items-center gap-1 text-sm text-foreground/50"><MapPin className="w-3.5 h-3.5" />{job.location}</span>
                      <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold border ${sourceStyle[job.source] || "bg-foreground/5 text-foreground/40 border-foreground/10"}`}>
                        {job.source}
                      </span>
                      <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold border capitalize ${
                        job.remote ? "bg-violet-500/10 text-violet-700 border-violet-500/25" : "bg-cyan-500/10 text-cyan-700 border-cyan-500/25"
                      }`}>
                        {job.remote ? "remote" : "onsite"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-4 pt-4 border-t border-foreground/5">
                  <a href={job.url} target="_blank" rel="noopener noreferrer" className="flex-1 btn-glass py-2.5 rounded-xl text-sm font-semibold text-foreground/60 hover:text-foreground text-center inline-flex items-center justify-center gap-1.5">
                    View Listing <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => handleApply(job)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all inline-flex items-center justify-center gap-1.5 ${
                      isApplied ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-700" : "btn-primary"
                    }`}
                  >
                    {isApplied ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" /> Applied
                      </>
                    ) : (
                      <>
                        Apply Now <ExternalLink className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </TiltCard>
            </RevealItem>
          );
        })}
      </RevealGroup>

      {selected.size > 0 && (
        <div className="fixed bottom-6 right-6 z-50 glass-strong rounded-2xl pl-5 pr-3 py-3 flex items-center gap-3 shadow-2xl">
          <div>
            <span className="text-sm font-semibold text-foreground block">{selected.size} job{selected.size > 1 ? "s" : ""} selected</span>
            <span className="text-xs text-foreground/40">Opens each real posting - allow popups if your browser asks</span>
          </div>
          <button
            onClick={() => setSelected(new Set())}
            aria-label="Clear selection"
            className="text-foreground/30 hover:text-foreground p-2 rounded-lg hover:bg-foreground/5"
          >
            <X className="w-4 h-4" />
          </button>
          <button
            onClick={handleBulkApply}
            disabled={bulkApplying}
            className="btn-primary px-5 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50 inline-flex items-center gap-2 whitespace-nowrap"
          >
            {bulkApplying ? "Opening..." : `Apply to All (${selected.size})`}
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
