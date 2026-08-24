/**
 * GET /api/export/brief?collection=<id>&format=md|pdf
 * GET /api/export/brief?passages=<id1,id2,...>&format=md|pdf&title=<title>
 *
 * Generates a structured research brief from a collection or a set of
 * passages. NO AI SUMMARIZATION — every word in the brief is drawn
 * directly from the selected passages (the user's explicit constraint:
 * "AI tightly constrained to the selected passages only. No open-ended
 * generation."). This is the lighter version: high-quality export
 * of the selected passages with sources.
 *
 * Brief structure:
 *   1. Title (collection name, user-provided, or auto)
 *   2. Subtitle (passage count, source count, date)
 *   3. Key Points (first ~200 chars of each passage as a bullet)
 *   4. Sources (deduplicated, with URLs)
 *   5. Full Passages (multi-paragraph text with source attribution)
 *
 * Auth: logged-in users only. Collection exports verify ownership.
 */
import { db } from "@/lib/db";
import { buildPdf, type PdfBlock } from "@/lib/export/pdf";
import { getSessionUser } from "@/lib/auth/session";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type PassageRow = {
  id: string;
  text: string;
  sequence: number;
  source: {
    id: string;
    slug: string;
    title: string;
    year: number | null;
    sourceType: string;
    publisher: string | null;
    url: string | null;
    person: {
      slug: string;
      name: string;
      kind: string;
    };
  };
};

export async function GET(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in to export a brief." }, { status: 401 });

  const url = new URL(req.url);
  const format = (url.searchParams.get("format") || "md").toLowerCase();
  const collectionId = url.searchParams.get("collection");
  const passageIdsParam = url.searchParams.get("passages");
  const customTitle = url.searchParams.get("title");

  if (!collectionId && !passageIdsParam) {
    return NextResponse.json({ error: "Provide ?collection=<id> or ?passages=<id1,id2,..." }, { status: 400 });
  }

  let title = customTitle || "Research Brief";
  let passages: PassageRow[] = [];

  try {
    if (collectionId) {
      // Verify ownership + fetch collection items.
      const collection = await db.collection.findUnique({
        where: { id: collectionId },
        select: { id: true, userId: true, title: true, description: true, items: { select: { kind: true, entityId: true, label: true } } },
      });
      if (!collection) return NextResponse.json({ error: "Collection not found" }, { status: 404 });
      if (collection.userId !== user.id) return NextResponse.json({ error: "Not your collection" }, { status: 403 });
      title = customTitle || collection.title;
      const passageIds = collection.items.filter((i) => i.kind === "passage").map((i) => i.entityId);
      const sourceIds = collection.items.filter((i) => i.kind === "source").map((i) => i.entityId);
      if (passageIds.length === 0 && sourceIds.length === 0) {
        return NextResponse.json({ error: "Collection has no passages or sources to export" }, { status: 400 });
      }
      passages = await db.passage.findMany({
        where: { id: { in: passageIds } },
        include: {
          source: { select: { id: true, slug: true, title: true, year: true, sourceType: true, publisher: true, url: true, person: { select: { slug: true, name: true, kind: true } } } },
        },
        orderBy: { sequence: "asc" },
      }) as unknown as PassageRow[];
      // Also fetch all passages from any sourceIds in the collection.
      if (sourceIds.length > 0) {
        const fromSources = await db.passage.findMany({
          where: { sourceId: { in: sourceIds } },
          include: {
            source: { select: { id: true, slug: true, title: true, year: true, sourceType: true, publisher: true, url: true, person: { select: { slug: true, name: true, kind: true } } } },
          },
          orderBy: [{ source: { year: "asc" } }, { sequence: "asc" }],
        }) as unknown as PassageRow[];
        passages = [...passages, ...fromSources];
      }
    } else if (passageIdsParam) {
      const ids = passageIdsParam.split(",").map((s) => s.trim()).filter(Boolean);
      if (ids.length === 0) return NextResponse.json({ error: "No passage IDs provided" }, { status: 400 });
      passages = await db.passage.findMany({
        where: { id: { in: ids } },
        include: {
          source: { select: { id: true, slug: true, title: true, year: true, sourceType: true, publisher: true, url: true, person: { select: { slug: true, name: true, kind: true } } } },
        },
        orderBy: { sequence: "asc" },
      }) as unknown as PassageRow[];
    }

    if (passages.length === 0) {
      return NextResponse.json({ error: "No passages found for the given IDs" }, { status: 404 });
    }

    // Deduplicate passages by ID (in case collection items + source passages overlap).
    const seen = new Set<string>();
    passages = passages.filter((p) => {
      if (seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });

    // ── Build the brief ──────────────────────────────────────────────
    const sourceMap = new Map<string, PassageRow["source"]>();
    for (const p of passages) {
      if (!sourceMap.has(p.source.id)) sourceMap.set(p.source.id, p.source);
    }
    const sources = [...sourceMap.values()];
    const personSet = new Set(passages.map((p) => p.source.person.slug));
    const dateStr = new Date().toISOString().slice(0, 10);

    const subtitle = `${passages.length} passage${passages.length === 1 ? "" : "s"} · ${sources.length} source${sources.length === 1 ? "" : "s"} · ${personSet.size} investor${personSet.size === 1 ? "" : "s"} · exported ${dateStr}`;

    // ── Markdown ─────────────────────────────────────────────────────
    if (format === "md") {
      let md = `# ${title}\n\n_${subtitle}._\n\n---\n\n## Key Points\n\n`;
      for (const p of passages) {
        const firstPara = p.text.split("\n\n")[0];
        const excerpt = firstPara.length > 200 ? firstPara.slice(0, 200) + "…" : firstPara;
        md += `- **${p.source.person.name}** — ${excerpt}\n`;
      }
      md += `\n---\n\n## Sources\n\n`;
      for (const s of sources) {
        md += `- ${s.title}${s.year ? ` (${s.year})` : ""} — ${s.person.name}${s.url ? ` · [source](${s.url})` : ""}\n`;
      }
      md += `\n---\n\n## Full Passages\n\n`;
      for (let i = 0; i < passages.length; i++) {
        const p = passages[i];
        md += `### ${i + 1}. ${p.source.title}${p.source.year ? ` (${p.source.year})` : ""}\n\n`;
        md += `*${p.source.person.name} · ${p.source.sourceType.replace(/_/g, " ")}${p.source.publisher ? ` · ${p.source.publisher}` : ""}*\n\n`;
        md += `${p.text}\n\n`;
        if (p.source.url) md += `[→ Primary source](${p.source.url})\n\n`;
        md += `---\n\n`;
      }
      md += `\n*Generated by Investor/Pass · [investorpass.vercel.app](https://investorpass.vercel.app)*\n`;

      const safeTitle = title.replace(/[^a-z0-9-]+/gi, "-").toLowerCase().slice(0, 60);
      return new Response(md, {
        headers: {
          "Content-Type": "text/markdown; charset=utf-8",
          "Content-Disposition": `attachment; filename="${safeTitle || "research-brief"}.md"`,
          "Cache-Control": "private, no-store",
        },
      });
    }

    // ── PDF ──────────────────────────────────────────────────────────
    if (format === "pdf") {
      const blocks: PdfBlock[] = [];
      blocks.push({ text: title, style: "h1" });
      blocks.push({ text: subtitle, style: "small" });
      blocks.push({ text: "", style: "body" });

      blocks.push({ text: "Key Points", style: "h2" });
      for (const p of passages) {
        const firstPara = p.text.split("\n\n")[0];
        const excerpt = firstPara.length > 200 ? firstPara.slice(0, 200) + "..." : firstPara;
        blocks.push({ text: `${p.source.person.name} — ${excerpt}`, style: "body" });
      }
      blocks.push({ text: "", style: "body" });

      blocks.push({ text: "Sources", style: "h2" });
      for (const s of sources) {
        const line = `${s.title}${s.year ? ` (${s.year})` : ""} — ${s.person.name}${s.url ? ` · ${s.url}` : ""}`;
        blocks.push({ text: line, style: "small" });
      }
      blocks.push({ text: "", style: "body" });

      blocks.push({ text: "Full Passages", style: "h2" });
      for (let i = 0; i < passages.length; i++) {
        const p = passages[i];
        blocks.push({ text: `${i + 1}. ${p.source.title}${p.source.year ? ` (${p.source.year})` : ""}`, style: "h2" });
        blocks.push({ text: `${p.source.person.name} · ${p.source.sourceType.replace(/_/g, " ")}${p.source.publisher ? ` · ${p.source.publisher}` : ""}`, style: "small" });
        // Split multi-paragraph text into separate body blocks
        for (const para of p.text.split("\n\n")) {
          blocks.push({ text: para, style: "body" });
        }
        if (p.source.url) {
          blocks.push({ text: `Primary source: ${p.source.url}`, style: "small" });
        }
        blocks.push({ text: "", style: "body" });
      }
      blocks.push({ text: "Generated by Investor/Pass · investorpass.vercel.app", style: "small" });

      const pdf = buildPdf(title, subtitle, blocks);
      const safeTitle = title.replace(/[^a-z0-9-]+/gi, "-").toLowerCase().slice(0, 60);
      return new Response(new Uint8Array(pdf), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${safeTitle || "research-brief"}.pdf"`,
          "Cache-Control": "private, no-store",
        },
      });
    }

    return NextResponse.json({ error: "Format must be md or pdf" }, { status: 400 });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Brief export failed", detail: e instanceof Error ? e.message.slice(0, 200) : "" }), {
      status: 503,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  }
}
