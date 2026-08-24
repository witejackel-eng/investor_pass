"use client";
/**
 * Auth-aware header actions for public pages.
 *
 * PAYWALL DORMANT — no PRO upsell, no UPGRADE button. Every visitor has
 * full library access. Logged-in users see OPEN APP; anonymous visitors
 * see LOG IN / SIGN UP.
 *
 * One /api/me fetch (cached by the request dedupe in TanStack-less
 * minimal fetch).
 */
import { useEffect, useState } from "react";
import Link from "next/link";

type Me = { user: { entitlement: "free" | "pro"; name: string | null; email: string } | null };

export function PublicHeaderActions() {
  const [me, setMe] = useState<Me["user"] | null | undefined>(undefined); // undefined = loading

  useEffect(() => {
    let active = true;
    fetch("/api/me", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : { user: null }))
      .then((d: Me) => { if (active) setMe(d.user); })
      .catch(() => { if (active) setMe(null); });
    return () => { active = false; };
  }, []);

  if (me === undefined) {
    return <span className="kicker" aria-hidden>·</span>; // layout-stable placeholder
  }

  // PAYWALL DORMANT — every visitor (logged-in or anon) gets full access.
  // No PRO badge, no UPGRADE button.
  if (me) {
    return (
      <span className="flex items-center gap-4">
        <Link href="/" className="nav-link hover:text-foreground">OPEN APP</Link>
      </span>
    );
  }

  return (
    <span className="flex items-center gap-4">
      <a href="/login" className="nav-link hover:text-foreground">LOG IN</a>
      <a
        href="/signup"
        className="bg-[var(--ink)] px-3 py-1.5 font-semibold text-[var(--paper)] transition-colors hover:bg-[var(--signal-dark)]"
      >
        SIGN UP
      </a>
    </span>
  );
}
