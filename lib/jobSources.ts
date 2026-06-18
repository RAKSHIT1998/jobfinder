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

const SOURCE_FETCHERS: Array<() => Promise<JobListing[]>> = [
  fetchArbeitnowJobs,
  fetchMuseJobs,
  fetchRemoteOkJobs,
  fetchJobicyJobs,
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
