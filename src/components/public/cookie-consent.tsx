"use client";
/**
 * Cookie consent banner.
 * Appears once on first visit. Choice stored in cookie + localStorage.
 * Once a choice is made, never appears again unless storage is cleared.
 * PAYWALL DORMANT — respects "Reject non-essential" (only loads essential cookies).
 */
import { useState, useEffect } from "react";
import Link from "next/link";

const STORAGE_KEY = "ip_cookie_consent";

type ConsentChoice = "all" | "essential" | null | undefined; // undefined = loading

export function CookieConsent() {
  // undefined = loading (SSR + first client render), null = no choice yet (show banner),
  // "all" | "essential" = choice made (hide banner)
  const [choice, setChoice] = useState<ConsentChoice>(undefined);

  useEffect(() => {
    // Don't show on legal pages
    if (typeof window !== "undefined" && window.location.pathname.startsWith("/legal")) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setChoice("essential");
      return;
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      setChoice(stored === "all" || stored === "essential" ? stored : null);
    } catch {
      setChoice(null);
    }
  }, []);

  const save = (c: Exclude<ConsentChoice, null | undefined>) => {
    try {
      localStorage.setItem(STORAGE_KEY, c);
      document.cookie = `${STORAGE_KEY}=${c}; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax`;
    } catch {}
    setChoice(c);
  };

  // undefined (loading) or non-null (already chose) → hide banner
  if (choice !== null) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[80] border-t-2 border-ink bg-paper p-4 shadow-[0_-4px_0_0_var(--ink)]">
      <div className="mx-auto flex max-w-[1100px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <p className="font-reader text-sm text-graphite">
            We use cookies to improve your experience and understand how the site is used.{" "}
            <Link href="/legal/privacy" className="underline hover:text-ink">Privacy Policy</Link>
            {" · "}
            <Link href="/legal" className="underline hover:text-ink">Cookie Policy</Link>
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={() => save("essential")}
            className="border border-ink px-3 py-1.5 text-xs font-semibold hover:bg-paper-2 transition-colors"
          >
            REJECT NON-ESSENTIAL
          </button>
          <button
            onClick={() => save("all")}
            className="bg-ink px-3 py-1.5 text-xs font-semibold text-paper hover:bg-signal-dark transition-colors"
          >
            ACCEPT ALL
          </button>
        </div>
      </div>
    </div>
  );
}
