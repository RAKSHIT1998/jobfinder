"use client";

const meetings = [
  { company: "Google", role: "Senior Software Engineer", date: "Wed, Jun 18", time: "10:00 AM PST", duration: "45 min", type: "Video", status: "Confirmed", interviewer: "Sarah Kim, Engineering Manager", link: "#", color: "#4285F4" },
  { company: "Stripe", role: "Full Stack Developer", date: "Fri, Jun 20", time: "2:00 PM PST", duration: "30 min", type: "Phone", status: "Confirmed", interviewer: "Mike Chen, Tech Recruiter", link: null, color: "#635bff" },
  { company: "Anthropic", role: "AI Engineer", date: "Mon, Jun 23", time: "11:00 AM PST", duration: "60 min", type: "Video", status: "Pending", interviewer: "TBD", link: null, color: "#d97706" },
  { company: "Vercel", role: "Frontend Engineer", date: "Tue, Jun 24", time: "9:00 AM PST", duration: "45 min", type: "Video", status: "Pending", interviewer: "TBD", link: null, color: "#ffffff" },
];

const prepTips = [
  { icon: "🔍", tip: "Research the company's recent news, products, and engineering blog" },
  { icon: "💻", tip: "Review system design patterns and data structures" },
  { icon: "🎯", tip: "Prepare 3-4 STAR format stories about past accomplishments" },
  { icon: "❓", tip: "Prepare thoughtful questions to ask your interviewer" },
  { icon: "🕐", tip: "Test your video setup and internet connection 10 minutes before" },
  { icon: "📝", tip: "Have your resume and notes ready for reference" },
];

export default function Meetings() {
  const confirmed = meetings.filter(m => m.status === "Confirmed");
  const pending = meetings.filter(m => m.status === "Pending");

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-black text-white">Scheduled Interviews</h1>
        <p className="text-white/40 text-sm mt-1">{confirmed.length} confirmed · {pending.length} pending confirmation</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass rounded-2xl p-4 text-center">
          <div className="text-3xl font-black text-emerald-400">{confirmed.length}</div>
          <div className="text-xs text-white/40 mt-1">Confirmed</div>
        </div>
        <div className="glass rounded-2xl p-4 text-center">
          <div className="text-3xl font-black text-amber-400">{pending.length}</div>
          <div className="text-xs text-white/40 mt-1">Pending</div>
        </div>
        <div className="glass rounded-2xl p-4 text-center">
          <div className="text-3xl font-black text-cyan-400">{meetings.length}</div>
          <div className="text-xs text-white/40 mt-1">Total</div>
        </div>
      </div>

      {/* Timeline */}
      <div>
        <h2 className="text-sm font-semibold text-white/50 uppercase tracking-widest mb-4">Interview Schedule</h2>
        <div className="relative">
          <div className="absolute left-3 top-2 bottom-2 w-px" style={{ background: "linear-gradient(to bottom, rgba(139,92,246,0.5), rgba(6,182,212,0.5))" }} />
          <div className="space-y-4">
            {meetings.map((m, i) => (
              <div key={i} className="flex gap-5 pl-3">
                <div className={`relative w-6 h-6 rounded-full border-2 mt-3 shrink-0 -ml-3 flex items-center justify-center ${
                  m.status === "Confirmed"
                    ? "border-emerald-400 bg-emerald-400/20"
                    : "border-amber-400 bg-amber-400/20"
                }`}>
                  {m.status === "Confirmed" && <div className="w-2 h-2 rounded-full bg-emerald-400" />}
                </div>

                <div className="flex-1 glass glass-hover rounded-2xl p-5">
                  <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm"
                        style={{ background: `${m.color}15`, border: `1px solid ${m.color}25`, color: m.color }}>
                        {m.company[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-bold text-sm">{m.role}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            m.status === "Confirmed"
                              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                              : "bg-amber-500/15 text-amber-400 border border-amber-500/25"
                          }`}>
                            {m.status}
                          </span>
                        </div>
                        <p className="text-white/40 text-xs">{m.company}</p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-xl text-xs font-semibold border ${
                      m.type === "Video"
                        ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/25"
                        : "bg-violet-500/15 text-violet-300 border-violet-500/25"
                    }`}>
                      {m.type === "Video" ? "📹" : "📞"} {m.type}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    {[
                      { label: "Date", value: m.date },
                      { label: "Time", value: m.time },
                      { label: "Duration", value: m.duration },
                      { label: "Interviewer", value: m.interviewer },
                    ].map((d) => (
                      <div key={d.label} className="glass rounded-xl p-2.5">
                        <div className="text-white/30 mb-1">{d.label}</div>
                        <div className="text-white/80 font-semibold truncate">{d.value}</div>
                      </div>
                    ))}
                  </div>

                  {m.link && (
                    <div className="mt-4 pt-4 border-t border-white/5">
                      <a href={m.link} className="inline-flex items-center gap-2 glass px-4 py-2 rounded-xl text-cyan-300 text-sm font-semibold hover:bg-cyan-500/10 transition-all">
                        📹 Join Meeting
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Prep Tips */}
      <div>
        <h2 className="text-sm font-semibold text-white/50 uppercase tracking-widest mb-4">AI Interview Prep Tips</h2>
        <div className="glass rounded-2xl p-6">
          <p className="text-white/40 text-sm mb-4">AI analyzed your upcoming interviews and prepared personalized tips:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {prepTips.map((tip, i) => (
              <div key={i} className="glass rounded-xl p-3 flex items-start gap-3">
                <span className="text-lg shrink-0">{tip.icon}</span>
                <p className="text-white/60 text-sm">{tip.tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
