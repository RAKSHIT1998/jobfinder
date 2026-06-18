import type { JobListing } from "./jobSources";

export interface CVProfile {
  techSkills?: string[];
  softSkills?: string[];
  targetRoles?: string;
  workType?: string;
}

export interface ScoredJob extends JobListing {
  match: number;
}

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9+.#]+/i)
    .filter((t) => t.length > 1);
}

const TITLE_WEIGHT = 5;
const TAG_WEIGHT = 3;
const DESCRIPTION_WEIGHT = 1;

// Generic job-title words that appear in nearly every posting regardless of
// specialty ("engineer", "manager"...). They still count, just not enough to
// let a vague role match drown out specific skill/tool keywords.
const GENERIC_ROLE_WORDS = new Set([
  "engineer", "engineering", "developer", "manager", "specialist", "senior",
  "junior", "staff", "lead", "principal", "analyst", "associate", "officer",
  "director", "coordinator", "representative", "intern", "consultant", "head",
]);

function keywordWeight(keyword: string): number {
  return GENERIC_ROLE_WORDS.has(keyword) ? 0.2 : 1;
}

export function scoreJob(cv: CVProfile, job: JobListing): number {
  const keywords = new Set<string>();
  (cv.techSkills || []).forEach((s) => tokenize(s).forEach((t) => keywords.add(t)));
  (cv.softSkills || []).forEach((s) => tokenize(s).forEach((t) => keywords.add(t)));
  tokenize(cv.targetRoles || "").forEach((t) => keywords.add(t));
  if (keywords.size === 0) return 0;

  const titleTokens = new Set(tokenize(job.title));
  const tagTokens = new Set(job.tags.flatMap(tokenize));
  const descTokens = new Set(tokenize(job.description));

  let raw = 0;
  let maxPossible = 0;
  let hasSpecificMatch = false;
  for (const kw of keywords) {
    const w = keywordWeight(kw);
    maxPossible += TITLE_WEIGHT * w;
    const overlaps = titleTokens.has(kw) || tagTokens.has(kw) || descTokens.has(kw);
    if (titleTokens.has(kw)) raw += TITLE_WEIGHT * w;
    if (tagTokens.has(kw)) raw += TAG_WEIGHT * w;
    if (descTokens.has(kw)) raw += DESCRIPTION_WEIGHT * w;
    if (overlaps && w === 1) hasSpecificMatch = true;
  }

  // A generic role word overlapping on its own ("manager", "specialist"...)
  // isn't a real signal this job fits the CV - e.g. it'd let a hotel
  // manager's CV "match" any "Engineering Manager" posting. Require at
  // least one specific skill/tool/role keyword to overlap too.
  if (!hasSpecificMatch) return 0;

  // A job matching every one of the user's keywords squarely in the title
  // hits 100 before bonuses; tag/description hits push it further, remote
  // preference adds a small nudge. Clamped so nothing reads as a fake 100%.
  let score = Math.round((raw / maxPossible) * 100);

  if (cv.workType?.toLowerCase().includes("remote") && job.remote) {
    score += 5;
  }

  return Math.max(0, Math.min(99, score));
}

export function rankJobs(cv: CVProfile, jobs: JobListing[]): ScoredJob[] {
  return jobs
    .map((job) => ({ ...job, match: scoreJob(cv, job) }))
    .filter((j) => j.match > 0)
    .sort((a, b) => b.match - a.match);
}
