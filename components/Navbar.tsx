"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 pt-4">
      <div className="max-w-6xl mx-auto glass rounded-2xl px-6 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center shadow-lg">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="font-bold text-white text-lg tracking-tight">
            JobFinder<span className="gradient-text">AI</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="/#how-it-works" className="text-sm text-white/50 hover:text-white transition-colors">How it works</Link>
          <Link href="/#features" className="text-sm text-white/50 hover:text-white transition-colors">Features</Link>
          <Link href="/#pricing" className="text-sm text-white/50 hover:text-white transition-colors">Pricing</Link>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link href="/dashboard" className="text-sm text-white/50 hover:text-white transition-colors px-4 py-2">
            Dashboard
          </Link>
          <Link href="/create-cv" className="btn-primary text-sm font-semibold px-5 py-2.5 rounded-xl">
            Get Started - INR 830
          </Link>
        </div>

        <button className="md:hidden text-white/60 hover:text-white" onClick={() => setOpen(!open)}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {open
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            }
          </svg>
        </button>
      </div>

      {open && (
        <div className="md:hidden glass-strong mt-2 mx-auto max-w-6xl rounded-2xl p-4 space-y-1">
          {[
            { href: "/#how-it-works", label: "How it works" },
            { href: "/#features", label: "Features" },
            { href: "/#pricing", label: "Pricing" },
            { href: "/dashboard", label: "Dashboard" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block py-2.5 px-4 text-white/60 hover:text-white rounded-xl hover:bg-white/5 text-sm transition-all"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/create-cv"
            className="block btn-primary text-center text-sm font-semibold px-5 py-3 rounded-xl mt-2"
            onClick={() => setOpen(false)}
          >
            Get Started - INR 830
          </Link>
        </div>
      )}
    </nav>
  );
}
