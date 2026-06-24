import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight, MapPin, Building2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { fetchAllJobs } from "@/lib/jobSources";
import { JOB_CATEGORIES, getCategoryBySlug, filterJobsForCategory } from "@/lib/jobCategories";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { TiltCard } from "@/components/motion/TiltCard";

type Props = { params: Promise<{ slug: string }> };

// Mirrors the hub page's freshness window — live postings change often enough
// that 30 minutes keeps both crawlers and real visitors looking at current data.
export const revalidate = 1800;

export function generateStaticParams() {
  return JOB_CATEGORIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cat = getCategoryBySlug(slug);
  if (!cat) return { title: "Jobs — JobFinder AI" };

  let count = 0;
  try {
    count = filterJobsForCategory(await fetchAllJobs(), cat, 1000).length;
  } catch {
    // metadata still renders without a live count
  }

  const title = `${cat.label} Jobs — ${count} Live Openings | JobFinder AI`;
  const description = `${count} live ${cat.description} right now, aggregated from real job boards and updated continuously. Match them to your CV for free.`;

  return {
    title,
    description,
    alternates: { canonical: `/jobs/${slug}` },
    openGraph: { title, description, type: "website", url: `/jobs/${slug}` },
    twitter: { card: "summary_large_image", title, description },
  };
}

function timeAgo(iso: string | null): string {
  if (!iso) return "recently";
  const ms = Date.now() - new Date(iso).getTime();
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  if (days <= 0) return "today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  return "over a month ago";
}

export default async function JobCategoryPage({ params }: Props) {
  const { slug } = await params;
  const cat = getCategoryBySlug(slug);
  if (!cat) notFound();

  let allJobs: Awaited<ReturnType<typeof fetchAllJobs>> = [];
  try {
    allJobs = await fetchAllJobs();
  } catch {
    // Render the empty state below rather than a 500 on a crawler.
  }
  const jobs = filterJobsForCategory(allJobs, cat, 30);
  const related = JOB_CATEGORIES.filter((c) => c.slug !== slug).slice(0, 4);

  return (
    <div className="min-h-screen" style={{ background: "#ffffff" }}>
      <Navbar />

      {jobs.map((job) => {
        const jsonLd = {
          "@context": "https://schema.org",
          "@type": "JobPosting",
          title: job.title,
          description: job.description || `${job.title} at ${job.company}`,
          datePosted: job.postedAt || undefined,
          hiringOrganization: { "@type": "Organization", name: job.company },
          jobLocationType: job.remote ? "TELECOMMUTE" : undefined,
          jobLocation: !job.remote
            ? { "@type": "Place", address: { "@type": "PostalAddress", addressLocality: job.location } }
            : undefined,
          directApply: false,
        };
        return (
          <script
            key={job.id}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
          />
        );
      })}

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[640px] h-[640px] rounded-full opacity-[0.1]" style={{ background: "radial-gradient(circle, #7c3aed, transparent 70%)", filter: "blur(var(--blur-ambient))" }} />
      </div>

      <section className="relative pt-36 pb-12 px-4">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <nav className="text-xs text-foreground/40 mb-6">
              <Link href="/jobs" className="hover:text-foreground/70 transition-colors">Jobs</Link>
              <span className="mx-2">/</span>
              <span className="text-foreground/60">{cat.label}</span>
            </nav>
            <h1 className="text-4xl sm:text-5xl font-black leading-[0.95] tracking-tight mb-5">
              <span className="text-foreground">{cat.label} </span>
              <span className="gradient-text">Jobs</span>
            </h1>
            <p className="text-lg text-foreground/50 max-w-2xl leading-relaxed mb-8">
              {jobs.length} live {cat.description} right now, pulled from real job boards and refreshed
              continuously — no expired listings left up for search traffic.
            </p>
            <Link href="/upload-cv" className="btn-primary inline-flex items-center gap-2 text-sm font-bold px-6 py-3 rounded-2xl">
              Upload My Resume — Free
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="relative py-8 px-4">
        <div className="max-w-5xl mx-auto">
          {jobs.length === 0 ? (
            <div className="glass rounded-2xl p-10 text-center">
              <p className="text-foreground/50">
                No live {cat.label.toLowerCase()} postings matched right now — our sources refresh every
                15 minutes, so check back shortly, or build your CV and we&apos;ll alert you the moment one fits.
              </p>
            </div>
          ) : (
            <RevealGroup className="space-y-3" stagger={0.03}>
              {jobs.map((job) => (
                <RevealItem key={job.id}>
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="block"
                  >
                    <TiltCard className="glass glass-hover rounded-2xl p-5 flex items-center gap-4" max={4}>
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-foreground/8 flex items-center justify-center text-base font-black text-violet-700 shrink-0">
                        {job.company[0]?.toUpperCase() || "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-foreground font-semibold text-sm truncate">{job.title}</p>
                        <div className="flex items-center gap-3 text-foreground/40 text-xs mt-1">
                          <span className="inline-flex items-center gap-1 truncate">
                            <Building2 className="w-3 h-3 shrink-0" /> {job.company}
                          </span>
                          <span className="inline-flex items-center gap-1 truncate">
                            <MapPin className="w-3 h-3 shrink-0" /> {job.remote ? "Remote" : job.location}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-foreground/30 text-xs">{job.source}</div>
                        <div className="text-foreground/30 text-xs">{timeAgo(job.postedAt)}</div>
                      </div>
                    </TiltCard>
                  </a>
                </RevealItem>
              ))}
            </RevealGroup>
          )}
        </div>
      </section>

      <section className="relative py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-sm font-semibold text-foreground/50 uppercase tracking-widest mb-4">
            Browse related roles
          </h2>
          <div className="flex flex-wrap gap-2">
            {related.map((c) => (
              <Link
                key={c.slug}
                href={`/jobs/${c.slug}`}
                className="glass glass-hover rounded-xl px-4 py-2 text-sm text-foreground/60 hover:text-foreground transition-colors"
              >
                {c.label} Jobs
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <Reveal>
            <div className="glass-strong rounded-3xl p-12 relative overflow-hidden">
              <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{ background: "radial-gradient(circle at 50% 0%, #7c3aed, transparent 70%)" }} />
              <h2 className="text-3xl sm:text-4xl font-black text-foreground mb-4 relative">
                Stop scrolling. Get matched.
              </h2>
              <p className="text-foreground/50 text-lg mb-8 relative">
                Build your CV once and our AI scores every live {cat.label.toLowerCase()} posting against your
                real skills — so you only see the roles worth applying to.
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
