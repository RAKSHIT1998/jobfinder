"use client";

import { useLocalizedPrice } from "@/lib/useLocalizedPrice";

/** The primary price display — $10 converted live into the visitor's local currency. */
export default function PriceTag({ className }: { className?: string }) {
  const { formatted, loading } = useLocalizedPrice();
  return <span className={className}>{loading ? "$10" : formatted}</span>;
}
