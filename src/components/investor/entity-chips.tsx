"use client";
import { useStore } from "@/stores/app-store";
import { cn } from "@/lib/utils";
import { Lock } from "lucide-react";

export function EntityChips({
  items,
  kind,
  investorSlug,
}: {
  items: { slug: string; name: string }[];
  kind: "theme" | "company" | "concept" | "event" | "source";
  investorSlug?: string;
}) {
  const go = useStore((s) => s.go);
  if (!items.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((it) => (
        <button
          key={`${kind}-${it.slug}`}
          onClick={() => {
            if (kind === "theme") go("topic", { slug: it.slug, investor: investorSlug });
            else if (kind === "company") go("company", { slug: it.slug, investor: investorSlug });
            else if (kind === "source") go("source", { slug: it.slug });
            else if (kind === "event") go("event", { slug: it.slug, investor: investorSlug });
            else if (kind === "concept") go("concept", { slug: it.slug, investor: investorSlug });
            else go("search", { q: it.slug });
          }}
          className="chip"
        >
          {it.name}
        </button>
      ))}
    </div>
  );
}

export function PremiumGate({
  hiddenCount,
  onUpgrade,
  label = "passages",
}: {
  hiddenCount: number;
  onUpgrade: () => void;
  label?: string;
}) {
  return (
    <div className="gate mt-6">
      <div className="flex items-start gap-3">
        <Lock className="mt-0.5 h-4 w-4 shrink-0 text-signal-dark" />
        <div className="flex-1">
          <p className="kicker">PRO CONTENT</p>
          <p className="mt-1 font-reader text-base">
            {hiddenCount > 0 ? (
              <>
                <strong className="font-display font-semibold">{hiddenCount} more {label}</strong> are indexed for this record. Unlock the full investor library with Investor/Pass Pro.
              </>
            ) : (
              <>Unlock the full investor library — every source, passage, and connection, searchable.</>
            )}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={onUpgrade}
              className="bg-ink px-4 py-2 text-sm font-semibold text-paper hover:bg-signal-dark transition-colors"
            >
              START PRO — $19/MONTH
            </button>
            <span className="kicker">$149/YEAR · ₹999/MONTH · ₹7,999/YEAR</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SourceTypeBadge({ type }: { type: string }) {
  const labels: Record<string, string> = {
    shareholder_letter: "Shareholder Letter",
    annual_report: "Annual Report",
    speech: "Speech",
    interview: "Interview",
    meeting_transcript: "Meeting Transcript",
    article: "Article",
    book: "Book",
    news: "News",
    imported: "Imported",
  };
  return <span className="chip chip-ink">{labels[type] || type}</span>;
}

export function ProBadge() {
  return (
    <span className="chip chip-signal">
      <Lock className="h-2.5 w-2.5" /> PRO
    </span>
  );
}

// Sources whose passages are a novelist's rendering, not the investor's own words.
// The corpus registry carries the FICTIONALISED_ATTRIBUTION flag in title/publisher;
// until re-imported, the canonical novel is also recognised by slug.
const FICTIONAL_SOURCE_SLUGS = new Set(["reminiscences-of-a-stock-operator"]);

export function isFictionalisedAttribution(source: { slug?: string; title?: string | null; publisher?: string | null }): boolean {
  if (source.slug && FICTIONAL_SOURCE_SLUGS.has(source.slug)) return true;
  return /fictionali[sz](?:ed|ation)[_-]?attribution/i.test(`${source.title || ""} ${source.publisher || ""}`);
}

export function FictionalAttributionBanner() {
  return (
    <div
      className="mt-4 border p-4"
      role="note"
      style={{ borderColor: "rgba(217, 119, 6, 0.55)", background: "rgba(217, 119, 6, 0.09)" }}
    >
      <p className="kicker" style={{ color: "#d97706" }}>FICTIONALISED ATTRIBUTION</p>
      <p className="mt-1 font-reader text-base">
        This is a novel by Edwin Lefèvre. The narrator &lsquo;Larry Livingston&rsquo; is a fictionalised character based on Livermore — passages are not Livermore&rsquo;s own words.
      </p>
    </div>
  );
}
