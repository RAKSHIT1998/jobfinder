import Link from "next/link";
import { Reveal } from "./motion/Reveal";

export default function Footer() {
  return (
    <footer className="border-t border-foreground/5 py-16 px-4">
      <Reveal className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-400 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="font-bold text-foreground text-lg">JobFinder<span className="gradient-text">AI</span></span>
            </div>
            <p className="text-foreground/40 text-sm leading-relaxed max-w-xs">
              We match your CV to real, live job postings and work to get you the highest offer you qualify for — not a marketplace, your AI career agent.
            </p>
            <div className="flex items-center gap-2 mt-4">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-600 text-xs font-medium">Live job matching — Arbeitnow, The Muse, RemoteOK, Jobicy</span>
            </div>
          </div>

          <div>
            <h4 className="text-foreground/80 font-semibold mb-4 text-sm">Product</h4>
            <ul className="space-y-3">
              {[
                { href: "/jobs", label: "Browse Jobs" },
                { href: "/upload-cv", label: "Upload CV" },
                { href: "/#features", label: "Features" },
                { href: "/#pricing", label: "Pricing" },
                { href: "/create-cv", label: "Build CV" },
                { href: "/dashboard", label: "Dashboard" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-foreground/40 hover:text-foreground text-sm transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-foreground/80 font-semibold mb-4 text-sm">Legal</h4>
            <ul className="space-y-3">
              {[
                { href: "/privacy", label: "Privacy Policy" },
                { href: "/terms", label: "Terms of Service" },
                { href: "/contact", label: "Contact Us" },
                { href: "/refund-policy", label: "Refund Policy" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-foreground/40 hover:text-foreground text-sm transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-foreground/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-foreground/25 text-sm">© 2026 JobFinder AI. All rights reserved.</p>
          <p className="text-foreground/25 text-xs">One-time payment · 7-day access · 30-day money back guarantee</p>
        </div>
      </Reveal>
    </footer>
  );
}
