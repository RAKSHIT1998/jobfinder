"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { searchLocations } from "@/lib/cities";

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  /** Comma-separated multi-value mode ("Preferred Locations") - autocompletes the segment being typed, not the whole field. */
  multi?: boolean;
  /** Offer "Anywhere"/"Remote" as suggestions - for preference fields, not a current-location field. */
  includeRemote?: boolean;
}

/**
 * The CV form wraps each step in a card with overflow-hidden (for its
 * rounded corners/shine effect), which would clip a normal dropdown - so
 * suggestions render through a portal anchored to the input's live
 * bounding rect instead of being a normal child.
 */
export function LocationAutocomplete({ value, onChange, placeholder, className, multi, includeRemote }: LocationAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const [rect, setRect] = useState<{ top: number; left: number; width: number } | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const activeSegment = multi ? value.slice(value.lastIndexOf(",") + 1) : value;
  const suggestions = searchLocations(activeSegment, { includeRemote });

  // Reset the highlighted suggestion when the typed segment changes - done
  // during render (React's documented pattern for this, using state rather
  // than a ref since refs can't be read/written during render) rather than
  // in an effect, so there's no extra render/flash of the stale highlight.
  const [prevSegment, setPrevSegment] = useState(activeSegment);
  if (prevSegment !== activeSegment) {
    setPrevSegment(activeSegment);
    if (highlighted !== 0) setHighlighted(0);
  }

  useEffect(() => {
    if (!open) return;
    const updateRect = () => {
      const el = wrapperRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setRect({ top: r.bottom + 4, left: r.left, width: r.width });
    };
    updateRect();
    window.addEventListener("scroll", updateRect, true);
    window.addEventListener("resize", updateRect);
    return () => {
      window.removeEventListener("scroll", updateRect, true);
      window.removeEventListener("resize", updateRect);
    };
  }, [open]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const applySuggestion = (suggestion: string) => {
    if (multi) {
      const upToLastComma = value.slice(0, value.lastIndexOf(",") + 1);
      const prefix = upToLastComma ? `${upToLastComma.replace(/,\s*$/, "")}, ` : "";
      onChange(`${prefix}${suggestion}, `);
    } else {
      onChange(suggestion);
    }
    setOpen(false);
  };

  const showDropdown = open && suggestions.length > 0 && rect;

  return (
    <div ref={wrapperRef}>
      <input
        className={className}
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (!open || suggestions.length === 0) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlighted((h) => (h + 1) % suggestions.length);
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlighted((h) => (h - 1 + suggestions.length) % suggestions.length);
          } else if (e.key === "Enter") {
            e.preventDefault();
            applySuggestion(suggestions[highlighted]);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
      />
      {showDropdown &&
        createPortal(
          <ul
            className="fixed z-50 glass-strong rounded-xl py-1.5 max-h-56 overflow-y-auto"
            style={{ top: rect.top, left: rect.left, width: rect.width }}
          >
            {suggestions.map((s, i) => (
              <li key={s}>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    // The list is portaled to document.body, outside wrapperRef's
                    // DOM subtree - without stopping propagation here, the global
                    // mousedown listener below sees this as an "outside" click and
                    // closes the dropdown before onClick ever fires.
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={() => applySuggestion(s)}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                    i === highlighted ? "bg-violet-500/15 text-violet-700" : "text-foreground/70 hover:bg-foreground/5"
                  }`}
                >
                  {s}
                </button>
              </li>
            ))}
          </ul>,
          document.body
        )}
    </div>
  );
}
