"use client";
/**
 * FollowButton v2 — claim a research beat, not a social button.
 * Entity-specific labels · optimistic toggle · quiet confirmation strip
 * with View-following link · unfollow undo toast. Zero layout shift.
 */
import { useEffect, useState } from "react";
import { useStore } from "@/stores/app-store";
import { track } from "@/lib/client";
import { apiPost, apiDelete } from "@/lib/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export type FollowKind = "person" | "topic" | "concept" | "company" | "event" | "source" | "search";

// Owner UX spec §1: smarter labels by entity type.
const CTA: Record<FollowKind, string> = {
  person: "Follow",
  topic: "Follow this idea",
  concept: "Follow this idea",
  company: "Follow this company",
  event: "Follow this episode",
  source: "Follow this source",
  search: "Follow this search",
};

export function FollowButton({
  entityType,
  entityId,
  label,
  compact = false,
}: {
  entityType: FollowKind;
  entityId: string;
  /** Display name of the entity (denormalized server-side). */
  label?: string;
  compact?: boolean;
}) {
  const user = useStore((s) => s.user);
  const go = useStore((s) => s.go);
  const qc = useQueryClient();
  const [following, setFollowing] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [justFollowed, setJustFollowed] = useState(false);

  // Seed from cached follows list when it arrives.
  const cached = qc.getQueryData<{ follows: { entityType: string; entityId: string }[] }>(["follows"]);
  useEffect(() => {
    if (following === null && cached?.follows) {
      setFollowing(cached.follows.some((f) => f.entityType === entityType && f.entityId === entityId));
    }
  }, [cached, following, entityType, entityId]);

  if (!user) {
    return (
      <button onClick={() => go("login")} className="chip" title="Log in to follow">
        {compact ? "FOLLOW" : CTA[entityType]}
      </button>
    );
  }

  const isFollowing = following ?? Boolean(cached?.follows?.some((f) => f.entityType === entityType && f.entityId === entityId));
  const displayLabel = label || entityId.replace(/-/g, " ");

  async function toggle() {
    if (busy) return;
    setBusy(true);
    const next = !isFollowing;
    setFollowing(next); // optimistic
    try {
      if (next) {
        await apiPost("/api/follows", { entityType, entityId, label: displayLabel });
      track("follow_toggled", { following: true });
        setJustFollowed(true);
        setTimeout(() => setJustFollowed(false), 6000);
      } else {
        await apiDelete(`/api/follows?entityType=${entityType}&entityId=${encodeURIComponent(entityId)}`);
        toast(`Unfollowed ${displayLabel}`, {
          description: "You can undo for a few seconds.",
          action: {
            label: "UNDO",
            onClick: async () => {
              try {
                await apiPost("/api/follows", { entityType, entityId, label: displayLabel });
      track("follow_toggled", { following: true });
                setFollowing(true);
                qc.invalidateQueries({ queryKey: ["follows"] });
              } catch {}
            },
          },
          duration: 7000,
        });
      }
      qc.invalidateQueries({ queryKey: ["follows"] });
    } catch {
      setFollowing(!next); // revert on failure
      toast.error("Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <button
        onClick={toggle}
        disabled={busy}
        aria-pressed={isFollowing}
        className={isFollowing ? "chip chip-signal" : "chip"}
        title={isFollowing ? "Click to unfollow" : undefined}
      >
        {compact
          ? isFollowing ? "FOLLOWING" : "FOLLOW"
          : isFollowing ? "FOLLOWING" : (CTA[entityType] ?? "FOLLOW")}
      </button>
      {justFollowed && !compact && (
        <span className="font-reader text-xs text-graphite">
          New references to {displayLabel} will appear in your library.{" "}
          <button onClick={() => go("watchlist")} className="text-signal-dark hover:underline">
            View following →
          </button>
        </span>
      )}
    </span>
  );
}
