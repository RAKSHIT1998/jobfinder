"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
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
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (!res.ok) {
      setError("Invalid password.");
      return;
    }
    router.push("/admin");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative" style={{ background: "#050508" }}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="animate-blob absolute top-1/3 left-1/4 w-80 h-80 rounded-full opacity-15" style={{ background: "radial-gradient(circle, #7c3aed, transparent)", filter: "blur(80px)" }} />
        <div className="animate-blob animation-delay-2000 absolute bottom-1/3 right-1/4 w-72 h-72 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #db2777, transparent)", filter: "blur(80px)" }} />
      </div>

      <form onSubmit={handleSubmit} className="glass-strong rounded-3xl p-8 w-full max-w-sm relative">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-white font-bold">JobFinder<span className="gradient-text">AI</span> Admin</span>
        </div>

        <h1 className="text-2xl font-black text-white mb-1">Admin Console</h1>
        <p className="text-white/40 text-sm mb-6">Sign in to manage users, CVs and payments.</p>

        <label className="block text-sm font-medium text-white/50 mb-2">Password</label>
        <input
          type="password"
          className="input-glass"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
        />

        {error && (
          <div className="glass rounded-xl px-4 py-3 text-red-400 text-sm border border-red-500/20 mt-4">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !password}
          className="btn-primary w-full py-3.5 rounded-2xl text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed mt-6"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}
