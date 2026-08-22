"use client";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-ink bg-paper">
      <div className="mx-auto max-w-[1320px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-6 text-[0.8rem] md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <div className="wordmark">
              <span>INVESTOR</span>
              <span className="slash">/</span>
              <span>PASS</span>
            </div>
            <p className="mt-2 font-reader text-sm text-graphite">
              The public record, properly indexed.
            </p>
          </div>
          <div>
            <p className="kicker mb-2">PRODUCT</p>
            <ul className="space-y-1.5 text-graphite">
              <li><Link href="#/view=investors" className="hover:text-ink">Investors</Link></li>
              <li><Link href="#/view=search" className="hover:text-ink">Search</Link></li>
              <li><Link href="#/view=upgrade" className="hover:text-ink">Upgrade</Link></li>
            </ul>
          </div>
          <div>
            <p className="kicker mb-2">EDITORIAL</p>
            <ul className="space-y-1.5 text-graphite">
              <li className="font-reader">Source attribution on every record</li>
              <li className="font-reader">No investment recommendations</li>
              <li className="font-reader">Historical reference only</li>
            </ul>
          </div>
          <div>
            <p className="kicker mb-2">KEYBOARD</p>
            <ul className="space-y-1.5 text-graphite">
              <li className="font-mono text-xs"><kbd className="border border-rule bg-paper-2 px-1">/</kbd> Search</li>
              <li className="font-mono text-xs"><kbd className="border border-rule bg-paper-2 px-1">g</kbd> + <kbd className="border border-rule bg-paper-2 px-1">i</kbd> Investors</li>
              <li className="font-mono text-xs"><kbd className="border border-rule bg-paper-2 px-1">g</kbd> + <kbd className="border border-rule bg-paper-2 px-1">l</kbd> Library</li>
              <li className="font-mono text-xs"><kbd className="border border-rule bg-paper-2 px-1">Esc</kbd> Back</li>
            </ul>
          </div>
          <div>
            <p className="kicker mb-2">LEGAL</p>
            <ul className="space-y-1.5 text-graphite">
              <li><Link href="/legal/terms" className="hover:text-ink">Terms of Service</Link></li>
              <li><Link href="/legal/privacy" className="hover:text-ink">Privacy Policy</Link></li>
              <li><Link href="/legal/cookies" className="hover:text-ink">Cookie &amp; Storage</Link></li>
              <li><Link href="/legal/copyright" className="hover:text-ink">Copyright &amp; IP</Link></li>
              <li><Link href="/legal/disclaimer" className="hover:text-ink">Investment Disclaimer</Link></li>
              <li><Link href="/legal/refunds" className="hover:text-ink">Refunds &amp; Cancellation</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-6 border-t border-rule pt-4 font-mono text-[0.62rem] uppercase tracking-wider text-graphite">
          © {new Date().getFullYear()} Investor/Pass · Launch collection: Warren Buffett · Munger, Marks, Lynch, Bogle coming later
        </div>
      </div>
    </footer>
  );
}
