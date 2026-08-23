"use client";
/**
 * Canonical LAUNCH pricing (docs/PRODUCT_CONSTITUTION.md).
 * USD $9/month · $79/year — annual framed as "save 27%" ($9×12=$108;
 * $79/$108 → 26.9% ≈ 27%). INR ₹499/₹3,999 is the provisional India launch
 * equivalent (₹499×12=₹5,988; ₹3,999 → save 33%) — owner to confirm.
 *
 * IMPORTANT (owner runbook): live charge amounts are defined by the
 * RAZORPAY_PLAN_MONTHLY / RAZORPAY_PLAN_ANNUAL and PAYPAL_PLAN_* dashboards,
 * not by this file. After adopting launch pricing, update the plan amounts
 * in both payment dashboards to match, or checkout will charge the old price.
 *
 * Currency rule (owner-locked): INR ONLY for visitors in India
 * (server-authoritative Vercel geo header); USD for every other country.
 * Explicit user override always wins and persists locally.
 */
import { useEffect, useState } from "react";
import { useStore } from "@/stores/app-store";

export type Currency = "INR" | "USD";

export const PRICING: Record<Currency, { monthly: string; annual: string; symbol: string }> = {
  USD: { monthly: "$9", annual: "$79", symbol: "$" },
  INR: { monthly: "₹499", annual: "₹3,999", symbol: "₹" },
};

/** Honest annual-discount copy derived from the actual numbers. */
export const ANNUAL_SAVING: Record<Currency, string> = {
  USD: "save 27%", // 1 - 79/108
  INR: "save 33%", // 1 - 3999/5988
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
