"use client";

import { useEffect } from "react";

// Stashes an inviter's ?ref=CODE the moment a visitor lands from a share link,
// so it survives the journey through the CV builder and gets attached at signup
// (see app/api/cv). Renders nothing.
export default function RefCapture() {
  useEffect(() => {
    try {
      const ref = new URLSearchParams(window.location.search).get("ref");
      if (ref && ref.trim()) {
        localStorage.setItem("jobfinder_ref", ref.trim().toUpperCase().slice(0, 16));
      }
    } catch {
      // Private-mode / storage-disabled browsers: a missed referral is harmless.
    }
  }, []);
  return null;
}
