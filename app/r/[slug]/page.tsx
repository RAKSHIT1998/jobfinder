import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight, BadgeCheck } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getShareBySlug } from "@/lib/db";
import { shareHeadline, shareSubline, shareBigStat } from "@/lib/shareCopy";

type Props = { params: Promise<{ slug: string }> };

// Always render fresh from the DB — a share link should resolve the moment it's
// created, before any ISR window would have elapsed.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const payload = await getShareBySlug(slug);
  if (!payload) return { title: "Result not found — JobFinder AI" };

  const title = shareHeadline(payload);
  const description = shareSubline(payload);
  // The OG/Twitter image is supplied automatically by the sibling
  // opengraph-image.tsx; we only set the text fields here.
  return {
    title: `${title} — JobFinder AI`,
    description,
    openGraph: { title, description, type: "website", url: `/r/${slug}` },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function SharePage({ params }: Props) {
  const { slug } = await params;
  const payload = await getShareBySlug(slug);
  if (!payload) notFound();

  const stat = shareBigStat(payload);

  return (
    <div className="min-h-screen" style={{ background: "#ffffff" }}>
      <Navbar />

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[640px] h-[640px] rounded-full opacity-[0.1]" style={{ background: "radial-gradient(circle, #7c3aed, transparent 70%)", filter: "blur(var(--blur-ambient))" }} />
      </div>

      <section className="relative pt-36 pb-24 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="iridescent-border rounded-3xl p-px">
            <div className="glass-strong shine-sweep rounded-3xl p-10 sm:p-12 relative overflow-hidden text-center">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-36 opacity-10 pointer-events-none" style={{ background: "radial-gradient(circle, #7c3aed, transparent)", filter: "blur(40px)" }} />

              <div className="relative">
                <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 text-xs text-violet-700 font-semibold mb-8">
                  <BadgeCheck className="w-4 h-4" />
                  Real data · JobFinder AI
                </div>

                <p className="text-5xl sm:text-6xl font-black gradient-text leading-none mb-3 break-words">
                  {stat.value}
                </p>
                <p className="text-foreground/40 text-sm mb-8">{stat.label}</p>

                <h1 className="text-2xl sm:text-3xl font-black text-foreground leading-tight mb-4">
                  {shareHeadline(payload)}
                </h1>
                <p className="text-foreground/50 text-base leading-relaxed max-w-xl mx-auto mb-8">
                  {shareSubline(payload)}
                </p>

                {payload.kind === "skills" && payload.topGaps.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-2 mb-8">
                    {payload.topGaps.map((g) => (
                      <span key={g} className="glass px-3 py-1.5 rounded-xl text-xs text-foreground/70 font-semibold">
                        {g}
                      </span>
                    ))}
                  </div>
                )}

                <Link href="/create-cv" className="btn-primary inline-flex items-center gap-2 text-base font-bold px-8 py-4 rounded-2xl">
                  See your own results — free
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <p className="text-foreground/40 text-xs mt-4">
                  Build your CV once, then match it against live postings from real job sources.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
