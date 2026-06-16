"use client";

import { useState } from "react";

const jobs = [
  { company: "Google", role: "Senior Software Engineer", match: 97 },
  { company: "Anthropic", role: "AI Engineer", match: 96 },
  { company: "Stripe", role: "Full Stack Developer", match: 94 },
  { company: "Linear", role: "Software Engineer", match: 93 },
  { company: "Vercel", role: "Frontend Engineer", match: 92 },
];

const tones = ["Professional", "Enthusiastic", "Concise"];

const generateLetter = (company: string, role: string, tone: string) => {
  const openers: Record<string, string> = {
    Professional: `I am writing to express my strong interest in the ${role} position at ${company}.`,
    Enthusiastic: `I'm thrilled to apply for the ${role} role at ${company} — it's exactly the kind of challenge I've been looking for!`,
    Concise: `I'm applying for the ${role} role at ${company}. Here's why I'm the right fit:`,
  };

  return `Dear ${company} Hiring Team,

${openers[tone]}

With over 5 years of experience building scalable web applications, I've developed deep expertise in TypeScript, React, Node.js, and distributed systems. In my current role, I've led the migration of a monolithic application to microservices, reducing API latency by 65% and enabling the team to ship features 3x faster.

What excites me most about ${company} is your approach to engineering culture — the emphasis on craftsmanship, autonomy, and moving fast without breaking things. I've followed your engineering blog closely and deeply respect how your team handles [technical challenges].

Key highlights from my background:
• Architected and shipped features used by 2M+ daily active users
• Led a team of 4 engineers to deliver a complete platform rewrite on time
• Reduced infrastructure costs by 40% through caching and query optimization
• Open source contributor with 1,200+ GitHub stars on personal projects

I'd love to discuss how my experience aligns with what you're building at ${company}. I'm available for a call at your earliest convenience.

Thank you for your consideration,
[Your Name]`;
};

export default function CoverLetter() {
  const [selectedJob, setSelectedJob] = useState(0);
  const [tone, setTone] = useState("Professional");
  const [letter, setLetter] = useState(() => generateLetter(jobs[0].company, jobs[0].role, "Professional"));
  const [copied, setCopied] = useState(false);

  const regenerate = () => {
    setLetter(generateLetter(jobs[selectedJob].company, jobs[selectedJob].role, tone));
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
    a.download = `cover-letter-${jobs[selectedJob].company.toLowerCase()}.txt`;
    a.click();
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-black text-white">Cover Letter Generator</h1>
        <p className="text-white/40 text-sm mt-1">AI generates personalized letters tailored to each job description.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="space-y-4">
          <div className="glass rounded-2xl p-5">
            <h3 className="text-white font-semibold text-sm mb-3">Select Job</h3>
            <div className="space-y-2">
              {jobs.map((job, i) => (
                <button
                  key={i}
                  onClick={() => { setSelectedJob(i); setLetter(generateLetter(job.company, job.role, tone)); }}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    selectedJob === i
                      ? "bg-violet-500/20 border-violet-500/40 text-white"
                      : "glass text-white/50 hover:text-white/80"
                  }`}
                >
                  <div className="font-semibold text-sm">{job.company}</div>
                  <div className="text-xs opacity-60">{job.role}</div>
                  <div className={`text-xs font-bold mt-1 ${
                    job.match >= 95 ? "text-emerald-400" : job.match >= 90 ? "text-cyan-400" : "text-violet-400"
                  }`}>{job.match}% match</div>
                </button>
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl p-5">
            <h3 className="text-white font-semibold text-sm mb-3">Tone</h3>
            <div className="space-y-2">
              {tones.map((t) => (
                <button
                  key={t}
                  onClick={() => { setTone(t); setLetter(generateLetter(jobs[selectedJob].company, jobs[selectedJob].role, t)); }}
                  className={`w-full text-left p-3 rounded-xl border transition-all text-sm font-semibold ${
                    tone === t
                      ? "bg-violet-500/20 border-violet-500/40 text-violet-200"
                      : "glass text-white/50 hover:text-white/80"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <button onClick={regenerate} className="btn-primary w-full py-3 rounded-xl font-bold text-sm">
            ✨ Regenerate Letter
          </button>
        </div>

        {/* Letter */}
        <div className="lg:col-span-2 glass rounded-2xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-white/5">
            <div>
              <span className="text-white font-semibold text-sm">{jobs[selectedJob].company} — {jobs[selectedJob].role}</span>
              <span className="ml-2 text-xs text-white/40">{tone}</span>
            </div>
            <div className="flex gap-2">
              <button onClick={copy} className={`btn-glass px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${copied ? "text-emerald-400" : "text-white/60"}`}>
                {copied ? "✓ Copied!" : "Copy"}
              </button>
              <button onClick={download} className="btn-glass px-3 py-1.5 rounded-xl text-xs font-semibold text-white/60">
                Download
              </button>
            </div>
          </div>
          <textarea
            className="flex-1 p-5 text-sm text-white/70 leading-relaxed resize-none outline-none"
            style={{ background: "transparent", minHeight: "500px" }}
            value={letter}
            onChange={(e) => setLetter(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
