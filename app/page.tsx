import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const features = [
  { icon: "⚡", title: "AI Job Scraping 24/7", desc: "Our agent scrapes local job listings and big recruiters non-stop, finding roles that match your exact profile before anyone else sees them." },
  { icon: "🎯", title: "97% Match Accuracy", desc: "Deep skill analysis matches you to roles where you have the highest chance of getting hired." },
  { icon: "📄", title: "ATS-Optimized CV", desc: "AI builds your CV with the exact keywords each company's ATS system looks for." },
  { icon: "📅", title: "Auto Interview Scheduling", desc: "AI contacts recruiters and schedules interviews on your behalf. You just show up." },
  { icon: "🧠", title: "AI Interview Coach", desc: "Practice with our AI coach that knows what each company asks. Get ready to crush it." },
  { icon: "💰", title: "Salary Intelligence", desc: "Know your market value before negotiating. AI gives you data-backed salary targets." },
  { icon: "✍️", title: "Cover Letter Generator", desc: "Personalized cover letters for each role in seconds, tailored to the job description." },
  { icon: "📊", title: "Skills Gap Analysis", desc: "See exactly what skills to learn to unlock higher-paying roles at top companies." },
];

const steps = [
  { num: "01", title: "Build Your CV", desc: "Fill out our 7-step smart form in 5 minutes. AI extracts your skills, experiences, and career goals." },
  { num: "02", title: "AI Hunts Jobs", desc: "Your personal agent scans local job listings and big recruiters around the clock, scoring thousands of jobs against your profile." },
  { num: "03", title: "Get Hired", desc: "Interviews get auto-scheduled. AI coaches you. You show up, impress them, and land the job." },
];

const testimonials = [
  { name: "Sarah Chen", role: "Software Engineer at Google", avatar: "SC", text: "Got 3 interviews in my first week. The AI found roles I'd have never found manually. Landed Google in 3 weeks." },
  { name: "Marcus Johnson", role: "Full Stack Dev at Stripe", avatar: "MJ", text: "Paid $10 on Tuesday, had my first interview by Thursday. The match scores are scary accurate." },
  { name: "Priya Patel", role: "Frontend Engineer at Vercel", avatar: "PP", text: "The auto-scheduling is mind-blowing. Zero cold emails. Everything handled. Offer in 2 weeks." },
  { name: "David Kim", role: "AI Engineer at Anthropic", avatar: "DK", text: "The interview coach prepped me perfectly. I knew exactly what they'd ask. Best $10 I ever spent." },
];

const liveActivity = [
  "🤖 Agent found Senior Engineer at Google · 97% match",
  "📅 Interview scheduled with Stripe recruiter for tomorrow",
  "🎯 New role at Anthropic matches your profile at 96%",
  "✅ CV submitted to 3 companies automatically",
  "🧠 AI coach prepared 12 interview questions for you",
  "💰 Salary insight: You can negotiate $20k more at Vercel",
  "📊 Skills gap: Learning TypeScript could unlock 47 more roles",
  "🔍 Scanning 1,240 new jobs on LinkedIn right now",
];

export default function Home() {
  return (
    <div className="min-h-screen" style={{ background: "#050508" }}>
      <Navbar />

      {/* Blob background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="animate-blob animation-delay-0 absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20" style={{ background: "radial-gradient(circle, #7c3aed, transparent)", filter: "blur(80px)" }} />
        <div className="animate-blob animation-delay-2000 absolute top-1/3 right-1/4 w-80 h-80 rounded-full opacity-15" style={{ background: "radial-gradient(circle, #0891b2, transparent)", filter: "blur(80px)" }} />
        <div className="animate-blob animation-delay-4000 absolute bottom-1/4 left-1/3 w-72 h-72 rounded-full opacity-15" style={{ background: "radial-gradient(circle, #db2777, transparent)", filter: "blur(80px)" }} />
      </div>

      {/* Hero */}
      <section className="relative pt-36 pb-24 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 text-sm text-white/60 mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Agent live — <span className="text-emerald-400 font-semibold">2,847 jobs found today</span></span>
          </div>

          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tight mb-8">
            <span className="text-white">Your AI </span>
            <span className="gradient-text">Career Agent</span>
            <br />
            <span className="text-white/80 text-5xl sm:text-6xl lg:text-7xl font-black">Works While You Sleep</span>
          </h1>

          <p className="text-xl text-white/40 mb-10 max-w-2xl mx-auto leading-relaxed">
            Build your CV once. AI scrapes local job listings and big recruiters, matches you to perfect roles,
            schedules interviews, and coaches you to get hired — all 24/7.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/create-cv" className="btn-primary text-base font-bold px-8 py-4 rounded-2xl inline-block">
              Start Finding Jobs — $10/week
            </Link>
            <Link href="#how-it-works" className="btn-glass text-base font-semibold px-8 py-4 rounded-2xl inline-block">
              See How It Works
            </Link>
          </div>

          {/* Stat pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-16">
            {[
              { val: "2,847", label: "Jobs found today" },
              { val: "143", label: "Interviews booked" },
              { val: "91%", label: "Match accuracy" },
              { val: "12+", label: "Sources scraped" },
              { val: "$10", label: "Per week" },
            ].map((s) => (
              <div key={s.label} className="glass rounded-2xl px-5 py-3 text-center">
                <div className="text-2xl font-black gradient-text">{s.val}</div>
                <div className="text-xs text-white/40 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Live activity ticker */}
          <div className="glass rounded-2xl py-3 overflow-hidden">
            <div className="flex animate-ticker whitespace-nowrap">
              {[...liveActivity, ...liveActivity].map((a, i) => (
                <span key={i} className="text-sm text-white/40 px-8 shrink-0">{a}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="relative py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-violet-400 font-semibold text-sm mb-3 tracking-widest uppercase">How it works</p>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">Three steps to your dream job</h2>
            <p className="text-white/40 text-lg">From zero to hired in days, not months.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((step, i) => (
              <div key={i} className="glass glass-hover rounded-3xl p-8 relative">
                <div className="text-6xl font-black gradient-text mb-5 leading-none">{step.num}</div>
                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{step.desc}</p>
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 z-10 text-white/20 text-2xl">→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-cyan-400 font-semibold text-sm mb-3 tracking-widest uppercase">Features</p>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">Everything to get you hired</h2>
            <p className="text-white/40 text-lg">8 AI-powered tools for $10/week.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <div key={i} className="glass glass-hover rounded-2xl p-6 group">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="text-white font-bold mb-2 text-sm group-hover:gradient-text transition-all">{f.title}</h3>
                <p className="text-white/40 text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="relative py-24 px-4">
        <div className="max-w-lg mx-auto text-center">
          <p className="text-pink-400 font-semibold text-sm mb-3 tracking-widest uppercase">Pricing</p>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">One price. Everything included.</h2>
          <p className="text-white/40 text-lg mb-12">No hidden fees. No nonsense.</p>

          <div className="iridescent-border rounded-3xl p-px">
            <div className="glass-strong rounded-3xl p-10 relative overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 opacity-20 pointer-events-none" style={{ background: "radial-gradient(circle, #7c3aed, transparent)", filter: "blur(40px)" }} />

              <div className="relative">
                <div className="inline-block glass rounded-full px-4 py-1.5 text-sm text-violet-300 font-semibold mb-6">
                  ✨ 7-Day Access
                </div>

                <div className="mb-2">
                  <span className="text-7xl font-black gradient-text">$10</span>
                </div>
                <p className="text-white/40 mb-8">Full access for 7 days. Renew anytime.</p>

                <ul className="text-left space-y-3 mb-10">
                  {[
                    "AI agent running 24/7 for 7 days",
                    "CV builder with ATS optimization",
                    "Unlimited job searches across local jobs & big recruiters",
                    "Automatic interview scheduling",
                    "AI Interview Coach",
                    "Cover Letter Generator",
                    "Skills Gap Analysis",
                    "Salary Intelligence & negotiation tips",
                    "Application Tracker (Kanban)",
                    "Real-time match scoring",
                    "30-day money back guarantee",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-white/70 text-sm">{item}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/create-cv" className="btn-primary w-full block text-center py-4 rounded-2xl text-base font-bold">
                  Get 7 Days for $10
                </Link>
                <p className="text-white/25 text-xs mt-4">Secure payment · Instant access · Renew anytime</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">Loved by job seekers</h2>
            <p className="text-white/40 text-lg">Join 4,200+ people who found their dream jobs.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {testimonials.map((t, i) => (
              <div key={i} className="glass glass-hover rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center text-white font-bold text-xs shrink-0">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-white font-semibold text-sm">{t.name}</div>
                    <div className="text-white/30 text-xs">{t.role}</div>
                  </div>
                </div>
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, j) => (
                    <svg key={j} className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-white/50 text-sm leading-relaxed">&ldquo;{t.text}&rdquo;</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="glass-strong rounded-3xl p-12 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ background: "radial-gradient(circle at 50% 0%, #7c3aed, transparent 70%)" }} />
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-4 relative">
              Stop job hunting.<br />
              <span className="gradient-text">Let AI do it.</span>
            </h2>
            <p className="text-white/40 text-lg mb-8 relative">
              One payment. 7 days of full access. Your AI career agent starts working in minutes.
            </p>
            <Link href="/create-cv" className="btn-primary inline-block text-lg font-bold px-10 py-4 rounded-2xl relative">
              Build Your CV — Get 7 Days for $10
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
