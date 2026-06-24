import { getAnthropic, ANTHROPIC_MODEL } from "./anthropic";

export interface ExtractedWorkExperience {
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface ExtractedEducation {
  degree: string;
  school: string;
  year: string;
}

export interface ExtractedCV {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  summary: string;
  workExperiences: ExtractedWorkExperience[];
  education: ExtractedEducation[];
  techSkills: string[];
  softSkills: string[];
  targetRoles: string;
  workType: "remote" | "hybrid" | "onsite";
  preferredLocations: string;
}

const SYSTEM_PROMPT = `You extract structured data from resumes/CVs. Read the document and respond with ONLY a single JSON object (no markdown fences, no commentary) matching this exact shape:
{
  "name": string, "email": string, "phone": string, "location": string, "linkedin": string,
  "summary": string (a 1-2 sentence professional summary grounded in the resume content, even if the resume has no summary section),
  "workExperiences": [{ "company": string, "role": string, "startDate": string, "endDate": string, "description": string }],
  "education": [{ "degree": string, "school": string, "year": string }],
  "techSkills": string[] (technical/job skills, tools, languages, frameworks actually evidenced in the resume),
  "softSkills": string[] (soft skills actually evidenced, e.g. Leadership, Communication),
  "targetRoles": string (a short comma-separated guess at the job titles this person should search for, based on their strongest/most recent experience),
  "workType": "remote" | "hybrid" | "onsite" (best guess; default to "remote" if there's no signal),
  "preferredLocations": string (city/region names mentioned as where they live or want to work; empty string if unclear)
}
Use only information present in the document. Leave a field as an empty string or empty array if it isn't present - never invent details.`;

function extractJsonObject(raw: string): unknown {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : raw;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) throw new Error("Could not find a JSON object in the AI response.");
  return JSON.parse(candidate.slice(start, end + 1));
}

function str(v: unknown, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

function strArray(v: unknown, maxItems: number, maxLen: number): string[] {
  if (!Array.isArray(v)) return [];
  return v.map((x) => str(x, maxLen)).filter(Boolean).slice(0, maxItems);
}

function sanitizeWorkExperiences(v: unknown): ExtractedWorkExperience[] {
  if (!Array.isArray(v)) return [];
  return v
    .slice(0, 8)
    .map((item) => {
      const o = (item && typeof item === "object" ? item : {}) as Record<string, unknown>;
      return {
        company: str(o.company, 120),
        role: str(o.role, 120),
        startDate: str(o.startDate, 30),
        endDate: str(o.endDate, 30),
        description: str(o.description, 600),
      };
    })
    .filter((e) => e.company || e.role);
}

function sanitizeEducation(v: unknown): ExtractedEducation[] {
  if (!Array.isArray(v)) return [];
  return v
    .slice(0, 5)
    .map((item) => {
      const o = (item && typeof item === "object" ? item : {}) as Record<string, unknown>;
      return { degree: str(o.degree, 120), school: str(o.school, 120), year: str(o.year, 20) };
    })
    .filter((e) => e.degree || e.school);
}

// The model's output is untrusted input from our own point of view too - it
// feeds straight into job matching, localStorage, and eventually a stored CV
// record, so every field is whitelisted/clamped exactly like a public API
// payload would be (see lib/shareTypes.ts for the same pattern).
function sanitizeExtractedCv(input: unknown): ExtractedCV {
  const o = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const workType = str(o.workType, 10).toLowerCase();
  return {
    name: str(o.name, 120),
    email: str(o.email, 200),
    phone: str(o.phone, 40),
    location: str(o.location, 120),
    linkedin: str(o.linkedin, 300),
    summary: str(o.summary, 500),
    workExperiences: sanitizeWorkExperiences(o.workExperiences),
    education: sanitizeEducation(o.education),
    techSkills: strArray(o.techSkills, 30, 60),
    softSkills: strArray(o.softSkills, 15, 60),
    targetRoles: str(o.targetRoles, 200),
    workType: workType === "hybrid" || workType === "onsite" ? workType : "remote",
    preferredLocations: str(o.preferredLocations, 200),
  };
}

type ExtractionContent =
  | { type: "text"; text: string }
  | { type: "document"; source: { type: "base64"; media_type: "application/pdf"; data: string } };

async function runExtraction(content: ExtractionContent[]): Promise<ExtractedCV> {
  const anthropic = getAnthropic();
  const message = await anthropic.messages.create({
    model: ANTHROPIC_MODEL,
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content }],
  });
  const block = message.content.find((b) => b.type === "text");
  const text = block && block.type === "text" ? block.text : "";
  return sanitizeExtractedCv(extractJsonObject(text));
}

export async function extractCvFromText(text: string): Promise<ExtractedCV> {
  const trimmed = text.trim().slice(0, 15000);
  if (!trimmed) throw new Error("Resume text is empty.");
  return runExtraction([{ type: "text", text: `Resume:\n\n${trimmed}` }]);
}

export async function extractCvFromPdfBase64(base64: string): Promise<ExtractedCV> {
  return runExtraction([
    { type: "document", source: { type: "base64", media_type: "application/pdf", data: base64 } },
    { type: "text", text: "Extract this resume into the JSON shape described in the system prompt." },
  ]);
}
