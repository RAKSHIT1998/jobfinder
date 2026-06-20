"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, Code2, Target, HelpCircle, Clock, NotebookPen, CalendarPlus } from "lucide-react";
import { buildInterviewIcs } from "@/lib/ics";
import { StaggerGroup as RevealGroup, StaggerItem as RevealItem } from "@/components/motion/Reveal";
import { TiltCard } from "@/components/motion/TiltCard";

interface Application {
  id: string;
  company: string;
  role: string;
  status: string;
  interview_at: string | null;
  notes: string | null;
}

const prepTips = [
  { Icon: Search, tip: "Research the company's recent news, products, and engineering blog" },
  { Icon: Code2, tip: "Review system design patterns and data structures" },
  { Icon: Target, tip: "Prepare 3-4 STAR format stories about past accomplishments" },
  { Icon: HelpCircle, tip: "Prepare thoughtful questions to ask your interviewer" },
  { Icon: Clock, tip: "Test your video setup and internet connection 10 minutes before" },
  { Icon: NotebookPen, tip: "Have your resume and notes ready for reference" },
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
        <p className="text-foreground/50">Build your CV first to start tracking interviews.</p>
        <Link href="/create-cv" className="btn-primary px-6 py-3 rounded-2xl text-sm font-bold">Build Your CV</Link>
      </div>
    );
  }

  const scheduled = apps.filter((a) => a.interview_at);
  const unscheduled = apps.filter((a) => !a.interview_at);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-black text-foreground">Interview Prep</h1>
        <p className="text-foreground/40 text-sm mt-1">
          Real interviews from your tracker — log the real date and download a calendar invite. Nothing here is auto-contacted or auto-scheduled.
        </p>
      </div>

      {!loading && apps.length === 0 && (
        <div className="glass rounded-2xl p-8 text-center text-foreground/40 text-sm space-y-3">
          <p>No applications marked &quot;Interview&quot; yet. Move one there from the Tracker once you land an interview.</p>
          <Link href="/dashboard/tracker" className="btn-primary inline-block px-6 py-3 rounded-2xl text-sm font-bold">Open Tracker</Link>
        </div>
      )}

      {apps.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <TiltCard className="glass rounded-2xl p-4 text-center" max={8}>
            <div className="text-3xl font-black text-emerald-600">{scheduled.length}</div>
            <div className="text-xs text-foreground/40 mt-1">Scheduled</div>
          </TiltCard>
          <TiltCard className="glass rounded-2xl p-4 text-center" max={8}>
            <div className="text-3xl font-black text-amber-600">{unscheduled.length}</div>
            <div className="text-xs text-foreground/40 mt-1">Need a date</div>
          </TiltCard>
          <TiltCard className="glass rounded-2xl p-4 text-center" max={8}>
            <div className="text-3xl font-black text-cyan-600">{apps.length}</div>
            <div className="text-xs text-foreground/40 mt-1">Total</div>
          </TiltCard>
        </div>
      )}

      {apps.length > 0 && (
        <RevealGroup className="space-y-3" stagger={0.07}>
          {apps.map((app) => {
            const draft = drafts[app.id] || { when: "", notes: "" };
            return (
              <RevealItem key={app.id}>
              <TiltCard className="glass glass-hover rounded-2xl p-5" max={4}>
                <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
                  <div>
                    <span className="text-foreground font-bold text-sm">{app.role}</span>
                    <p className="text-foreground/40 text-xs">{app.company}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-xl text-xs font-semibold border ${
                    app.interview_at ? "bg-emerald-500/15 text-emerald-700 border-emerald-500/25" : "bg-amber-500/15 text-amber-700 border-amber-500/25"
                  }`}>
                    {app.interview_at ? "Scheduled" : "Needs a date"}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-foreground/40 mb-1">Date & time</label>
                    <input
                      type="datetime-local"
                      className="input-glass text-sm"
                      value={draft.when}
                      onChange={(e) => setDrafts((p) => ({ ...p, [app.id]: { ...draft, when: e.target.value } }))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-foreground/40 mb-1">Notes</label>
                    <input
                      className="input-glass text-sm"
                      placeholder="Interviewer, format, link..."
                      value={draft.notes}
                      onChange={(e) => setDrafts((p) => ({ ...p, [app.id]: { ...draft, notes: e.target.value } }))}
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-4 pt-4 border-t border-foreground/5">
                  <button onClick={() => save(app.id)} className="btn-primary px-4 py-2 rounded-xl text-xs font-bold">
                    Save
                  </button>
                  <button
                    onClick={() => downloadIcs(app)}
                    disabled={!draft.when}
                    className="btn-glass px-4 py-2 rounded-xl text-xs font-semibold text-foreground/60 disabled:opacity-40 inline-flex items-center gap-1.5"
                  >
                    <CalendarPlus className="w-3.5 h-3.5" /> Download Calendar Invite
                  </button>
                </div>
              </TiltCard>
              </RevealItem>
            );
          })}
        </RevealGroup>
      )}

      <div>
        <h2 className="text-sm font-semibold text-foreground/50 uppercase tracking-widest mb-4">General Interview Prep Checklist</h2>
        <div className="glass rounded-2xl p-6">
          <RevealGroup className="grid grid-cols-1 md:grid-cols-2 gap-3" stagger={0.05}>
            {prepTips.map((tip, i) => (
              <RevealItem key={i}>
                <TiltCard className="glass rounded-xl p-3 flex items-start gap-3" max={6}>
                  <div className="w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                    <tip.Icon className="w-3.5 h-3.5 text-violet-700" />
                  </div>
                  <p className="text-foreground/60 text-sm">{tip.tip}</p>
                </TiltCard>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </div>
    </div>
  );
}
