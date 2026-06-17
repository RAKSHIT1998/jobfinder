// Real-time exchange rates from the European Central Bank reference rates
// (via frankfurter.dev) — no API key needed. Replaces any hardcoded rate
// constants, which go stale the moment currency markets move.

interface RatesResponse {
  base: string;
  date: string;
  rates: Record<string, number>;
}

let cache: { rates: Record<string, number>; fetchedAt: number } | null = null;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

async function fetchRatesFromUsd(): Promise<Record<string, number>> {
  const res = await fetch("https://api.frankfurter.dev/v1/latest?base=USD", {
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Exchange rate API responded ${res.status}`);
  const data = (await res.json()) as RatesResponse;
  return { USD: 1, ...data.rates };
}

async function getRatesFromUsd(): Promise<Record<string, number>> {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.rates;
  }
  const rates = await fetchRatesFromUsd();
  cache = { rates, fetchedAt: Date.now() };
  return rates;
}

/** Converts an amount between two currency codes using real current rates. Returns null if either currency isn't covered. */
export async function convertCurrency(amount: number, from: string, to: string): Promise<number | null> {
  if (from === to) return amount;
  const rates = await getRatesFromUsd();
  const fromRate = rates[from];
  const toRate = rates[to];
  if (!fromRate || !toRate) return null;
  const amountInUsd = amount / fromRate;
  return amountInUsd * toRate;
}

export async function getSupportedCurrencies(): Promise<string[]> {
  const rates = await getRatesFromUsd();
  return Object.keys(rates);
}
