"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface WorkExperience {
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface Education {
  degree: string;
  school: string;
  year: string;
}

interface CVData {
  // Step 1
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  // Step 2
  workExperiences: WorkExperience[];
  // Step 3
  education: Education[];
  // Step 4
  techSkills: string[];
  softSkills: string[];
  // Step 5
  targetRoles: string;
  salaryMin: string;
  salaryMax: string;
  workType: string;
  preferredLocations: string;
}

const STEPS = [
  "Personal Info",
  "Work Experience",
  "Education",
  "Skills",
  "Job Preferences",
  "Review",
  "Payment",
];

const TECH_SKILL_OPTIONS = [
  "JavaScript", "TypeScript", "React", "Next.js", "Node.js", "Python",
  "Go", "Rust", "Java", "C++", "PostgreSQL", "MongoDB", "Redis",
  "AWS", "Docker", "Kubernetes", "GraphQL", "REST APIs",
];

const SOFT_SKILL_OPTIONS = [
  "Communication", "Leadership", "Problem Solving", "Teamwork",
  "Time Management", "Adaptability", "Critical Thinking", "Creativity",
];

export default function CreateCV() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [cv, setCv] = useState<CVData>({
    name: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    workExperiences: [{ company: "", role: "", startDate: "", endDate: "", description: "" }],
    education: [{ degree: "", school: "", year: "" }],
    techSkills: [],
    softSkills: [],
    targetRoles: "",
    salaryMin: "80000",
    salaryMax: "150000",
    workType: "remote",
    preferredLocations: "",
  });

  const updateCv = (field: keyof CVData, value: unknown) => {
    setCv((prev) => ({ ...prev, [field]: value }));
  };

  const updateWorkExp = (idx: number, field: keyof WorkExperience, value: string) => {
    const updated = [...cv.workExperiences];
    updated[idx] = { ...updated[idx], [field]: value };
    updateCv("workExperiences", updated);
  };

  const updateEducation = (idx: number, field: keyof Education, value: string) => {
    const updated = [...cv.education];
    updated[idx] = { ...updated[idx], [field]: value };
    updateCv("education", updated);
  };

  const toggleSkill = (skill: string, type: "techSkills" | "softSkills") => {
    const current = cv[type];
    if (current.includes(skill)) {
      updateCv(type, current.filter((s) => s !== skill));
    } else {
      updateCv(type, [...current, skill]);
    }
  };

  const handleNext = () => {
    if (step < 7) {
      if (typeof window !== "undefined") {
        localStorage.setItem("jobfinder_cv", JSON.stringify(cv));
      }
      if (step === 6) {
        fetch("/api/cv", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(cv),
        }).catch(() => {});
        router.push("/checkout");
        return;
      }
      setStep(step + 1);
    }
  };

  const inputClass = "input-glass";
  const labelClass = "block text-sm font-medium text-white/50 mb-2";

  return (
    <div className="min-h-screen text-white py-8 px-4 relative" style={{ background: "#050508" }}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="animate-blob absolute top-1/4 left-1/4 w-80 h-80 rounded-full opacity-15" style={{ background: "radial-gradient(circle, #7c3aed, transparent)", filter: "blur(80px)" }} />
        <div className="animate-blob animation-delay-2000 absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #0891b2, transparent)", filter: "blur(80px)" }} />
      </div>
      <div className="max-w-2xl mx-auto relative">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="text-white/40 hover:text-white transition-colors text-sm">← Back</Link>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-white font-bold">JobFinder<span className="gradient-text">AI</span></span>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-white/30 mb-2">
            <span>Step {step} of {STEPS.length}</span>
            <span className="text-white/60">{STEPS[step - 1]}</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${(step / STEPS.length) * 100}%`, background: "linear-gradient(90deg, #7c3aed, #06b6d4)" }}
            />
          </div>
          <div className="flex gap-1 mt-3">
            {STEPS.map((s, i) => (
              <div
                key={i}
                className={`flex-1 text-center text-xs py-1.5 rounded-lg transition-all ${
                  i + 1 === step
                    ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                    : i + 1 < step
                    ? "text-emerald-400"
                    : "text-white/20"
                }`}
              >
                {i + 1 < step ? "✓" : i + 1}
              </div>
            ))}
          </div>
        </div>

        {/* Card */}
        <div className="glass-strong rounded-3xl p-8">
          {/* Step 1: Personal Info */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold mb-1">Personal Information</h2>
              <p className="text-white/40 text-sm mb-6">Tell us about yourself so we can build your profile.</p>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Full Name *</label>
                  <input className={inputClass} placeholder="John Doe" value={cv.name} onChange={(e) => updateCv("name", e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Email Address *</label>
                  <input className={inputClass} type="email" placeholder="john@example.com" value={cv.email} onChange={(e) => updateCv("email", e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Phone Number</label>
                  <input className={inputClass} placeholder="+1 (555) 000-0000" value={cv.phone} onChange={(e) => updateCv("phone", e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Location</label>
                  <input className={inputClass} placeholder="San Francisco, CA" value={cv.location} onChange={(e) => updateCv("location", e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>LinkedIn URL</label>
                  <input className={inputClass} placeholder="https://linkedin.com/in/johndoe" value={cv.linkedin} onChange={(e) => updateCv("linkedin", e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Work Experience */}
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold mb-1">Work Experience</h2>
              <p className="text-white/40 text-sm mb-6">Add your relevant work history.</p>
              <div className="space-y-6">
                {cv.workExperiences.map((exp, idx) => (
                  <div key={idx} className="glass rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium text-white/40">Experience {idx + 1}</span>
                      {cv.workExperiences.length > 1 && (
                        <button
                          onClick={() => updateCv("workExperiences", cv.workExperiences.filter((_, i) => i !== idx))}
                          className="text-red-400/70 hover:text-red-400 text-xs"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={labelClass}>Company</label>
                          <input className={inputClass} placeholder="Google" value={exp.company} onChange={(e) => updateWorkExp(idx, "company", e.target.value)} />
                        </div>
                        <div>
                          <label className={labelClass}>Role / Title</label>
                          <input className={inputClass} placeholder="Software Engineer" value={exp.role} onChange={(e) => updateWorkExp(idx, "role", e.target.value)} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={labelClass}>Start Date</label>
                          <input className={inputClass} placeholder="Jan 2022" value={exp.startDate} onChange={(e) => updateWorkExp(idx, "startDate", e.target.value)} />
                        </div>
                        <div>
                          <label className={labelClass}>End Date</label>
                          <input className={inputClass} placeholder="Present" value={exp.endDate} onChange={(e) => updateWorkExp(idx, "endDate", e.target.value)} />
                        </div>
                      </div>
                      <div>
                        <label className={labelClass}>Description</label>
                        <textarea
                          className={`${inputClass} resize-none`}
                          rows={3}
                          placeholder="Describe your responsibilities and achievements..."
                          value={exp.description}
                          onChange={(e) => updateWorkExp(idx, "description", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => updateCv("workExperiences", [...cv.workExperiences, { company: "", role: "", startDate: "", endDate: "", description: "" }])}
                  className="w-full border border-dashed border-white/10 hover:border-violet-500/50 text-white/30 hover:text-violet-300 rounded-xl py-3 text-sm transition-colors"
                >
                  + Add Another Experience
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Education */}
          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold mb-1">Education</h2>
              <p className="text-white/40 text-sm mb-6">Add your educational background.</p>
              <div className="space-y-4">
                {cv.education.map((edu, idx) => (
                  <div key={idx} className="glass rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-white/40">Education {idx + 1}</span>
                      {cv.education.length > 1 && (
                        <button
                          onClick={() => updateCv("education", cv.education.filter((_, i) => i !== idx))}
                          className="text-red-400/70 hover:text-red-400 text-xs"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className={labelClass}>Degree / Certificate</label>
                        <input className={inputClass} placeholder="B.S. Computer Science" value={edu.degree} onChange={(e) => updateEducation(idx, "degree", e.target.value)} />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={labelClass}>School / University</label>
                          <input className={inputClass} placeholder="MIT" value={edu.school} onChange={(e) => updateEducation(idx, "school", e.target.value)} />
                        </div>
                        <div>
                          <label className={labelClass}>Graduation Year</label>
                          <input className={inputClass} placeholder="2020" value={edu.year} onChange={(e) => updateEducation(idx, "year", e.target.value)} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => updateCv("education", [...cv.education, { degree: "", school: "", year: "" }])}
                  className="w-full border border-dashed border-white/10 hover:border-violet-500/50 text-white/30 hover:text-violet-300 rounded-xl py-3 text-sm transition-colors"
                >
                  + Add Another Education
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Skills */}
          {step === 4 && (
            <div>
              <h2 className="text-2xl font-bold mb-1">Skills</h2>
              <p className="text-white/40 text-sm mb-6">Select your technical and soft skills.</p>
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-white/60 mb-3">Technical Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {TECH_SKILL_OPTIONS.map((skill) => (
                      <button
                        key={skill}
                        onClick={() => toggleSkill(skill, "techSkills")}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                          cv.techSkills.includes(skill)
                            ? "bg-violet-500/20 border-violet-500/60 text-violet-300"
                            : "glass text-white/40 hover:text-white/70"
                        }`}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                  {cv.techSkills.length > 0 && (
                    <p className="text-xs text-violet-400 mt-2">{cv.techSkills.length} selected</p>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white/60 mb-3">Soft Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {SOFT_SKILL_OPTIONS.map((skill) => (
                      <button
                        key={skill}
                        onClick={() => toggleSkill(skill, "softSkills")}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                          cv.softSkills.includes(skill)
                            ? "bg-cyan-500/20 border-cyan-500/60 text-cyan-300"
                            : "glass text-white/40 hover:text-white/70"
                        }`}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Job Preferences */}
          {step === 5 && (
            <div>
              <h2 className="text-2xl font-bold mb-1">Job Preferences</h2>
              <p className="text-white/40 text-sm mb-6">Tell us what you&apos;re looking for.</p>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Target Job Roles</label>
                  <input
                    className={inputClass}
                    placeholder="e.g. Software Engineer, Full Stack Developer, Backend Engineer"
                    value={cv.targetRoles}
                    onChange={(e) => updateCv("targetRoles", e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass}>Salary Range (Annual USD)</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <input
                        className={inputClass}
                        type="number"
                        placeholder="Min: 80000"
                        value={cv.salaryMin}
                        onChange={(e) => updateCv("salaryMin", e.target.value)}
                      />
                    </div>
                    <div>
                      <input
                        className={inputClass}
                        type="number"
                        placeholder="Max: 150000"
                        value={cv.salaryMax}
                        onChange={(e) => updateCv("salaryMax", e.target.value)}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-white/30 mt-1">
                    ${parseInt(cv.salaryMin || "0").toLocaleString()} – ${parseInt(cv.salaryMax || "0").toLocaleString()} per year
                  </p>
                </div>
                <div>
                  <label className={labelClass}>Work Type</label>
                  <div className="flex gap-3">
                    {["remote", "hybrid", "onsite"].map((type) => (
                      <button
                        key={type}
                        onClick={() => updateCv("workType", type)}
                        className={`flex-1 py-2.5 rounded-lg border text-sm font-medium capitalize transition-all ${
                          cv.workType === type
                            ? "bg-violet-500/20 border-violet-500/60 text-violet-300"
                            : "glass text-white/40 hover:text-white/70"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Preferred Locations</label>
                  <input
                    className={inputClass}
                    placeholder="e.g. San Francisco, New York, Austin (or Anywhere)"
                    value={cv.preferredLocations}
                    onChange={(e) => updateCv("preferredLocations", e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Review */}
          {step === 6 && (
            <div>
              <h2 className="text-2xl font-bold mb-1">Review Your CV</h2>
              <p className="text-white/40 text-sm mb-6">Everything look good? You can go back to edit.</p>
              <div className="space-y-6 text-sm">
                <div className="glass rounded-xl p-4">
                  <h3 className="font-semibold text-violet-300 mb-3">Personal Info</h3>
                  <div className="space-y-1 text-white/70">
                    <p><span className="text-white/30">Name:</span> {cv.name || "—"}</p>
                    <p><span className="text-white/30">Email:</span> {cv.email || "—"}</p>
                    <p><span className="text-white/30">Phone:</span> {cv.phone || "—"}</p>
                    <p><span className="text-white/30">Location:</span> {cv.location || "—"}</p>
                    <p><span className="text-white/30">LinkedIn:</span> {cv.linkedin || "—"}</p>
                  </div>
                </div>
                <div className="glass rounded-xl p-4">
                  <h3 className="font-semibold text-violet-300 mb-3">Work Experience</h3>
                  {cv.workExperiences.map((exp, i) => (
                    <div key={i} className="mb-3 last:mb-0">
                      <p className="text-white font-medium">{exp.role || "—"} at {exp.company || "—"}</p>
                      <p className="text-white/40">{exp.startDate} – {exp.endDate}</p>
                    </div>
                  ))}
                </div>
                <div className="glass rounded-xl p-4">
                  <h3 className="font-semibold text-violet-300 mb-3">Education</h3>
                  {cv.education.map((edu, i) => (
                    <div key={i} className="mb-3 last:mb-0">
                      <p className="text-white font-medium">{edu.degree || "—"}</p>
                      <p className="text-white/40">{edu.school || "—"} · {edu.year || "—"}</p>
                    </div>
                  ))}
                </div>
                <div className="glass rounded-xl p-4">
                  <h3 className="font-semibold text-violet-300 mb-3">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {[...cv.techSkills, ...cv.softSkills].map((s) => (
                      <span key={s} className="glass text-white/60 px-2 py-0.5 rounded-lg text-xs">{s}</span>
                    ))}
                    {cv.techSkills.length === 0 && cv.softSkills.length === 0 && <span className="text-white/30">No skills added</span>}
                  </div>
                </div>
                <div className="glass rounded-xl p-4">
                  <h3 className="font-semibold text-violet-300 mb-3">Job Preferences</h3>
                  <div className="space-y-1 text-white/70">
                    <p><span className="text-white/30">Roles:</span> {cv.targetRoles || "—"}</p>
                    <p><span className="text-white/30">Salary:</span> ${parseInt(cv.salaryMin || "0").toLocaleString()} – ${parseInt(cv.salaryMax || "0").toLocaleString()}</p>
                    <p><span className="text-white/30">Work type:</span> {cv.workType}</p>
                    <p><span className="text-white/30">Locations:</span> {cv.preferredLocations || "—"}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="flex-1 btn-glass py-3 rounded-xl text-sm font-semibold text-white/60 hover:text-white"
              >
                ← Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex-1 btn-primary py-3 rounded-xl text-sm font-semibold"
            >
              {step === 6 ? "Proceed to Payment →" : step === STEPS.length ? "Submit" : "Continue →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
