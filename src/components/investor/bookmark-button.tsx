"use client";
import { useState } from "react";
import { useStore } from "@/stores/app-store";
import { track } from "@/lib/client";
import { apiPost, apiDelete } from "@/lib/client";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { toast } from "sonner";

export function BookmarkButton({
  kind,
  entityId,
  label,
}: {
  kind: "source" | "passage" | "company" | "theme" | "search";
  entityId: string;
  label: string;
}) {
  const { user, go } = useStore();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!user) {
    return (
      <button onClick={() => go("login")} className="chip" title="Log in to bookmark">
        <Bookmark className="h-3 w-3" /> SAVE
      </button>
    );
  }
  // PAYWALL DORMANT — every logged-in user can bookmark (was Pro-only).

  const toggle = async () => {
    setLoading(true);
    try {
      if (saved) {
        await apiDelete(`/api/bookmarks?kind=${kind}&entityId=${encodeURIComponent(entityId)}`);
        setSaved(false);
        toast.success("Bookmark removed");
      } else {
        await apiPost("/api/bookmarks", { kind, entityId, label });
      track("bookmark_created");
        setSaved(true);
        toast.success("Bookmarked");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to update bookmark");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={saved ? "chip chip-signal" : "chip"}
      title={saved ? "Remove bookmark" : "Save"}
    >
      {saved ? <BookmarkCheck className="h-3 w-3" /> : <Bookmark className="h-3 w-3" />}
      {saved ? "SAVED" : "SAVE"}
    </button>
  );
}
