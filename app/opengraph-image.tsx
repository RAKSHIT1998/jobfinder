import { ImageResponse } from "next/og";

// Default social card for every page that doesn't define its own. Until this
// existed, every JobFinder link shared anywhere rendered as a blank grey box.
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "JobFinder AI — match your CV to the highest-paying jobs";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #1b1140 0%, #4c1d95 55%, #6d28d9 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", fontSize: 36, fontWeight: 700, marginBottom: 36 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 56,
              height: 56,
              borderRadius: 16,
              marginRight: 22,
              background: "rgba(255,255,255,0.14)",
              border: "1px solid rgba(255,255,255,0.25)",
              fontSize: 26,
              fontWeight: 800,
            }}
          >
            JF
          </div>
          JobFinder AI
        </div>

        <div style={{ display: "flex", fontSize: 76, fontWeight: 800, lineHeight: 1.08, letterSpacing: "-0.03em", maxWidth: 1040 }}>
          Match your CV to the highest-paying jobs
        </div>
        <div style={{ display: "flex", fontSize: 32, color: "rgba(255,255,255,0.75)", marginTop: 28, maxWidth: 960 }}>
          Live postings from real job sources, scored against your actual skills — plus the tools to land the highest offer.
        </div>
      </div>
    ),
    size
  );
}
