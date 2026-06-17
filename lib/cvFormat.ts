interface WorkExperience {
  company?: string;
  role?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

interface CVData {
  name?: string;
  email?: string;
  location?: string;
  techSkills?: string[];
  softSkills?: string[];
  targetRoles?: string;
  workExperiences?: WorkExperience[];
  education?: Array<{ degree?: string; school?: string; year?: string }>;
}

export function formatCvForPrompt(cv: CVData): string {
  const lines: string[] = [];
  if (cv.name) lines.push(`Name: ${cv.name}`);
  if (cv.location) lines.push(`Location: ${cv.location}`);
  if (cv.targetRoles) lines.push(`Target role: ${cv.targetRoles}`);
  if (cv.techSkills?.length) lines.push(`Technical skills: ${cv.techSkills.join(", ")}`);
  if (cv.softSkills?.length) lines.push(`Soft skills: ${cv.softSkills.join(", ")}`);

  if (cv.workExperiences?.length) {
    lines.push("Work experience:");
    for (const w of cv.workExperiences) {
      if (!w.company && !w.role) continue;
      lines.push(`- ${w.role || "Role"} at ${w.company || "Company"} (${w.startDate || "?"} - ${w.endDate || "present"}): ${w.description || ""}`);
    }
  }

  if (cv.education?.length) {
    lines.push("Education:");
    for (const e of cv.education) {
      if (!e.degree && !e.school) continue;
      lines.push(`- ${e.degree || ""} at ${e.school || ""} (${e.year || ""})`);
    }
  }

  return lines.join("\n");
}
