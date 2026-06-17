import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CountrySelector from "@/components/CountrySelector";
import LocalizedPrice from "@/components/LocalizedPrice";
import { ACCESS_PRICE_INR, formatInr } from "@/lib/currency";
import { fetchAllJobs } from "@/lib/jobSources";

export const revalidate = 900;

const features = [
  { icon: "Live", title: "Live Job Scanning", desc: "We pull live postings from Arbeitnow, The Muse, RemoteOK, and Jobicy, then score every one against your exact skills." },
  { icon: "Match", title: "Real Match Scoring", desc: "Our matching algorithm weighs skill overlap in the title, tags, and description - no fabricated accuracy numbers, just a transparent score." },
  { icon: "CV", title: "CV Builder", desc: "Build a structured CV in minutes that powers every other feature - matching, cover letters, and interview prep." },
  { icon: "Prep", title: "Interview Prep", desc: "Log your real interview dates and download a calendar invite. We don't auto-contact recruiters on your behalf." },
  { icon: "Coach", title: "AI Interview Coach", desc: "Real questions generated for the specific role you're interviewing for, with real feedback on the answers you type." },
  { icon: "Pay", title: "Salary Intelligence", desc: "We extract real disclosed pay from live postings matching your profile - and tell you honestly when there isn't enough data." },
  { icon: "Write", title: "Cover Letter Generator", desc: "AI writes a letter from your actual CV and the job description you give it - not a fill-in-the-blank template." },
  { icon: "Skills", title: "Skills Gap Analysis", desc: "See which in-demand skills show up across live postings matching you that aren't on your CV yet." },
];

const steps = [
  { num: "01", title: "Build Your CV", desc: "Fill out our 7-step smart form in 5 minutes. AI extracts your skills, experiences, and career goals." },
  { num: "02", title: "We Scan Live Postings", desc: "Real job data from multiple live sources, scored against your actual profile - no canned results." },
  { num: "03", title: "Apply With Confidence", desc: "Track applications, prep for real interviews, and generate tailored cover letters as you go." },
];

export default async function Home() {
  let jobCount: number | null = null;
  let sourceCount = 4;

  try {
    const jobs = await fetchAllJobs();
    jobCount = jobs.length;
    sourceCount = new Set(jobs.map((j) => j.source)).size;
  } catch {
    // Fall back to no count rather than a fake one if the live sources are unreachable.
  }

  return (
    <div className="min-h-screen" style={{ background: "#050508" }}>
      <Navbar />

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="animate-blob animation-delay-0 absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20" style={{ background: "radial-gradient(circle, #7c3aed, transparent)", filter: "blur(80px)" }} />
        <div className="animate-blob animation-delay-2000 absolute top-1/3 right-1/4 w-80 h-80 rounded-full opacity-15" style={{ background: "radial-gradient(circle, #0891b2, transparent)", filter: "blur(80px)" }} />
        <div className="animate-blob animation-delay-4000 absolute bottom-1/4 left-1/3 w-72 h-72 rounded-full opacity-15" style={{ background: "radial-gradient(circle, #db2777, transparent)", filter: "blur(80px)" }} />
      </div>

      <section className="relative pt-36 pb-24 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 text-sm text-white/60 mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              Live right now - <span className="text-emerald-400 font-semibold">{jobCount !== null ? `${jobCount} real postings` : "scanning real sources"}</span>
            </span>
          </div>

          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tight mb-8">
            <span className="text-white">Your AI </span>
            <span className="gradient-text">Career Agent</span>
            <br />
            <span className="text-white/80 text-5xl sm:text-6xl lg:text-7xl font-black">Finds Real Jobs</span>
          </h1>

          <p className="text-xl text-white/40 mb-10 max-w-2xl mx-auto leading-relaxed">
            Build your CV once. We scan live postings from multiple real job sources, score them against your
            actual skills, and help you track every application - no fabricated results.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/create-cv" className="btn-primary text-base font-bold px-8 py-4 rounded-2xl inline-block">
              Start Finding Jobs - {formatInr(ACCESS_PRICE_INR)}/week
            </Link>
            <Link href="#how-it-works" className="btn-glass text-base font-semibold px-8 py-4 rounded-2xl inline-block">
              See How It Works
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-3 mb-16">
            {[
              { val: jobCount !== null ? String(jobCount) : "-", label: "Live postings right now" },
              { val: String(sourceCount), label: "Real job sources" },
              { val: formatInr(ACCESS_PRICE_INR), label: "Per week" },
            ].map((s) => (
              <div key={s.label} className="glass rounded-2xl px-5 py-3 text-center">
                <div className="text-2xl font-black gradient-text">{s.val}</div>
                <div className="text-xs text-white/40 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

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
                  <div className="hidden md:block absolute top-1/2 -right-3 z-10 text-white/20 text-2xl">-&gt;</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="relative py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-cyan-400 font-semibold text-sm mb-3 tracking-widest uppercase">Features</p>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">Everything to get you hired</h2>
            <p className="text-white/40 text-lg">8 AI-powered tools for {formatInr(ACCESS_PRICE_INR)}/week.</p>
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

      <section id="pricing" className="relative py-24 px-4">
        <div className="max-w-lg mx-auto text-center">
          <p className="text-pink-400 font-semibold text-sm mb-3 tracking-widest uppercase">Pricing</p>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">One price. Everything included.</h2>
          <p className="text-white/40 text-lg mb-12">No hidden fees. No nonsense.</p>

          <div className="iridescent-border rounded-3xl p-px">
            <div className="glass-strong rounded-3xl p-10 relative overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 opacity-20 pointer-events-none" style={{ background: "radial-gradient(circle, #7c3aed, transparent)", filter: "blur(40px)" }} />

              <div className="relative">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <div className="inline-block glass rounded-full px-4 py-1.5 text-sm text-violet-300 font-semibold">
                    7-Day Access
                  </div>
                  <CountrySelector />
                </div>

                <div className="mb-2">
                  <span className="text-7xl font-black gradient-text">{formatInr(ACCESS_PRICE_INR)}</span>
                </div>
                <p className="text-white/40 text-sm mb-2"><LocalizedPrice /></p>
                <p className="text-white/40 mb-8">Full access for 7 days. Renew anytime.</p>

                <ul className="text-left space-y-3 mb-10">
                  {[
                    "Live job scanning across 4 real sources",
                    "CV builder that powers every feature",
                    "Real skill-based match scoring",
                    "Application Tracker (Kanban)",
                    "Interview Prep with calendar export",
                    "AI Interview Coach",
                    "Cover Letter Generator",
                    "Skills Gap Analysis",
                    "Salary Intelligence",
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
                  Get 7 Days for {formatInr(ACCESS_PRICE_INR)}
                </Link>
                <p className="text-white/25 text-xs mt-4">Secure payment - instant access - renew anytime</p>
              </div>
            </div>
          </div>
        </div>
      </section>

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
              Build Your CV - Get 7 Days for {formatInr(ACCESS_PRICE_INR)}
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
