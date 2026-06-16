"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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
      if (stored) {
        setCv(JSON.parse(stored));
      }
    }
  }, []);

  if (!cv) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="text-4xl">📄</div>
        <h2 className="text-xl font-bold text-white">No CV Found</h2>
        <p className="text-gray-400 text-sm">You have not built your CV yet.</p>
        <Link
          href="/create-cv"
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold"
        >
          Build My CV
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">My CV</h1>
          <p className="text-gray-400 text-sm mt-1">Your profile used for AI job matching</p>
        </div>
        <Link
          href="/create-cv"
          className="border border-gray-700 hover:border-purple-500 text-gray-300 hover:text-purple-300 px-4 py-2 rounded-lg text-sm transition-all"
        >
          Edit CV
        </Link>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-purple-300 mb-4">Personal Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div><span className="text-gray-500">Name:</span> <span className="text-white ml-2">{cv.name || "—"}</span></div>
          <div><span className="text-gray-500">Email:</span> <span className="text-white ml-2">{cv.email || "—"}</span></div>
          <div><span className="text-gray-500">Phone:</span> <span className="text-white ml-2">{cv.phone || "—"}</span></div>
          <div><span className="text-gray-500">Location:</span> <span className="text-white ml-2">{cv.location || "—"}</span></div>
          {cv.linkedin && (
            <div className="md:col-span-2">
              <span className="text-gray-500">LinkedIn:</span>
              <a href={cv.linkedin} className="text-purple-400 hover:text-purple-300 ml-2">{cv.linkedin}</a>
            </div>
          )}
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-purple-300 mb-4">Work Experience</h2>
        <div className="space-y-4">
          {cv.workExperiences?.map((exp, i) => (
            <div key={i} className="border-l-2 border-purple-500/40 pl-4">
              <p className="text-white font-medium">{exp.role || "—"}</p>
              <p className="text-gray-400 text-sm">{exp.company} · {exp.startDate} – {exp.endDate}</p>
              {exp.description && <p className="text-gray-400 text-sm mt-1">{exp.description}</p>}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-purple-300 mb-4">Education</h2>
        <div className="space-y-3">
          {cv.education?.map((edu, i) => (
            <div key={i} className="border-l-2 border-blue-500/40 pl-4">
              <p className="text-white font-medium">{edu.degree || "—"}</p>
              <p className="text-gray-400 text-sm">{edu.school} · {edu.year}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-purple-300 mb-4">Skills</h2>
        {cv.techSkills?.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-2">Technical</p>
            <div className="flex flex-wrap gap-2">
              {cv.techSkills.map((s) => (
                <span key={s} className="bg-purple-500/20 text-purple-300 px-2.5 py-1 rounded-lg text-xs border border-purple-500/30">{s}</span>
              ))}
            </div>
          </div>
        )}
        {cv.softSkills?.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 mb-2">Soft Skills</p>
            <div className="flex flex-wrap gap-2">
              {cv.softSkills.map((s) => (
                <span key={s} className="bg-blue-500/20 text-blue-300 px-2.5 py-1 rounded-lg text-xs border border-blue-500/30">{s}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-purple-300 mb-4">Job Preferences</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div><span className="text-gray-500">Target Roles:</span> <span className="text-white ml-2">{cv.targetRoles || "—"}</span></div>
          <div><span className="text-gray-500">Work Type:</span> <span className="text-white ml-2 capitalize">{cv.workType || "—"}</span></div>
          <div>
            <span className="text-gray-500">Salary:</span>
            <span className="text-white ml-2">
              ${parseInt(cv.salaryMin || "0").toLocaleString()} – ${parseInt(cv.salaryMax || "0").toLocaleString()}
            </span>
          </div>
          <div><span className="text-gray-500">Locations:</span> <span className="text-white ml-2">{cv.preferredLocations || "—"}</span></div>
        </div>
      </div>
    </div>
  );
}
