"use client";
/**
 * Auth-aware header actions for public pages. One /api/me fetch (cached by
 * the request dedupe in TanStack-less minimal fetch): Pro users see their PRO
 * badge — never a PRO upsell; signed-in free users get OPEN APP + upgrade;
 * anonymous visitors get LOG IN / SIGN UP + the PRO button.
 */
import { isAllAccess } from "@/lib/promo";
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

  if ((me?.entitlement === "pro" || isAllAccess())) {
    return (
      <span className="flex items-center gap-4">
        <Link href="/" className="nav-link hover:text-foreground">OPEN APP</Link>
        <span className="border border-[var(--signal)] bg-[var(--signal-ghost)] px-3 py-1.5 font-mono text-[0.68rem] font-bold uppercase tracking-wider text-[var(--signal-dark)]">
          ✓ PRO
        </span>
      </span>
    );
  }

  if (me) {
    return (
      <span className="flex items-center gap-4">
        <Link href="/" className="nav-link hover:text-foreground">OPEN APP</Link>
        <a
          href="/upgrade"
          className="bg-[var(--ink)] px-3 py-1.5 font-semibold text-[var(--paper)] transition-colors hover:bg-[var(--signal-dark)]"
        >
          UPGRADE — $9/MONTH
        </a>
      </span>
    );
  }

  return (
    <span className="flex items-center gap-4">
      <a href="/login" className="nav-link hover:text-foreground">LOG IN</a>
      <a
        href="/upgrade"
        className="bg-[var(--ink)] px-3 py-1.5 font-semibold text-[var(--paper)] transition-colors hover:bg-[var(--signal-dark)]"
      >
        PRO — $9/MONTH
      </a>
    </span>
  );
}
