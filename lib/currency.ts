const INR_LOCALE = "en-IN";

// Canonical product price — every visitor pays the same $10, converted live
// into whatever currency they're actually being charged in.
export const ACCESS_PRICE_USD = 10;

export function formatInr(amount: number, fractionDigits = 0): string {
  return new Intl.NumberFormat(INR_LOCALE, {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(amount);
}

export function formatInrCompact(amount: number): string {
  if (amount >= 10000000) return `${formatInr(amount / 10000000, 1)} Cr`;
  if (amount >= 100000) return `${formatInr(amount / 100000, 1)} L`;
  if (amount >= 1000) return `${formatInr(amount / 1000, 0)}k`;
  return formatInr(amount);
}

/** Number of minor-unit decimal places a currency uses (0 for JPY/KRW, 2 for USD/EUR, etc). */
export function getCurrencyDecimals(currency: string): number {
  try {
    return new Intl.NumberFormat("en", { style: "currency", currency }).resolvedOptions().maximumFractionDigits ?? 2;
  } catch {
    return 2;
  }
}

/** Rounds an amount to the decimal precision a currency actually supports. */
export function roundForCurrency(amount: number, currency: string): number {
  const factor = 10 ** getCurrencyDecimals(currency);
  return Math.round(amount * factor) / factor;
}

export function formatCurrency(amount: number, currency: string, locale?: string): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount);
}
