"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AnimatedCounter } from "@/components/motion/AnimatedCounter";
import { TiltCard } from "@/components/motion/TiltCard";

interface AgentStatusProps {
  jobsAnalyzed: number;
  sources: string[];
  loading: boolean;
}

export default function AgentStatus({ jobsAnalyzed, sources, loading }: AgentStatusProps) {
  return (
    <TiltCard className="glass rounded-2xl p-5 h-full" max={6}>
      <div className="flex items-center gap-3 mb-5">
        <div className="relative">
          <motion.div
            className="w-3 h-3 rounded-full"
            animate={{ backgroundColor: loading ? "#fbbf24" : "#34d399" }}
            transition={{ duration: 0.4 }}
          />
          {!loading && <div className="absolute inset-0 w-3 h-3 rounded-full bg-emerald-400 animate-ping opacity-60" />}
        </div>
        <span className="text-foreground font-semibold text-sm">{loading ? "Scanning live sources..." : "Scan complete"}</span>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-foreground/40">Jobs matched this scan</span>
          <span className="text-emerald-600 font-bold">
            {loading ? "—" : <AnimatedCounter value={jobsAnalyzed} />}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-foreground/40">Live sources queried</span>
          <span className="text-violet-600 font-medium">{sources.length}</span>
        </div>
      </div>

      <div>
        <p className="text-xs text-foreground/30 mb-2">Real sources, not a simulation</p>
        <div className="flex flex-wrap gap-1.5">
          <AnimatePresence>
            {sources.map((source) => (
              <motion.span
                key={source}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="px-2 py-1 rounded-lg text-xs font-medium bg-violet-500/10 text-violet-700 border border-violet-500/30"
              >
                {source}
              </motion.span>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </TiltCard>
  );
}
