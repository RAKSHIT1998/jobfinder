"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface TrackedJob {
  company: string;
  role: string;
}

export default function AICoach() {
  const [email, setEmail] = useState<string | null>(null);
  const [tracked, setTracked] = useState<TrackedJob[]>([]);
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [questions, setQuestions] = useState<string[]>([]);
  const [activeQ, setActiveQ] = useState<number | null>(null);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<Record<number, string>>({});
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [error, setError] = useState("");

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
        if (jobs[0]) { setCompany(jobs[0].company); setRole(jobs[0].role); }
      })
      .catch(() => {});
  }, []);

  const generateQuestions = async () => {
    if (!email || !company || !role) { setError("Pick or enter a company and role first."); return; }
    setError("");
    setLoadingQuestions(true);
    setQuestions([]);
    setFeedback({});
    setActiveQ(null);
    try {
      const res = await fetch("/api/interview-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "questions", email, company, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not generate questions.");
      setQuestions(data.questions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not generate questions.");
    } finally {
      setLoadingQuestions(false);
    }
  };

  const submitAnswer = async (qIndex: number) => {
    if (!answer.trim()) return;
    setLoadingFeedback(true);
    try {
      const res = await fetch("/api/interview-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "feedback", email, company, role, question: questions[qIndex], answer }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not get feedback.");
      setFeedback((prev) => ({ ...prev, [qIndex]: data.feedback }));
      setAnswer("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not get feedback.");
    } finally {
      setLoadingFeedback(false);
    }
  };

  if (!email) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4 text-center">
        <p className="text-white/50">Build your CV first so the coach has real context to work from.</p>
        <Link href="/create-cv" className="btn-primary px-6 py-3 rounded-2xl text-sm font-bold">Build Your CV</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-black text-white">AI Interview Coach</h1>
        <p className="text-white/40 text-sm mt-1">Real questions generated for a specific role, real feedback on your actual answers.</p>
      </div>

      <div className="glass rounded-2xl p-5 space-y-3">
        <h3 className="text-white font-semibold text-sm">Interviewing for</h3>
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
        <div className="flex gap-3">
          <input className="input-glass text-sm flex-1" placeholder="Company" value={company} onChange={(e) => setCompany(e.target.value)} />
          <input className="input-glass text-sm flex-1" placeholder="Role" value={role} onChange={(e) => setRole(e.target.value)} />
        </div>
        <button onClick={generateQuestions} disabled={loadingQuestions} className="btn-primary px-5 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50">
          {loadingQuestions ? "Generating..." : "✨ Generate Real Questions"}
        </button>
        {error && <p className="text-red-400 text-xs">{error}</p>}
      </div>

      {questions.length > 0 && (
        <div className="space-y-3">
          {questions.map((q, i) => (
            <div key={i} className="glass glass-hover rounded-2xl overflow-hidden">
              <button
                className="w-full text-left p-5 flex items-start justify-between gap-4"
                onClick={() => setActiveQ(activeQ === i ? null : i)}
              >
                <p className="text-white font-semibold text-sm">{q}</p>
                <span className={`text-white/40 text-lg shrink-0 transition-transform ${activeQ === i ? "rotate-45" : ""}`}>+</span>
              </button>
              {activeQ === i && (
                <div className="px-5 pb-5 border-t border-white/5 pt-4 space-y-3">
                  {feedback[i] ? (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <span className="text-violet-300 text-xs font-semibold">AI Coach Feedback</span>
                      </div>
                      <p className="text-white/60 text-sm leading-relaxed">{feedback[i]}</p>
                    </div>
                  ) : (
                    <>
                      <textarea
                        className="input-glass text-sm w-full resize-none"
                        style={{ minHeight: "100px" }}
                        placeholder="Type your answer..."
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                      />
                      <button
                        onClick={() => submitAnswer(i)}
                        disabled={loadingFeedback || !answer.trim()}
                        className="btn-primary px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-50"
                      >
                        {loadingFeedback ? "Reviewing..." : "Get Feedback"}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
