// Human-readable copy derived from a SharePayload. Pure (no server deps) so the
// public page, the OG image, the page <title>, and the client share button all
// speak with one voice. The wording is first-person and ego-forward on purpose
// — these strings are what actually get pasted into LinkedIn/WhatsApp feeds.

import type { SharePayload } from "./shareTypes";

export function formatShareMoney(currency: string, n: number): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    // Exotic/unknown currency code the Intl runtime doesn't recognise.
    return `${currency} ${Math.round(n).toLocaleString("en-US")}`;
  }
}

/** The headline — also used as the OG title and the social-share text hook. */
export function shareHeadline(p: SharePayload): string {
  switch (p.kind) {
    case "salary": {
      const range = `${formatShareMoney(p.currency, p.min)}–${formatShareMoney(p.currency, p.max)}`;
      return p.role
        ? `${p.role} roles are paying ${range} right now`
        : `Roles matching my CV are paying ${range} right now`;
    }
    case "match":
      return `My CV is a ${p.score}% match for ${p.role} at ${p.company}`;
    case "skills":
      return `My CV already covers ${p.coveragePercent}% of what ${p.role} jobs want`;
  }
}

/** The supporting line — used as the OG/meta description and page subtitle. */
export function shareSubline(p: SharePayload): string {
  switch (p.kind)  {
    case "salary":
      return `Real disclosed pay pulled from ${p.disclosedCount} of ${p.analyzedCount} live postings matched to my actual CV on JobFinder AI.`;
    case "match":
      return `Scored live against my real CV on JobFinder AI — no fabricated accuracy numbers, just skill overlap.`;
    case "skills":
      return p.topGaps.length
        ? `The skills to add next: ${p.topGaps.slice(0, 3).join(", ")}. Find your own gaps on JobFinder AI.`
        : `Find the exact skills standing between your CV and the jobs you want on JobFinder AI.`;
  }
}

/** The single big number/stat shown front-and-centre on the OG card. */
export function shareBigStat(p: SharePayload): { value: string; label: string } {
  switch (p.kind) {
    case "salary":
      return {
        value: `${formatShareMoney(p.currency, p.min)} – ${formatShareMoney(p.currency, p.max)}`,
        label: "real disclosed pay, per year",
      };
    case "match":
      return { value: `${p.score}%`, label: `CV match for ${p.role}` };
    case "skills":
      return { value: `${p.coveragePercent}%`, label: `of in-demand ${p.role} skills covered` };
  }
}
