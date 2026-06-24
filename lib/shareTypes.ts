// Shapes for the public, shareable result snapshots ("viral cards"). Kept free
// of any server-only imports so the API route, the OG-image generator, the
// public page, and the client share button can all reuse the same types and
// validation without dragging mongodb into a client bundle.

export type ShareKind = "salary" | "match" | "skills";

export interface SalaryShare {
  kind: "salary";
  /** The candidate's target role, e.g. "React Developer". May be empty. */
  role: string;
  currency: string;
  min: number;
  max: number;
  median: number;
  disclosedCount: number;
  analyzedCount: number;
}

export interface MatchShare {
  kind: "match";
  role: string;
  company: string;
  score: number;
}

export interface SkillsShare {
  kind: "skills";
  role: string;
  coveragePercent: number;
  topGaps: string[];
}

export type SharePayload = SalaryShare | MatchShare | SkillsShare;

function str(v: unknown, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

function num(v: unknown): number | null {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

// Never trust the client: a share link is a public, un-authenticated artifact,
// so we only ever persist a small whitelist of typed/clamped fields per kind
// and reject anything we can't make sense of (returns null -> 400).
export function parseSharePayload(input: unknown): SharePayload | null {
  if (!input || typeof input !== "object") return null;
  const o = input as Record<string, unknown>;
  const role = str(o.role, 80);

  switch (o.kind) {
    case "salary": {
      const min = num(o.min);
      const max = num(o.max);
      const median = num(o.median);
      if (min === null || max === null || median === null) return null;
      if (min < 0 || max < min) return null;
      const disclosed = num(o.disclosedCount) ?? 0;
      const analyzed = num(o.analyzedCount) ?? 0;
      return {
        kind: "salary",
        role,
        currency: str(o.currency, 6).toUpperCase() || "USD",
        min: Math.round(min),
        max: Math.round(max),
        median: Math.round(clamp(median, min, max)),
        disclosedCount: clamp(Math.round(disclosed), 0, 1000),
        analyzedCount: clamp(Math.round(analyzed), 0, 1000),
      };
    }
    case "match": {
      const score = num(o.score);
      if (score === null) return null;
      return {
        kind: "match",
        role: role || "this role",
        company: str(o.company, 80) || "a top company",
        score: clamp(Math.round(score), 0, 99),
      };
    }
    case "skills": {
      const coverage = num(o.coveragePercent);
      if (coverage === null) return null;
      const topGaps = Array.isArray(o.topGaps)
        ? o.topGaps.map((g) => str(g, 40)).filter(Boolean).slice(0, 6)
        : [];
      return {
        kind: "skills",
        role: role || "this role",
        coveragePercent: clamp(Math.round(coverage), 0, 100),
        topGaps,
      };
    }
    default:
      return null;
  }
}
