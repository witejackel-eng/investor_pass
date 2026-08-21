"use client";
import { useEffect, useState, useCallback } from "react";
import { useStore } from "@/stores/app-store";
import { apiGet } from "@/lib/client";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Search, ArrowRight, Tag, Building2, FileText, Clock, Calendar } from "lucide-react";

type SearchResult = {
  type: "theme" | "company" | "source" | "year" | "event" | "concept";
  slug: string;
  label: string;
  sublabel?: string;
};

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const go = useStore((s) => s.go);

  // Cmd+K / Ctrl+K to open
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Search when query changes
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      return;
    }
    let active = true;
    const timer = setTimeout(async () => {
      try {
        // Fetch themes + companies in parallel, then filter
        const [themesData, companiesData] = await Promise.all([
          apiGet<{ themes: { slug: string; name: string; passageCount: number }[] }>("/api/investors/buffett/themes"),
          apiGet<{ companies: { slug: string; name: string; passageCount: number }[] }>("/api/investors/buffett/companies"),
        ]);
        if (!active) return;
        const q = query.toLowerCase();
        const themeResults: SearchResult[] = themesData.themes
          .filter((t) => t.name.toLowerCase().includes(q))
          .slice(0, 5)
          .map((t) => ({ type: "theme", slug: t.slug, label: t.name, sublabel: `${t.passageCount} passages` }));
        const companyResults: SearchResult[] = companiesData.companies
          .filter((c) => c.name.toLowerCase().includes(q))
          .slice(0, 5)
          .map((c) => ({ type: "company", slug: c.slug, label: c.name, sublabel: `${c.passageCount} passages` }));
        if (active) setResults([...themeResults, ...companyResults]);
      } catch {
        /* results stay as-is on error */
      }
    }, 200);
    return () => { active = false; clearTimeout(timer); };
  }, [query]);

  const navigate = useCallback((r: SearchResult) => {
    const investor = "buffett";
    if (r.type === "theme") go("topic", { slug: r.slug, investor });
    else if (r.type === "company") go("company", { slug: r.slug, investor });
    else if (r.type === "source") go("source", { slug: r.slug });
    else if (r.type === "event") go("event", { slug: r.slug, investor });
    else if (r.type === "concept") go("concept", { slug: r.slug, investor });
    else if (r.type === "year") go("year", { year: r.slug, investor });
    setOpen(false);
    setQuery("");
  }, [go]);

  const iconFor = (type: string) => {
    switch (type) {
      case "theme": return <Tag className="h-4 w-4 text-signal-dark" />;
      case "company": return <Building2 className="h-4 w-4 text-signal-dark" />;
      case "source": return <FileText className="h-4 w-4 text-signal-dark" />;
      case "event": return <Calendar className="h-4 w-4 text-signal-dark" />;
      case "concept": return <Tag className="h-4 w-4 text-signal-dark" />;
      default: return <Search className="h-4 w-4 text-graphite" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-[600px] p-0 overflow-hidden border-ink">
        <Command className="rounded-none">
          <CommandInput
            placeholder="Search themes, companies, or type a query…"
            value={query}
            onValueChange={setQuery}
            className="font-reader text-base"
          />
          <CommandList className="max-h-[400px]">
            <CommandEmpty className="py-6 text-center font-reader text-sm text-graphite">
              {query.length < 2 ? "Type at least 2 characters…" : "No results found."}
            </CommandEmpty>

            {/* Search results */}
            {results.length > 0 && (
              <CommandGroup heading="Entities">
                {results.map((r) => (
                  <CommandItem
                    key={`${r.type}-${r.slug}`}
                    value={`${r.type} ${r.slug} ${r.label}`}
                    onSelect={() => navigate(r)}
                    className="flex items-center gap-3"
                  >
                    {iconFor(r.type)}
                    <div className="flex-1">
                      <p className="font-display text-sm font-semibold">{r.label}</p>
                      {r.sublabel && <p className="font-mono text-xs text-graphite">{r.sublabel}</p>}
                    </div>
                    <span className="chip">{r.type}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* Quick search — full-text */}
            {query.trim().length >= 2 && (
              <CommandGroup heading="Search">
                <CommandItem
                  value={`search ${query}`}
                  onSelect={() => {
                    go("search", { q: query });
                    setOpen(false);
                    setQuery("");
                  }}
                  className="flex items-center gap-3"
                >
                  <Search className="h-4 w-4 text-signal-dark" />
                  <p className="font-display text-sm font-semibold">Search passages for "{query}"</p>
                  <ArrowRight className="ml-auto h-4 w-4 text-graphite" />
                </CommandItem>
              </CommandGroup>
            )}

            {/* Quick navigation when empty */}
            {query.length < 2 && (
              <>
                <CommandGroup heading="Navigate">
                  <CommandItem value="home" onSelect={() => { go("home"); setOpen(false); }} className="flex items-center gap-3">
                    <Clock className="h-4 w-4" /> <span className="font-display text-sm">Home</span>
                  </CommandItem>
                  <CommandItem value="investors" onSelect={() => { go("investors"); setOpen(false); }} className="flex items-center gap-3">
                    <Clock className="h-4 w-4" /> <span className="font-display text-sm">Investors</span>
                  </CommandItem>
                  <CommandItem value="search library" onSelect={() => { go("search"); setOpen(false); }} className="flex items-center gap-3">
                    <Search className="h-4 w-4" /> <span className="font-display text-sm">Search the library</span>
                  </CommandItem>
                  <CommandItem value="timeline" onSelect={() => { go("timeline", { slug: "buffett" }); setOpen(false); }} className="flex items-center gap-3">
                    <Calendar className="h-4 w-4" /> <span className="font-display text-sm">Buffett timeline</span>
                  </CommandItem>
                  <CommandItem value="upgrade" onSelect={() => { go("upgrade"); setOpen(false); }} className="flex items-center gap-3">
                    <ArrowRight className="h-4 w-4" /> <span className="font-display text-sm">Upgrade to Pro</span>
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
