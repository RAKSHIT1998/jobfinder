"use client";

import AgentStatus from "@/components/AgentStatus";
import Link from "next/link";

const stats = [
  { label: "Jobs Found Today", value: "247", change: "+38 since yesterday", color: "text-violet-300", border: "rgba(139,92,246,0.2)", glow: "rgba(139,92,246,0.1)" },
  { label: "Interviews Scheduled", value: "4", change: "+2 this week", color: "text-emerald-300", border: "rgba(52,211,153,0.2)", glow: "rgba(52,211,153,0.1)" },
  { label: "Avg Match Score", value: "91%", change: "Top 5% of candidates", color: "text-cyan-300", border: "rgba(34,211,238,0.2)", glow: "rgba(34,211,238,0.1)" },
  { label: "Platforms Active", value: "12", change: "All systems running", color: "text-pink-300", border: "rgba(236,72,153,0.2)", glow: "rgba(236,72,153,0.1)" },
];

const recentJobs = [
  { company: "Anthropic", role: "AI Engineer", salary: "$160k-220k", location: "Hybrid SF", match: 96 },
  { company: "Google", role: "Senior Software Engineer", salary: "$150k-200k", location: "Remote", match: 97 },
  { company: "Linear", role: "Software Engineer", salary: "$130k-160k", location: "Remote", match: 93 },
];

const upcomingMeetings = [
  { company: "Google", role: "Senior Software Engineer", date: "Jun 18", time: "10:00 AM", type: "Video", status: "Confirmed" },
  { company: "Stripe", role: "Full Stack Developer", date: "Jun 20", time: "2:00 PM", type: "Phone", status: "Confirmed" },
];

const quickActions = [
  { href: "/dashboard/ai-coach", label: "Practice Interview", icon: "🧠", desc: "AI-powered prep" },
  { href: "/dashboard/cover-letter", label: "Generate Cover Letter", icon: "✍️", desc: "Personalized in seconds" },
  { href: "/dashboard/skills", label: "Check Skills Gap", icon: "📊", desc: "See what to learn" },
  { href: "/dashboard/salary", label: "Salary Intelligence", icon: "💰", desc: "Know your worth" },
];

export default function Dashboard() {
  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-3xl font-black text-white">Dashboard</h1>
        <p className="text-white/40 text-sm mt-1">Your AI agent is actively hunting for the perfect job right now.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="glass rounded-2xl p-5" style={{ borderColor: stat.border, boxShadow: `0 8px 32px ${stat.glow}` }}>
            <p className="text-white/40 text-xs mb-2">{stat.label}</p>
            <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
            <p className="text-white/25 text-xs mt-1.5">{stat.change}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold text-white/50 uppercase tracking-widest mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map((a, i) => (
            <Link key={i} href={a.href} className="glass glass-hover rounded-2xl p-4 group">
              <div className="text-2xl mb-2">{a.icon}</div>
              <div className="text-white/80 font-semibold text-sm group-hover:text-white transition-colors">{a.label}</div>
              <div className="text-white/30 text-xs mt-0.5">{a.desc}</div>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-widest mb-3">Agent Status</h2>
          <AgentStatus />
        </div>

        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white/50 uppercase tracking-widest">Top Matches</h2>
            <Link href="/dashboard/jobs" className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
              View all 247 →
            </Link>
          </div>
          <div className="space-y-3">
            {recentJobs.map((job, i) => (
              <div key={i} className="glass glass-hover rounded-2xl p-4 flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 border border-white/8 flex items-center justify-center text-base font-black text-violet-300 shrink-0">
                  {job.company[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm">{job.role}</p>
                  <p className="text-white/40 text-xs">{job.company} · {job.location} · {job.salary}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className={`text-xl font-black ${job.match >= 95 ? "text-emerald-400" : job.match >= 90 ? "text-cyan-400" : "text-violet-400"}`}>
                    {job.match}%
                  </div>
                  <div className="text-white/30 text-xs">match</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upcoming interviews */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-widest">Upcoming Interviews</h2>
          <Link href="/dashboard/meetings" className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {upcomingMeetings.map((m, i) => (
            <div key={i} className="glass rounded-2xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-white font-semibold text-sm">{m.role}</p>
                  <p className="text-white/40 text-xs">{m.company}</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                  {m.status}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-white/40">
                <span>📅 {m.date}</span>
                <span>🕐 {m.time}</span>
                <span>{m.type === "Video" ? "📹" : "📞"} {m.type}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
