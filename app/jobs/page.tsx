import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { fetchAllJobs } from "@/lib/jobSources";
import { JOB_CATEGORIES, countJobsForCategory } from "@/lib/jobCategories";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { TiltCard } from "@/components/motion/TiltCard";

// Job listings refresh upstream every ~15 minutes; re-rendering this page
// every 30 minutes keeps it fresh for crawlers without hammering the sources.
export const revalidate = 1800;

const TITLE = "Find Jobs — Live Openings From Real Job Boards | JobFinder AI";
const DESCRIPTION =
  "Browse live job openings aggregated from Arbeitnow, The Muse, RemoteOK, Jobicy, Adzuna, and Naukri, organized by role. Updated continuously, then match them to your CV for free.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/jobs" },
  openGraph: { title: TITLE, description: DESCRIPTION, type: "website", url: "/jobs" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

export default async function JobsHub() {
  let jobs: Awaited<ReturnType<typeof fetchAllJobs>> = [];
  let sourceCount = 0;
  try {
    jobs = await fetchAllJobs();
    sourceCount = new Set(jobs.map((j) => j.source)).size;
  } catch {
    // No live data right now — the category cards below still render with a count of 0.
  }

  return (
    <div className="min-h-screen" style={{ background: "#ffffff" }}>
      <Navbar />

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[640px] h-[640px] rounded-full opacity-[0.1]" style={{ background: "radial-gradient(circle, #7c3aed, transparent 70%)", filter: "blur(var(--blur-ambient))" }} />
      </div>

      <section className="relative pt-36 pb-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <Reveal>
            <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 text-sm text-foreground/60 mb-8">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                <span className="text-emerald-600 font-semibold">{jobs.length}</span> live postings across{" "}
                <span className="text-emerald-600 font-semibold">{sourceCount}</span> sources right now
              </span>
            </div>
            <h1 className="text-5xl sm:text-6xl font-black leading-[0.95] tracking-tight mb-6">
              <span className="text-foreground">Find your next </span>
              <span className="gradient-text">job</span>
            </h1>
            <p className="text-xl text-foreground/50 max-w-2xl mx-auto leading-relaxed">
              Real, live openings pulled from real job boards — no fake listings, no expired postings left up
              for SEO. Pick a role below, or build your CV and let our AI match you to every fit automatically.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="relative py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <RevealGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" stagger={0.04}>
            {JOB_CATEGORIES.map((cat) => {
              const count = countJobsForCategory(jobs, cat);
              return (
                <RevealItem key={cat.slug}>
                  <Link href={`/jobs/${cat.slug}`} className="block h-full">
                    <TiltCard className="glass glass-hover rounded-2xl p-6 h-full" max={8}>
                      <div className="flex items-center justify-between mb-2">
                        <h2 className="text-foreground font-bold text-base">{cat.label} Jobs</h2>
                        <ArrowRight className="w-4 h-4 text-foreground/30" />
                      </div>
                      <p className="text-foreground/40 text-xs leading-relaxed mb-3">Live {cat.description}</p>
                      <p className="text-violet-700 font-black text-sm">
                        {count} open {count === 1 ? "role" : "roles"}
                      </p>
                    </TiltCard>
                  </Link>
                </RevealItem>
              );
            })}
          </RevealGroup>
        </div>
      </section>

      <section className="relative py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <Reveal>
            <div className="glass-strong rounded-3xl p-12 relative overflow-hidden">
              <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{ background: "radial-gradient(circle at 50% 0%, #7c3aed, transparent 70%)" }} />
              <h2 className="text-3xl sm:text-4xl font-black text-foreground mb-4 relative">
                Don&apos;t browse — get matched.
              </h2>
              <p className="text-foreground/50 text-lg mb-8 relative">
                Build your CV once and our AI scores every live posting against your real skills, so you only
                see the roles worth applying to.
              </p>
              <Link href="/upload-cv" className="btn-primary inline-flex items-center gap-2 text-lg font-bold px-10 py-4 rounded-2xl relative">
                Upload My Resume — Free
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </div>
  );
}
