import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.PUBLIC_SITE_URL || "https://investor-pass.vercel.app"),
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
            <Link href="/investors" className="nav-link hover:text-foreground">
              INVESTORS
            </Link>
            <a href="/#/view=search" className="nav-link hover:text-foreground">
              SEARCH THE LIBRARY
            </a>
            <a
              href="/#/view=upgrade"
              className="bg-[var(--ink)] px-3 py-1.5 font-semibold text-[var(--paper)] transition-colors hover:bg-[var(--signal-dark)]"
            >
              PRO — $19/MONTH
            </a>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-10 sm:py-14">{children}</main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-5 py-5">
          <p className="kicker">INVESTOR/PASS — THE PUBLIC RECORD, PROPERLY INDEXED.</p>
          <nav aria-label="Footer" className="kicker flex flex-wrap items-center gap-x-4">
            <Link href="/investors" className="hover:text-foreground hover:underline">
              Investors
            </Link>
            <a href="/#/view=search" className="hover:text-foreground hover:underline">
              Search
            </a>
            <a href="/#/view=upgrade" className="hover:text-foreground hover:underline">
              Pro — $19/month or $149/year
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
