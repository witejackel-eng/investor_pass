"use client";
/**
 * Personal Home rails (Master Plan §27): new-since-last-visit banner +
 * followed entities strip. Rendered on home for logged-in users only.
 */
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useStore } from "@/stores/app-store";
import { apiGet } from "@/lib/client";
import { Sparkles, Users } from "lucide-react";

type NewSince = {
  isNew: boolean;
  totalNew: number;
  followedNew: number;
  items: { view: string; slug: string; label: string; meta: string; followed: boolean }[];
};
type Follow = { entityType: string; entityId: string };

export function PersonalHomeRails() {
  const go = useStore((s) => s.go);
  const [dismissed, setDismissed] = useState(false);

  const { data: ns } = useQuery({
    queryKey: ["new-since"],
    queryFn: () => apiGet<NewSince>("/api/new-since"),
    staleTime: 0,
    gcTime: 0,
  });
  const { data: fw } = useQuery({ queryKey: ["follows"], queryFn: () => apiGet<{ follows: Follow[] }>("/api/follows") });

  const follows = fw?.follows ?? [];
  if (!ns && follows.length === 0) return null;

  return (
    <>
      {/* New since your last visit */}
      {ns?.isNew && !dismissed && (
        <section className="mt-8 border-2 border-signal bg-paper p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="kicker flex items-center gap-1.5 text-signal-dark">
                <Sparkles className="h-3.5 w-3.5" /> NEW SINCE YOUR LAST VISIT
              </p>
              <p className="mt-1 font-display text-xl font-semibold tracking-tight">
                {ns.totalNew} new source{ns.totalNew === 1 ? "" : "s"} indexed
                {ns.followedNew > 0 && <> — {ns.followedNew} from investors you follow</>}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {ns.items.slice(0, 6).map((item) => (
                  <button
                    key={item.slug}
                    onClick={() => go(item.view as any, { slug: item.slug })}
                    className="border border-rule bg-paper-2 px-3 py-1.5 text-left transition-colors hover:border-ink"
                  >
                    <span className="font-display text-sm font-medium">{item.label}</span>
                    <span className="ml-2 font-mono text-[0.6rem] uppercase text-graphite">{item.meta}</span>
                  </button>
                ))}
              </div>
            </div>
            <button onClick={() => setDismissed(true)} className="chip shrink-0" aria-label="Dismiss">✕</button>
          </div>
        </section>
      )}

      {/* Following strip */}
      {follows.length > 0 && (
        <section className="mt-8 border-t border-rule py-4">
          <p className="kicker flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" /> FOLLOWING ({follows.length})
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {follows.map((f) => (
              <button
                key={`${f.entityType}-${f.entityId}`}
                onClick={() => go((f.entityType === "person" ? "investor" : f.entityType) as any, { slug: f.entityId })}
                className="chip"
              >
                {f.entityId.replace(/-/g, " ")}
              </button>
            ))}
            <button onClick={() => go("watchlist")} className="chip chip-signal">MANAGE WATCHLIST →</button>
          </div>
        </section>
      )}
    </>
  );
}
