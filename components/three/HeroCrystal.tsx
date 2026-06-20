"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { useIsMobile } from "@/lib/useIsMobile";

const HeroCrystalCanvas = dynamic(() => import("./HeroCrystalCanvas"), {
  ssr: false,
  loading: () => null,
});

/**
 * Faceted gem built from flat gradient polygons - shown immediately (and
 * during SSR/hydration, before we know the user's motion preference) and
 * kept as the permanent fallback for prefers-reduced-motion.
 */
function StaticGem({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} role="img" aria-label="Faceted crystal">
      <defs>
        <linearGradient id="facetA" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#c4b5fd" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
        <linearGradient id="facetB" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>
        <linearGradient id="facetC" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#312e81" />
        </linearGradient>
      </defs>
      <polygon points="100,12 165,70 100,100" fill="url(#facetA)" />
      <polygon points="100,12 35,70 100,100" fill="url(#facetB)" opacity="0.92" />
      <polygon points="35,70 100,100 60,150" fill="url(#facetC)" opacity="0.85" />
      <polygon points="165,70 100,100 140,150" fill="url(#facetB)" opacity="0.8" />
      <polygon points="60,150 100,100 140,150" fill="url(#facetA)" opacity="0.7" />
      <polygon points="60,150 140,150 100,192" fill="url(#facetC)" opacity="0.95" />
    </svg>
  );
}

export function HeroCrystal({ className }: { className?: string }) {
  const reducedMotion = usePrefersReducedMotion();
  // A WebGL render loop is the single most expensive thing on this page -
  // skip it on phones, where it's also the least useful (cursor-driven
  // rotation has no touch equivalent and the box renders much smaller anyway).
  const isMobile = useIsMobile();
  const [canvasReady, setCanvasReady] = useState(false);
  const showCanvas = !reducedMotion && !isMobile;
  // Keep the static gem visible until the WebGL canvas has actually painted
  // a frame, so there's no blank gap while its chunk is still loading.
  const showStatic = !showCanvas || !canvasReady;

  return (
    <div className={`relative ${className ?? ""}`}>
      <StaticGem className={`w-full h-full transition-opacity duration-700 ${showStatic ? "opacity-100" : "opacity-0"}`} />
      {showCanvas && (
        <div className="absolute inset-0">
          <HeroCrystalCanvas onReady={() => setCanvasReady(true)} />
        </div>
      )}
    </div>
  );
}
