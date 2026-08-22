"use client";
/**
 * Decision Ledger (Master Plan §19-20): statement → decision → outcome.
 * Free: first 3 entries. Pro: full timeline. Every outcome links to its
 * primary source — no fabricated numbers, ever.
 */
import { useEffect, useState } from "react";
import { apiGet } from "@/lib/client";
import { useStore } from "@/stores/app-store";
import { PremiumGate } from "@/components/investor/entity-chips";
import { ExternalLink, Scale } from "lucide-react";

type Decision = {
  id: string;
  title: string;
  date?: string | null;
  action?: string | null;
  statement?: string | null;
  outcome?: string | null;
  outcomeSourceUrl?: string | null;
  confidence?: string | null;
};

type Payload = {
  isPro: boolean;
  total: number;
  visibleCount: number;
  hiddenCount: number;
  decisions: Decision[];
};

export function DecisionLedger({ slug }: { slug: string }) {
  const go = useStore((s) => s.go);
  const [data, setData] = useState<Payload | null>(null);

  useEffect(() => {
    let active = true;
    apiGet<Payload>(`/api/investors/${slug}/decisions`)
      .then((d) => { if (active) setData(d); })
      .catch(() => { if (active) setData(null); });
    return () => { active = false; };
  }, [slug]);

  if (!data || data.decisions.length === 0) return null;

  const actionColor = (a?: string | null) =>
    a === "acquired" || a === "invested" ? "chip chip-signal" : a === "exited" ? "chip" : "chip";

  return (
    <section className="mt-10 border-t-2 border-ink pt-4">
      <div className="section-head">
        <h2 className="flex items-center gap-2"><Scale className="h-5 w-5" /> Decision Ledger</h2>
        <p className="kicker">STATEMENT → DECISION → OUTCOME · {data.total} ENTRIES</p>
      </div>

      <div className="mt-4 space-y-0">
        {data.decisions.map((d) => (
          <div key={d.id} className="border-l-2 border-rule pl-4 pb-6 ml-2 relative">
            <span className="absolute -left-[7px] top-1 h-3 w-3 rounded-full bg-signal-dark" />
            <p className="font-mono text-xs uppercase tracking-wider text-graphite">
              {d.date ?? "N.D."}
              {d.action && <span className={`ml-2 ${actionColor(d.action)} px-1`}>{(d.action ?? "").toUpperCase()}</span>}
              {d.confidence === "medium" && <span className="ml-2 text-signal">· MEDIUM CONFIDENCE</span>}
            </p>
            <p className="mt-1 font-display text-lg font-semibold leading-tight">{d.title}</p>
            {d.statement && <p className="mt-1 max-w-[75ch] font-reader text-sm text-graphite">{d.statement}</p>}
            {d.outcome && (
              <p className="mt-2 max-w-[75ch] font-reader text-sm">
                <span className="kicker mr-2">OUTCOME</span>{d.outcome}
                {" "}
                {d.outcomeSourceUrl && (
                  <a href={d.outcomeSourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 text-signal-dark hover:underline">
                    primary source <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </p>
            )}
          </div>
        ))}
      </div>

      {!data.isPro && data.hiddenCount > 0 && (
        <PremiumGate
          hiddenCount={data.hiddenCount}
          onUpgrade={() => go("upgrade")}
          label="ledger entries"
        />
      )}
    </section>
  );
}
