/**
 * One-time helper: pre-renders the hero's PNG sequence (drifting glow orbs in
 * the site's existing violet/indigo/pink palette) so PngSequenceBackground
 * has real frames to play instead of running a second live WebGL scene
 * behind the whole hero. Re-run after tweaking ORBS/FRAME_COUNT/size below.
 *
 * Usage: npx tsx scripts/generate-hero-sequence.ts
 */
import sharp from "sharp";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

// Kept small on purpose: these are heavily Gaussian-blurred soft gradients,
// so a low source resolution + small palette costs no visible quality once
// scaled up by the canvas player, but cuts per-frame weight by ~4x.
const WIDTH = 640;
const HEIGHT = 360;
const FRAME_COUNT = 72;
const OUT_DIR = path.join(process.cwd(), "public", "hero-sequence");

interface Orb {
  color: string;
  baseX: number;
  baseY: number;
  ampX: number;
  ampY: number;
  baseR: number;
  ampR: number;
  phase: number;
  opacity: number;
}

// Same palette as glow-purple/glow-cyan/glow-pink in globals.css.
const ORBS: Orb[] = [
  { color: "#7c3aed", baseX: 0.32, baseY: 0.42, ampX: 0.1, ampY: 0.08, baseR: 0.34, ampR: 0.05, phase: 0, opacity: 0.55 },
  { color: "#4f46e5", baseX: 0.68, baseY: 0.55, ampX: 0.08, ampY: 0.1, baseR: 0.3, ampR: 0.04, phase: Math.PI * 0.66, opacity: 0.45 },
  { color: "#ec4899", baseX: 0.52, baseY: 0.3, ampX: 0.09, ampY: 0.07, baseR: 0.22, ampR: 0.035, phase: Math.PI * 1.3, opacity: 0.3 },
];

// t spans exactly one full loop (0..2*PI) across the sequence so frame
// FRAME_COUNT-1 -> frame 0 is a seamless wrap, not a jump cut.
function frameSvg(frameIndex: number): string {
  const t = (frameIndex / FRAME_COUNT) * Math.PI * 2;

  const circles = ORBS.map((o) => {
    const cx = (o.baseX + Math.sin(t + o.phase) * o.ampX) * WIDTH;
    const cy = (o.baseY + Math.cos(t + o.phase) * o.ampY) * HEIGHT;
    const r = (o.baseR + Math.sin(t + o.phase * 1.3) * o.ampR) * WIDTH;
    return `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r.toFixed(1)}" fill="${o.color}" opacity="${o.opacity}" filter="url(#blur)" />`;
  }).join("");

  return `<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="blur" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="70" />
      </filter>
    </defs>
    <rect width="${WIDTH}" height="${HEIGHT}" fill="#050508" />
    ${circles}
  </svg>`;
}

async function renderFrame(svg: string): Promise<Buffer> {
  return sharp(Buffer.from(svg))
    .png({ compressionLevel: 9, palette: true, colors: 48, effort: 10 })
    .toBuffer();
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  for (let i = 0; i < FRAME_COUNT; i++) {
    const png = await renderFrame(frameSvg(i));
    await writeFile(path.join(OUT_DIR, `frame-${String(i).padStart(3, "0")}.png`), png);
  }

  // Single representative frame for prefers-reduced-motion and the
  // always-rendered base layer underneath the live canvas.
  const poster = await renderFrame(frameSvg(0));
  await writeFile(path.join(OUT_DIR, "poster.png"), poster);

  console.log(`Generated ${FRAME_COUNT} frames + poster.png in ${OUT_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
