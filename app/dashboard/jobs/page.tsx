"use client";

import { useState } from "react";

const allJobs = [
  { company: "Google", role: "Senior Software Engineer", location: "Remote", salary: "$150k-200k", match: 97, source: "Indeed", type: "remote", color: "#4285F4" },
  { company: "Anthropic", role: "AI Engineer", location: "Hybrid SF", salary: "$160k-220k", match: 96, source: "LinkedIn", type: "hybrid", color: "#d97706" },
  { company: "Stripe", role: "Full Stack Developer", location: "Hybrid SF", salary: "$130k-170k", match: 94, source: "LinkedIn", type: "hybrid", color: "#635bff" },
  { company: "Linear", role: "Software Engineer", location: "Remote", salary: "$130k-160k", match: 93, source: "Remote.co", type: "remote", color: "#5e6ad2" },
  { company: "Vercel", role: "Frontend Engineer", location: "Remote", salary: "$120k-160k", match: 92, source: "Glassdoor", type: "remote", color: "#ffffff" },
  { company: "Shopify", role: "Backend Developer", location: "Remote", salary: "$125k-155k", match: 90, source: "Indeed", type: "remote", color: "#96bf48" },
  { company: "Figma", role: "Software Engineer", location: "Hybrid NYC", salary: "$140k-180k", match: 88, source: "LinkedIn", type: "hybrid", color: "#a259ff" },
  { company: "Airbnb", role: "React Developer", location: "Hybrid SF", salary: "$130k-165k", match: 87, source: "Glassdoor", type: "hybrid", color: "#ff5a5f" },
  { company: "GitHub", role: "Platform Engineer", location: "Remote", salary: "$135k-175k", match: 85, source: "Remote.co", type: "remote", color: "#6e40c9" },
  { company: "Notion", role: "Full Stack Engineer", location: "Remote", salary: "$120k-150k", match: 84, source: "AngelList", type: "remote", color: "#ffffff" },
];

const matchBadge = (match: number) => {
  if (match >= 95) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
  if (match >= 90) return "text-cyan-400 bg-cyan-500/10 border-cyan-500/30";
  if (match >= 85) return "text-violet-400 bg-violet-500/10 border-violet-500/30";
  return "text-amber-400 bg-amber-500/10 border-amber-500/30";
};

const sourceStyle: Record<string, string> = {
  LinkedIn: "bg-blue-600/15 text-blue-300 border-blue-600/25",
  Indeed: "bg-orange-500/15 text-orange-300 border-orange-500/25",
  Glassdoor: "bg-emerald-600/15 text-emerald-300 border-emerald-600/25",
  "Remote.co": "bg-violet-600/15 text-violet-300 border-violet-600/25",
  AngelList: "bg-white/8 text-white/50 border-white/10",
};

export default function Jobs() {
  const [filter, setFilter] = useState("all");
  const [appliedMap, setAppliedMap] = useState<Record<number, boolean>>(
    Object.fromEntries(allJobs.map((_, i) => [i, i === 2 || i === 7]))
  );

  const filtered = filter === "all" ? allJobs : allJobs.filter((j) => j.type === filter);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-black text-white">AI-Found Jobs</h1>
        <p className="text-white/40 text-sm mt-1">{allJobs.length} jobs matching your profile · Refreshed 2 minutes ago</p>
      </div>

      {/* Filters */}
      <div className="glass rounded-2xl p-1.5 inline-flex gap-1">
        {[
          { key: "all", label: `All (${allJobs.length})` },
          { key: "remote", label: `Remote (${allJobs.filter(j => j.type === "remote").length})` },
          { key: "hybrid", label: `Hybrid (${allJobs.filter(j => j.type === "hybrid").length})` },
          { key: "onsite", label: "Onsite (0)" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              filter === f.key
                ? "bg-violet-500/25 text-violet-200 border border-violet-500/30"
                : "text-white/40 hover:text-white/70"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Job cards */}
      <div className="space-y-3">
        {filtered.map((job, idx) => {
          const globalIdx = allJobs.indexOf(job);
          const isApplied = appliedMap[globalIdx];
          return (
            <div key={idx} className="glass glass-hover rounded-2xl p-5 transition-all">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black shrink-0"
                  style={{ background: `${job.color}15`, border: `1px solid ${job.color}25`, color: job.color }}>
                  {job.company[0]}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <h3 className="text-white font-bold">{job.role}</h3>
                      <p className="text-white/40 text-sm">{job.company}</p>
                    </div>
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-sm font-black ${matchBadge(job.match)}`}>
                      {job.match}% match
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="text-sm text-white/50">📍 {job.location}</span>
                    <span className="text-sm text-emerald-400 font-semibold">💰 {job.salary}</span>
                    <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold border ${sourceStyle[job.source] || "bg-white/5 text-white/40 border-white/10"}`}>
                      {job.source}
                    </span>
                    <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold border capitalize ${
                      job.type === "remote" ? "bg-violet-500/15 text-violet-300 border-violet-500/25" :
                      "bg-cyan-500/15 text-cyan-300 border-cyan-500/25"
                    }`}>
                      {job.type}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-4 pt-4 border-t border-white/5">
                <button className="flex-1 btn-glass py-2.5 rounded-xl text-sm font-semibold text-white/60 hover:text-white">
                  View Details
                </button>
                <button
                  onClick={() => setAppliedMap((p) => ({ ...p, [globalIdx]: !p[globalIdx] }))}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    isApplied
                      ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
                      : "btn-primary"
                  }`}
                >
                  {isApplied ? "✓ Applied" : "Apply Now"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
