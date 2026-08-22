"use client";
import { useState } from "react";

export type RecentlyViewed = {
  view: string;
  slug?: string;
  label: string;
  sublabel?: string;
  ts: number;
};

const KEY = "ip_recently_viewed";
const MAX = 8;

export function useRecentlyViewed() {
  const [items, setItems] = useState<RecentlyViewed[]>(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(KEY) : null;
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const add = (item: Omit<RecentlyViewed, "ts">) => {
    setItems((prev) => {
      const filtered = prev.filter((i) => !(i.view === item.view && i.slug === item.slug));
      const next = [{ ...item, ts: Date.now() }, ...filtered].slice(0, MAX);
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const clear = () => {
    localStorage.removeItem(KEY);
    setItems([]);
  };

  return { items, add, clear };
}
