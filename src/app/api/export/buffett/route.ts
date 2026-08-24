/**
 * GET /api/export/buffett?format=md|pdf|epub — the complete Buffett research
 * volume (all paraphrased research units, grouped by source/year, with
 * attribution and original links). Investor/Pass's OWN copyrighted content —
 * safe to export in full. Letter texts themselves remain Berkshire's
 * copyright and are only linked.
 *
 * PAYWALL DORMANT: every passage exports with full text (no Pro-tier
 * summarization). The `pro` flag is retained in the row shape for
 * forward-compat but always false while the all-access switch is on.
 */
import { db } from "@/lib/db";
import { buildPdf, type PdfBlock } from "@/lib/export/pdf";
import { buildEpub } from "@/lib/export/epub";

export const dynamic = "force-dynamic";

type Row = {
  sourceTitle: string; sourceSlug: string; year: number | null; sourceType: string; publisher: string | null; url: string | null;
  sequence: number; text: string; visibility: string;
};

export async function GET(req: Request) {
  const format = (new URL(req.url).searchParams.get("format") || "md").toLowerCase();
  let rows: Row[] = [];
  try {
    rows = (await db.$queryRawUnsafe(`
      SELECT s.title AS "sourceTitle", s.slug AS "sourceSlug", s.year, s."sourceType", s.publisher, s.url,
             p.sequence, p.text, p.visibility
      FROM "Passage" p JOIN "Source" s ON p."sourceId" = s."id"
      WHERE s."personId" = (SELECT id FROM "Person" WHERE slug='buffett')
      ORDER BY s.year ASC NULLS LAST, s."createdAt" ASC, p.sequence ASC
    `)) as Row[];
  } catch (e) {
    return new Response(JSON.stringify({ error: "Export unavailable", detail: e instanceof Error ? e.message.slice(0, 200) : "" }), { status: 503, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
  }

  // Group by source
  const groups = new Map<string, { title: string; year: number | null; type: string; publisher: string | null; url: string | null; units: { seq: number; text: string; pro: boolean }[] }>();
  for (const r of rows) {
    const g = groups.get(r.sourceSlug) ?? { title: r.sourceTitle, year: r.year, type: r.sourceType, publisher: r.publisher, url: r.url, units: [] };
    // PAYWALL DORMANT: always export full text. Flag retained for forward-compat.
    g.units.push({ seq: r.sequence, text: r.text, pro: false });
    groups.set(r.sourceSlug, g);
  }
  const chapters = [...groups.values()].map((g) => ({
    title: `${g.year ? `${g.year} — ` : ""}${g.title}`,
    meta: `Source: ${g.publisher ?? "Berkshire Hathaway"}${g.url ? ` · ${g.url}` : ""}`,
    g,
  }));

  const TITLE = "Warren Buffett — The Complete Indexed Research Volume";
  const SUB = "Every paraphrased research unit, grouped by source and year · Investor/Pass";

  if (format === "pdf") {
    const blocks: PdfBlock[] = [];
    for (const c of chapters) {
      blocks.push({ text: c.title, style: "h2" });
      blocks.push({ text: c.meta, style: "small" });
      for (const u of c.g.units) {
        blocks.push({ text: `${u.seq}. ${u.text}` });
      }
    }
    const pdf = buildPdf(TITLE, SUB, blocks);
    return new Response(new Uint8Array(pdf), { headers: { "Content-Type": "application/pdf", "Content-Disposition": 'attachment; filename="buffett-research-volume.pdf"', "Cache-Control": "public, s-maxage=3600" } });
  }

  if (format === "epub") {
    const epub = buildEpub({
      title: TITLE,
      author: "Investor/Pass",
      chapters: chapters.map((c) => ({
        title: c.title,
        html: `<p><em>${c.meta}</em></p>` + c.g.units.map((u) => `<p>${u.text.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</p>`).join(""),
      })),
    });
    return new Response(new Uint8Array(epub), { headers: { "Content-Type": "application/epub+zip", "Content-Disposition": 'attachment; filename="buffett-research-volume.epub"', "Cache-Control": "public, s-maxage=3600" } });
  }

  // Markdown
  let md = `# ${TITLE}\n\n_${SUB}._\n\nExported ${new Date().toISOString().slice(0, 10)} · ${rows.length.toLocaleString()} research units · ${chapters.length} sources. Paraphrased research units with source attribution — never reproductions of Berkshire's copyrighted letters; official PDFs are linked per source.\n\n---\n`;
  for (const c of chapters) {
    md += `\n## ${c.title}\n\n${c.meta}\n\n`;
    for (const u of c.g.units) md += `- ${u.text}\n`;
  }
  return new Response(md, { headers: { "Content-Type": "text/markdown; charset=utf-8", "Content-Disposition": 'attachment; filename="buffett-research-volume.md"', "Cache-Control": "public, s-maxage=3600" } });
}
