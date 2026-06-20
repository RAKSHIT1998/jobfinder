"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const EASE = [0.21, 0.47, 0.32, 0.98] as const;

/** Fades + slides a section in once it scrolls into view. */
export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={item}
      transition={{ duration: 0.6, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

/** Wrap a grid/list with RevealGroup and each child with RevealItem for a staggered entrance. */
export function RevealGroup({
  children,
  className,
  stagger = 0.08,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={{ visible: { transition: { staggerChildren: stagger } } }}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={item} transition={{ duration: 0.5, ease: EASE }}>
      {children}
    </motion.div>
  );
}

// Mount-driven equivalents of Reveal/RevealGroup/RevealItem - same fade+slide
// animation, but triggered on mount instead of via whileInView's
// IntersectionObserver. Reveal's scroll-into-view semantics assume content
// exists from initial render on a long scrollable page (the marketing
// homepage); they're the wrong fit for dashboard content that's added to the
// DOM after an async fetch resolves - whileInView can observe an empty
// container during the loading state and never re-trigger once content
// lands, leaving it stuck at opacity:0. Use these for anything gated behind
// a loading/data check instead.

/** Fades + slides in immediately on mount - for content that pops in once async data loads. */
export function FadeIn({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={item}
      transition={{ duration: 0.6, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

/** Wrap a grid/list with StaggerGroup and each child with StaggerItem for a staggered entrance on mount. */
export function StaggerGroup({
  children,
  className,
  stagger = 0.08,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: stagger } } }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={item} transition={{ duration: 0.5, ease: EASE }}>
      {children}
    </motion.div>
  );
}
