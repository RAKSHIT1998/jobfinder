"use client";

import { useState, useEffect } from "react";
import { useCountry } from "@/lib/useCountry";

export default function LocalizedPrice({ className }: { className?: string }) {
  const { country } = useCountry();
  const [converted, setConverted] = useState<{ currency: string; amount: number } | null>(null);

  useEffect(() => {
    if (country.currency === "INR") {
      setConverted(null);
      return;
    }
    fetch(`/api/exchange-rate?currency=${country.currency}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.converted && data.currency !== "INR") {
          setConverted({ currency: data.currency, amount: data.amount });
        } else {
          setConverted(null);
        }
      })
      .catch(() => setConverted(null));
  }, [country.currency]);

  if (!converted) return null;

  const formatted = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: converted.currency,
    maximumFractionDigits: 2,
  }).format(converted.amount);

  return <span className={className}>≈ {formatted}</span>;
}
