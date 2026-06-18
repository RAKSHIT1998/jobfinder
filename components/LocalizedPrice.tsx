"use client";

import { useLocalizedPrice } from "@/lib/useLocalizedPrice";

/** Secondary "≈ $10 USD" reference shown next to the local-currency price tag. */
export default function LocalizedPrice({ className }: { className?: string }) {
  const { currency } = useLocalizedPrice();

  if (currency === "USD") return null;

  return <span className={className}>≈ $10.00 USD</span>;
}
