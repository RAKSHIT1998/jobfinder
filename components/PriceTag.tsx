"use client";

import { useLocalizedPrice } from "@/lib/useLocalizedPrice";
import { ACCESS_PRICE_USD } from "@/lib/currency";

/** The primary price display — fixed USD access price converted live into the visitor's local currency. */
export default function PriceTag({ className }: { className?: string }) {
  const { formatted, loading } = useLocalizedPrice();
  return <span className={className}>{loading ? `$${ACCESS_PRICE_USD}` : formatted}</span>;
}
