"use client";
import { useState } from "react";
import { useStore } from "@/stores/app-store";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

const PLACEHOLDERS = [
  "Buffett on inflation",
  "Coca-Cola",
  "capital allocation",
  "mistakes",
  "moats",
  "2008 crisis",
];

export function SearchBar({
  initialQuery = "",
  compact = false,
}: {
  initialQuery?: string;
  compact?: boolean;
}) {
  const go = useStore((s) => s.go);
  const [q, setQ] = useState(initialQuery);
  const [phIndex] = useState(() => Math.floor(Math.random() * PLACEHOLDERS.length));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    go("search", { q });
  };

  return (
    <form onSubmit={submit} className="relative w-full">
      <div className={cn("flex items-center border border-ink bg-paper", compact ? "" : "shadow-[2px_2px_0_0_var(--ink)]")}>
        <Search className="ml-3 h-4 w-4 shrink-0 text-graphite" />
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={`Search the library — ${PLACEHOLDERS[phIndex]}`}
          className="w-full bg-transparent px-3 py-2.5 font-reader text-base outline-none placeholder:text-graphite/70"
          aria-label="Search the library"
        />
        {q && (
          <button type="button" onClick={() => setQ("")} className="mr-1 p-1 text-graphite hover:text-ink" aria-label="Clear">
            <X className="h-4 w-4" />
          </button>
        )}
        <button
          type="submit"
          className="hidden border-l border-ink bg-ink px-4 py-2.5 text-sm font-semibold text-paper hover:bg-signal-dark transition-colors sm:block"
        >
          SEARCH
        </button>
      </div>
    </form>
  );
}

export function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn("chip", active && "chip-ink")}
      type="button"
    >
      {label}
    </button>
  );
}
