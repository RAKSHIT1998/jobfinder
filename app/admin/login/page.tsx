"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HeroEntrance, TapScale } from "@/components/motion/HeroEntrance";

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    setLoading(false);
    if (!res.ok) {
      setError("Invalid username or password.");
      return;
    }
    router.push("/admin");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative" style={{ background: "#050508" }}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[460px] h-[460px] rounded-full opacity-[0.13]" style={{ background: "radial-gradient(circle, #7c3aed, transparent)", filter: "blur(90px)" }} />
      </div>

      <HeroEntrance>
      <form onSubmit={handleSubmit} className="glass-strong rounded-3xl p-8 w-full max-w-sm relative">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-400 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-white font-bold">JobFinder<span className="gradient-text">AI</span> Admin</span>
        </div>

        <h1 className="text-2xl font-black text-white mb-1">Admin Console</h1>
        <p className="text-white/40 text-sm mb-6">Sign in to manage users, CVs and payments.</p>

        <label className="block text-sm font-medium text-white/50 mb-2">Username</label>
        <input
          type="text"
          className="input-glass mb-4"
          placeholder="you@example.com"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoFocus
        />

        <label className="block text-sm font-medium text-white/50 mb-2">Password</label>
        <input
          type="password"
          className="input-glass"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && (
          <div className="glass rounded-xl px-4 py-3 text-red-400 text-sm border border-red-500/20 mt-4">
            {error}
          </div>
        )}

        <TapScale className="block mt-6">
          <button
            type="submit"
            disabled={loading || !username || !password}
            className="btn-primary w-full py-3.5 rounded-2xl text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </TapScale>
      </form>
      </HeroEntrance>
    </div>
  );
}
