"use client";

import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import type { MouseEvent, ReactNode } from "react";

/**
 * A soft light that follows the cursor across its container - a cheap,
 * high-impact depth cue for hero and auth backdrops (no WebGL needed).
 */
export function Spotlight({
  children,
  className,
  color = "139,92,246",
}: {
  children: ReactNode;
  className?: string;
  color?: string;
}) {
  const x = useSpring(useMotionValue(0), { stiffness: 150, damping: 25 });
  const y = useSpring(useMotionValue(0), { stiffness: 150, damping: 25 });
  const background = useMotionTemplate`radial-gradient(550px circle at ${x}px ${y}px, rgba(${color},0.18), transparent 70%)`;

  const handleMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - rect.left);
    y.set(e.clientY - rect.top);
  };

  return (
    <div onMouseMove={handleMove} className={`relative ${className ?? ""}`}>
      <motion.div className="pointer-events-none absolute inset-0" style={{ background }} />
      {children}
    </div>
  );
}
