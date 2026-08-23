import Link from "next/link";

import { FREE_PASSAGE_LIMIT, type EntityCount, type PassageCard } from "@/lib/server/public-pages";

// ── SPA deep-link shapes (verified against src/stores/app-store.ts toHash) ──
export const spaSearch = (q: string) => `/#/view=search&q=${encodeURIComponent(q)}`;
export const spaUpgrade = () => "/#/view=upgrade";

export const fmt = (n: number) => n.toLocaleString("en-US");

export function Crumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="kicker flex flex-wrap items-center gap-x-1.5 gap-y-1">
      {items.map((it, i) => (
        <span key={`${it.label}-${i}`} className="flex items-center gap-1.5">
          {i > 0 && <span aria-hidden>/</span>}
          {it.href ? (
            <Link href={it.href} className="hover:text-foreground hover:underline">
              {it.label}
            </Link>
          ) : (
            <span>{it.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function PageHead({
  crumb,
  title,
  meta,
  lede,
}: {
  crumb: { label: string; href?: string }[];
  title: string;
  meta: string[];
  lede?: string | null;
}) {
  return (
    <header className="max-w-4xl">
      <Crumb items={crumb} />
      <h1 className="mt-4 text-balance font-display text-4xl font-bold leading-[1.02] tracking-tight sm:text-5xl md:text-6xl">
        {title}
      </h1>
      <p className="kicker mt-4 flex flex-wrap gap-x-3 gap-y-1">{meta.map((m) => <span key={m}>{m}</span>)}</p>
      {lede ? (
        <p className="prose-reader mt-6 max-w-2xl text-lg leading-relaxed">{lede}</p>
      ) : null}
    </header>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 border-t-2 border-[var(--ink)] pt-2">
      <p className="kicker !text-foreground">{children}</p>
    </div>
  );
}

export function Chip({
  href,
  children,
  variant,
}: {
  href: string;
  children: React.ReactNode;
  variant?: "ink" | "signal";
}) {
  return (
    <Link
      href={href}
      className={`chip ${variant === "ink" ? "chip-ink" : variant === "signal" ? "chip-signal" : ""}`}
    >
      {children}
    </Link>
  );
}

export function ChipRow({
  items,
  kind,
}: {
  items: EntityCount[];
  kind: "theme" | "company" | "event" | "investor";
}) {
  const hrefFor = (slug: string) => {
    if (kind === "theme") return `/themes/${slug}`;
    if (kind === "company") return `/companies/${slug}`;
    if (kind === "event") return `/events/${slug}`;
    return `/investors/${slug}`;
  };
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((it) => (
        <Chip key={it.slug} href={hrefFor(it.slug)}>
          {it.name}
          {" · "}
          {fmt(it.total)}
        </Chip>
      ))}
    </div>
  );
}

export function SourceTypeLabel({ type }: { type: string }) {
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
  return <span className="chip">{labels[type] ?? type}</span>;
}

export function PassageItem({ p, showInvestor = true }: { p: PassageCard; showInvestor?: boolean }) {
  const bylineBits = [
    ...(showInvestor ? [p.source.person.name] : []),
    ...(p.source.year ? [String(p.source.year)] : []),
  ];
  return (
    <article className="border-t border-border py-6 first:border-t-0 first:pt-0">
      <p className="kicker">
        {bylineBits.join(" · ")}
        {p.source.publisher ? ` · ${p.source.publisher}` : ""}
      </p>
      <p className="mt-1.5 font-display text-sm font-semibold tracking-tight">{p.source.title}</p>
      <div className="prose-reader mt-3">
        <p>{p.text}</p>
        {p.context ? <p className="!text-muted-foreground mt-2 text-[0.95rem] italic">{p.context}</p> : null}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <SourceTypeLabel type={p.source.sourceType} />
        {p.source.url ? (
          <a
            href={p.source.url}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="chip chip-signal"
          >
            ORIGINAL SOURCE →
          </a>
        ) : null}
        <Link href={spaSearch(p.source.person.name)} className="chip">
          SEARCH IN APP →
        </Link>
      </div>
    </article>
  );
}

export function PassageBoundary({ total }: { total: number }) {
  return (
    <aside className="gate mt-8 max-w-2xl">
      <p className="font-display text-lg font-semibold tracking-tight">
        Showing {FREE_PASSAGE_LIMIT} of {fmt(total)} references.
      </p>
      <p className="prose-reader mt-2">
        Search the complete library, follow every connection, and save your research.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <a
          href={spaUpgrade()}
          className="bg-[var(--ink)] px-4 py-2 text-sm font-semibold text-[var(--paper)] transition-colors hover:bg-[var(--signal-dark)]"
        >
          START PRO — $19/MONTH
        </a>
        <span className="kicker">$149/YEAR</span>
      </div>
    </aside>
  );
}

export function ExploreNext({ groups }: { groups: { label: string; links: React.ReactNode }[] }) {
  return (
    <section className="mt-12">
      <SectionLabel>EXPLORE NEXT</SectionLabel>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((g) => (
          <div key={g.label}>
            <p className="kicker mb-2">{g.label}</p>
            {g.links}
          </div>
        ))}
      </div>
    </section>
  );
}

export function EmptyNote({ children }: { children: React.ReactNode }) {
  return <p className="prose-reader text-muted-foreground">{children}</p>;
}
