"use client";

import { useState } from "react";

type Status = "Applied" | "Interview" | "Offer" | "Rejected";

interface Application {
  id: number;
  company: string;
  role: string;
  salary: string;
  date: string;
  status: Status;
  color: string;
}

const initialApps: Application[] = [
  { id: 1, company: "Google", role: "Senior Software Engineer", salary: "$150k-200k", date: "Jun 10", status: "Interview", color: "#4285F4" },
  { id: 2, company: "Stripe", role: "Full Stack Developer", salary: "$130k-170k", date: "Jun 11", status: "Interview", color: "#635bff" },
  { id: 3, company: "Anthropic", role: "AI Engineer", salary: "$160k-220k", date: "Jun 12", status: "Applied", color: "#d97706" },
  { id: 4, company: "Linear", role: "Software Engineer", salary: "$130k-160k", date: "Jun 13", status: "Applied", color: "#5e6ad2" },
  { id: 5, company: "Vercel", role: "Frontend Engineer", salary: "$120k-160k", date: "Jun 9", status: "Applied", color: "#ffffff" },
  { id: 6, company: "Figma", role: "Software Engineer", salary: "$140k-180k", date: "Jun 8", status: "Rejected", color: "#a259ff" },
  { id: 7, company: "Meta", role: "Senior Engineer", salary: "$180k-240k", date: "Jun 7", status: "Offer", color: "#1877f2" },
  { id: 8, company: "Shopify", role: "Backend Developer", salary: "$125k-155k", date: "Jun 14", status: "Applied", color: "#96bf48" },
];

const columns: { status: Status; color: string; glow: string }[] = [
  { status: "Applied", color: "border-white/15 bg-white/3", glow: "rgba(255,255,255,0.05)" },
  { status: "Interview", color: "border-cyan-500/25 bg-cyan-500/5", glow: "rgba(6,182,212,0.1)" },
  { status: "Offer", color: "border-emerald-500/25 bg-emerald-500/5", glow: "rgba(52,211,153,0.1)" },
  { status: "Rejected", color: "border-red-500/20 bg-red-500/3", glow: "rgba(239,68,68,0.05)" },
];

const statusColors: Record<Status, string> = {
  Applied: "text-white/60 bg-white/8 border-white/15",
  Interview: "text-cyan-300 bg-cyan-500/15 border-cyan-500/25",
  Offer: "text-emerald-300 bg-emerald-500/15 border-emerald-500/25",
  Rejected: "text-red-400 bg-red-500/10 border-red-500/20",
};

const nextStatuses: Record<Status, Status | null> = {
  Applied: "Interview",
  Interview: "Offer",
  Offer: null,
  Rejected: null,
};

export default function Tracker() {
  const [apps, setApps] = useState(initialApps);

  const move = (id: number, newStatus: Status) => {
    setApps((prev) => prev.map((a) => a.id === id ? { ...a, status: newStatus } : a));
  };

  const responseRate = Math.round((apps.filter(a => a.status !== "Applied").length / apps.length) * 100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-white">Application Tracker</h1>
        <p className="text-white/40 text-sm mt-1">Track your applications from submission to offer.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {columns.map((col) => {
          const count = apps.filter(a => a.status === col.status).length;
          return (
            <div key={col.status} className="glass rounded-2xl p-4 text-center" style={{ boxShadow: `0 8px 32px ${col.glow}` }}>
              <div className={`text-3xl font-black ${statusColors[col.status].split(" ")[0]}`}>{count}</div>
              <div className="text-white/40 text-xs mt-1">{col.status}</div>
            </div>
          );
        })}
      </div>

      <div className="glass rounded-xl p-3 flex items-center gap-3">
        <div className="text-emerald-400 font-black text-2xl">{responseRate}%</div>
        <div>
          <div className="text-white/70 text-sm font-semibold">Response rate</div>
          <div className="text-white/30 text-xs">Industry avg is 8% — you&apos;re at {responseRate}% 🔥</div>
        </div>
        <div className="ml-auto flex-1 max-w-32 h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
          <div className="h-full rounded-full" style={{ width: `${responseRate}%`, background: "linear-gradient(90deg, #7c3aed, #06b6d4)" }} />
        </div>
      </div>

      {/* Kanban */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {columns.map((col) => {
          const colApps = apps.filter((a) => a.status === col.status);
          return (
            <div key={col.status} className={`rounded-2xl p-3 border ${col.color}`} style={{ minHeight: "300px" }}>
              <div className="flex items-center justify-between mb-3 px-1">
                <span className={`text-sm font-bold px-2 py-1 rounded-lg border ${statusColors[col.status]}`}>{col.status}</span>
                <span className="text-white/30 text-sm font-bold">{colApps.length}</span>
              </div>

              <div className="space-y-2">
                {colApps.map((app) => {
                  const next = nextStatuses[app.status];
                  return (
                    <div key={app.id} className="glass rounded-xl p-3 glass-hover">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0"
                          style={{ background: `${app.color}15`, border: `1px solid ${app.color}25`, color: app.color }}>
                          {app.company[0]}
                        </div>
                        <div className="min-w-0">
                          <div className="text-white/80 text-xs font-bold truncate">{app.company}</div>
                          <div className="text-white/30 text-xs truncate">{app.role}</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-emerald-400 text-xs font-semibold">{app.salary}</span>
                        <span className="text-white/25 text-xs">{app.date}</span>
                      </div>
                      {next && (
                        <button
                          onClick={() => move(app.id, next)}
                          className="mt-2 w-full text-xs py-1.5 rounded-lg btn-glass text-white/40 hover:text-white/70 transition-all"
                        >
                          Move to {next} →
                        </button>
                      )}
                    </div>
                  );
                })}
                {colApps.length === 0 && (
                  <div className="text-center py-8 text-white/20 text-sm">Empty</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
