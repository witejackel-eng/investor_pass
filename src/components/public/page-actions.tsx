"use client";
/**
 * Page actions for public research surfaces (Master Plan §32-34):
 * share the canonical URL, print a clean paper/PDF copy, and export
 * the surface as a Markdown file. Client-only; no dependencies.
 *
 * Server Components cannot pass functions to Client Components — so the
 * Markdown builder takes plain data props, never a closure.
 */
import { useState } from "react";
import { Link2, Printer, Download, Check } from "lucide-react";

function useShare() {
  const [copied, setCopied] = useState(false);
  const share = async (title: string) => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* user dismissed — no-op */
    }
  };
  return { copied, share };
}

export function ShareButton({ title }: { title: string }) {
  const { copied, share } = useShare();
  return (
    <button
      onClick={() => share(title)}
      className="chip inline-flex items-center gap-1.5"
      aria-label="Share this page"
    >
      {copied ? <Check className="h-3 w-3" /> : <Link2 className="h-3 w-3" />}
      {copied ? "LINK COPIED" : "SHARE"}
    </button>
  );
}

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="chip inline-flex items-center gap-1.5"
      aria-label="Print this page"
    >
      <Printer className="h-3 w-3" />
      PRINT
    </button>
  );
}

export type TrailExportData = {
  title: string;
  centralQuestion: string;
  intro: string;
  steps: { title: string; kind: string; year: number | null; blurb: string }[];
};

/** Markdown export for research trails — plain-data props, built client-side. */
export function ExportTrailButton({ data }: { data: TrailExportData }) {
  const download = () => {
    const md = [
      `# ${data.title}`,
      ``,
      `_${data.centralQuestion}_`,
      ``,
      data.intro,
      ``,
      `## The trail`,
      ``,
      ...data.steps.map(
        (s, i) => `${i + 1}. **${s.title}** (${s.kind}${s.year ? `, ${s.year}` : ""}) — ${s.blurb}`
      ),
      ``,
      `---`,
      ``,
      `Exported from Investor/Pass — the public record, properly indexed.`,
      typeof window !== "undefined" ? window.location.href : "",
    ].join("\n");
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "investorpass-trail.md";
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <button
      onClick={download}
      className="chip inline-flex items-center gap-1.5"
      aria-label="Export this trail as Markdown"
    >
      <Download className="h-3 w-3" />
      EXPORT .MD
    </button>
  );
}
