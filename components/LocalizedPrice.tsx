"use client";

import { useLocalizedPrice } from "@/lib/useLocalizedPrice";
import { ACCESS_PRICE_USD } from "@/lib/currency";

/** Secondary "≈ $X USD" reference shown next to the local-currency price tag. */
export default function LocalizedPrice({ className }: { className?: string }) {
  const { currency } = useLocalizedPrice();

  if (currency === "USD") return null;

  return <span className={className}>≈ ${ACCESS_PRICE_USD.toFixed(2)} USD</span>;
}
