export interface Country {
  code: string;
  name: string;
  currency: string;
  /** BCP-47 locale used to format numbers/currency the way that region expects. */
  locale: string;
}

// Countries whose currency is covered by the exchange rate provider
// (frankfurter.dev / ECB reference rates) — kept in sync so every option in
// the manual override actually converts.
export const COUNTRIES: Country[] = [
  { code: "IN", name: "India", currency: "INR", locale: "en-IN" },
  { code: "US", name: "United States", currency: "USD", locale: "en-US" },
  { code: "GB", name: "United Kingdom", currency: "GBP", locale: "en-GB" },
  { code: "DE", name: "Germany", currency: "EUR", locale: "de-DE" },
  { code: "FR", name: "France", currency: "EUR", locale: "fr-FR" },
  { code: "ES", name: "Spain", currency: "EUR", locale: "es-ES" },
  { code: "IT", name: "Italy", currency: "EUR", locale: "it-IT" },
  { code: "NL", name: "Netherlands", currency: "EUR", locale: "nl-NL" },
  { code: "CA", name: "Canada", currency: "CAD", locale: "en-CA" },
  { code: "AU", name: "Australia", currency: "AUD", locale: "en-AU" },
  { code: "NZ", name: "New Zealand", currency: "NZD", locale: "en-NZ" },
  { code: "JP", name: "Japan", currency: "JPY", locale: "ja-JP" },
  { code: "CN", name: "China", currency: "CNY", locale: "zh-CN" },
  { code: "SG", name: "Singapore", currency: "SGD", locale: "en-SG" },
  { code: "HK", name: "Hong Kong", currency: "HKD", locale: "zh-HK" },
  { code: "KR", name: "South Korea", currency: "KRW", locale: "ko-KR" },
  { code: "CH", name: "Switzerland", currency: "CHF", locale: "de-CH" },
  { code: "SE", name: "Sweden", currency: "SEK", locale: "sv-SE" },
  { code: "NO", name: "Norway", currency: "NOK", locale: "nb-NO" },
  { code: "DK", name: "Denmark", currency: "DKK", locale: "da-DK" },
  { code: "PL", name: "Poland", currency: "PLN", locale: "pl-PL" },
  { code: "CZ", name: "Czech Republic", currency: "CZK", locale: "cs-CZ" },
  { code: "HU", name: "Hungary", currency: "HUF", locale: "hu-HU" },
  { code: "RO", name: "Romania", currency: "RON", locale: "ro-RO" },
  { code: "TR", name: "Turkey", currency: "TRY", locale: "tr-TR" },
  { code: "IL", name: "Israel", currency: "ILS", locale: "he-IL" },
  { code: "ZA", name: "South Africa", currency: "ZAR", locale: "en-ZA" },
  { code: "BR", name: "Brazil", currency: "BRL", locale: "pt-BR" },
  { code: "MX", name: "Mexico", currency: "MXN", locale: "es-MX" },
  { code: "TH", name: "Thailand", currency: "THB", locale: "th-TH" },
  { code: "MY", name: "Malaysia", currency: "MYR", locale: "ms-MY" },
  { code: "ID", name: "Indonesia", currency: "IDR", locale: "id-ID" },
  { code: "PH", name: "Philippines", currency: "PHP", locale: "en-PH" },
];

export const DEFAULT_COUNTRY: Country = COUNTRIES.find((c) => c.code === "US") ?? COUNTRIES[0];

export function findCountryByCode(code: string): Country | undefined {
  return COUNTRIES.find((c) => c.code === code.toUpperCase());
}

export function findCountryByCurrency(currency: string): Country | undefined {
  return COUNTRIES.find((c) => c.currency === currency.toUpperCase());
}
