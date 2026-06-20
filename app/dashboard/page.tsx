"use client";

import { useState, useEffect } from "react";
import AgentStatus from "@/components/AgentStatus";
import Link from "next/link";
import { Brain, PenLine, BarChart3, Wallet } from "lucide-react";
import { StaggerGroup as RevealGroup, StaggerItem as RevealItem } from "@/components/motion/Reveal";
import { AnimatedCounter } from "@/components/motion/AnimatedCounter";
import { TiltCard } from "@/components/motion/TiltCard";

interface ScoredJob {
  id: string;
  title: string;
  company: string;
  location: string;
  source: string;
  match: number;
}

interface Application {
  company: string;
  role: string;
  status: string;
  interview_at: string | null;
}

const quickActions = [
  { href: "/dashboard/ai-coach", label: "Practice Interview", Icon: Brain, desc: "AI-powered prep" },
  { href: "/dashboard/cover-letter", label: "Generate Cover Letter", Icon: PenLine, desc: "Personalized in seconds" },
  { href: "/dashboard/skills", label: "Check Skills Gap", Icon: BarChart3, desc: "See what to learn" },
  { href: "/dashboard/salary", label: "Salary Intelligence", Icon: Wallet, desc: "Know your worth" },
];

export default function Dashboard() {
  const [email, setEmail] = useState<string | null>(null);
  const [jobs, setJobs] = useState<ScoredJob[]>([]);
  const [sources, setSources] = useState<string[]>([]);
  const [interviews, setInterviews] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("jobfinder_cv") : null;
    const cvEmail = stored ? JSON.parse(stored).email : null;
    setEmail(cvEmail);
    if (!cvEmail) { setLoading(false); return; }

    Promise.all([
      fetch(`/api/jobs?email=${encodeURIComponent(cvEmail)}`).then((r) => r.json()),
      fetch(`/api/applications?email=${encodeURIComponent(cvEmail)}`).then((r) => r.json()),
    ])
      .then(([jobsData, appsData]) => {
        setJobs(jobsData.jobs || []);
        setSources(jobsData.sourcedFrom || []);
        const apps: Application[] = appsData.applications || [];
        setInterviews(apps.filter((a) => a.status === "Interview"));
      })
      .finally(() => setLoading(false));
  }, []);

  const avgMatch = jobs.length ? Math.round(jobs.reduce((s, j) => s + j.match, 0) / jobs.length) : null;

  const stats = [
    { label: "Jobs Matched", value: jobs.length, suffix: "", color: "text-violet-300", border: "rgba(139,92,246,0.2)", glow: "rgba(139,92,246,0.1)" },
    { label: "Interviews Scheduled", value: interviews.length, suffix: "", color: "text-emerald-300", border: "rgba(52,211,153,0.2)", glow: "rgba(52,211,153,0.1)" },
    { label: "Avg Match Score", value: avgMatch, suffix: "%", color: "text-cyan-300", border: "rgba(34,211,238,0.2)", glow: "rgba(34,211,238,0.1)" },
    { label: "Live Sources", value: sources.length, suffix: "", color: "text-pink-300", border: "rgba(236,72,153,0.2)", glow: "rgba(236,72,153,0.1)" },
  ];

  if (!email) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4 text-center">
        <p className="text-white/50">Build your CV to start scanning real jobs.</p>
        <Link href="/create-cv" className="btn-primary px-6 py-3 rounded-2xl text-sm font-bold">Build Your CV</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-3xl font-black text-white">Dashboard</h1>
        <p className="text-white/40 text-sm mt-1">Live job data scanned from real sources, matched against your real CV.</p>
      </div>

      <RevealGroup className="grid grid-cols-2 lg:grid-cols-4 gap-4" stagger={0.06}>
        {stats.map((stat, i) => (
          <RevealItem key={i}>
            <TiltCard className="glass rounded-2xl p-5" max={8} style={{ borderColor: stat.border, boxShadow: `0 8px 32px ${stat.glow}` }}>
              <p className="text-white/40 text-xs mb-2">{stat.label}</p>
              <p className={`text-3xl font-black ${stat.color}`}>
                {loading || stat.value === null ? "—" : <AnimatedCounter value={stat.value} suffix={stat.suffix} />}
              </p>
            </TiltCard>
          </RevealItem>
        ))}
      </RevealGroup>

      <div>
        <h2 className="text-sm font-semibold text-white/50 uppercase tracking-widest mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map((a, i) => (
            <Link key={i} href={a.href} className="group block">
              <TiltCard className="glass glass-hover rounded-2xl p-4" max={10}>
                <div className="w-9 h-9 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-3 transition-colors group-hover:bg-violet-500/20">
                  <a.Icon className="w-4 h-4 text-violet-300" strokeWidth={1.75} />
                </div>
                <div className="text-white/80 font-semibold text-sm group-hover:text-white transition-colors">{a.label}</div>
                <div className="text-white/30 text-xs mt-0.5">{a.desc}</div>
              </TiltCard>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-widest mb-3">Scan Status</h2>
          <AgentStatus jobsAnalyzed={jobs.length} sources={sources} loading={loading} />
        </div>

        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white/50 uppercase tracking-widest">Top Matches</h2>
            <Link href="/dashboard/jobs" className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
              View all {jobs.length} →
            </Link>
          </div>
          <RevealGroup className="space-y-3" stagger={0.08}>
            {jobs.slice(0, 3).map((job) => (
              <RevealItem key={job.id}>
                <TiltCard className="glass glass-hover rounded-2xl p-4 flex items-center gap-4" max={6}>
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-white/8 flex items-center justify-center text-base font-black text-violet-300 shrink-0">
                    {job.company[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm truncate">{job.title}</p>
                    <p className="text-white/40 text-xs truncate">{job.company} · {job.location} · {job.source}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className={`text-xl font-black ${job.match >= 40 ? "text-emerald-400" : job.match >= 20 ? "text-cyan-400" : "text-violet-400"}`}>
                      {job.match}%
                    </div>
                    <div className="text-white/30 text-xs">match</div>
                  </div>
                </TiltCard>
              </RevealItem>
            ))}
            {!loading && jobs.length === 0 && (
              <p className="text-white/30 text-sm">No live matches yet — try adding more skills to your CV.</p>
            )}
          </RevealGroup>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-widest">Upcoming Interviews</h2>
          <Link href="/dashboard/meetings" className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
            View all →
          </Link>
        </div>
        {interviews.length === 0 ? (
          <p className="text-white/30 text-sm">No interviews scheduled yet.</p>
        ) : (
          <RevealGroup className="grid grid-cols-1 md:grid-cols-2 gap-4" stagger={0.08}>
            {interviews.slice(0, 2).map((m, i) => (
              <RevealItem key={i}>
                <TiltCard className="glass rounded-2xl p-5" max={6}>
                  <p className="text-white font-semibold text-sm">{m.role}</p>
                  <p className="text-white/40 text-xs">{m.company}</p>
                  <p className="text-white/40 text-xs mt-2">
                    {m.interview_at ? new Date(m.interview_at).toLocaleString() : "Date not set yet"}
                  </p>
                </TiltCard>
              </RevealItem>
            ))}
          </RevealGroup>
        )}
      </div>
    </div>
  );
}
