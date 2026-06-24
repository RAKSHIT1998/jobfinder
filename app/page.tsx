import Link from "next/link";
import { Radar, Target, FileText, CalendarCheck, Brain, TrendingUp, PenLine, BarChart3, ArrowRight, Check } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CountrySelector from "@/components/CountrySelector";
import LocalizedPrice from "@/components/LocalizedPrice";
import PriceTag from "@/components/PriceTag";
import { fetchAllJobs } from "@/lib/jobSources";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { AnimatedCounter } from "@/components/motion/AnimatedCounter";
import { HeroEntrance, TapScale } from "@/components/motion/HeroEntrance";
import { TiltCard } from "@/components/motion/TiltCard";
import { Spotlight } from "@/components/motion/Spotlight";
import { HeroCrystal } from "@/components/three/HeroCrystal";
import { PngSequenceBackground } from "@/components/three/PngSequenceBackground";

export const revalidate = 900;

const features = [
  { Icon: Radar, title: "Live Job Scanning", desc: "We pull live postings from Arbeitnow, The Muse, RemoteOK, and Jobicy, then score every one against your exact skills." },
  { Icon: Target, title: "Real Match Scoring", desc: "Our matching algorithm weighs skill overlap in the title, tags, and description - no fabricated accuracy numbers, just a transparent score." },
  { Icon: FileText, title: "CV Builder", desc: "Build a structured CV in minutes that powers every other feature - matching, cover letters, and interview prep." },
  { Icon: CalendarCheck, title: "Interview Prep", desc: "Log your real interview dates and download a calendar invite. We don't auto-contact recruiters on your behalf." },
  { Icon: Brain, title: "AI Interview Coach", desc: "Real questions generated for the specific role you're interviewing for, with real feedback on the answers you type." },
  { Icon: TrendingUp, title: "Salary Intelligence", desc: "We extract real disclosed pay from live postings matching your profile - and tell you honestly when there isn't enough data." },
  { Icon: PenLine, title: "Cover Letter Generator", desc: "AI writes a letter from your actual CV and the job description you give it - not a fill-in-the-blank template." },
  { Icon: BarChart3, title: "Skills Gap Analysis", desc: "See which in-demand skills show up across live postings matching you that aren't on your CV yet." },
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
    <div className="min-h-screen" style={{ background: "#ffffff" }}>
      <Navbar />

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[640px] h-[640px] rounded-full opacity-[0.1]" style={{ background: "radial-gradient(circle, #7c3aed, transparent 70%)", filter: "blur(var(--blur-ambient))" }} />
        <div className="animate-blob absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-[0.07]" style={{ background: "radial-gradient(circle, #6366f1, transparent)", filter: "blur(var(--blur-ambient))" }} />
      </div>

      <section className="relative isolate overflow-hidden">
        <PngSequenceBackground basePath="/hero-sequence" frameCount={72} className="absolute inset-0 -z-20" />
        {/* Light scrim over the live background so headline/body text stays legible. */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white/55 via-white/80 to-white" />

      <Spotlight className="pt-36 pb-24 px-4" color="124,58,237">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.15fr_0.85fr] gap-12 items-center">
          <HeroEntrance className="text-center lg:text-left">
            <Link href="/jobs" className="inline-flex items-center gap-2 glass glass-hover rounded-full px-4 py-2 text-sm text-foreground/60 mb-8">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                Live right now - <span className="text-emerald-600 font-semibold">{jobCount !== null ? `${jobCount} real postings` : "scanning real sources"}</span>
              </span>
            </Link>

            <h1 className="text-6xl sm:text-7xl lg:text-7xl font-black leading-[0.9] tracking-tight mb-8">
              <span className="text-foreground">Your AI </span>
              <span className="gradient-text">Career Agent</span>
              <br />
              <span className="text-foreground/80 text-5xl sm:text-6xl lg:text-6xl font-black">Maximizes Your Salary</span>
            </h1>

            <p className="text-xl text-foreground/50 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Build your CV once. We match it against live postings from multiple real job sources to find the
              roles that fit your skills and pay the most - then back you with the tools to land the highest offer.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-16">
              <TapScale>
                <Link href="/create-cv" className="btn-primary text-base font-bold px-8 py-4 rounded-2xl inline-flex items-center gap-2">
                  Match My CV to Top-Paying Jobs
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </TapScale>
              <TapScale>
                <Link href="/upload-cv" className="btn-glass text-base font-semibold px-8 py-4 rounded-2xl inline-block">
                  Upload My Resume — Free
                </Link>
              </TapScale>
            </div>

            <div className="flex flex-wrap justify-center lg:justify-start gap-3">
              <div className="glass rounded-2xl px-5 py-3 text-center">
                <div className="text-2xl font-black gradient-text">
                  {jobCount !== null ? <AnimatedCounter value={jobCount} /> : "-"}
                </div>
                <div className="text-xs text-foreground/40 mt-0.5">Live postings right now</div>
              </div>
              <div className="glass rounded-2xl px-5 py-3 text-center">
                <div className="text-2xl font-black gradient-text"><AnimatedCounter value={sourceCount} /></div>
                <div className="text-xs text-foreground/40 mt-0.5">Real job sources</div>
              </div>
              <div className="glass rounded-2xl px-5 py-3 text-center">
                <div className="text-2xl font-black gradient-text"><PriceTag /></div>
                <div className="text-xs text-foreground/40 mt-0.5">One-time, flat price</div>
              </div>
            </div>
          </HeroEntrance>

          <HeroCrystal className="mx-auto lg:mx-0 w-64 h-64 sm:w-80 sm:h-80 lg:w-full lg:h-[420px]" />
        </div>
      </Spotlight>
      </section>

      <section id="how-it-works" className="relative py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <Reveal className="text-center mb-16">
            <p className="eyebrow justify-center mb-3">How it works</p>
            <h2 className="text-4xl sm:text-5xl font-black text-foreground mb-4">Three steps to your dream job</h2>
            <p className="text-foreground/50 text-lg">From zero to hired in days, not months.</p>
          </Reveal>

          <RevealGroup className="grid grid-cols-1 md:grid-cols-3 gap-6" stagger={0.12}>
            {steps.map((step, i) => (
              <RevealItem key={i}>
                <TiltCard className="glass glass-hover rounded-3xl p-8 h-full" max={6}>
                  <div className="text-6xl font-black gradient-text mb-5 leading-none">{step.num}</div>
                  <h3 className="text-xl font-bold text-foreground mb-3">{step.title}</h3>
                  <p className="text-foreground/50 text-sm leading-relaxed">{step.desc}</p>
                  {i < 2 && (
                    <div className="hidden md:flex items-center justify-center absolute top-1/2 -right-3 z-10 w-6 h-6 rounded-full bg-violet-500/20 border border-violet-500/30 text-violet-300">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  )}
                </TiltCard>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      <section id="features" className="relative py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <Reveal className="text-center mb-16">
            <p className="eyebrow justify-center mb-3">Features</p>
            <h2 className="text-4xl sm:text-5xl font-black text-foreground mb-4">Everything to get you hired at the right price</h2>
            <p className="text-foreground/50 text-lg">8 AI-powered tools working toward one goal: matching your CV to the offer that pays you the most.</p>
          </Reveal>

          <RevealGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" stagger={0.06}>
            {features.map((f, i) => (
              <RevealItem key={i}>
                <TiltCard className="glass glass-hover rounded-2xl p-6 group h-full" max={10}>
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-4 transition-colors group-hover:bg-violet-500/20">
                    <f.Icon className="w-5 h-5 text-violet-600" strokeWidth={1.75} />
                  </div>
                  <h3 className="text-foreground font-bold mb-2 text-sm group-hover:text-violet-700 transition-colors">{f.title}</h3>
                  <p className="text-foreground/50 text-xs leading-relaxed">{f.desc}</p>
                </TiltCard>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      <section id="pricing" className="relative py-24 px-4">
        <div className="max-w-lg mx-auto text-center">
          <Reveal>
            <p className="eyebrow justify-center mb-3">Pricing</p>
            <h2 className="text-4xl sm:text-5xl font-black text-foreground mb-4">One price. Everything included.</h2>
            <p className="text-foreground/50 text-lg mb-12">No hidden fees. No nonsense.</p>

            <TiltCard className="iridescent-border rounded-3xl p-px" max={5}>
              <div className="glass-strong shine-sweep rounded-3xl p-10 relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 opacity-10 pointer-events-none" style={{ background: "radial-gradient(circle, #7c3aed, transparent)", filter: "blur(40px)" }} />

                <div className="relative">
                  <div className="flex items-center justify-center gap-3 mb-6">
                    <div className="inline-block glass rounded-full px-4 py-1.5 text-sm text-violet-700 font-semibold">
                      7-Day Access
                    </div>
                    <CountrySelector />
                  </div>

                  <div className="mb-2">
                    <span className="text-7xl font-black gradient-text"><PriceTag /></span>
                  </div>
                  <p className="text-foreground/50 text-sm mb-2"><LocalizedPrice /></p>
                  <p className="text-foreground/50 mb-8">Full access for 7 days. Renew anytime.</p>

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
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" strokeWidth={2.5} />
                        <span className="text-foreground/70 text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>

                  <TapScale className="block">
                    <Link href="/create-cv" className="btn-primary w-full block text-center py-4 rounded-2xl text-base font-bold">
                      Get Access for <PriceTag />
                    </Link>
                  </TapScale>
                  <p className="text-foreground/40 text-xs mt-4">Secure payment - instant access - renew anytime</p>
                </div>
              </div>
            </TiltCard>
          </Reveal>
        </div>
      </section>

      <section className="relative py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <Reveal>
            <div className="glass-strong rounded-3xl p-12 relative overflow-hidden">
              <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{ background: "radial-gradient(circle at 50% 0%, #7c3aed, transparent 70%)" }} />
              <h2 className="text-4xl sm:text-5xl font-black text-foreground mb-4 relative">
                Stop settling for less.<br />
                <span className="gradient-text">Let AI get you paid more.</span>
              </h2>
              <p className="text-foreground/50 text-lg mb-8 relative">
                One payment. 7 days of full access. Your AI career agent starts matching your CV to the
                highest-paying fits within minutes.
              </p>
              <TapScale>
                <Link href="/create-cv" className="btn-primary inline-flex items-center gap-2 text-lg font-bold px-10 py-4 rounded-2xl relative">
                  Build Your CV - Get Access for <PriceTag />
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </TapScale>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </div>
  );
}
