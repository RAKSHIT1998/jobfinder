"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FileText } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { useCountry } from "@/lib/useCountry";
import { StaggerGroup as RevealGroup, StaggerItem as RevealItem } from "@/components/motion/Reveal";
import { TiltCard } from "@/components/motion/TiltCard";

interface CVData {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  summary?: string;
  workExperiences: Array<{ company: string; role: string; startDate: string; endDate: string; description: string }>;
  education: Array<{ degree: string; school: string; year: string }>;
  techSkills: string[];
  softSkills: string[];
  targetRoles: string;
  salaryMin: string;
  salaryMax: string;
  salaryCurrency?: string;
  workType: string;
  preferredLocations: string;
}

export default function MyCVPage() {
  const router = useRouter();
  const { country } = useCountry();
  const [cv, setCv] = useState<CVData | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await fetch("/api/account", { method: "DELETE" });
    } finally {
      localStorage.removeItem("jobfinder_cv");
      localStorage.removeItem("jobfinder_paid");
      localStorage.removeItem("jobfinder_paid_at");
      router.push("/");
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("jobfinder_cv");
      if (stored) setCv(JSON.parse(stored));
    }
  }, []);

  if (!cv) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4 text-center">
        <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center"><FileText className="w-7 h-7 text-violet-300" /></div>
        <h2 className="text-xl font-bold text-white">No CV Found</h2>
        <p className="text-white/40 text-sm">Build your CV to start getting matched to jobs.</p>
        <Link href="/create-cv" className="btn-primary px-6 py-2.5 rounded-xl text-sm font-semibold">
          Build My CV
        </Link>
      </div>
    );
  }

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <RevealItem>
      <TiltCard className="glass rounded-2xl p-6" max={4}>
        <h2 className="text-sm font-semibold text-white/50 uppercase tracking-widest mb-4">{title}</h2>
        {children}
      </TiltCard>
    </RevealItem>
  );

  return (
    <RevealGroup className="space-y-4 max-w-3xl" stagger={0.07}>
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
        {cv.summary && (
          <div className="glass rounded-xl p-3 mt-4">
            <div className="text-white/30 text-xs mb-1">Summary</div>
            <p className="text-white/70 text-sm leading-relaxed">{cv.summary}</p>
          </div>
        )}
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
            {
              label: "Salary Range",
              value:
                cv.salaryMin && cv.salaryMax
                  ? `${formatCurrency(parseFloat(cv.salaryMin), cv.salaryCurrency || "INR", country.locale)} - ${formatCurrency(parseFloat(cv.salaryMax), cv.salaryCurrency || "INR", country.locale)}`
                  : "",
            },
            { label: "Locations", value: cv.preferredLocations },
          ].map((f) => (
            <div key={f.label} className="glass rounded-xl p-3">
              <div className="text-white/30 text-xs mb-1">{f.label}</div>
              <div className="text-white/80 text-sm font-semibold capitalize">{f.value || "—"}</div>
            </div>
          ))}
        </div>
      </Section>

      <RevealItem>
      <TiltCard className="glass rounded-2xl p-6 border border-red-500/20" max={4}>
        <h2 className="text-sm font-semibold text-red-400/80 uppercase tracking-widest mb-2">Danger Zone</h2>
        <p className="text-white/40 text-sm mb-4">
          Permanently delete your account, CV, applications, and payment history. This can&apos;t be undone.
        </p>
        {!confirmingDelete ? (
          <button
            onClick={() => setConfirmingDelete(true)}
            className="btn-glass px-4 py-2 rounded-xl text-sm font-semibold text-red-400 hover:text-red-300"
          >
            Delete My Account
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-white/50 text-sm">Are you sure? This is permanent.</span>
            <button
              onClick={handleDeleteAccount}
              disabled={deleting}
              className="px-4 py-2 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-sm font-semibold disabled:opacity-50"
            >
              {deleting ? "Deleting..." : "Yes, delete everything"}
            </button>
            <button
              onClick={() => setConfirmingDelete(false)}
              className="btn-glass px-4 py-2 rounded-xl text-sm font-semibold text-white/50"
            >
              Cancel
            </button>
          </div>
        )}
      </TiltCard>
      </RevealItem>
    </RevealGroup>
  );
}
