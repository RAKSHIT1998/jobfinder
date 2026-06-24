import type { JobListing } from "./jobSources";

export interface JobCategory {
  slug: string;
  label: string;
  /** Plain-English description used in metadata and the page intro. */
  description: string;
  /** Lowercase substrings matched against the job title + tags. Empty means "any". */
  keywords: string[];
  remoteOnly?: boolean;
}

// Long-tail, role-specific searches we can realistically rank for with real,
// continuously-refreshed listings — unlike the generic word "jobs", which is
// dominated by Indeed/LinkedIn/Google for Jobs.
export const JOB_CATEGORIES: JobCategory[] = [
  { slug: "software-engineer-jobs", label: "Software Engineer", description: "software engineering roles, from backend to full stack", keywords: ["software engineer", "software developer", "backend developer", "backend engineer", "frontend developer", "frontend engineer", "full stack", "full-stack"] },
  { slug: "remote-software-engineer-jobs", label: "Remote Software Engineer", description: "remote-friendly software engineering roles", keywords: ["software engineer", "software developer", "backend developer", "frontend developer", "full stack", "full-stack"], remoteOnly: true },
  { slug: "data-analyst-jobs", label: "Data Analyst", description: "data analyst and data analytics roles", keywords: ["data analyst", "data analytics"] },
  { slug: "data-scientist-jobs", label: "Data Scientist", description: "data science and machine learning roles", keywords: ["data scientist", "machine learning engineer", "ml engineer"] },
  { slug: "product-manager-jobs", label: "Product Manager", description: "product management roles", keywords: ["product manager"] },
  { slug: "project-manager-jobs", label: "Project Manager", description: "project and program management roles", keywords: ["project manager", "program manager"] },
  { slug: "ux-designer-jobs", label: "UX Designer", description: "UX, UI, and product design roles", keywords: ["ux designer", "ui designer", "product designer", "ux/ui"] },
  { slug: "customer-service-jobs", label: "Customer Service", description: "customer service and customer support roles", keywords: ["customer service", "customer support", "customer success"] },
  { slug: "sales-executive-jobs", label: "Sales Executive", description: "sales and business development roles", keywords: ["sales executive", "account executive", "business development", "sales representative"] },
  { slug: "marketing-manager-jobs", label: "Marketing Manager", description: "marketing and digital marketing roles", keywords: ["marketing manager", "marketing specialist", "digital marketing"] },
  { slug: "hr-recruiter-jobs", label: "HR Recruiter", description: "HR, recruiting, and people operations roles", keywords: ["recruiter", "human resources", "hr generalist", "hr manager", "talent acquisition"] },
  { slug: "accountant-jobs", label: "Accountant", description: "accounting and bookkeeping roles", keywords: ["accountant", "accounting", "bookkeeper"] },
  { slug: "registered-nurse-jobs", label: "Registered Nurse", description: "nursing and clinical healthcare roles", keywords: ["registered nurse", "nursing", "staff nurse"] },
  { slug: "retail-associate-jobs", label: "Retail Associate", description: "retail, store, and cashier roles", keywords: ["retail associate", "store associate", "sales associate", "cashier"] },
  { slug: "administrative-assistant-jobs", label: "Administrative Assistant", description: "administrative and office support roles", keywords: ["administrative assistant", "office assistant", "executive assistant"] },
  { slug: "devops-engineer-jobs", label: "DevOps Engineer", description: "DevOps, SRE, and infrastructure roles", keywords: ["devops", "site reliability", "sre engineer", "platform engineer"] },
  { slug: "graphic-designer-jobs", label: "Graphic Designer", description: "graphic and visual design roles", keywords: ["graphic designer", "visual designer"] },
  { slug: "content-writer-jobs", label: "Content Writer", description: "content writing and copywriting roles", keywords: ["content writer", "copywriter", "content strategist"] },
  { slug: "business-analyst-jobs", label: "Business Analyst", description: "business analysis roles", keywords: ["business analyst"] },
  { slug: "java-developer-jobs", label: "Java Developer", description: "Java development roles", keywords: ["java developer", "java engineer"] },
  { slug: "python-developer-jobs", label: "Python Developer", description: "Python development roles", keywords: ["python developer", "python engineer"] },
  { slug: "react-developer-jobs", label: "React Developer", description: "React and React Native development roles", keywords: ["react developer", "react engineer", "react native"] },
  { slug: "entry-level-jobs", label: "Entry Level", description: "entry-level and graduate roles across industries", keywords: ["entry level", "entry-level", "junior", "graduate"] },
  { slug: "remote-jobs", label: "Remote", description: "remote roles across every industry", keywords: [], remoteOnly: true },
];

export function getCategoryBySlug(slug: string): JobCategory | undefined {
  return JOB_CATEGORIES.find((c) => c.slug === slug);
}

function jobMatchesCategory(job: JobListing, cat: JobCategory): boolean {
  if (cat.remoteOnly && !job.remote) return false;
  if (cat.keywords.length === 0) return true;
  const haystack = `${job.title} ${job.tags.join(" ")}`.toLowerCase();
  return cat.keywords.some((kw) => haystack.includes(kw));
}

export function filterJobsForCategory(jobs: JobListing[], cat: JobCategory, limit = 40): JobListing[] {
  return jobs
    .filter((j) => jobMatchesCategory(j, cat))
    .sort((a, b) => {
      const at = a.postedAt ? new Date(a.postedAt).getTime() : 0;
      const bt = b.postedAt ? new Date(b.postedAt).getTime() : 0;
      return bt - at;
    })
    .slice(0, limit);
}

export function countJobsForCategory(jobs: JobListing[], cat: JobCategory): number {
  return jobs.reduce((n, j) => (jobMatchesCategory(j, cat) ? n + 1 : n), 0);
}
