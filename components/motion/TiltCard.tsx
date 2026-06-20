"use client";

import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import type { CSSProperties, MouseEvent, ReactNode } from "react";

/**
 * Wraps a card with a mouse-tracked 3D tilt and a specular highlight that
 * follows the cursor - the classic "glass card catching light" effect,
 * built from CSS perspective + framer-motion springs (no WebGL needed).
 */
export function TiltCard({
  children,
  className,
  max = 8,
  style,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [hovering, setHovering] = useState(false);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const spring = { stiffness: 300, damping: 30, mass: 0.5 };
  const rotateX = useSpring(useTransform(py, [0, 1], [max, -max]), spring);
  const rotateY = useSpring(useTransform(px, [0, 1], [-max, max]), spring);
  const background = useTransform([px, py], (latest) => {
    const [x, y] = latest as [number, number];
    return `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(255,255,255,0.16), transparent 60%)`;
  });

  const handleMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    px.set((e.clientX - rect.left) / rect.width);
    py.set((e.clientY - rect.top) / rect.height);
  };

  const handleLeave = () => {
    setHovering(false);
    px.set(0.5);
    py.set(0.5);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={handleLeave}
      style={{ ...style, rotateX, rotateY, transformPerspective: 800 }}
      className={`relative ${className ?? ""}`}
    >
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden"
        style={{ background }}
        animate={{ opacity: hovering ? 1 : 0 }}
        transition={{ duration: 0.25 }}
      />
      {children}
    </motion.div>
  );
}
