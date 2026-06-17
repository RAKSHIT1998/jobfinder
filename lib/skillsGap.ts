import type { ScoredJob, CVProfile } from "./matching";

export interface SkillGap {
  skill: string;
  count: number;
  percentOfPostings: number;
}

export interface SkillsGapResult {
  analyzedCount: number;
  gaps: SkillGap[];
  haveSkills: string[];
  /** % of in-demand skills found across analyzed postings that the user already has. Null if no signal. */
  coveragePercent: number | null;
}

// A curated vocabulary of concrete, learnable skills — scanning job text for
// these (instead of trusting free-form source tags like "bachelor's degree"
// or "Directors") keeps results to things that actually belong on a gap
// analysis. The frequencies themselves are always counted from real live
// postings; only the list of terms we look for is hand-picked.
const SKILL_VOCABULARY = [
  "react", "vue", "angular", "svelte", "next.js", "nuxt", "tailwind", "redux",
  "typescript", "javascript", "python", "java", "go", "rust", "c++", "c#",
  "php", "ruby", "kotlin", "swift", "scala",
  "node.js", "django", "flask", "spring", "express", "graphql", "rest api",
  "postgresql", "mysql", "mongodb", "redis", "elasticsearch", "sql", "nosql",
  "aws", "azure", "gcp", "docker", "kubernetes", "terraform", "ansible",
  "ci/cd", "jenkins", "github actions", "linux",
  "machine learning", "deep learning", "pytorch", "tensorflow", "nlp",
  "data science", "pandas", "numpy", "spark", "airflow", "kafka",
  "agile", "scrum", "kanban", "jira",
  "figma", "ui/ux", "accessibility",
  "salesforce", "sap", "erp", "crm",
  "seo", "google analytics", "content marketing", "email marketing",
];

function findSkillsInText(text: string): Set<string> {
  const lower = ` ${text.toLowerCase()} `;
  const found = new Set<string>();
  for (const skill of SKILL_VOCABULARY) {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`(?<![a-z0-9])${escaped}(?![a-z0-9])`, "i");
    if (pattern.test(lower)) found.add(skill);
  }
  return found;
}

export function analyzeSkillsGap(cv: CVProfile, rankedJobs: ScoredJob[]): SkillsGapResult {
  const have = new Set<string>();
  (cv.techSkills || []).forEach((s) => have.add(s.toLowerCase().trim()));
  (cv.softSkills || []).forEach((s) => have.add(s.toLowerCase().trim()));

  // Only analyze postings that scored as genuine, specific matches — weak
  // overlaps (e.g. matching on "teamwork" alone) would otherwise pollute the
  // gap analysis with skills from unrelated roles.
  const pool = rankedJobs.filter((j) => j.match >= 10).slice(0, 30);

  const gapCounts = new Map<string, number>();
  const matchedSkills = new Set<string>();

  for (const job of pool) {
    const text = `${job.title} ${job.tags.join(" ")} ${job.description}`;
    const found = findSkillsInText(text);
    for (const skill of found) {
      if (have.has(skill)) {
        matchedSkills.add(skill);
      } else {
        gapCounts.set(skill, (gapCounts.get(skill) || 0) + 1);
      }
    }
  }

  const gaps = [...gapCounts.entries()]
    .filter(([, count]) => count >= 2)
    .map(([skill, count]) => ({
      skill,
      count,
      percentOfPostings: pool.length ? Math.round((count / pool.length) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const relevantSkillCount = matchedSkills.size + gapCounts.size;
  const coveragePercent = relevantSkillCount > 0 ? Math.round((matchedSkills.size / relevantSkillCount) * 100) : null;

  return { analyzedCount: pool.length, gaps, haveSkills: [...have], coveragePercent };
}
