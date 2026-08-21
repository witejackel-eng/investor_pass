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
            <p className="kicker mb-2">LEGAL</p>
            <ul className="space-y-1.5 text-graphite">
              <li className="font-reader">Paraphrased summaries, not reproductions</li>
              <li className="font-reader">Links to original sources</li>
              <li className="font-reader">No claim of fair use by word count</li>
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
