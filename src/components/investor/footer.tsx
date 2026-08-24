"use client";
import Link from "next/link";
import { useStore } from "@/stores/app-store";

export function Footer() {
  // PAYWALL DORMANT — no Upgrade link while all-access is on.
  return (
    <footer className="mt-auto border-t border-ink bg-paper">
      <div className="mx-auto max-w-[1320px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 text-[0.8rem] sm:grid-cols-2 lg:grid-cols-12">
          <div className="col-span-2 lg:col-span-4">
            <div className="wordmark">
              <span>INVESTOR</span>
              <span className="slash">/</span>
              <span>PASS</span>
            </div>
            <p className="mt-2 font-reader text-sm text-graphite">
              The public record, properly indexed.
            </p>
            <p className="mt-4 max-w-xs font-reader text-[0.78rem] leading-relaxed text-graphite">
              Paraphrased summaries with source attribution — never reproductions.
              Historical reference only, never investment advice.
            </p>
          </div>

          <nav className="lg:col-span-2" aria-label="Product">
            <p className="kicker mb-3">PRODUCT</p>
            <ul className="space-y-2 text-graphite">
              <li><Link href="/investors" className="hover:text-ink">Investors</Link></li>
              <li><Link href="/search" className="hover:text-ink">Search</Link></li>
              <li><Link href="/founders" className="hover:text-ink">Founders</Link></li>
              <li><Link href="/legal" className="hover:text-ink">Legal</Link></li>
            </ul>
          </nav>

          <nav className="lg:col-span-2" aria-label="Legal">
            <p className="kicker mb-3">LEGAL</p>
            <ul className="space-y-2 text-graphite">
              <li><Link href="/legal/terms" className="hover:text-ink">Terms of Service</Link></li>
              <li><Link href="/legal/privacy" className="hover:text-ink">Privacy Policy</Link></li>
              <li><Link href="/legal/copyright" className="hover:text-ink">Copyright &amp; IP</Link></li>
              <li><Link href="/legal/refunds" className="hover:text-ink">Refunds</Link></li>
            </ul>
          </nav>

          <nav className="lg:col-span-2" aria-label="Editorial standards">
            <p className="kicker mb-3">EDITORIAL</p>
            <ul className="space-y-2 font-reader text-graphite">
              <li>Source attribution on every record</li>
              <li>No investment recommendations</li>
              <li>
                <Link href="/legal/disclaimer" className="underline decoration-rule underline-offset-2 hover:text-ink">
                  Investment disclaimer →
                </Link>
              </li>
            </ul>
          </nav>

          <div className="lg:col-span-2">
            <p className="kicker mb-3">KEYBOARD</p>
            <ul className="space-y-2 text-graphite">
              <li className="font-mono text-xs"><kbd className="border border-rule bg-paper-2 px-1">/</kbd> Search</li>
              <li className="font-mono text-xs"><kbd className="border border-rule bg-paper-2 px-1">g</kbd> + <kbd className="border border-rule bg-paper-2 px-1">i</kbd> Investors</li>
              <li className="font-mono text-xs"><kbd className="border border-rule bg-paper-2 px-1">g</kbd> + <kbd className="border border-rule bg-paper-2 px-1">l</kbd> Library</li>
              <li className="font-mono text-xs"><kbd className="border border-rule bg-paper-2 px-1">Esc</kbd> Back</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-rule pt-4 font-mono text-[0.62rem] uppercase tracking-wider text-graphite sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Investor/Pass</span>
          <span>Launch collection: Warren Buffett · Munger, Marks, Lynch, Bogle and more indexed</span>
        </div>
      </div>
    </footer>
  );
}
