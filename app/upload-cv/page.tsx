"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Upload, FileText, ClipboardPaste, X, Loader2, Sparkles, ArrowRight,
  Lock, Building2, MapPin,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Spotlight } from "@/components/motion/Spotlight";
import { TiltCard } from "@/components/motion/TiltCard";
import { Reveal } from "@/components/motion/Reveal";
import type { ExtractedCV } from "@/lib/cvExtract";
import type { ScoredJob } from "@/lib/matching";

type Mode = "upload" | "paste";
type Status = "idle" | "loading" | "error" | "done";

interface ParseResult {
  cv: ExtractedCV;
  matches: ScoredJob[];
  sourcedFrom: string[];
}

const VISIBLE_MATCHES = 3;

function toDraftCv(cv: ExtractedCV) {
  return {
    name: cv.name,
    email: cv.email,
    phone: cv.phone,
    location: cv.location,
    linkedin: cv.linkedin,
    summary: cv.summary,
    workExperiences: cv.workExperiences.length
      ? cv.workExperiences
      : [{ company: "", role: "", startDate: "", endDate: "", description: "" }],
    education: cv.education.length ? cv.education : [{ degree: "", school: "", year: "" }],
    techSkills: cv.techSkills,
    softSkills: cv.softSkills,
    targetRoles: cv.targetRoles,
    salaryMin: "",
    salaryMax: "",
    salaryCurrency: "",
    workType: cv.workType,
    preferredLocations: cv.preferredLocations,
  };
}

export default function UploadCV() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<Mode>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [result, setResult] = useState<ParseResult | null>(null);

  const canSubmit = mode === "upload" ? !!file : pastedText.trim().length > 0;

  async function handleSubmit() {
    if (!canSubmit || status === "loading") return;
    setStatus("loading");
    setError("");

    const form = new FormData();
    if (mode === "upload" && file) form.append("file", file);
    if (mode === "paste") form.append("text", pastedText);

    try {
      const res = await fetch("/api/cv/parse", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong reading that resume.");
        setStatus("error");
        return;
      }
      setResult(data as ParseResult);
      setStatus("done");
    } catch {
      setError("Couldn't reach the server - check your connection and try again.");
      setStatus("error");
    }
  }

  function continueToProfile() {
    if (!result) return;
    localStorage.setItem("jobfinder_cv", JSON.stringify(toDraftCv(result.cv)));
    router.push("/create-cv");
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) setFile(dropped);
  }

  return (
    <Spotlight className="min-h-screen text-foreground bg-white" color="124,58,237">
      <Navbar />

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[560px] h-[560px] rounded-full opacity-[0.1]" style={{ background: "radial-gradient(circle, #7c3aed, transparent)", filter: "blur(var(--blur-ambient))" }} />
      </div>

      <section className="relative pt-36 pb-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <Reveal>
            <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 text-sm text-foreground/60 mb-6">
              <Sparkles className="w-3.5 h-3.5 text-violet-600" />
              Free - no signup required
            </div>
            <h1 className="text-4xl sm:text-5xl font-black leading-[0.95] tracking-tight mb-5">
              <span className="text-foreground">Upload your resume.</span>
              <br />
              <span className="gradient-text">See your matches in seconds.</span>
            </h1>
            <p className="text-lg text-foreground/50 leading-relaxed">
              We&apos;ll read your resume, pull out your skills and target roles, then score it against live
              postings right now - before you create an account or pay anything.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="relative px-4 pb-24">
        <div className="max-w-2xl mx-auto">
          {status !== "done" && (
            <TiltCard className="glass-strong rounded-3xl p-6 sm:p-8" max={3}>
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setMode("upload")}
                  className={`flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    mode === "upload" ? "bg-violet-500/20 border border-violet-500/40 text-violet-700" : "glass text-foreground/40 hover:text-foreground/70"
                  }`}
                >
                  <Upload className="w-4 h-4" /> Upload File
                </button>
                <button
                  onClick={() => setMode("paste")}
                  className={`flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    mode === "paste" ? "bg-violet-500/20 border border-violet-500/40 text-violet-700" : "glass text-foreground/40 hover:text-foreground/70"
                  }`}
                >
                  <ClipboardPaste className="w-4 h-4" /> Paste Text
                </button>
              </div>

              {mode === "upload" ? (
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={onDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`rounded-2xl border-2 border-dashed p-10 text-center cursor-pointer transition-all ${
                    dragOver ? "border-violet-500/60 bg-violet-500/5" : "border-foreground/10 hover:border-violet-500/40"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.txt,application/pdf,text/plain"
                    className="hidden"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                  {file ? (
                    <div className="flex items-center justify-center gap-3">
                      <FileText className="w-8 h-8 text-violet-600" />
                      <div className="text-left">
                        <p className="text-foreground font-semibold text-sm truncate max-w-[220px]">{file.name}</p>
                        <p className="text-foreground/40 text-xs">{(file.size / 1024).toFixed(0)} KB</p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); setFile(null); }}
                        className="text-foreground/30 hover:text-red-600 transition-colors"
                        aria-label="Remove file"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-foreground/25 mx-auto mb-3" />
                      <p className="text-foreground/60 text-sm font-medium">Drop your resume here, or click to browse</p>
                      <p className="text-foreground/30 text-xs mt-1">PDF or .txt, up to 5MB</p>
                    </>
                  )}
                </div>
              ) : (
                <textarea
                  className="input-glass resize-none w-full"
                  rows={10}
                  placeholder="Paste your resume text here - works great for Word docs, just copy and paste the content."
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                />
              )}

              {status === "error" && <p className="text-red-600 text-sm mt-4">{error}</p>}

              <button
                onClick={handleSubmit}
                disabled={!canSubmit || status === "loading"}
                className="btn-primary w-full mt-6 py-3.5 rounded-2xl text-sm font-bold inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Reading your resume...
                  </>
                ) : (
                  <>
                    Find My Matches <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </TiltCard>
          )}

          {status === "done" && result && (
            <Reveal>
              <div className="space-y-6">
                <TiltCard className="glass-strong rounded-3xl p-6 sm:p-8" max={3}>
                  <h2 className="text-2xl font-black text-foreground mb-1">
                    {result.cv.name ? `Hey ${result.cv.name.split(" ")[0]}, here's what we found.` : "Here's what we found."}
                  </h2>
                  <p className="text-foreground/40 text-sm mb-5">
                    {result.cv.targetRoles ? `Best fit for: ${result.cv.targetRoles}` : "Pulled straight from your resume."}
                  </p>
                  {result.cv.techSkills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {result.cv.techSkills.slice(0, 10).map((skill) => (
                        <span key={skill} className="glass px-3 py-1.5 rounded-xl text-xs text-foreground/70 font-semibold">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </TiltCard>

                <div>
                  <h3 className="text-sm font-semibold text-foreground/50 uppercase tracking-widest mb-3">
                    {result.matches.length} live {result.matches.length === 1 ? "match" : "matches"}
                  </h3>

                  {result.matches.length === 0 ? (
                    <div className="glass rounded-2xl p-6 text-center text-foreground/50 text-sm">
                      No live matches right now - save your profile and we&apos;ll keep scanning as new postings come in.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {result.matches.slice(0, VISIBLE_MATCHES).map((job) => (
                        <TiltCard key={job.id} className="glass glass-hover rounded-2xl p-4 flex items-center gap-4" max={4}>
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-foreground/8 flex items-center justify-center text-base font-black text-violet-700 shrink-0">
                            {job.company[0]?.toUpperCase() || "?"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-foreground font-semibold text-sm truncate">{job.title}</p>
                            <div className="flex items-center gap-3 text-foreground/40 text-xs mt-1">
                              <span className="inline-flex items-center gap-1 truncate"><Building2 className="w-3 h-3 shrink-0" /> {job.company}</span>
                              <span className="inline-flex items-center gap-1 truncate"><MapPin className="w-3 h-3 shrink-0" /> {job.remote ? "Remote" : job.location}</span>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-xl font-black text-emerald-600">{job.match}%</div>
                            <div className="text-foreground/30 text-xs">match</div>
                          </div>
                        </TiltCard>
                      ))}

                      {result.matches.length > VISIBLE_MATCHES && (
                        <div className="relative">
                          <div className="space-y-3 blur-sm select-none pointer-events-none">
                            {result.matches.slice(VISIBLE_MATCHES, VISIBLE_MATCHES + 2).map((job) => (
                              <div key={job.id} className="glass rounded-2xl p-4 flex items-center gap-4">
                                <div className="w-11 h-11 rounded-xl bg-foreground/10 shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-foreground font-semibold text-sm truncate">{job.title}</p>
                                  <p className="text-foreground/40 text-xs mt-1">{job.company}</p>
                                </div>
                                <div className="text-xl font-black text-emerald-600 shrink-0">{job.match}%</div>
                              </div>
                            ))}
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="glass-strong rounded-2xl px-5 py-3 flex items-center gap-2 text-sm font-semibold text-foreground/70">
                              <Lock className="w-4 h-4" />
                              +{result.matches.length - VISIBLE_MATCHES} more matches - save your profile to unlock
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <TiltCard className="iridescent-border rounded-3xl p-px" max={3}>
                  <div className="glass-strong shine-sweep rounded-3xl p-8 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-56 h-28 opacity-10 pointer-events-none" style={{ background: "radial-gradient(circle, #7c3aed, transparent)", filter: "blur(40px)" }} />
                    <h3 className="text-foreground font-black text-lg mb-2 relative">Save your profile to see every match</h3>
                    <p className="text-foreground/50 text-sm mb-6 relative">
                      Your resume is already filled in - just add an email and password to finish your full profile
                      and unlock the dashboard.
                    </p>
                    <button
                      onClick={continueToProfile}
                      className="btn-primary inline-flex items-center gap-2 text-sm font-bold px-8 py-3.5 rounded-2xl relative"
                    >
                      Save My Profile <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </TiltCard>

                <p className="text-center text-foreground/30 text-xs">
                  Want to start over? <button onClick={() => { setStatus("idle"); setResult(null); setFile(null); setPastedText(""); }} className="text-violet-600 hover:text-violet-700 underline">Upload a different resume</button>
                </p>
              </div>
            </Reveal>
          )}

          {status !== "done" && (
            <p className="text-center text-foreground/30 text-xs mt-6">
              Prefer to fill it in yourself? <Link href="/create-cv" className="text-violet-600 hover:text-violet-700 underline">Build your CV manually</Link>
            </p>
          )}
        </div>
      </section>

      <Footer />
    </Spotlight>
  );
}
