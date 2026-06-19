"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { buildInterviewIcs } from "@/lib/ics";

interface Application {
  id: string;
  company: string;
  role: string;
  status: string;
  interview_at: string | null;
  notes: string | null;
}

const prepTips = [
  { icon: "🔍", tip: "Research the company's recent news, products, and engineering blog" },
  { icon: "💻", tip: "Review system design patterns and data structures" },
  { icon: "🎯", tip: "Prepare 3-4 STAR format stories about past accomplishments" },
  { icon: "❓", tip: "Prepare thoughtful questions to ask your interviewer" },
  { icon: "🕐", tip: "Test your video setup and internet connection 10 minutes before" },
  { icon: "📝", tip: "Have your resume and notes ready for reference" },
];

export default function InterviewPrep() {
  const [email, setEmail] = useState<string | null>(null);
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState<Record<string, { when: string; notes: string }>>({});

  const load = useCallback((userEmail: string) => {
    fetch(`/api/applications?email=${encodeURIComponent(userEmail)}`)
      .then((r) => r.json())
      .then((d) => {
        const interviews: Application[] = (d.applications || []).filter((a: Application) => a.status === "Interview");
        setApps(interviews);
        setDrafts((prev) => {
          const next = { ...prev };
          for (const a of interviews) {
            if (!next[a.id]) {
              next[a.id] = {
                when: a.interview_at ? a.interview_at.slice(0, 16) : "",
                notes: a.notes || "",
              };
            }
          }
          return next;
        });
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("jobfinder_cv") : null;
    const cvEmail = stored ? JSON.parse(stored).email : null;
    setEmail(cvEmail);
    if (cvEmail) load(cvEmail);
    else setLoading(false);
  }, [load]);

  const save = async (id: string) => {
    const draft = drafts[id];
    await fetch("/api/applications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, interviewAt: draft.when || null, notes: draft.notes || null }),
    });
    setApps((prev) => prev.map((a) => (a.id === id ? { ...a, interview_at: draft.when || null, notes: draft.notes || null } : a)));
  };

  const downloadIcs = (app: Application) => {
    const draft = drafts[app.id];
    if (!draft?.when) return;
    const ics = buildInterviewIcs({ company: app.company, role: app.role, start: new Date(draft.when), notes: draft.notes });
    const blob = new Blob([ics], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `interview-${app.company.toLowerCase().replace(/\s+/g, "-")}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!email) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4 text-center">
        <p className="text-white/50">Build your CV first to start tracking interviews.</p>
        <Link href="/create-cv" className="btn-primary px-6 py-3 rounded-2xl text-sm font-bold">Build Your CV</Link>
      </div>
    );
  }

  const scheduled = apps.filter((a) => a.interview_at);
  const unscheduled = apps.filter((a) => !a.interview_at);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-black text-white">Interview Prep</h1>
        <p className="text-white/40 text-sm mt-1">
          Real interviews from your tracker — log the real date and download a calendar invite. Nothing here is auto-contacted or auto-scheduled.
        </p>
      </div>

      {!loading && apps.length === 0 && (
        <div className="glass rounded-2xl p-8 text-center text-white/40 text-sm space-y-3">
          <p>No applications marked &quot;Interview&quot; yet. Move one there from the Tracker once you land an interview.</p>
          <Link href="/dashboard/tracker" className="btn-primary inline-block px-6 py-3 rounded-2xl text-sm font-bold">Open Tracker</Link>
        </div>
      )}

      {apps.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="glass rounded-2xl p-4 text-center">
            <div className="text-3xl font-black text-emerald-400">{scheduled.length}</div>
            <div className="text-xs text-white/40 mt-1">Scheduled</div>
          </div>
          <div className="glass rounded-2xl p-4 text-center">
            <div className="text-3xl font-black text-amber-400">{unscheduled.length}</div>
            <div className="text-xs text-white/40 mt-1">Need a date</div>
          </div>
          <div className="glass rounded-2xl p-4 text-center">
            <div className="text-3xl font-black text-cyan-400">{apps.length}</div>
            <div className="text-xs text-white/40 mt-1">Total</div>
          </div>
        </div>
      )}

      {apps.length > 0 && (
        <div className="space-y-3">
          {apps.map((app) => {
            const draft = drafts[app.id] || { when: "", notes: "" };
            return (
              <div key={app.id} className="glass glass-hover rounded-2xl p-5">
                <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
                  <div>
                    <span className="text-white font-bold text-sm">{app.role}</span>
                    <p className="text-white/40 text-xs">{app.company}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-xl text-xs font-semibold border ${
                    app.interview_at ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25" : "bg-amber-500/15 text-amber-400 border-amber-500/25"
                  }`}>
                    {app.interview_at ? "Scheduled" : "Needs a date"}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-white/40 mb-1">Date & time</label>
                    <input
                      type="datetime-local"
                      className="input-glass text-sm"
                      value={draft.when}
                      onChange={(e) => setDrafts((p) => ({ ...p, [app.id]: { ...draft, when: e.target.value } }))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/40 mb-1">Notes</label>
                    <input
                      className="input-glass text-sm"
                      placeholder="Interviewer, format, link..."
                      value={draft.notes}
                      onChange={(e) => setDrafts((p) => ({ ...p, [app.id]: { ...draft, notes: e.target.value } }))}
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-4 pt-4 border-t border-white/5">
                  <button onClick={() => save(app.id)} className="btn-primary px-4 py-2 rounded-xl text-xs font-bold">
                    Save
                  </button>
                  <button
                    onClick={() => downloadIcs(app)}
                    disabled={!draft.when}
                    className="btn-glass px-4 py-2 rounded-xl text-xs font-semibold text-white/60 disabled:opacity-40"
                  >
                    📅 Download Calendar Invite
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div>
        <h2 className="text-sm font-semibold text-white/50 uppercase tracking-widest mb-4">General Interview Prep Checklist</h2>
        <div className="glass rounded-2xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {prepTips.map((tip, i) => (
              <div key={i} className="glass rounded-xl p-3 flex items-start gap-3">
                <span className="text-lg shrink-0">{tip.icon}</span>
                <p className="text-white/60 text-sm">{tip.tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
