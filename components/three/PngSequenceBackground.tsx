"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

interface PngSequenceBackgroundProps {
  /** Folder under /public holding frame-000.png..frame-{N-1}.png and poster.png. */
  basePath: string;
  frameCount: number;
  fps?: number;
  /** Must include a position class (e.g. "absolute inset-0") - the root has no position of its own. */
  className?: string;
}

function frameUrl(basePath: string, index: number) {
  return `${basePath}/frame-${String(index).padStart(3, "0")}.png`;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Plays a pre-rendered PNG sequence on a canvas instead of running a second
 * live WebGL scene behind the whole hero - far cheaper for something that's
 * purely ambient background motion. Pauses while scrolled off-screen.
 */
export function PngSequenceBackground({ basePath, frameCount, fps = 24, className }: PngSequenceBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (reducedMotion) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let cancelled = false;
    let rafId = 0;
    let visible = true;

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    observer.observe(container);

    function draw(img: HTMLImageElement) {
      const { width, height } = container!.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const targetW = Math.round(width * dpr);
      const targetH = Math.round(height * dpr);
      if (canvas!.width !== targetW) canvas!.width = targetW;
      if (canvas!.height !== targetH) canvas!.height = targetH;
      const scale = Math.max(canvas!.width / img.width, canvas!.height / img.height);
      const sw = img.width * scale;
      const sh = img.height * scale;
      ctx!.drawImage(img, (canvas!.width - sw) / 2, (canvas!.height - sh) / 2, sw, sh);
    }

    Promise.all(Array.from({ length: frameCount }, (_, i) => loadImage(frameUrl(basePath, i))))
      .then((images) => {
        if (cancelled) return;
        draw(images[0]);
        setReady(true);

        let frameIndex = 0;
        let lastFrameTime = 0;
        function tick(time: number) {
          if (cancelled) return;
          rafId = requestAnimationFrame(tick);
          if (!visible || time - lastFrameTime < 1000 / fps) return;
          lastFrameTime = time;
          frameIndex = (frameIndex + 1) % images.length;
          draw(images[frameIndex]);
        }
        rafId = requestAnimationFrame(tick);
      })
      .catch(() => {
        // Frames failed to load (offline, blocked, etc.) - the poster image underneath stays visible.
      });

    return () => {
      cancelled = true;
      observer.disconnect();
      cancelAnimationFrame(rafId);
    };
  }, [reducedMotion, basePath, frameCount, fps]);

  return (
    <div ref={containerRef} className={`overflow-hidden ${className ?? ""}`}>
      <Image src={`${basePath}/poster.png`} alt="" fill priority sizes="100vw" className="object-cover" />
      {!reducedMotion && (
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 w-full h-full transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"}`}
        />
      )}
    </div>
  );
}
