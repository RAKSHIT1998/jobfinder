import { useSyncExternalStore } from "react";

// Matches the breakpoint the rest of the app already treats as "mobile"
// (DashboardShell's isDesktop check, Tailwind's md: prefix).
const QUERY = "(max-width: 767px)";

function subscribe(callback: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches;
}

function getServerSnapshot() {
  return false;
}

/**
 * SSR-safe small-viewport read, same pattern as usePrefersReducedMotion.
 * Used to skip the heaviest effects (WebGL canvas, canvas animation loops)
 * on phones, where they're the biggest source of lag and the least useful
 * (cursor-driven interactivity has no touch equivalent anyway).
 */
export function useIsMobile(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
