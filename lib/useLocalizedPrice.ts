"use client";

import { useEffect, useState } from "react";
import { useCountry } from "./useCountry";

interface LocalizedPrice {
  amount: number;
  currency: string;
  formatted: string;
  loading: boolean;
}

/** Live-converts the fixed $10 access price into the visitor's detected/selected currency. */
export function useLocalizedPrice(): LocalizedPrice {
  const { country, loading: countryLoading } = useCountry();
  const [amount, setAmount] = useState(10);
  const [currency, setCurrency] = useState("USD");
  const [priceLoading, setPriceLoading] = useState(true);

  useEffect(() => {
    if (country.currency === "USD") {
      setAmount(10);
      setCurrency("USD");
      setPriceLoading(false);
      return;
    }

    setPriceLoading(true);
    fetch(`/api/exchange-rate?currency=${country.currency}`)
      .then((r) => r.json())
      .then((data: { amount: number; currency: string }) => {
        setAmount(data.amount);
        setCurrency(data.currency);
      })
      .catch(() => {
        setAmount(10);
        setCurrency("USD");
      })
      .finally(() => setPriceLoading(false));
  }, [country.currency]);

  const formatted = new Intl.NumberFormat(country.locale, {
    style: "currency",
    currency,
  }).format(amount);

  return { amount, currency, formatted, loading: countryLoading || priceLoading };
}
