"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, Briefcase, CalendarCheck, Brain, PenLine, BarChart3, Wallet, Target, FileText,
  Menu, X, ArrowLeft, LogOut,
} from "lucide-react";
import { Spotlight } from "@/components/motion/Spotlight";

const navItems = [
  { href: "/dashboard", label: "Overview", Icon: Zap },
  { href: "/dashboard/jobs", label: "Jobs", Icon: Briefcase },
  { href: "/dashboard/meetings", label: "Interview Prep", Icon: CalendarCheck },
  { href: "/dashboard/ai-coach", label: "AI Coach", Icon: Brain },
  { href: "/dashboard/cover-letter", label: "Cover Letters", Icon: PenLine },
  { href: "/dashboard/skills", label: "Skills Gap", Icon: BarChart3 },
  { href: "/dashboard/salary", label: "Salary Intel", Icon: Wallet },
  { href: "/dashboard/tracker", label: "App Tracker", Icon: Target },
  { href: "/dashboard/cv", label: "My CV", Icon: FileText },
];

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches
  );

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return (
    <div className="min-h-screen text-white flex" style={{ background: "#050508" }}>
      {/* Ambient background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="animate-blob absolute top-0 right-0 w-96 h-96 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #7c3aed, transparent)", filter: "blur(80px)" }} />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full opacity-[0.07]" style={{ background: "radial-gradient(circle, #6366f1, transparent)", filter: "blur(80px)" }} />
      </div>

      {/* Sidebar */}
      <motion.aside
        className="fixed inset-y-0 left-0 z-50 w-64 flex flex-col md:static md:z-auto"
        style={{ backdropFilter: "blur(40px) saturate(180%)", background: "rgba(255,255,255,0.03)", borderRight: "1px solid rgba(255,255,255,0.07)" }}
        animate={{ x: isDesktop || sidebarOpen ? 0 : "-100%" }}
        transition={{ type: "spring", stiffness: 320, damping: 32 }}
      >
        <div className="flex items-center gap-2.5 px-6 py-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-400 flex items-center justify-center">
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
                  className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                    isActive ? "text-violet-200" : "text-white/40 hover:text-white/80 hover:bg-white/5"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="sidebar-active-pill"
                      className="absolute inset-0 rounded-xl bg-violet-500/20 border border-violet-500/30 shadow-[0_0_20px_rgba(139,92,246,0.15)]"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  <item.Icon className="w-4 h-4 relative z-10 shrink-0" strokeWidth={2} />
                  <span className="flex-1 relative z-10">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="px-4 pb-6 pt-2 space-y-0.5" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <Link href="/" className="flex items-center gap-2 px-3 py-2 rounded-xl text-white/30 hover:text-white/60 text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
          <button
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
              localStorage.removeItem("jobfinder_cv");
              localStorage.removeItem("jobfinder_paid");
              localStorage.removeItem("jobfinder_paid_at");
              router.push("/");
            }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-white/30 hover:text-red-400 text-sm transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </button>
        </div>
      </motion.aside>

      <AnimatePresence>
        {sidebarOpen && !isDesktop && (
          <motion.div
            className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Main */}
      <Spotlight className="flex-1 flex flex-col min-w-0 z-10" color="124,58,237">
        <header className="px-6 py-4 flex items-center gap-4" style={{ backdropFilter: "blur(20px)", background: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <button className="md:hidden text-white/40 hover:text-white" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle sidebar">
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <div className="ml-auto flex items-center gap-3">
            <div className="glass rounded-full px-3 py-1.5 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-white/50">AI Running</span>
            </div>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-400 flex items-center justify-center text-white text-sm font-bold">
              U
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </Spotlight>
    </div>
  );
}
