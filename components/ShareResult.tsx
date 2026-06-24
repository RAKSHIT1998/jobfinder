"use client";

import { useState } from "react";
import { Share2, Copy, Check, MessageCircle } from "lucide-react";
import type { SharePayload } from "@/lib/shareTypes";
import { shareHeadline } from "@/lib/shareCopy";

// Turns a computed result into a public /r/<slug> link, then surfaces one-tap
// share targets. On mobile we hand off to the native share sheet; on desktop we
// show LinkedIn/WhatsApp/X (the channels this audience actually lives in) plus
// copy-to-clipboard.
export default function ShareResult({ payload }: { payload: SharePayload }) {
  const [url, setUrl] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const hook = shareHeadline(payload);

  async function ensureLink(): Promise<string | null> {
    if (url) return url;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not create a share link.");
      setUrl(data.url);
      return data.url as string;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create a share link.");
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function handleClick() {
    const link = await ensureLink();
    if (!link) return;

    // Prefer the native share sheet where it exists (almost always mobile).
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({ title: "My JobFinder AI result", text: hook, url: link });
        return;
      } catch {
        // User dismissed the sheet — fall through to the inline panel.
      }
    }
    setOpen(true);
  }

  async function copy() {
    const link = await ensureLink();
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Couldn't copy — long-press the link to copy it manually.");
    }
  }

  const encodedUrl = url ? encodeURIComponent(url) : "";
  const encodedHook = encodeURIComponent(hook);
  const linkedIn = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
  const whatsapp = `https://wa.me/?text=${encodeURIComponent(`${hook} ${url ?? ""}`)}`;
  const x = `https://twitter.com/intent/tweet?text=${encodedHook}&url=${encodedUrl}`;

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="btn-primary inline-flex items-center gap-2 text-sm font-bold px-5 py-3 rounded-2xl disabled:opacity-60"
      >
        <Share2 className="w-4 h-4" />
        {loading ? "Creating link…" : "Share my result"}
      </button>

      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}

      {open && url && (
        <div className="glass rounded-2xl p-4 mt-3 space-y-3">
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={url}
              onFocus={(e) => e.currentTarget.select()}
              className="input-glass text-xs flex-1"
            />
            <button
              type="button"
              onClick={copy}
              className="btn-glass inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href={linkedIn} target="_blank" rel="noopener noreferrer" className="btn-glass inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl">
              <span className="font-black tracking-tight">in</span> LinkedIn
            </a>
            <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="btn-glass inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl">
              <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
            </a>
            <a href={x} target="_blank" rel="noopener noreferrer" className="btn-glass inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl">
              <span className="font-black">𝕏</span> Post
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
