"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { hasActiveAccess, hasEverPaid } from "@/lib/access";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: "⚡" },
  { href: "/dashboard/jobs", label: "Jobs", icon: "💼" },
  { href: "/dashboard/meetings", label: "Interview Prep", icon: "📅" },
  { href: "/dashboard/ai-coach", label: "AI Coach", icon: "🧠" },
  { href: "/dashboard/cover-letter", label: "Cover Letters", icon: "✍️" },
  { href: "/dashboard/skills", label: "Skills Gap", icon: "📊" },
  { href: "/dashboard/salary", label: "Salary Intel", icon: "💰" },
  { href: "/dashboard/tracker", label: "App Tracker", icon: "🎯" },
  { href: "/dashboard/cv", label: "My CV", icon: "📄" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (hasActiveAccess()) {
      setAuthorized(true);
      return;
    }
    router.replace(hasEverPaid() ? "/checkout?expired=1" : "/checkout");
  }, [router]);

  if (!authorized) return null;

  return (
    <div className="min-h-screen text-white flex" style={{ background: "#050508" }}>
      {/* Fixed blob background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="animate-blob absolute top-0 right-0 w-96 h-96 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #7c3aed, transparent)", filter: "blur(80px)" }} />
        <div className="animate-blob animation-delay-4000 absolute bottom-0 left-0 w-72 h-72 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #0891b2, transparent)", filter: "blur(80px)" }} />
      </div>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 flex flex-col transform transition-transform duration-300 md:translate-x-0 md:static md:z-auto ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{ backdropFilter: "blur(40px) saturate(180%)", background: "rgba(255,255,255,0.03)", borderRight: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div className="flex items-center gap-2.5 px-6 py-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="font-bold text-white text-base">JobFinder<span className="gradient-text">AI</span></span>
        </div>

        <div className="px-3 py-4 flex-1 overflow-y-auto">
          <div className="flex items-center gap-2 mb-4 px-3">
            <div className="relative">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-400 animate-ping opacity-60" />
            </div>
            <span className="text-xs text-emerald-400 font-semibold">Live job scan active</span>
          </div>

          <nav className="space-y-0.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                    isActive
                      ? "bg-violet-500/20 text-violet-200 border border-violet-500/30 shadow-[0_0_20px_rgba(139,92,246,0.15)]"
                      : "text-white/40 hover:text-white/80 hover:bg-white/5"
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="px-4 pb-6 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <Link href="/" className="flex items-center gap-2 px-3 py-2 rounded-xl text-white/30 hover:text-white/60 text-sm transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to home
          </Link>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <header className="px-6 py-4 flex items-center gap-4" style={{ backdropFilter: "blur(20px)", background: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <button className="md:hidden text-white/40 hover:text-white" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="ml-auto flex items-center gap-3">
            <div className="glass rounded-full px-3 py-1.5 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-white/50">AI Running</span>
            </div>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center text-white text-sm font-bold">
              U
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
