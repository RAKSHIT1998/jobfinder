"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import PriceTag from "./PriceTag";

const navLinks = [
  { href: "/jobs", label: "Browse Jobs" },
  { href: "/upload-cv", label: "Upload CV" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#features", label: "Features" },
  { href: "/#pricing", label: "Pricing" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 pt-4">
      <div
        className={`max-w-6xl mx-auto rounded-2xl px-6 py-3 flex items-center justify-between transition-all duration-300 ${
          scrolled ? "glass-strong" : "glass"
        }`}
      >
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-400 flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="font-bold text-foreground text-lg tracking-tight">
            JobFinder<span className="gradient-text">AI</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1" onMouseLeave={() => setHovered(null)}>
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onMouseEnter={() => setHovered(item.href)}
              className="relative text-sm text-foreground/50 hover:text-foreground transition-colors px-4 py-2 rounded-xl"
            >
              {hovered === item.href && (
                <motion.span
                  layoutId="nav-hover-pill"
                  className="absolute inset-0 rounded-xl bg-foreground/8"
                  transition={{ type: "spring", stiffness: 400, damping: 35 }}
                />
              )}
              <span className="relative">{item.label}</span>
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link href="/login" className="text-sm text-foreground/50 hover:text-foreground transition-colors px-4 py-2">
            Log In
          </Link>
          <Link href="/create-cv" className="btn-primary text-sm font-semibold px-5 py-2.5 rounded-xl">
            Get Started - <PriceTag />
          </Link>
        </div>

        <button className="md:hidden text-foreground/60 hover:text-foreground" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="md:hidden mt-2 mx-auto max-w-6xl overflow-hidden"
          >
            <div className="glass-strong rounded-2xl p-4 space-y-1">
              {[...navLinks, { href: "/dashboard", label: "Dashboard" }].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block py-2.5 px-4 text-foreground/60 hover:text-foreground rounded-xl hover:bg-foreground/5 text-sm transition-all"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/login"
                className="block py-2.5 px-4 text-foreground/60 hover:text-foreground rounded-xl hover:bg-foreground/5 text-sm transition-all"
                onClick={() => setOpen(false)}
              >
                Log In
              </Link>
              <Link
                href="/create-cv"
                className="block btn-primary text-center text-sm font-semibold px-5 py-3 rounded-xl mt-2"
                onClick={() => setOpen(false)}
              >
                Get Started - <PriceTag />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
