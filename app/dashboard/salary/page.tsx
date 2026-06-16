"use client";

const salaryData = [
  { tier: "Startup (Seed)", base: "$110k", equity: "0.1-0.5%", total: "$120-180k", color: "#a78bfa" },
  { tier: "Startup (Series B+)", base: "$130k", equity: "0.05-0.2%", total: "$160-220k", color: "#818cf8" },
  { tier: "Mid-size Tech", base: "$150k", equity: "$50-100k/yr", total: "$180-240k", color: "#60a5fa" },
  { tier: "FAANG / Tier 1", base: "$185k", equity: "$150-300k/yr", total: "$280-500k", color: "#34d399" },
];

const cityData = [
  { city: "San Francisco", multiplier: 1.3, avg: "$195k", index: 100 },
  { city: "New York", multiplier: 1.2, avg: "$185k", index: 93 },
  { city: "Seattle", multiplier: 1.15, avg: "$178k", index: 89 },
  { city: "Austin", multiplier: 0.9, avg: "$140k", index: 70 },
  { city: "Remote", multiplier: 1.0, avg: "$158k", index: 79 },
  { city: "London", multiplier: 0.85, avg: "$130k", index: 65 },
];

const negotiationScript = [
  { step: "1. Get the offer in writing", tip: "Always ask: 'Can you send that over in writing?' This gives you time to think and research." },
  { step: "2. Express excitement first", tip: "'I'm really excited about this offer and the team. I'm very much looking forward to joining.' Never sound desperate or disappointed." },
  { step: "3. Ask for time", tip: "'I want to give this the consideration it deserves — can I have 48-72 hours?' This is normal and expected." },
  { step: "4. Research and counter", tip: "Use levels.fyi and Glassdoor. Counter 10-20% above base. Always negotiate equity, signing bonus, and remote policy too." },
  { step: "5. The counter script", tip: "\"I'm very excited about [Company]. Based on my experience and market data on levels.fyi, I was expecting something closer to $X. Is there flexibility?\" Then stop talking." },
  { step: "6. If they say no", tip: "Ask: 'Is there flexibility on signing bonus, equity, or remote days?' Total comp matters, not just base." },
];

export default function Salary() {
  const yourEstimate = "$158k - $195k";
  const midpoint = 176;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-black text-white">Salary Intelligence</h1>
        <p className="text-white/40 text-sm mt-1">Market data for your profile: 5 YOE, TypeScript/React/Node.js, Senior Engineer roles.</p>
      </div>

      {/* Your worth card */}
      <div className="iridescent-border rounded-3xl p-px">
        <div className="glass-strong rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-32 pointer-events-none opacity-20" style={{ background: "radial-gradient(circle, #7c3aed, transparent)", filter: "blur(40px)" }} />
          <div className="relative">
            <p className="text-white/50 text-sm mb-2">Based on your profile, you&apos;re worth</p>
            <p className="text-5xl font-black gradient-text mb-2">{yourEstimate}</p>
            <p className="text-white/40 text-sm">per year total compensation · Senior Engineer · US Market</p>
            <div className="flex flex-wrap gap-3 mt-4">
              <span className="glass px-3 py-1.5 rounded-xl text-xs text-emerald-400 font-semibold">📈 Market is hot right now</span>
              <span className="glass px-3 py-1.5 rounded-xl text-xs text-violet-300 font-semibold">🎯 247 matching roles found</span>
              <span className="glass px-3 py-1.5 rounded-xl text-xs text-cyan-300 font-semibold">⚡ Negotiate confidently</span>
            </div>
          </div>
        </div>
      </div>

      {/* Salary by tier */}
      <div className="glass rounded-2xl p-6">
        <h2 className="text-white font-bold mb-5">Salary by Company Tier</h2>
        <div className="space-y-4">
          {salaryData.map((d, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-36 text-white/60 text-sm shrink-0">{d.tier}</div>
              <div className="flex-1 relative h-8 flex items-center">
                <div className="h-6 rounded-xl transition-all duration-700 flex items-center px-3"
                  style={{
                    width: `${(i + 1) * 20 + 20}%`,
                    background: `${d.color}20`,
                    border: `1px solid ${d.color}30`
                  }}
                >
                  <span className="text-xs font-bold" style={{ color: d.color }}>{d.base} base</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-white/80 text-sm font-bold">{d.total}</div>
                <div className="text-white/30 text-xs">{d.equity} equity</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Location comparison */}
      <div className="glass rounded-2xl p-6">
        <h2 className="text-white font-bold mb-5">Salary by Location</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {cityData.map((c, i) => (
            <div key={i} className="glass rounded-xl p-4">
              <div className="text-white/60 text-xs mb-1">{c.city}</div>
              <div className="text-white font-bold text-lg">{c.avg}</div>
              <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                <div className="h-full rounded-full" style={{ width: `${c.index}%`, background: `linear-gradient(90deg, #7c3aed, #06b6d4)` }} />
              </div>
              <div className="text-white/30 text-xs mt-1">{c.index}/100</div>
            </div>
          ))}
        </div>
      </div>

      {/* Negotiation guide */}
      <div>
        <h2 className="text-sm font-semibold text-white/50 uppercase tracking-widest mb-4">Negotiation Playbook</h2>
        <div className="space-y-3">
          {negotiationScript.map((s, i) => (
            <div key={i} className="glass glass-hover rounded-2xl p-5 flex gap-4">
              <div className="w-8 h-8 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-violet-300 font-black text-sm shrink-0">
                {i + 1}
              </div>
              <div>
                <h3 className="text-white font-bold text-sm mb-1">{s.step.replace(/^\d+\.\s/, '')}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{s.tip}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
