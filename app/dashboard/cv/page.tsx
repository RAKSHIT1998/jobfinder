"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatInr } from "@/lib/currency";

interface CVData {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  workExperiences: Array<{ company: string; role: string; startDate: string; endDate: string; description: string }>;
  education: Array<{ degree: string; school: string; year: string }>;
  techSkills: string[];
  softSkills: string[];
  targetRoles: string;
  salaryMin: string;
  salaryMax: string;
  workType: string;
  preferredLocations: string;
}

export default function MyCVPage() {
  const [cv, setCv] = useState<CVData | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("jobfinder_cv");
      if (stored) setCv(JSON.parse(stored));
    }
  }, []);

  if (!cv) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4 text-center">
        <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center text-3xl">📄</div>
        <h2 className="text-xl font-bold text-white">No CV Found</h2>
        <p className="text-white/40 text-sm">Build your CV to start getting matched to jobs.</p>
        <Link href="/create-cv" className="btn-primary px-6 py-2.5 rounded-xl text-sm font-semibold">
          Build My CV
        </Link>
      </div>
    );
  }

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="glass rounded-2xl p-6">
      <h2 className="text-sm font-semibold text-white/50 uppercase tracking-widest mb-4">{title}</h2>
      {children}
    </div>
  );

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white">My CV</h1>
          <p className="text-white/40 text-sm mt-1">Your profile used by AI for job matching</p>
        </div>
        <Link href="/create-cv" className="btn-glass px-4 py-2 rounded-xl text-sm font-semibold text-white/60 hover:text-white">
          Edit CV
        </Link>
      </div>

      <Section title="Personal Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {[
            { label: "Name", value: cv.name },
            { label: "Email", value: cv.email },
            { label: "Phone", value: cv.phone },
            { label: "Location", value: cv.location },
          ].map((f) => (
            <div key={f.label} className="glass rounded-xl p-3">
              <div className="text-white/30 text-xs mb-1">{f.label}</div>
              <div className="text-white/80 font-semibold">{f.value || "—"}</div>
            </div>
          ))}
          {cv.linkedin && (
            <div className="glass rounded-xl p-3 md:col-span-2">
              <div className="text-white/30 text-xs mb-1">LinkedIn</div>
              <a href={cv.linkedin} className="text-violet-400 hover:text-violet-300 text-sm font-semibold break-all">{cv.linkedin}</a>
            </div>
          )}
        </div>
      </Section>

      <Section title="Work Experience">
        <div className="space-y-4">
          {cv.workExperiences?.map((exp, i) => (
            <div key={i} className="glass rounded-xl p-4 border-l-2" style={{ borderColor: "rgba(139,92,246,0.4)" }}>
              <p className="text-white font-bold text-sm">{exp.role || "—"}</p>
              <p className="text-violet-300 text-xs font-semibold mt-0.5">{exp.company || "—"}</p>
              <p className="text-white/30 text-xs mt-1">{exp.startDate} – {exp.endDate}</p>
              {exp.description && <p className="text-white/50 text-sm mt-2 leading-relaxed">{exp.description}</p>}
            </div>
          ))}
        </div>
      </Section>

      <Section title="Education">
        <div className="space-y-3">
          {cv.education?.map((edu, i) => (
            <div key={i} className="glass rounded-xl p-4 border-l-2" style={{ borderColor: "rgba(6,182,212,0.4)" }}>
              <p className="text-white font-bold text-sm">{edu.degree || "—"}</p>
              <p className="text-cyan-300 text-xs font-semibold mt-0.5">{edu.school || "—"}</p>
              <p className="text-white/30 text-xs mt-1">{edu.year || "—"}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Skills">
        {cv.techSkills?.length > 0 && (
          <div className="mb-4">
            <p className="text-white/30 text-xs mb-2 font-semibold uppercase tracking-wider">Technical</p>
            <div className="flex flex-wrap gap-2">
              {cv.techSkills.map((s) => (
                <span key={s} className="px-3 py-1 rounded-xl text-xs font-semibold border bg-violet-500/15 text-violet-300 border-violet-500/25">{s}</span>
              ))}
            </div>
          </div>
        )}
        {cv.softSkills?.length > 0 && (
          <div>
            <p className="text-white/30 text-xs mb-2 font-semibold uppercase tracking-wider">Soft Skills</p>
            <div className="flex flex-wrap gap-2">
              {cv.softSkills.map((s) => (
                <span key={s} className="px-3 py-1 rounded-xl text-xs font-semibold border bg-cyan-500/15 text-cyan-300 border-cyan-500/25">{s}</span>
              ))}
            </div>
          </div>
        )}
        {!cv.techSkills?.length && !cv.softSkills?.length && (
          <p className="text-white/30 text-sm">No skills added yet.</p>
        )}
      </Section>

      <Section title="Job Preferences">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Target Roles", value: cv.targetRoles },
            { label: "Work Type", value: cv.workType },
            { label: "Salary Range", value: `${formatInr(parseInt(cv.salaryMin||"0"))} - ${formatInr(parseInt(cv.salaryMax||"0"))}` },
            { label: "Locations", value: cv.preferredLocations },
          ].map((f) => (
            <div key={f.label} className="glass rounded-xl p-3">
              <div className="text-white/30 text-xs mb-1">{f.label}</div>
              <div className="text-white/80 text-sm font-semibold capitalize">{f.value || "—"}</div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
