import type { ScoredJob } from "./matching";

export interface SalaryIntel {
  analyzedCount: number;
  disclosedCount: number;
  figures: number[];
  min: number | null;
  max: number | null;
  median: number | null;
}

const MIN_PLAUSIBLE_USD = 15000;
const MAX_PLAUSIBLE_USD = 600000;

// Pulls plausible annual USD figures out of free-text job descriptions.
// Real postings disclose pay in wildly inconsistent formats ("$120k",
// "$120,000", "USD$171,000 per year") — this just needs to catch enough of
// them to build an honest real-data range, not parse every edge case.
export function extractSalaryFigures(text: string): number[] {
  const figures: number[] = [];

  for (const m of text.matchAll(/\$\s?(\d{2,3})\s?k\b/gi)) {
    figures.push(Number(m[1]) * 1000);
  }
  for (const m of text.matchAll(/\$\s?(\d{2,3},\d{3})\b/g)) {
    figures.push(Number(m[1].replace(/,/g, "")));
  }

  return figures.filter((n) => n >= MIN_PLAUSIBLE_USD && n <= MAX_PLAUSIBLE_USD);
}

function median(nums: number[]): number {
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

export function analyzeSalary(rankedJobs: ScoredJob[]): SalaryIntel {
  const pool = rankedJobs.filter((j) => j.match >= 10).slice(0, 30);
  const allFigures: number[] = [];
  let disclosedCount = 0;

  for (const job of pool) {
    const found = extractSalaryFigures(`${job.title} ${job.description}`);
    if (found.length > 0) {
      disclosedCount++;
      allFigures.push(...found);
    }
  }

  if (allFigures.length === 0) {
    return { analyzedCount: pool.length, disclosedCount: 0, figures: [], min: null, max: null, median: null };
  }

  return {
    analyzedCount: pool.length,
    disclosedCount,
    figures: allFigures,
    min: Math.min(...allFigures),
    max: Math.max(...allFigures),
    median: median(allFigures),
  };
}
