"use client";
/**
 * Canonical pricing copy (docs/payments-spec.md §1).
 * USD $19/$149 · INR ₹999/₹7,999 · annual framed as "≈ 8 months".
 * Currency rule (owner-locked): INR ONLY for visitors in India
 * (server-authoritative Vercel geo header); USD for every other country.
 * Explicit user override always wins and persists locally.
 */
import { useEffect, useState } from "react";
import { useStore } from "@/stores/app-store";

export type Currency = "INR" | "USD";

export const PRICING: Record<Currency, { monthly: string; annual: string; symbol: string }> = {
  USD: { monthly: "$19", annual: "$149", symbol: "$" },
  INR: { monthly: "₹999", annual: "₹7,999", symbol: "₹" },
};

const OVERRIDE_KEY = "ip_currency";

function readOverride(): Currency | null {
  try {
    const v = localStorage.getItem(OVERRIDE_KEY);
    return v === "INR" || v === "USD" ? v : null;
  } catch {
    return null;
  }
}

// Client-side heuristic — fallback only when the server country is unknown
// (e.g. local dev). Never overrides the server answer.
function heuristicCurrency(): Currency {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    if (tz === "Asia/Kolkata" || tz === "Asia/Calcutta") return "INR";
    const lang = typeof navigator !== "undefined" ? navigator.language || "" : "";
    if (lang.toLowerCase().endsWith("-in")) return "INR";
  } catch {}
  return "USD";
}

export function setCurrencyOverride(c: Currency) {
  try { localStorage.setItem(OVERRIDE_KEY, c); } catch {}
}

// Hydration-safe: USD on first paint; resolves after the store's /api/me
// round-trip delivers the authoritative country.
export function useCurrency(): [Currency, (c: Currency) => void] {
  const country = useStore((s) => s.country);
  const userLoading = useStore((s) => s.userLoading);
  const [override, setOverrideState] = useState<Currency | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time override read after mount
    setOverrideState(readOverride());
  }, []);

  let currency: Currency;
  if (override) currency = override;
  else if (!userLoading && country) currency = country === "IN" ? "INR" : "USD";
  else if (typeof window !== "undefined") currency = heuristicCurrency();
  else currency = "USD";

  return [currency, (c) => { setCurrencyOverride(c); setOverrideState(c); }];
}
