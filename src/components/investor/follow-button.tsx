"use client";
/**
 * FollowButton — optimistic follow toggle (free tier).
 * Logged-out click routes to login with return context (spec §28 pattern).
 */
import { useState } from "react";
import { useStore } from "@/stores/app-store";
import { apiPost, apiDelete } from "@/lib/client";
import { useQueryClient } from "@tanstack/react-query";
import { Bell, BellOff } from "lucide-react";

export function FollowButton({
  entityType,
  entityId,
  label = "FOLLOW",
}: {
  entityType: "person" | "topic" | "concept" | "company" | "event" | "source";
  entityId: string;
  label?: string;
}) {
  const user = useStore((s) => s.user);
  const go = useStore((s) => s.go);
  const qc = useQueryClient();
  const [following, setFollowing] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);

  if (!user) {
    return (
      <button
        onClick={() => go("login")}
        className="chip"
        title="Log in to follow"
      >
        <Bell className="mr-1 inline h-3 w-3" /> {label}
      </button>
    );
  }

  // Resolve initial state from follows query cache if present.
  const cached = qc.getQueryData<{ follows: { entityType: string; entityId: string }[] }>(["follows"]);
  const isFollowing = following ?? Boolean(cached?.follows?.some((f) => f.entityType === entityType && f.entityId === entityId));

  const toggle = async () => {
    setBusy(true);
    setFollowing(!isFollowing); // optimistic
    try {
      if (isFollowing) {
        await apiDelete(`/api/follows?entityType=${entityType}&entityId=${encodeURIComponent(entityId)}`);
      } else {
        await apiPost("/api/follows", { entityType, entityId });
      }
      qc.invalidateQueries({ queryKey: ["follows"] });
    } catch {
      setFollowing(isFollowing); // revert
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={busy}
      className={isFollowing ? "chip chip-signal" : "chip"}
      aria-pressed={isFollowing}
    >
      {isFollowing ? <BellOff className="mr-1 inline h-3 w-3" /> : <Bell className="mr-1 inline h-3 w-3" />}
      {isFollowing ? "FOLLOWING" : label}
    </button>
  );
}
