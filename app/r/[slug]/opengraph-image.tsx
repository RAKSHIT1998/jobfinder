import { ImageResponse } from "next/og";
import { getShareBySlug } from "@/lib/db";
import { shareHeadline, shareBigStat } from "@/lib/shareCopy";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "JobFinder AI result";

// `params` is passed synchronously by the file convention in some Next versions
// and as a promise in others — awaiting handles both (await on a plain value is
// a no-op).
type Params = { slug: string };

export default async function Image({ params }: { params: Params | Promise<Params> }) {
  const { slug } = await params;
  const payload = await getShareBySlug(slug);

  // Fall back to a brand card rather than 500-ing a crawler on a dead link.
  const headline = payload ? shareHeadline(payload) : "Match your CV to the highest-paying jobs";
  const stat = payload
    ? shareBigStat(payload)
    : { value: "JobFinder AI", label: "your AI career agent" };

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background: "linear-gradient(135deg, #1b1140 0%, #4c1d95 55%, #6d28d9 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", fontSize: 34, fontWeight: 700, letterSpacing: "-0.02em" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 52,
              height: 52,
              borderRadius: 16,
              marginRight: 20,
              background: "rgba(255,255,255,0.14)",
              border: "1px solid rgba(255,255,255,0.25)",
              fontSize: 24,
              fontWeight: 800,
            }}
          >
            JF
          </div>
          JobFinder AI
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: stat.value.length > 22 ? 76 : 104,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
            }}
          >
            {stat.value}
          </div>
          <div style={{ display: "flex", fontSize: 30, color: "rgba(255,255,255,0.72)", marginTop: 14 }}>
            {stat.label}
          </div>
          <div style={{ display: "flex", fontSize: 40, fontWeight: 600, lineHeight: 1.18, marginTop: 30, maxWidth: 1000 }}>
            {headline}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", fontSize: 26, color: "rgba(255,255,255,0.78)" }}>
            Scored against a real CV on live job postings
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: 26,
              fontWeight: 700,
              padding: "16px 30px",
              borderRadius: 999,
              background: "white",
              color: "#4c1d95",
            }}
          >
            See your results
          </div>
        </div>
      </div>
    ),
    size
  );
}
