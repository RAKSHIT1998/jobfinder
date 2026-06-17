const INR_LOCALE = "en-IN";
const USD_TO_INR = 83;

export const ACCESS_PRICE_INR = 830;
export const ACCESS_PRICE_PAISE = ACCESS_PRICE_INR * 100;

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

export function usdToInr(amount: number): number {
  return Math.round(amount * USD_TO_INR);
}
