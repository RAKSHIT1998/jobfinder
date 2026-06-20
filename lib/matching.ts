import type { JobListing } from "./jobSources";
import { convertCurrency } from "./exchangeRates";

export interface CVProfile {
  techSkills?: string[];
  softSkills?: string[];
  targetRoles?: string;
  workType?: string;
  location?: string;
  preferredLocations?: string;
  salaryMin?: string;
  salaryMax?: string;
  salaryCurrency?: string;
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

// Generic title/business words that appear in nearly every posting regardless
// of industry or specialty - "engineer"/"manager" as much as "operations" or
// "software" buried inside a custom skill phrase like "Front Desk Operations"
// or "Property Management Software". They still count, just not enough on
// their own to drown out genuinely specific skill/tool/domain keywords - a
// hotel manager's CV shouldn't "match" every "Operations Manager" posting at
// a tech company purely because both mention "operations".
const GENERIC_WORDS = new Set([
  "engineer", "engineering", "developer", "manager", "specialist", "senior",
  "junior", "staff", "lead", "principal", "analyst", "associate", "officer",
  "director", "coordinator", "representative", "intern", "consultant", "head",
  "operations", "operation", "management", "administration", "software",
  "business", "services", "service", "solutions", "support", "development",
  "performance", "strategic", "strategy", "process", "processes", "program",
  "programs", "project", "projects", "client", "clients", "customer",
  "customers", "account", "accounts", "team", "department", "general",
  "corporate", "global", "regional",
]);

function keywordWeight(keyword: string): number {
  return GENERIC_WORDS.has(keyword) ? 0.2 : 1;
}

const ANYWHERE_WORDS = new Set(["anywhere", "any", "flexible", "open"]);

// City/country tokens the candidate actually wants to work in - "Preferred
// Locations" if they filled it in, else their current location. Null means
// no preference was expressed (or they said "Anywhere"), so location
// shouldn't affect ranking at all.
function locationPreferenceTokens(cv: CVProfile): Set<string> | null {
  const raw = (cv.preferredLocations || cv.location || "").trim();
  if (!raw) return null;
  const tokens = tokenize(raw);
  if (tokens.length === 0 || tokens.every((t) => ANYWHERE_WORDS.has(t))) return null;
  return new Set(tokens);
}

// Converts the candidate's minimum salary expectation to USD once per
// ranking pass (not per job - scoreJob stays synchronous and cheap to run
// over hundreds of postings). Legacy CVs saved before salaryCurrency existed
// were always entered in INR, so that's the fallback for them specifically.
export async function desiredMinSalaryUsd(cv: CVProfile): Promise<number | null> {
  const min = parseFloat(cv.salaryMin || "");
  if (!min || min <= 0) return null;
  const currency = (cv.salaryCurrency || "INR").toUpperCase();
  if (currency === "USD") return min;
  return convertCurrency(min, currency, "USD").catch(() => null);
}

export function scoreJob(cv: CVProfile, job: JobListing, desiredMinUsd?: number | null): number {
  // Soft skills ("Communication", "Leadership", "Teamwork"...) are the same
  // generic options offered to every CV regardless of profession, and they
  // show up in nearly every job description on earth - so on their own
  // they're not a real signal this job fits the CV. Only domain-specific
  // keywords (tech skills, target role words) are eligible to unlock a
  // match; soft skills still add to the score once a real match exists.
  const specificKeywords = new Set<string>();
  (cv.techSkills || []).forEach((s) => tokenize(s).forEach((t) => specificKeywords.add(t)));
  tokenize(cv.targetRoles || "").forEach((t) => specificKeywords.add(t));

  const softKeywords = new Set<string>();
  (cv.softSkills || []).forEach((s) => tokenize(s).forEach((t) => softKeywords.add(t)));
  for (const kw of specificKeywords) softKeywords.delete(kw);

  if (specificKeywords.size === 0 && softKeywords.size === 0) return 0;

  const titleTokens = new Set(tokenize(job.title));
  const tagTokens = new Set(job.tags.flatMap(tokenize));
  const descTokens = new Set(tokenize(job.description));

  let raw = 0;
  let maxPossible = 0;
  let hasSpecificMatch = false;
  for (const kw of specificKeywords) {
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

  // Soft skills only count toward the score once a real domain match above
  // has already cleared the bar - they can boost a real match, not create one.
  for (const kw of softKeywords) {
    maxPossible += TITLE_WEIGHT;
    if (titleTokens.has(kw)) raw += TITLE_WEIGHT;
    if (tagTokens.has(kw)) raw += TAG_WEIGHT;
    if (descTokens.has(kw)) raw += DESCRIPTION_WEIGHT;
  }

  // A job matching every one of the user's keywords squarely in the title
  // hits 100 before bonuses; tag/description hits push it further, remote
  // preference adds a small nudge. Clamped so nothing reads as a fake 100%.
  let score = Math.round((raw / maxPossible) * 100);

  if (cv.workType?.toLowerCase().includes("remote") && job.remote) {
    score += 5;
  }

  // Remote work is location-agnostic, so only weigh location for jobs that
  // actually require being there. A candidate in India has no real shot at
  // an onsite role in the US/UK - sink those instead of presenting them
  // alongside jobs they could actually take.
  const placeTokens = locationPreferenceTokens(cv);
  if (placeTokens && !job.remote) {
    const jobLocationTokens = new Set(tokenize(job.location));
    const nearby = [...placeTokens].some((t) => jobLocationTokens.has(t));
    score = nearby ? score + 15 : Math.round(score * 0.3);
  }

  // Reward postings that clear the candidate's stated minimum, and sink ones
  // that pay well under it - but only when we actually have a disclosed
  // figure to compare against. No data means no opinion, not a penalty.
  if (desiredMinUsd && job.salaryUsd) {
    if (job.salaryUsd.max >= desiredMinUsd) score += 10;
    else if (job.salaryUsd.max < desiredMinUsd * 0.7) score = Math.round(score * 0.7);
  }

  return Math.max(0, Math.min(99, score));
}

export async function rankJobs(cv: CVProfile, jobs: JobListing[]): Promise<ScoredJob[]> {
  const desiredMinUsd = await desiredMinSalaryUsd(cv);
  return jobs
    .map((job) => ({ ...job, match: scoreJob(cv, job, desiredMinUsd) }))
    .filter((j) => j.match > 0)
    .sort((a, b) => b.match - a.match);
}
