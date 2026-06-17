"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface TrackedJob {
  company: string;
  role: string;
}

const tones = ["Professional", "Enthusiastic", "Concise"];

export default function CoverLetter() {
  const [email, setEmail] = useState<string | null>(null);
  const [tracked, setTracked] = useState<TrackedJob[]>([]);
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [tone, setTone] = useState("Professional");
  const [letter, setLetter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("jobfinder_cv") : null;
    const cvEmail = stored ? JSON.parse(stored).email : null;
    setEmail(cvEmail);
    if (!cvEmail) return;
    fetch(`/api/applications?email=${encodeURIComponent(cvEmail)}`)
      .then((r) => r.json())
      .then((d) => {
        const jobs: TrackedJob[] = d.applications || [];
        setTracked(jobs);
        if (jobs[0]) {
          setCompany(jobs[0].company);
          setRole(jobs[0].role);
        }
      })
      .catch(() => {});
  }, []);

  const generate = async () => {
    if (!email || !company || !role) { setError("Pick or enter a company and role first."); return; }
    setError("");
    setLoading(true);
    setLetter("");
    try {
      const res = await fetch("/api/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, company, role, jobDescription: `${jobDescription} Tone: ${tone}.` }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not generate letter.");
      setLetter(data.letter);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not generate letter.");
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(letter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const download = () => {
    const blob = new Blob([letter], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cover-letter-${company.toLowerCase().replace(/\s+/g, "-")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!email) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4 text-center">
        <p className="text-white/50">Build your CV first so the AI has something real to write from.</p>
        <Link href="/create-cv" className="btn-primary px-6 py-3 rounded-2xl text-sm font-bold">Build Your CV</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-black text-white">Cover Letter Generator</h1>
        <p className="text-white/40 text-sm mt-1">AI writes a real letter from your actual CV — nothing pre-written or templated.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <div className="glass rounded-2xl p-5 space-y-3">
            <h3 className="text-white font-semibold text-sm">Job</h3>
            {tracked.length > 0 && (
              <select
                className="input-glass text-sm"
                onChange={(e) => {
                  const job = tracked[Number(e.target.value)];
                  if (job) { setCompany(job.company); setRole(job.role); }
                }}
              >
                <option value="">From your tracker...</option>
                {tracked.map((j, i) => (
                  <option key={i} value={i}>{j.company} — {j.role}</option>
                ))}
              </select>
            )}
            <input className="input-glass text-sm" placeholder="Company" value={company} onChange={(e) => setCompany(e.target.value)} />
            <input className="input-glass text-sm" placeholder="Role" value={role} onChange={(e) => setRole(e.target.value)} />
            <textarea
              className="input-glass text-sm resize-none"
              style={{ minHeight: "100px" }}
              placeholder="Paste the job description (optional, improves the result)"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </div>

          <div className="glass rounded-2xl p-5">
            <h3 className="text-white font-semibold text-sm mb-3">Tone</h3>
            <div className="space-y-2">
              {tones.map((t) => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className={`w-full text-left p-3 rounded-xl border transition-all text-sm font-semibold ${
                    tone === t ? "bg-violet-500/20 border-violet-500/40 text-violet-200" : "glass text-white/50 hover:text-white/80"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <button onClick={generate} disabled={loading} className="btn-primary w-full py-3 rounded-xl font-bold text-sm disabled:opacity-50">
            {loading ? "Writing..." : "✨ Generate Letter"}
          </button>
          {error && <p className="text-red-400 text-xs">{error}</p>}
        </div>

        <div className="lg:col-span-2 glass rounded-2xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-white/5">
            <div>
              <span className="text-white font-semibold text-sm">{company || "—"} {role && `— ${role}`}</span>
              <span className="ml-2 text-xs text-white/40">{tone}</span>
            </div>
            {letter && (
              <div className="flex gap-2">
                <button onClick={copy} className={`btn-glass px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${copied ? "text-emerald-400" : "text-white/60"}`}>
                  {copied ? "✓ Copied!" : "Copy"}
                </button>
                <button onClick={download} className="btn-glass px-3 py-1.5 rounded-xl text-xs font-semibold text-white/60">
                  Download
                </button>
              </div>
            )}
          </div>
          {letter ? (
            <textarea
              className="flex-1 p-5 text-sm text-white/70 leading-relaxed resize-none outline-none"
              style={{ background: "transparent", minHeight: "500px" }}
              value={letter}
              onChange={(e) => setLetter(e.target.value)}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-white/30 text-sm p-10 text-center" style={{ minHeight: "500px" }}>
              {loading ? "The AI is writing your letter..." : "Fill in a job on the left and generate a real, tailored letter."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
