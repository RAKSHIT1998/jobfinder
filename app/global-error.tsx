"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-full flex flex-col" style={{ background: "#050508" }}>
        <div className="min-h-screen flex items-center justify-center px-4 text-white">
          <div className="max-w-sm text-center" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "1.5rem", padding: "2rem" }}>
            <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
            <p className="text-white/40 text-sm mb-6">An unexpected error occurred. You can try again.</p>
            <button
              onClick={() => reset()}
              style={{ background: "linear-gradient(135deg, #7c3aed, #2563eb)" }}
              className="px-5 py-2.5 rounded-xl text-sm font-bold"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
