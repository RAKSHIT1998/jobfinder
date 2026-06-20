"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, Users, Mail, X, Menu } from "lucide-react";
import LogoutButton from "./LogoutButton";
import { Spotlight } from "@/components/motion/Spotlight";

const navItems = [
  { href: "/admin", label: "Overview", Icon: BarChart3 },
  { href: "/admin/users", label: "Users", Icon: Users },
  { href: "/admin/messages", label: "Messages", Icon: Mail },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const nav = (
    <>
      <div className="flex items-center gap-2.5 mb-6 px-1">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-400 flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <span className="text-foreground font-bold text-sm">Admin Console</span>
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                isActive ? "text-violet-700" : "text-foreground/60 hover:text-foreground hover:bg-foreground/5"
              } font-semibold`}
            >
              {isActive && (
                <motion.span
                  layoutId="admin-active-pill"
                  className="absolute inset-0 rounded-xl bg-violet-500/15 border border-violet-500/25"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <item.Icon className="w-4 h-4 relative z-10" strokeWidth={2} />
              <span className="relative z-10">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 pt-4 border-t border-foreground/5">
        <LogoutButton />
      </div>
    </>
  );

  return (
    <div className="min-h-screen relative" style={{ background: "#ffffff" }}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="animate-blob absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-[0.06]" style={{ background: "radial-gradient(circle, #7c3aed, transparent)", filter: "blur(100px)" }} />
      </div>

      {/* Mobile top bar */}
      <div className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 glass-strong">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-400 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-foreground font-bold text-sm">Admin Console</span>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="text-foreground/60 hover:text-foreground p-1"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            <motion.div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              className="relative w-64 max-w-[80%] p-4"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
            >
              <div className="glass-strong rounded-2xl p-4 h-full">
                <button
                  onClick={() => setOpen(false)}
                  className="absolute top-6 right-6 text-foreground/50 hover:text-foreground"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
                {nav}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="relative flex">
        <aside className="w-64 shrink-0 min-h-screen p-4 hidden md:block">
          <div className="glass rounded-2xl p-4 sticky top-4">{nav}</div>
        </aside>

        <Spotlight className="flex-1 p-4 md:p-8 min-w-0" color="124,58,237">
          {children}
        </Spotlight>
      </div>
    </div>
  );
}
