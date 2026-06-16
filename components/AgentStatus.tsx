"use client";

import { useState, useEffect } from "react";

const sites = ["LinkedIn", "Indeed", "Glassdoor", "Remote.co", "AngelList", "Wellfound", "Lever", "Greenhouse"];
const actions = [
  "Scanning LinkedIn for Senior Engineer roles...",
  "Found 3 new matches on Indeed...",
  "Analyzing Glassdoor salary data...",
  "Querying Remote.co for remote positions...",
  "Scoring 12 new jobs against your profile...",
  "Scheduling interview with Google recruiter...",
  "Optimizing CV keywords for ATS systems...",
  "Found high-match role at Anthropic...",
];

export default function AgentStatus() {
  const [currentSite, setCurrentSite] = useState(0);
  const [currentAction, setCurrentAction] = useState(0);
  const [jobsFound, setJobsFound] = useState(247);
  const [dots, setDots] = useState(".");

  useEffect(() => {
    const siteInterval = setInterval(() => setCurrentSite((p) => (p + 1) % sites.length), 2000);
    const actionInterval = setInterval(() => setCurrentAction((p) => (p + 1) % actions.length), 3000);
    const jobInterval = setInterval(() => setJobsFound((p) => p + Math.floor(Math.random() * 3)), 8000);
    const dotInterval = setInterval(() => setDots((p) => (p.length >= 3 ? "." : p + ".")), 500);
    return () => { clearInterval(siteInterval); clearInterval(actionInterval); clearInterval(jobInterval); clearInterval(dotInterval); };
  }, []);

  return (
    <div className="glass rounded-2xl p-5 h-full">
      <div className="flex items-center gap-3 mb-5">
        <div className="relative">
          <div className="w-3 h-3 rounded-full bg-emerald-400" />
          <div className="absolute inset-0 w-3 h-3 rounded-full bg-emerald-400 animate-ping opacity-60" />
        </div>
        <span className="text-white font-semibold text-sm">AI Agent Active</span>
        <span className="ml-auto text-xs text-white/30">2 mins ago</span>
      </div>

      <div className="glass rounded-xl p-3 mb-4">
        <p className="text-xs text-white/50 mb-1">Current task</p>
        <p className="text-sm text-violet-300 font-medium transition-all">{actions[currentAction]}{dots}</p>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/40">Scanning</span>
          <span className="text-cyan-400 font-medium">{sites[currentSite]}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/40">Jobs analyzed today</span>
          <span className="text-emerald-400 font-bold">{jobsFound}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/40">Platforms active</span>
          <span className="text-violet-400 font-medium">12 sites</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/40">Uptime</span>
          <span className="text-white/70 font-medium">99.9% · 24/7</span>
        </div>
      </div>

      <div>
        <p className="text-xs text-white/30 mb-2">Scanning queue</p>
        <div className="flex flex-wrap gap-1.5">
          {sites.slice(0, 6).map((site) => (
            <span
              key={site}
              className={`px-2 py-1 rounded-lg text-xs font-medium transition-all duration-500 ${
                sites[currentSite] === site
                  ? "bg-violet-500/25 text-violet-300 border border-violet-500/40"
                  : "bg-white/4 text-white/30 border border-white/6"
              }`}
            >
              {site}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
