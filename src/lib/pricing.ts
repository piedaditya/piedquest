/**
 * Shared (client-safe) pricing types + the authoritative price table.
 * All amounts are computed on the server; the client only renders what it is
 * handed back so prices can never be tampered with locally.
 */

export type BillingCycle = "daily" | "monthly" | "yearly";
export type PaidTier = "gold" | "special";

export interface PriceRow {
  amountMinor: number;
  originalMinor: number;
  display: string;
  originalDisplay: string;
  savePercent: number;
}

export interface RegionalPricing {
  countryCode: string;
  currency: string;
  symbol: string;
  cycles: Record<BillingCycle, Record<PaidTier, PriceRow>>;
}

/** Base list prices in INR (the reference market). */
export const BASE_INR: Record<BillingCycle, Record<PaidTier, { price: number; original: number }>> = {
  daily: {
    gold: { price: 9, original: 10 },
    special: { price: 13, original: 20 },
  },
  monthly: {
    gold: { price: 99, original: 300 },
    special: { price: 143, original: 600 },
  },
  yearly: {
    gold: { price: 999, original: 3600 },
    special: { price: 1436, original: 7200 },
  },
};

export interface CurrencyDef {
  code: string;
  symbol: string;
  /** INR per 1 unit of this currency. */
  fx: number;
  /** Purchasing-power multiplier relative to India (1 = same PPP basket). */
  ppp: number;
  /** Smallest sensible rounding step, in major units. */
  step: number;
  decimals: number;
}

export const CURRENCIES: Record<string, CurrencyDef> = {
  INR: { code: "INR", symbol: "₹", fx: 1, ppp: 1, step: 1, decimals: 0 },
  USD: { code: "USD", symbol: "$", fx: 88, ppp: 3.4, step: 0.5, decimals: 2 },
  GBP: { code: "GBP", symbol: "£", fx: 112, ppp: 3.2, step: 0.5, decimals: 2 },
  EUR: { code: "EUR", symbol: "€", fx: 96, ppp: 3.1, step: 0.5, decimals: 2 },
  CAD: { code: "CAD", symbol: "C$", fx: 63, ppp: 3.0, step: 0.5, decimals: 2 },
  AUD: { code: "AUD", symbol: "A$", fx: 57, ppp: 3.0, step: 0.5, decimals: 2 },
  AED: { code: "AED", symbol: "AED ", fx: 24, ppp: 2.6, step: 1, decimals: 0 },
  SGD: { code: "SGD", symbol: "S$", fx: 66, ppp: 3.0, step: 0.5, decimals: 2 },
  JPY: { code: "JPY", symbol: "¥", fx: 0.58, ppp: 2.6, step: 10, decimals: 0 },
  BRL: { code: "BRL", symbol: "R$", fx: 16, ppp: 1.5, step: 1, decimals: 0 },
  ZAR: { code: "ZAR", symbol: "R", fx: 4.8, ppp: 1.5, step: 1, decimals: 0 },
  NGN: { code: "NGN", symbol: "₦", fx: 0.06, ppp: 0.8, step: 50, decimals: 0 },
  PKR: { code: "PKR", symbol: "Rs ", fx: 0.31, ppp: 0.85, step: 10, decimals: 0 },
  BDT: { code: "BDT", symbol: "৳", fx: 0.72, ppp: 0.9, step: 5, decimals: 0 },
  IDR: { code: "IDR", symbol: "Rp ", fx: 0.0053, ppp: 1.0, step: 1000, decimals: 0 },
  PHP: { code: "PHP", symbol: "₱", fx: 1.5, ppp: 1.1, step: 5, decimals: 0 },
};

/** ISO-3166 country -> currency. Anything unlisted falls back to USD. */
export const COUNTRY_CURRENCY: Record<string, string> = {
  IN: "INR",
  US: "USD",
  GB: "GBP",
  IE: "EUR", DE: "EUR", FR: "EUR", ES: "EUR", IT: "EUR", NL: "EUR", PT: "EUR", BE: "EUR", AT: "EUR", FI: "EUR", GR: "EUR",
  CA: "CAD",
  AU: "AUD",
  NZ: "AUD",
  AE: "AED",
  SA: "AED",
  SG: "SGD",
  JP: "JPY",
  BR: "BRL",
  ZA: "ZAR",
  NG: "NGN",
  PK: "PKR",
  BD: "BDT",
  ID: "IDR",
  PH: "PHP",
  NP: "INR",
  LK: "INR",
};

function roundTo(value: number, step: number): number {
  return Math.max(step, Math.round(value / step) * step);
}

function format(def: CurrencyDef, major: number): string {
  return `${def.symbol}${major.toFixed(def.decimals)}`;
}

function convert(inr: number, def: CurrencyDef): number {
  if (def.code === "INR") return Math.round(inr);
  return roundTo((inr * def.ppp) / def.fx, def.step);
}

/** Deterministic, server-computed price sheet for a country. */
export function buildPricing(countryCode: string): RegionalPricing {
  const cc = (countryCode || "US").toUpperCase();
  const def = CURRENCIES[COUNTRY_CURRENCY[cc] ?? "USD"] ?? CURRENCIES["USD"]!;
  const cycles = {} as RegionalPricing["cycles"];

  (Object.keys(BASE_INR) as BillingCycle[]).forEach((cycle) => {
    const tiers = {} as Record<PaidTier, PriceRow>;
    (Object.keys(BASE_INR[cycle]) as PaidTier[]).forEach((tier) => {
      const base = BASE_INR[cycle][tier];
      const price = convert(base.price, def);
      const original = Math.max(price + def.step, convert(base.original, def));
      const factor = 10 ** def.decimals;
      tiers[tier] = {
        amountMinor: Math.round(price * factor),
        originalMinor: Math.round(original * factor),
        display: format(def, price),
        originalDisplay: format(def, original),
        savePercent: Math.round(((original - price) / original) * 100),
      };
    });
    cycles[cycle] = tiers;
  });

  return { countryCode: cc, currency: def.code, symbol: def.symbol, cycles };
}
