
import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeaderActions } from "@/components/public/header-actions";
import { CookieConsent } from "@/components/public/cookie-consent";
import { OnboardingModal } from "@/components/public/onboarding-modal";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.PUBLIC_SITE_URL || "https://investorpass.vercel.app"),
  title: {
    default: "Investor/Pass — The public record, properly indexed",
    template: "%s · Investor/Pass",
  },
};

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-5 py-4">
          <Link
            href="/"
            className="wordmark"
            aria-label="Investor/Pass — open the research app"
          >
            INVESTOR<span className="slash">/</span>PASS
          </Link>
          <nav aria-label="Public" className="kicker flex flex-wrap items-center gap-x-5 gap-y-1">
            <Link href="/discover" className="nav-link hover:text-foreground">DISCOVER</Link>
            <Link href="/search" className="nav-link hover:text-foreground">SEARCH</Link>
            <Link href="/research" className="nav-link hover:text-foreground">RESEARCH</Link>
            <Link href="/learn" className="nav-link hover:text-foreground">LEARN</Link>
            <Link href="/newsletter" className="nav-link hover:text-foreground">NEWSLETTER</Link>
            <PublicHeaderActions />
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-10 sm:py-14">{children}</main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-5 py-5">
          <p className="kicker">INVESTOR/PASS — THE PUBLIC RECORD, PROPERLY INDEXED.</p>
          <nav aria-label="Footer" className="kicker flex flex-wrap items-center gap-x-4">
            <Link href="/discover" className="hover:text-foreground hover:underline">Discover</Link>
            <Link href="/investors" className="hover:text-foreground hover:underline">Investors</Link>
            <Link href="/founders" className="hover:text-foreground hover:underline">Founders</Link>
            <Link href="/decisions" className="hover:text-foreground hover:underline">Decisions</Link>
            <Link href="/filings" className="hover:text-foreground hover:underline">Filings</Link>
            <Link href="/legal" className="hover:text-foreground hover:underline">Legal</Link>
          </nav>
        </div>
      </footer>

      {/* First-visit UX: onboarding modal + cookie consent */}
      <OnboardingModal />
      <CookieConsent />
    </div>
  );
}
