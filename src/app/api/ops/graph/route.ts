/**
 * GET /api/ops/graph?q=<term> — EVIDENCE GRAPH subgraph around a search
 * term (person/company/theme/event/source). Live DB; clickable nodes; ids
 * allowed here (private dashboard). ~≤80 nodes.
 */
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

type GNode = { id: string; type: string; label: string; meta?: string };
type GEdge = { from: string; to: string; rel: string };

export async function GET(req: Request) {
  const q = (new URL(req.url).searchParams.get("q") || "").trim();
  try {
    const nodes = new Map<string, GNode>();
    const edges: GEdge[] = [];
    const add = (n: GNode) => { if (!nodes.has(n.id)) nodes.set(n.id, n); };
    const link = (from: string, to: string, rel: string) => edges.push({ from, to, rel });

    if (!q) {
      // Default demo subgraph: the canonical documented chain (§ EVIDENCE GRAPH)
      const [person, decision, theme] = await Promise.all([
        db.person.findUnique({ where: { slug: "buffett" } }),
        db.decision.findFirst({ where: { person: { slug: "buffett" }, company: { slug: "coca-cola" }, statement: { not: null } }, include: { company: true } }),
        db.theme.findUnique({ where: { slug: "risk-management" } }),
      ]);
      if (person) add({ id: `person:${person.slug}`, type: "INVESTOR", label: person.name, meta: `status=${person.status}` });
      if (decision) {
        add({ id: `decision:${decision.id}`, type: "POSITION_ACTION", label: decision.title.slice(0, 60), meta: `${decision.decisionDate ?? ""} · action=${decision.action ?? "n/a"} · verified=${decision.verified}` });
        link("person:buffett", `decision:${decision.id}`, "DOCUMENTED");
        if (decision.company) {
          add({ id: `company:${decision.company.slug}`, type: "COMPANY", label: decision.company.name });
          link(`decision:${decision.id}`, `company:${decision.company.slug}`, "TARGETS");
        }
        if (decision.outcome) {
          add({ id: `outcome:${decision.id}`, type: "OUTCOME", label: decision.outcome.slice(0, 60), meta: decision.outcomeSourceUrl ?? "no url" });
          link(`decision:${decision.id}`, `outcome:${decision.id}`, "RESULTED_IN");
        }
      }
      if (theme) {
        add({ id: `theme:${theme.slug}`, type: "THEME", label: theme.name });
        link("person:buffett", `theme:${theme.slug}`, "INDEXED_UNDER");
      }
      return NextResponse.json({ q: "", nodes: [...nodes.values()], edges }, { headers: { "Cache-Control": "no-store" } });
    }

    const lq = q.toLowerCase();

    // People
    const people = await db.person.findMany({
      where: { OR: [{ name: { contains: q, mode: "insensitive" } }, { slug: { contains: lq } }] }, take: 5,
    });
    for (const p of people) {
      add({ id: `person:${p.slug}`, type: "INVESTOR", label: p.name });
      const decs = await db.decision.findMany({ where: { personId: p.id }, include: { company: true }, take: 6 });
      for (const d of decs) {
        add({ id: `decision:${d.id}`, type: "POSITION_ACTION", label: d.title.slice(0, 60), meta: `${d.decisionDate ?? ""} · verified=${d.verified}` });
        link(`person:${p.slug}`, `decision:${d.id}`, "DOCUMENTED");
        if (d.company) {
          add({ id: `company:${d.company.slug}`, type: "COMPANY", label: d.company.name });
          link(`decision:${d.id}`, `company:${d.company.slug}`, "TARGETS");
        }
        if (d.outcome) {
          add({ id: `outcome:${d.id}`, type: "OUTCOME", label: d.outcome.slice(0, 60), meta: d.outcomeSourceUrl ?? "" });
          link(`decision:${d.id}`, `outcome:${d.id}`, "RESULTED_IN");
        }
      }
    }

    // Companies
    const companies = await db.company.findMany({
      where: { OR: [{ name: { contains: q, mode: "insensitive" } }, { slug: { contains: lq } }] }, take: 5,
    });
    for (const c of companies) {
      add({ id: `company:${c.slug}`, type: "COMPANY", label: c.name });
      const decs = await db.decision.findMany({ where: { companyId: c.id }, include: { person: true }, take: 6 });
      for (const d of decs) {
        add({ id: `decision:${d.id}`, type: "POSITION_ACTION", label: d.title.slice(0, 60) });
        link(`person:${d.person.slug}`, `decision:${d.id}`, "DOCUMENTED");
        add({ id: `person:${d.person.slug}`, type: "INVESTOR", label: d.person.name });
        link(`decision:${d.id}`, `company:${c.slug}`, "TARGETS");
      }
    }

    // Themes (via PassageTheme)
    const themes = await db.theme.findMany({
      where: { OR: [{ name: { contains: q, mode: "insensitive" } }, { slug: { contains: lq } }] }, take: 4,
    });
    for (const t of themes) {
      add({ id: `theme:${t.slug}`, type: "THEME", label: t.name });
      const pts = await db.passageTheme.findMany({ where: { themeId: t.id }, include: { passage: { include: { source: { include: { person: true } } } } }, take: 40 });
      const perPerson = new Map<string, number>();
      for (const pt of pts) perPerson.set(pt.passage.source.person.slug, (perPerson.get(pt.passage.source.person.slug) ?? 0) + 1);
      for (const [slug, n] of [...perPerson.entries()].slice(0, 8)) {
        const person = await db.person.findUnique({ where: { slug } });
        if (!person) continue;
        add({ id: `person:${slug}`, type: "INVESTOR", label: person.name, meta: `${n} indexed units` });
        link(`person:${slug}`, `theme:${t.slug}`, "INDEXED_UNDER");
      }
    }

    return NextResponse.json(
      { q, nodes: [...nodes.values()].slice(0, 80), edges: edges.slice(0, 160) },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json({ error: "Graph query failed" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
