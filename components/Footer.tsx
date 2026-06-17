import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="font-bold text-white text-lg">JobFinder<span className="gradient-text">AI</span></span>
            </div>
            <p className="text-white/40 text-sm leading-relaxed max-w-xs">
              Your AI-powered career agent working 24/7 to find, match, and schedule interviews for your dream job.
            </p>
            <div className="flex items-center gap-2 mt-4">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 text-xs font-medium">Agent running — 2,847 jobs found today</span>
            </div>
          </div>

          <div>
            <h4 className="text-white/80 font-semibold mb-4 text-sm">Product</h4>
            <ul className="space-y-3">
              {[
                { href: "/#features", label: "Features" },
                { href: "/#pricing", label: "Pricing" },
                { href: "/create-cv", label: "Build CV" },
                { href: "/dashboard", label: "Dashboard" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-white/40 hover:text-white text-sm transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white/80 font-semibold mb-4 text-sm">Legal</h4>
            <ul className="space-y-3">
              {["Privacy Policy", "Terms of Service", "Contact Us", "Refund Policy"].map((l) => (
                <li key={l}>
                  <Link href="#" className="text-white/40 hover:text-white text-sm transition-colors">{l}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/25 text-sm">© 2026 JobFinder AI. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <p className="text-white/25 text-xs">One-time payment · Lifetime access · 30-day money back guarantee</p>
            <Link href="/admin/login" className="text-white/15 hover:text-white/40 text-xs transition-colors">Admin</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
