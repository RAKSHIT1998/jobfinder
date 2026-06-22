"use client";

import { useEffect, useState } from "react";
import { FadeIn, StaggerGroup, StaggerItem } from "@/components/motion/Reveal";
import { AnimatedCounter } from "@/components/motion/AnimatedCounter";
import { TiltCard } from "@/components/motion/TiltCard";

interface TrafficSnapshot {
  activeNow: number;
  viewsLast5Min: number;
  viewsLast24h: number;
  topPaths: { path: string; count: number }[];
  recent: { path: string; createdAt: string; referrer: string | null }[];
}

const POLL_MS = 5000;

function timeAgo(stamp: string): string {
  const ms = Date.now() - new Date(stamp.replace(" ", "T") + "Z").getTime();
  const seconds = Math.max(0, Math.round(ms / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  return `${hours}h ago`;
}

function referrerLabel(referrer: string | null): string {
  if (!referrer) return "Direct";
  try {
    return new URL(referrer).hostname;
  } catch {
    return referrer;
  }
}

export default function AdminTraffic() {
  const [snapshot, setSnapshot] = useState<TrafficSnapshot | null>(null);
  const [, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/admin/traffic", { cache: "no-store" });
        if (!res.ok) return;
        const data: TrafficSnapshot = await res.json();
        if (!cancelled) setSnapshot(data);
      } catch {
        // transient network blip - next poll will retry
      }
    };
    load();
    const poller = setInterval(load, POLL_MS);
    // Re-render every few seconds so the "Xs ago" labels in the live feed keep advancing.
    const ticker = setInterval(() => setTick((t) => t + 1), 1000);
    return () => {
      cancelled = true;
      clearInterval(poller);
      clearInterval(ticker);
    };
  }, []);

  const stats = [
    { label: "Active Now", value: snapshot?.activeNow ?? 0, color: "#34d399", live: true },
    { label: "Views (5 min)", value: snapshot?.viewsLast5Min ?? 0, color: "#60a5fa" },
    { label: "Views (24h)", value: snapshot?.viewsLast24h ?? 0, color: "#a78bfa" },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-3xl font-black text-foreground">Live Traffic</h1>
          <p className="text-foreground/40 text-sm mt-1">Real-time visitors across the public site.</p>
        </div>
        <span className="flex items-center gap-1.5 text-emerald-600 text-xs font-semibold ml-auto">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75 animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          Live
        </span>
      </div>

      <StaggerGroup className="grid grid-cols-1 sm:grid-cols-3 gap-4" stagger={0.06}>
        {stats.map((s) => (
          <StaggerItem key={s.label}>
            <TiltCard className="glass rounded-2xl p-5" max={8}>
              <div className="flex items-center gap-2">
                <div className="text-3xl font-black" style={{ color: s.color }}>
                  <AnimatedCounter value={s.value} />
                </div>
                {s.live && snapshot && s.value > 0 && (
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75 animate-ping" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                )}
              </div>
              <div className="text-foreground/40 text-xs mt-1">{s.label}</div>
            </TiltCard>
          </StaggerItem>
        ))}
      </StaggerGroup>

      <FadeIn className="glass rounded-2xl p-6" delay={0.1}>
        <h2 className="text-foreground font-bold mb-4">Top Pages (24h)</h2>
        {!snapshot || snapshot.topPaths.length === 0 ? (
          <p className="text-foreground/30 text-sm">No traffic recorded yet.</p>
        ) : (
          <div className="space-y-2">
            {snapshot.topPaths.map((p) => (
              <div key={p.path} className="flex items-center justify-between gap-3">
                <span className="text-foreground/70 text-sm font-mono truncate">{p.path}</span>
                <span className="text-foreground/40 text-xs shrink-0">{p.count} view{p.count === 1 ? "" : "s"}</span>
              </div>
            ))}
          </div>
        )}
      </FadeIn>

      <FadeIn className="glass rounded-2xl p-6" delay={0.15}>
        <h2 className="text-foreground font-bold mb-4">Live Feed</h2>
        {!snapshot || snapshot.recent.length === 0 ? (
          <p className="text-foreground/30 text-sm">No page views yet.</p>
        ) : (
          <div className="space-y-2 max-h-[28rem] overflow-y-auto">
            {snapshot.recent.map((v, i) => (
              <div key={`${v.createdAt}-${i}`} className="glass rounded-xl p-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-foreground/80 text-sm font-mono truncate">{v.path}</div>
                  <div className="text-foreground/30 text-xs truncate">via {referrerLabel(v.referrer)}</div>
                </div>
                <div className="text-foreground/25 text-xs shrink-0">{timeAgo(v.createdAt)}</div>
              </div>
            ))}
          </div>
        )}
      </FadeIn>
    </div>
  );
}
