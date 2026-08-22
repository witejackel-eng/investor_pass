"use client";
/**
 * Canonical pricing copy (docs/payments-spec.md §1).
 * USD $19/$149 · INR ₹999/₹7,999 · annual framed as "≈ 8 months".
 * Region default is a simple client-side heuristic; actual payment routing
 * lives in the payments lane.
 */
import { useEffect, useState } from "react";

export type Currency = "INR" | "USD";

export const PRICING: Record<Currency, { monthly: string; annual: string; symbol: string }> = {
  USD: { monthly: "$19", annual: "$149", symbol: "$" },
  INR: { monthly: "₹999", annual: "₹7,999", symbol: "₹" },
};

export function defaultCurrency(): Currency {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    if (tz === "Asia/Kolkata" || tz === "Asia/Calcutta") return "INR";
    const lang = typeof navigator !== "undefined" ? navigator.language || "" : "";
    if (lang.toLowerCase().endsWith("-in")) return "INR";
  } catch {}
  return "USD";
}

// Hydration-safe: renders USD on first paint, swaps after mount when the
// visitor looks India-based.
export function useCurrency(): [Currency, (c: Currency) => void] {
  const [currency, setCurrency] = useState<Currency>("USD");
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time region default after mount
    setCurrency(defaultCurrency());
  }, []);
  return [currency, setCurrency];
}
