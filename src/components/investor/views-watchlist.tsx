"use client";
/**
 * Watchlist dashboard (Master Plan §3, Pro layer §7): followed entities
 * grouped by type with per-entity alert preferences + weekly digest panel.
 */
import { useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/client";
import { useStore } from "@/stores/app-store";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loading } from "@/components/investor/views-core";
import { PremiumGate } from "@/components/investor/entity-chips";
import { Bell, Users, FileText, Building2, Lightbulb, Zap, CalendarClock } from "lucide-react";

type Follow = { entityType: string; entityId: string; alertFrequency: string; createdAt: string };
type Digest = { isPro: boolean; gated: boolean; message?: string; totalNew?: number; groups?: { entityType: string; entityId: string; count: number; latestTitle: string }[] };

const TYPE_ICON: Record<string, any> = {
  person: Users,
  source: FileText,
  company: Building2,
  concept: Lightbulb,
  topic: Lightbulb,
  event: Zap,
};

const TYPE_LABEL: Record<string, string> = {
  person: "INVESTORS",
  topic: "TOPICS",
  concept: "CONCEPTS",
  company: "COMPANIES",
  event: "EVENTS",
  source: "SOURCES",
};

export function WatchlistView() {
  const go = useStore((s) => s.go);
  const isPro = useStore((s) => s.user?.entitlement === "pro");
  const qc = useQueryClient();
  const [saving, setSaving] = useState<string | null>(null);

  const { data: fw, isLoading } = useQuery({
    queryKey: ["follows"],
    queryFn: () => apiGet<{ follows: Follow[] }>("/api/follows"),
  });
  const { data: digest } = useQuery({
    queryKey: ["digest"],
    queryFn: () => apiGet<Digest>("/api/digest"),
  });

  const follows = fw?.follows ?? [];

  const setFrequency = async (f: Follow, frequency: string) => {
    if (!isPro) { go("upgrade"); return; }
    if (frequency === "instant") {
      toast("Instant alerts arrive in your weekly inbox once email ships — for now digests are in-app.");
    }
    setSaving(`${f.entityType}:${f.entityId}`);
    try {
      await apiPost("/api/follows", { ...f, alertFrequency: frequency });
      qc.invalidateQueries({ queryKey: ["follows"] });
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(null);
    }
  };

  if (isLoading) return <Loading />;

  const grouped = follows.reduce<Record<string, Follow[]>>((acc, f) => {
    (acc[f.entityType] ||= []).push(f);
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-[860px] px-4 py-12">
      <div className="border-t-2 border-ink pt-4">
        <p className="kicker flex items-center gap-1.5"><Bell className="h-3.5 w-3.5" /> / WATCHLIST</p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">Your monitoring desk</h1>
        <p className="mt-2 font-reader text-graphite">
          Everything you follow, with per-entity alert depth.
          {!isPro && " Alert preferences and the weekly brief are part of Pro."}
        </p>
      </div>

      {/* Weekly digest */}
      <section className="mt-6 border border-ink p-5">
        <p className="kicker"><CalendarClock className="mr-1 inline h-3.5 w-3.5" /> YOUR WEEK</p>
        {!digest ? (
          <div className="mt-3 h-16 animate-pulse bg-paper-2" />
        ) : digest.gated ? (
          <>
            <p className="mt-2 font-reader text-sm text-graphite">{digest.message}</p>
            {!isPro && (
              <button onClick={() => go("upgrade")} className="mt-3 chip chip-signal">UNLOCK WEEKLY BRIEF — PRO</button>
            )}
          </>
        ) : (
          <>
            <p className="mt-2 font-display text-2xl font-bold">{digest.totalNew} new items this week</p>
            <ul className="mt-3 space-y-1 font-reader text-sm text-graphite">
              {(digest.groups ?? []).slice(0, 6).map((g) => (
                <li key={`${g.entityType}:${g.entityId}`}>
                  · {g.count}× {g.entityId.replace(/-/g, " ")} — {g.latestTitle}
                </li>
              ))}
              {(digest.groups ?? []).length === 0 && <li>· Nothing new — follow more investors to widen coverage.</li>}
            </ul>
          </>
        )}
      </section>

      {/* Grouped watchlist */}
      {follows.length === 0 && (
        <section className="mt-6 border border-rule p-5">
          <p className="font-reader text-graphite">You're not following anything yet.</p>
          <button onClick={() => go("investors")} className="mt-3 chip chip-signal">EXPLORE INVESTORS</button>
        </section>
      )}

      {Object.entries(grouped).map(([type, rows]) => {
        const Icon = TYPE_ICON[type] ?? Users;
        return (
          <section key={type} className="mt-6 border border-rule p-0">
            <p className="kicker border-b border-rule px-4 py-2"><Icon className="mr-1 inline h-3.5 w-3.5" /> {TYPE_LABEL[type] ?? type.toUpperCase()} ({rows.length})</p>
            <ul>
              {rows.map((f) => (
                <li key={f.entityId} className="flex items-center justify-between gap-3 border-b border-rule px-4 py-2 last:border-b-0">
                  <button
                    onClick={() => go((f.entityType === "person" ? "investor" : f.entityType) as any, { slug: f.entityId })}
                    className="font-display text-sm font-medium capitalize hover:text-signal-dark"
                  >
                    {f.entityId.replace(/-/g, " ")}
                  </button>
                  <select
                    value={f.alertFrequency ?? "weekly"}
                    disabled={saving === `${f.entityType}:${f.entityId}`}
                    onChange={(e) => setFrequency(f, e.target.value)}
                    className="border border-rule bg-paper px-2 py-1 font-mono text-[0.65rem] uppercase outline-none focus:border-signal"
                    aria-label={`Alert preference for ${f.entityId}`}
                  >
                    <option value="off">OFF</option>
                    <option value="weekly">WEEKLY{!isPro ? " 🔒" : ""}</option>
                    <option value="instant">INSTANT{!isPro ? " 🔒" : ""}</option>
                  </select>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      {!isPro && follows.length > 0 && (
        <PremiumGate
          hiddenCount={follows.length}
          onUpgrade={() => go("upgrade")}
          label="watchlist entries have Pro alert controls"
        />
      )}
    </div>
  );
}
