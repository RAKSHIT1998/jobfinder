"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";

type Status = "Applied" | "Interview" | "Offer" | "Rejected";

interface Application {
  id: string;
  company: string;
  role: string;
  salary: string | null;
  status: Status;
  created_at: string;
}

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

const AVATAR_COLORS = ["#4285F4", "#635bff", "#5e6ad2", "#96bf48", "#a259ff", "#ff5a5f", "#6e40c9", "#d97706"];
const avatarColor = (company: string) => {
  let hash = 0;
  for (const ch of company) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};

export default function Tracker() {
  const [email, setEmail] = useState<string | null>(null);
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback((userEmail: string) => {
    setLoading(true);
    fetch(`/api/applications?email=${encodeURIComponent(userEmail)}`)
      .then((r) => r.json())
      .then((data) => setApps(data.applications || []))
      .catch(() => setError("Could not load your applications."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("jobfinder_cv") : null;
    const cvEmail = stored ? JSON.parse(stored).email : null;
    setEmail(cvEmail);
    if (cvEmail) load(cvEmail);
    else setLoading(false);
  }, [load]);

  const move = async (id: string, newStatus: Status) => {
    setApps((prev) => prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a)));
    await fetch("/api/applications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: newStatus }),
    }).catch(() => {});
  };

  if (!email) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4 text-center">
        <p className="text-white/50">Build your CV first to start tracking applications.</p>
        <Link href="/create-cv" className="btn-primary px-6 py-3 rounded-2xl text-sm font-bold">Build Your CV</Link>
      </div>
    );
  }

  const responseRate = apps.length > 0 ? Math.round((apps.filter((a) => a.status !== "Applied").length / apps.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-white">Application Tracker</h1>
        <p className="text-white/40 text-sm mt-1">Track your applications from submission to offer.</p>
      </div>

      {error && (
        <div className="glass rounded-2xl p-5 text-red-400 text-sm border border-red-500/20">{error}</div>
      )}

      {!loading && apps.length === 0 && !error && (
        <div className="glass rounded-2xl p-8 text-center text-white/40 text-sm space-y-3">
          <p>No applications yet — applying to a job from the Jobs tab adds it here automatically.</p>
          <Link href="/dashboard/jobs" className="btn-primary inline-block px-6 py-3 rounded-2xl text-sm font-bold">Find Jobs</Link>
        </div>
      )}

      {apps.length > 0 && (
        <>
          {/* Stats */}
          <RevealGroup className="grid grid-cols-2 md:grid-cols-4 gap-4" stagger={0.06}>
            {columns.map((col) => {
              const count = apps.filter((a) => a.status === col.status).length;
              return (
                <RevealItem key={col.status}>
                  <div className="glass rounded-2xl p-4 text-center" style={{ boxShadow: `0 8px 32px ${col.glow}` }}>
                    <div className={`text-3xl font-black ${statusColors[col.status].split(" ")[0]}`}>{count}</div>
                    <div className="text-white/40 text-xs mt-1">{col.status}</div>
                  </div>
                </RevealItem>
              );
            })}
          </RevealGroup>

          <div className="glass rounded-xl p-3 flex items-center gap-3">
            <div className="text-emerald-400 font-black text-2xl">{responseRate}%</div>
            <div>
              <div className="text-white/70 text-sm font-semibold">Response rate</div>
              <div className="text-white/30 text-xs">Share of your applications that moved past &quot;Applied&quot;</div>
            </div>
            <div className="ml-auto flex-1 max-w-32 h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, #7c3aed, #6366f1)" }}
                initial={{ width: 0 }}
                animate={{ width: `${responseRate}%` }}
                transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
              />
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
                    <AnimatePresence>
                      {colApps.map((app) => {
                        const next = nextStatuses[app.status];
                        const color = avatarColor(app.company);
                        return (
                          <motion.div
                            key={app.id}
                            layout
                            layoutId={app.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ type: "spring", stiffness: 350, damping: 28 }}
                            className="glass rounded-xl p-3 glass-hover"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0"
                                style={{ background: `${color}15`, border: `1px solid ${color}25`, color }}>
                                {app.company[0]?.toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <div className="text-white/80 text-xs font-bold truncate">{app.company}</div>
                                <div className="text-white/30 text-xs truncate">{app.role}</div>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-emerald-400 text-xs font-semibold">{app.salary || "—"}</span>
                              <span className="text-white/25 text-xs">{app.created_at.slice(0, 10)}</span>
                            </div>
                            {next && (
                              <button
                                onClick={() => move(app.id, next)}
                                className="mt-2 w-full text-xs py-1.5 rounded-lg btn-glass text-white/40 hover:text-white/70 transition-all"
                              >
                                Move to {next} →
                              </button>
                            )}
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                    {colApps.length === 0 && (
                      <div className="text-center py-8 text-white/20 text-sm">Empty</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
