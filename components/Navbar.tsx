"use client";

import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/80 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">J</span>
            </div>
            <span className="text-white font-bold text-lg">JobFinder AI</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="#how-it-works" className="text-gray-400 hover:text-white transition-colors text-sm">
              How it works
            </Link>
            <Link href="#features" className="text-gray-400 hover:text-white transition-colors text-sm">
              Features
            </Link>
            <Link href="#pricing" className="text-gray-400 hover:text-white transition-colors text-sm">
              Pricing
            </Link>
            <Link
              href="/create-cv"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
            >
              Get Started — $10
            </Link>
          </div>

          <button
            className="md:hidden text-gray-400 hover:text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-gray-950 border-t border-gray-800 px-4 py-4 flex flex-col gap-4">
          <Link href="#how-it-works" className="text-gray-400 hover:text-white text-sm" onClick={() => setMobileOpen(false)}>
            How it works
          </Link>
          <Link href="#features" className="text-gray-400 hover:text-white text-sm" onClick={() => setMobileOpen(false)}>
            Features
          </Link>
          <Link href="#pricing" className="text-gray-400 hover:text-white text-sm" onClick={() => setMobileOpen(false)}>
            Pricing
          </Link>
          <Link
            href="/create-cv"
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium text-center"
            onClick={() => setMobileOpen(false)}
          >
            Get Started — $10
          </Link>
        </div>
      )}
    </nav>
  );
}
