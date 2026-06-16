"use client";

import AgentStatus from "@/components/AgentStatus";
import Link from "next/link";

const stats = [
  { label: "Jobs Found Today", value: "47", change: "+12 since yesterday", color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/30" },
  { label: "Interviews Scheduled", value: "3", change: "+1 this week", color: "text-green-400", bg: "bg-green-500/10 border-green-500/30" },
  { label: "Match Score Avg", value: "91%", change: "Top 5% of candidates", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/30" },
  { label: "Sites Scraped", value: "12", change: "All platforms active", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/30" },
];

const recentJobs = [
  { company: "Anthropic", role: "AI Engineer", salary: "$160k-220k", location: "Hybrid SF", match: 96, source: "LinkedIn" },
  { company: "Google", role: "Senior Software Engineer", salary: "$150k-200k", location: "Remote", match: 97, source: "Indeed" },
  { company: "Linear", role: "Software Engineer", salary: "$130k-160k", location: "Remote", match: 93, source: "Remote.co" },
];

const upcomingMeetings = [
  { company: "Google", role: "Senior Software Engineer", date: "Jun 18, 2024", time: "10:00 AM PST", type: "Video", status: "Confirmed" },
  { company: "Stripe", role: "Full Stack Developer", date: "Jun 20, 2024", time: "2:00 PM PST", type: "Phone", status: "Confirmed" },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard Overview</h1>
        <p className="text-gray-400 text-sm mt-1">Your AI agent is actively hunting for the perfect job.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className={`bg-gray-900 border ${stat.bg} rounded-xl p-5`}>
            <p className="text-gray-400 text-sm mb-2">{stat.label}</p>
            <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agent Status */}
        <div className="lg:col-span-1">
          <h2 className="text-lg font-semibold mb-3">AI Agent Status</h2>
          <AgentStatus />
        </div>

        {/* Recent Matches */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Top Job Matches</h2>
            <Link href="/dashboard/jobs" className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
              View all 47 →
            </Link>
          </div>
          <div className="space-y-3">
            {recentJobs.map((job, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/30 to-blue-500/30 border border-purple-500/20 flex items-center justify-center text-sm font-bold text-purple-300 shrink-0">
                  {job.company[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm truncate">{job.role}</p>
                  <p className="text-gray-400 text-xs">{job.company} · {job.location} · {job.salary}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className={`text-lg font-black ${job.match >= 95 ? "text-green-400" : job.match >= 90 ? "text-blue-400" : "text-purple-400"}`}>
                    {job.match}%
                  </div>
                  <div className="text-xs text-gray-500">match</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upcoming Meetings */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Upcoming Interviews</h2>
          <Link href="/dashboard/meetings" className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {upcomingMeetings.map((m, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-white font-semibold">{m.role}</p>
                  <p className="text-gray-400 text-sm">{m.company}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  m.status === "Confirmed" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"
                }`}>
                  {m.status}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span>📅 {m.date}</span>
                <span>🕐 {m.time}</span>
                <span>📹 {m.type}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
