"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronDown } from "lucide-react";
import { StaggerGroup as RevealGroup, StaggerItem as RevealItem } from "@/components/motion/Reveal";
import { TiltCard } from "@/components/motion/TiltCard";

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
        <p className="text-foreground/50">Build your CV first so the coach has real context to work from.</p>
        <Link href="/create-cv" className="btn-primary px-6 py-3 rounded-2xl text-sm font-bold">Build Your CV</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-black text-foreground">AI Interview Coach</h1>
        <p className="text-foreground/40 text-sm mt-1">Real questions generated for a specific role, real feedback on your actual answers.</p>
      </div>

      <TiltCard className="glass rounded-2xl p-5 space-y-3" max={4}>
        <h3 className="text-foreground font-semibold text-sm">Interviewing for</h3>
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
        <button onClick={generateQuestions} disabled={loadingQuestions} className="btn-primary px-5 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50 inline-flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          {loadingQuestions ? "Generating..." : "Generate Real Questions"}
        </button>
        {error && <p className="text-red-600 text-xs">{error}</p>}
      </TiltCard>

      {questions.length > 0 && (
        <RevealGroup className="space-y-3" stagger={0.07}>
          {questions.map((q, i) => (
            <RevealItem key={i}>
              <TiltCard className="glass glass-hover rounded-2xl overflow-hidden" max={4}>
                <button
                  className="w-full text-left p-5 flex items-start justify-between gap-4"
                  onClick={() => setActiveQ(activeQ === i ? null : i)}
                >
                  <p className="text-foreground font-semibold text-sm">{q}</p>
                  <ChevronDown className={`w-4 h-4 text-foreground/40 shrink-0 transition-transform duration-300 ${activeQ === i ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence initial={false}>
                  {activeQ === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.21, 0.47, 0.32, 0.98] }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 border-t border-foreground/5 pt-4 space-y-3">
                        {feedback[i] ? (
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-400 flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                              </div>
                              <span className="text-violet-700 text-xs font-semibold">AI Coach Feedback</span>
                            </div>
                            <p className="text-foreground/60 text-sm leading-relaxed">{feedback[i]}</p>
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
                    </motion.div>
                  )}
                </AnimatePresence>
              </TiltCard>
            </RevealItem>
          ))}
        </RevealGroup>
      )}
    </div>
  );
}
