"use client";

const skillsData = [
  { skill: "TypeScript", yours: 85, market: 90, gap: 5 },
  { skill: "System Design", yours: 60, market: 88, gap: 28 },
  { skill: "React", yours: 90, market: 85, gap: -5 },
  { skill: "Node.js", yours: 80, market: 82, gap: 2 },
  { skill: "AWS / Cloud", yours: 55, market: 85, gap: 30 },
  { skill: "Docker / K8s", yours: 50, market: 80, gap: 30 },
  { skill: "GraphQL", yours: 40, market: 65, gap: 25 },
  { skill: "Python / ML", yours: 35, market: 70, gap: 35 },
];

const topToLearn = [
  { skill: "AWS / Cloud", impact: "Unlocks 34 more roles", difficulty: "Medium", time: "3-4 months", resource: "AWS Solutions Architect course", color: "text-amber-400 border-amber-400/30 bg-amber-400/10" },
  { skill: "System Design", impact: "Required for senior roles", difficulty: "Hard", time: "2-3 months", resource: "Designing Data-Intensive Applications", color: "text-violet-400 border-violet-400/30 bg-violet-400/10" },
  { skill: "Docker / K8s", impact: "Unlocks 28 more roles", difficulty: "Medium", time: "1-2 months", resource: "Docker Deep Dive (YouTube)", color: "text-cyan-400 border-cyan-400/30 bg-cyan-400/10" },
  { skill: "Python / ML", impact: "AI roles pay 40% more", difficulty: "Medium", time: "4-6 months", resource: "fast.ai Practical Deep Learning", color: "text-pink-400 border-pink-400/30 bg-pink-400/10" },
  { skill: "GraphQL", impact: "Unlocks 18 more roles", difficulty: "Easy", time: "2-3 weeks", resource: "How to GraphQL (free)", color: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10" },
];

const profileScore = 78;

export default function Skills() {
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (profileScore / 100) * circumference;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-black text-white">Skills Gap Analysis</h1>
        <p className="text-white/40 text-sm mt-1">AI compared your skills against 247 matching job descriptions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile score */}
        <div className="glass rounded-2xl p-6 flex flex-col items-center text-center">
          <h3 className="text-white/60 text-sm font-semibold mb-4">Profile Optimization</h3>
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
              <circle
                cx="60" cy="60" r="54"
                fill="none"
                stroke="url(#grad)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                style={{ transition: "stroke-dashoffset 1s ease" }}
              />
              <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black gradient-text">{profileScore}%</span>
              <span className="text-white/40 text-xs">optimized</span>
            </div>
          </div>
          <p className="text-white/50 text-xs mt-4 leading-relaxed">
            Learn the top 5 skills below to reach <span className="text-violet-300 font-semibold">95%+</span> and unlock 89 more roles.
          </p>
        </div>

        {/* Skill bars */}
        <div className="lg:col-span-2 glass rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-5">Your Skills vs Market Demand</h3>
          <div className="space-y-4">
            {skillsData.map((s, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-white/70 text-sm font-semibold">{s.skill}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-white/40 text-xs">{s.yours}% you</span>
                    <span className={`text-xs font-bold ${s.gap > 0 ? "text-amber-400" : "text-emerald-400"}`}>
                      {s.gap > 0 ? `−${s.gap}` : `+${Math.abs(s.gap)}`}
                    </span>
                  </div>
                </div>
                <div className="relative h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                  {/* Market demand bar */}
                  <div className="absolute inset-0 rounded-full" style={{ width: `${s.market}%`, background: "rgba(255,255,255,0.08)" }} />
                  {/* Your level bar */}
                  <div className="absolute inset-0 h-2 rounded-full transition-all duration-700"
                    style={{
                      width: `${s.yours}%`,
                      background: s.gap > 15
                        ? "linear-gradient(90deg, #f59e0b, #ef4444)"
                        : s.gap > 0
                        ? "linear-gradient(90deg, #8b5cf6, #06b6d4)"
                        : "linear-gradient(90deg, #10b981, #06b6d4)"
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/5">
            <div className="flex items-center gap-2"><div className="w-3 h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.1)" }} /><span className="text-white/30 text-xs">Market demand</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-1.5 rounded-full bg-violet-400" /><span className="text-white/30 text-xs">Your level</span></div>
          </div>
        </div>
      </div>

      {/* Top skills to learn */}
      <div>
        <h2 className="text-sm font-semibold text-white/50 uppercase tracking-widest mb-4">Top 5 Skills to Learn</h2>
        <div className="space-y-3">
          {topToLearn.map((item, i) => (
            <div key={i} className="glass glass-hover rounded-2xl p-5 flex items-center gap-5">
              <div className="text-2xl font-black text-white/20 w-8 shrink-0">0{i + 1}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-white font-bold">{item.skill}</h3>
                  <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold border ${item.color}`}>{item.difficulty}</span>
                </div>
                <p className="text-emerald-400 text-xs font-semibold mt-1">{item.impact}</p>
                <p className="text-white/40 text-xs mt-1">📚 {item.resource} · ⏱ {item.time}</p>
              </div>
              <button className="btn-glass px-4 py-2 rounded-xl text-xs font-semibold text-white/60 hover:text-white shrink-0">
                Start →
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
