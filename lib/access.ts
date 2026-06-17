export const ACCESS_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

function getPaidAccessExpiry(): number | null {
  if (typeof window === "undefined") return null;
  if (localStorage.getItem("jobfinder_paid") !== "true") return null;
  const paidAt = localStorage.getItem("jobfinder_paid_at");
  const paidAtMs = paidAt ? new Date(paidAt).getTime() : NaN;
  if (!Number.isFinite(paidAtMs)) return null;
  return paidAtMs + ACCESS_DURATION_MS;
}

export function hasActiveAccess(): boolean {
  const expiry = getPaidAccessExpiry();
  return expiry !== null && Date.now() < expiry;
}

export function hasEverPaid(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("jobfinder_paid") === "true";
}
