import { findCountryByCode } from "./countries";
import { convertCurrency } from "./exchangeRates";

export interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  remote: boolean;
  url: string;
  source: string;
  tags: string[];
  description: string;
  postedAt: string | null;
  /** Structured salary in USD, when the source provides real numeric fields rather than free text. */
  salaryUsd?: { min: number; max: number };
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

interface ArbeitnowJob {
  slug: string;
  company_name: string;
  title: string;
  description: string;
  remote: boolean;
  url: string;
  tags: string[];
  location: string;
  created_at: number;
}

async function fetchArbeitnowJobs(): Promise<JobListing[]> {
  const res = await fetch("https://www.arbeitnow.com/api/job-board-api", {
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Arbeitnow responded ${res.status}`);
  const data = (await res.json()) as { data: ArbeitnowJob[] };
  return data.data.map((j) => ({
    id: `arbeitnow:${j.slug}`,
    title: j.title,
    company: j.company_name,
    location: j.location || (j.remote ? "Remote" : "Unspecified"),
    remote: !!j.remote,
    url: j.url,
    source: "Arbeitnow",
    tags: j.tags || [],
    description: stripHtml(j.description || ""),
    postedAt: j.created_at ? new Date(j.created_at * 1000).toISOString() : null,
  }));
}

interface MuseJob {
  id: number;
  name: string;
  contents: string;
  publication_date: string;
  locations: Array<{ name: string }>;
  categories: Array<{ name: string }>;
  levels: Array<{ name: string }>;
  refs: { landing_page: string };
  company: { name: string };
}

async function fetchMuseCategory(category: string): Promise<JobListing[]> {
  const res = await fetch(
    `https://www.themuse.com/api/public/jobs?page=1&category=${encodeURIComponent(category)}`,
    { signal: AbortSignal.timeout(8000) }
  );
  if (!res.ok) throw new Error(`The Muse responded ${res.status}`);
  const data = (await res.json()) as { results: MuseJob[] };
  return data.results.map((j) => ({
    id: `muse:${j.id}`,
    title: j.name,
    company: j.company?.name || "Unknown company",
    location: j.locations?.map((l) => l.name).join(", ") || "Unspecified",
    remote: j.locations?.some((l) => /remote/i.test(l.name)) ?? false,
    url: j.refs?.landing_page,
    source: "The Muse",
    tags: [...j.categories.map((c) => c.name), ...j.levels.map((l) => l.name)],
    description: stripHtml(j.contents || ""),
    postedAt: j.publication_date || null,
  }));
}

// Spans far more than tech so non-tech CVs (hospitality, retail, healthcare,
// admin...) have real postings to match against, not just software roles.
// "IT" was dropped - The Muse no longer recognizes that category and it was
// silently returning zero results.
const MUSE_CATEGORIES = [
  "Software Engineering",
  "Data and Analytics",
  "Retail",
  "Healthcare",
  "Customer Service",
  "Sales",
  "Education",
  "Human Resources and Recruitment",
  "Account Management",
  "Accounting and Finance",
  "Administration and Office",
  "Design and UX",
  "Social Services",
];

async function fetchMuseJobs(): Promise<JobListing[]> {
  const results = await Promise.allSettled(MUSE_CATEGORIES.map(fetchMuseCategory));
  return results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
}

interface RemoteOkJob {
  id?: string;
  slug: string;
  company: string;
  position: string;
  description: string;
  tags: string[];
  location: string;
  url: string;
  date: string;
  salary_min: number;
  salary_max: number;
}

async function fetchRemoteOkJobs(): Promise<JobListing[]> {
  const res = await fetch("https://remoteok.com/api", {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; JobFinderAI/1.0)" },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`RemoteOK responded ${res.status}`);
  const data = (await res.json()) as RemoteOkJob[];
  // First element is always an API-terms banner, not a job.
  return data
    .filter((j) => j.id)
    .map((j) => {
      const hasSalary = j.salary_min > 0 || j.salary_max > 0;
      return {
        id: `remoteok:${j.slug}`,
        title: j.position,
        company: j.company,
        location: j.location || "Remote",
        remote: true,
        url: j.url,
        source: "RemoteOK",
        tags: j.tags || [],
        description: stripHtml(j.description || ""),
        salaryUsd: hasSalary ? { min: j.salary_min, max: j.salary_max } : undefined,
        postedAt: j.date || null,
      };
    });
}

interface JobicyJob {
  id: number;
  url: string;
  jobTitle: string;
  companyName: string;
  jobIndustry: string[];
  jobType: string[];
  jobGeo: string;
  jobLevel: string;
  jobDescription: string;
  pubDate: string;
}

async function fetchJobicyJobs(): Promise<JobListing[]> {
  const res = await fetch("https://jobicy.com/api/v2/remote-jobs?count=50", {
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Jobicy responded ${res.status}`);
  const data = (await res.json()) as { jobs: JobicyJob[] };
  return data.jobs.map((j) => ({
    id: `jobicy:${j.id}`,
    title: j.jobTitle,
    company: j.companyName,
    location: j.jobGeo || "Remote",
    remote: true,
    url: j.url,
    source: "Jobicy",
    tags: [...(j.jobIndustry || []), ...(j.jobType || []), j.jobLevel].filter(Boolean),
    description: stripHtml(j.jobDescription || ""),
    postedAt: j.pubDate || null,
  }));
}

interface AdzunaJob {
  id: string;
  title: string;
  description: string;
  redirect_url: string;
  company?: { display_name?: string };
  location?: { display_name?: string };
  category?: { label?: string };
  contract_type?: string;
  contract_time?: string;
  created?: string;
  salary_min?: number;
  salary_max?: number;
}

// Country codes Adzuna should be queried for - each has its own official
// per-country endpoint. Defaults to India since that's the gap the other 4
// (tech/remote-leaning) sources don't cover; add more via env (e.g. "in,us,gb").
const ADZUNA_COUNTRIES = (process.env.ADZUNA_COUNTRIES || "in")
  .split(",")
  .map((c) => c.trim().toLowerCase())
  .filter(Boolean);

async function fetchAdzunaCountry(country: string): Promise<JobListing[]> {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;
  if (!appId || !appKey) return [];

  const res = await fetch(
    `https://api.adzuna.com/v1/api/jobs/${country}/search/1?app_id=${appId}&app_key=${appKey}&results_per_page=50&content-type=application/json`,
    { signal: AbortSignal.timeout(8000) }
  );
  if (!res.ok) throw new Error(`Adzuna (${country}) responded ${res.status}`);
  const data = (await res.json()) as { results: AdzunaJob[] };

  // Adzuna reports salary in the listing's local currency, not USD - convert
  // so it's comparable with the other sources' salaryUsd figures.
  const currency = findCountryByCode(country.toUpperCase())?.currency || "USD";

  return Promise.all(
    data.results.map(async (j): Promise<JobListing> => {
      const description = stripHtml(j.description || "");
      let salaryUsd: { min: number; max: number } | undefined;
      if (j.salary_min && j.salary_max) {
        const [min, max] =
          currency === "USD"
            ? [j.salary_min, j.salary_max]
            : await Promise.all([
                convertCurrency(j.salary_min, currency, "USD"),
                convertCurrency(j.salary_max, currency, "USD"),
              ]);
        if (min !== null && max !== null) salaryUsd = { min: Math.round(min), max: Math.round(max) };
      }

      return {
        id: `adzuna:${j.id}`,
        title: j.title,
        company: j.company?.display_name || "Unknown company",
        location: j.location?.display_name || "Unspecified",
        remote: /\bremote\b/i.test(`${j.title} ${description}`),
        url: j.redirect_url,
        source: "Adzuna",
        tags: [j.category?.label, j.contract_type, j.contract_time].filter((t): t is string => !!t),
        description,
        postedAt: j.created || null,
        salaryUsd,
      };
    })
  );
}

async function fetchAdzunaJobs(): Promise<JobListing[]> {
  const results = await Promise.allSettled(ADZUNA_COUNTRIES.map(fetchAdzunaCountry));
  return results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
}

interface NaukriJob {
  uniq_id: string;
  timestamp: string | null;
  job_title: string | null;
  job_salary: string | null;
  job_experience_required: string | null;
  key_skills: string | null;
  role_category: string | null;
  location: string | null;
  functional_area: string | null;
  industry: string | null;
  role: string | null;
}

// job_salary looks like " 3,00,000 - 8,00,000 PA. " (Indian lakh grouping) or
// "Not Disclosed by Recruiter" - returns the raw INR range, left to the
// caller to convert to USD.
function parseNaukriSalaryInr(raw: string | null): { min: number; max: number } | undefined {
  if (!raw) return undefined;
  const match = raw.replace(/PA\.?/i, "").match(/([\d,]+)\s*-\s*([\d,]+)/);
  if (!match) return undefined;
  const min = Number(match[1].replace(/,/g, ""));
  const max = Number(match[2].replace(/,/g, ""));
  if (!Number.isFinite(min) || !Number.isFinite(max)) return undefined;
  return { min, max };
}

// The dataset has no apply link, so point at a Naukri title search instead
// of fabricating a URL to a since-expired posting.
function naukriSearchUrl(title: string): string {
  const slug = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `https://www.naukri.com/${slug || "jobs"}-jobs`;
}

async function fetchNaukriJobs(): Promise<JobListing[]> {
  const res = await fetch("https://suraj-996.github.io/Naukri.com-API/api.json", {
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Naukri responded ${res.status}`);
  const data = (await res.json()) as { content: NaukriJob[] };

  return Promise.all(
    data.content
      .filter((j) => j.job_title && j.job_title.trim() && j.job_title.trim().toLowerCase() !== "not disclosed")
      .map(async (j): Promise<JobListing> => {
        const title = j.job_title!.trim();
        const skills = (j.key_skills || "")
          .split("|")
          .map((s) => s.trim())
          .filter(Boolean);
        const tags = [...skills, j.role_category, j.role].filter((t): t is string => !!t);

        const salaryInr = parseNaukriSalaryInr(j.job_salary);
        let salaryUsd: { min: number; max: number } | undefined;
        if (salaryInr) {
          const [min, max] = await Promise.all([
            convertCurrency(salaryInr.min, "INR", "USD"),
            convertCurrency(salaryInr.max, "INR", "USD"),
          ]);
          if (min !== null && max !== null) salaryUsd = { min: Math.round(min), max: Math.round(max) };
        }

        return {
          id: `naukri:${j.uniq_id}`,
          title,
          company: "Unknown company",
          location: j.location || "India",
          remote: /\bremote\b/i.test(`${title} ${j.functional_area || ""}`),
          url: naukriSearchUrl(title),
          source: "Naukri",
          tags,
          description: [
            j.role ? `Role: ${j.role}.` : null,
            j.functional_area ? `Functional area: ${j.functional_area.replace(/\s*,\s*/g, ", ")}.` : null,
            j.job_experience_required ? `Experience required: ${j.job_experience_required}.` : null,
            skills.length ? `Key skills: ${skills.join(", ")}.` : null,
          ]
            .filter((s): s is string => !!s)
            .join(" "),
          postedAt: j.timestamp ? new Date(j.timestamp).toISOString() : null,
          salaryUsd,
        };
      })
  );
}

const SOURCE_FETCHERS: Array<() => Promise<JobListing[]>> = [
  fetchArbeitnowJobs,
  fetchMuseJobs,
  fetchRemoteOkJobs,
  fetchJobicyJobs,
  fetchAdzunaJobs,
  fetchNaukriJobs,
];

let cache: { jobs: JobListing[]; fetchedAt: number } | null = null;
const CACHE_TTL_MS = 15 * 60 * 1000;

export async function fetchAllJobs(): Promise<JobListing[]> {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.jobs;
  }

  const results = await Promise.allSettled(SOURCE_FETCHERS.map((fetcher) => fetcher()));
  const jobs = results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));

  if (jobs.length === 0) {
    const reasons = results
      .filter((r): r is PromiseRejectedResult => r.status === "rejected")
      .map((r) => String(r.reason));
    throw new Error(`All job sources failed: ${reasons.join("; ")}`);
  }

  cache = { jobs, fetchedAt: Date.now() };
  return jobs;
}
