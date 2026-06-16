"use client";

import { useState } from "react";

const allJobs = [
  { company: "Google", role: "Senior Software Engineer", location: "Remote", salary: "$150k-200k", match: 97, source: "Indeed", type: "remote", applied: false },
  { company: "Anthropic", role: "AI Engineer", location: "Hybrid SF", salary: "$160k-220k", match: 96, source: "LinkedIn", type: "hybrid", applied: false },
  { company: "Stripe", role: "Full Stack Developer", location: "Hybrid SF", salary: "$130k-170k", match: 94, source: "LinkedIn", type: "hybrid", applied: true },
  { company: "Linear", role: "Software Engineer", location: "Remote", salary: "$130k-160k", match: 93, source: "Remote.co", type: "remote", applied: false },
  { company: "Vercel", role: "Frontend Engineer", location: "Remote", salary: "$120k-160k", match: 92, source: "Glassdoor", type: "remote", applied: false },
  { company: "Shopify", role: "Backend Developer", location: "Remote", salary: "$125k-155k", match: 90, source: "Indeed", type: "remote", applied: false },
  { company: "Figma", role: "Software Engineer", location: "Hybrid NYC", salary: "$140k-180k", match: 88, source: "LinkedIn", type: "hybrid", applied: false },
  { company: "Airbnb", role: "React Developer", location: "Hybrid SF", salary: "$130k-165k", match: 87, source: "Glassdoor", type: "hybrid", applied: true },
  { company: "GitHub", role: "Platform Engineer", location: "Remote", salary: "$135k-175k", match: 85, source: "Remote.co", type: "remote", applied: false },
  { company: "Notion", role: "Full Stack Engineer", location: "Remote", salary: "$120k-150k", match: 84, source: "AngelList", type: "remote", applied: false },
];

const matchColor = (match: number) => {
  if (match >= 95) return "text-green-400 bg-green-500/10 border-green-500/30";
  if (match >= 90) return "text-blue-400 bg-blue-500/10 border-blue-500/30";
  if (match >= 85) return "text-purple-400 bg-purple-500/10 border-purple-500/30";
  return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
};

const sourceColor: Record<string, string> = {
  LinkedIn: "bg-blue-600/20 text-blue-300",
  Indeed: "bg-orange-500/20 text-orange-300",
  Glassdoor: "bg-green-600/20 text-green-300",
  "Remote.co": "bg-purple-600/20 text-purple-300",
  AngelList: "bg-gray-600/20 text-gray-300",
};

export default function Jobs() {
  const [filter, setFilter] = useState("all");
  const [appliedMap, setAppliedMap] = useState<Record<number, boolean>>(
    Object.fromEntries(allJobs.map((j, i) => [i, j.applied]))
  );

  const filtered = filter === "all" ? allJobs : allJobs.filter((j) => j.type === filter);

  const toggleApplied = (idx: number) => {
    const globalIdx = allJobs.indexOf(filtered[idx]);
    setAppliedMap((prev) => ({ ...prev, [globalIdx]: !prev[globalIdx] }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">AI-Found Jobs</h1>
        <p className="text-gray-400 text-sm mt-1">
          {allJobs.length} jobs found matching your profile · Updated 2 minutes ago
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm text-gray-500">Filter by:</span>
        {["all", "remote", "hybrid", "onsite"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all capitalize ${
              filter === f
                ? "bg-purple-500/20 border-purple-500 text-purple-300"
                : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600"
            }`}
          >
            {f === "all" ? `All (${allJobs.length})` : f === "remote" ? `Remote (${allJobs.filter(j => j.type === "remote").length})` : f === "hybrid" ? `Hybrid (${allJobs.filter(j => j.type === "hybrid").length})` : "Onsite (0)"}
          </button>
        ))}
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filtered.map((job, idx) => {
          const globalIdx = allJobs.indexOf(job);
          const isApplied = appliedMap[globalIdx];
          return (
            <div key={idx} className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl p-5 transition-all">
              <div className="flex items-start gap-4">
                {/* Logo placeholder */}
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/20 flex items-center justify-center text-lg font-bold text-purple-300 shrink-0">
                  {job.company[0]}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <h3 className="text-white font-semibold">{job.role}</h3>
                      <p className="text-gray-400 text-sm">{job.company}</p>
                    </div>
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-sm font-bold ${matchColor(job.match)}`}>
                      {job.match}% match
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 mt-3">
                    <span className="flex items-center gap-1 text-sm text-gray-400">
                      📍 {job.location}
                    </span>
                    <span className="flex items-center gap-1 text-sm text-green-400 font-medium">
                      💰 {job.salary}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${sourceColor[job.source] || "bg-gray-700 text-gray-300"}`}>
                      {job.source}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${
                      job.type === "remote" ? "bg-purple-500/20 text-purple-300" :
                      job.type === "hybrid" ? "bg-blue-500/20 text-blue-300" :
                      "bg-gray-700 text-gray-300"
                    }`}>
                      {job.type}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-4 pt-4 border-t border-gray-800">
                <button className="flex-1 border border-gray-700 hover:border-purple-500 text-gray-300 hover:text-purple-300 py-2 rounded-lg text-sm font-medium transition-all">
                  View Job
                </button>
                <button
                  onClick={() => toggleApplied(idx)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                    isApplied
                      ? "bg-green-500/20 border border-green-500/50 text-green-400"
                      : "bg-purple-600 hover:bg-purple-500 text-white"
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
