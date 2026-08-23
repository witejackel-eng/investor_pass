/**
 * Server-side queries over the Graphify-style knowledge graph
 * (GraphNode/GraphEdge — see scripts/db/build-graph.ts).
 *
 * All payloads are public metadata only: node labels/hrefs/weights and edge
 * relations/weights. Passage text never crosses this boundary.
 */
import "server-only";
import { db } from "@/lib/db";
import { cache } from "react";

export type GraphSummary = {
  nodes: { total: number; byKind: Record<string, number> };
  edges: { total: number; byRelation: Record<string, number> };
  godNodes: {
    id: string;
    kind: string;
    label: string;
    href: string | null;
    weight: number;
    communityId: number | null;
  }[];
  communities: {
    id: number;
    size: number;
    topNodes: { id: string; kind: string; label: string }[];
  }[];
};

/** Whole-graph stats: counts, god nodes (highest degree), communities. */
export const getGraphSummary = cache(async (): Promise<GraphSummary> => {
  const [byKind, byRelation, godNodes, communityRows] = await Promise.all([
    db.graphNode.groupBy({ by: ["kind"], _count: { _all: true } }),
    db.graphEdge.groupBy({ by: ["relation"], _count: { _all: true } }),
    db.graphNode.findMany({
      where: { kind: { not: "passage" } },
      orderBy: { weight: "desc" },
      take: 14,
      select: { id: true, kind: true, label: true, href: true, weight: true, communityId: true },
    }),
    db.graphNode.groupBy({
      by: ["communityId"],
      _count: { _all: true },
      where: { communityId: { not: null } },
      orderBy: { _count: { communityId: "desc" } },
      take: 6,
    }),
  ]);

  const communities = await Promise.all(
    communityRows.map(async (c) => {
      const topNodes = await db.graphNode.findMany({
        where: { communityId: c.communityId },
        orderBy: { weight: "desc" },
        take: 4,
        select: { id: true, kind: true, label: true },
      });
      return {
        id: c.communityId!,
        size: c._count._all,
        topNodes,
      };
    })
  );

  return {
    nodes: {
      total: byKind.reduce((s, k) => s + k._count._all, 0),
      byKind: Object.fromEntries(byKind.map((k) => [k.kind, k._count._all])),
    },
    edges: {
      total: byRelation.reduce((s, r) => s + r._count._all, 0),
      byRelation: Object.fromEntries(byRelation.map((r) => [r.relation, r._count._all])),
    },
    godNodes,
    communities,
  };
});

export type NetworkNode = {
  id: string;
  kind: "investor" | "theme";
  label: string;
  slug: string | null;
  href: string | null;
  weight: number;
  communityId: number | null;
};

export type NetworkLink = {
  source: string;
  target: string;
  relation: string;
  weight: number;
};

export type InvestorNetwork = {
  investors: NetworkNode[];
  themes: NetworkNode[];
  links: NetworkLink[];
};

/**
 * The investor cross-reference network: every investor, the strongest
 * investor→theme links, and every investor↔investor SHARED_THEME /
 * SHARED_COMPANY edge — the "who connects to whom" map.
 */
export const getInvestorNetwork = cache(async (): Promise<InvestorNetwork> => {
  const investors = await db.graphNode.findMany({
    where: { kind: "investor" },
    select: { id: true, kind: true, label: true, slug: true, href: true, weight: true, communityId: true },
    orderBy: { weight: "desc" },
  });

  // Investor↔investor cross edges.
  const crossEdges = await db.graphEdge.findMany({
    where: { relation: { in: ["SHARED_THEME", "SHARED_COMPANY"] }, source: { kind: "investor" } },
    select: { sourceId: true, targetId: true, relation: true, weight: true },
  });

  // Strongest investor→theme links, computed passage-side for honest weights.
  type ThemeLink = { person_slug: string; theme_slug: string; theme_name: string; cnt: number };
  const themeLinks = await db.$queryRaw<ThemeLink[]>`
    WITH per_person_theme AS (
      SELECT s."personId" AS person_id, pt."themeId" AS theme_id, COUNT(*) AS cnt
      FROM "PassageTheme" pt
      JOIN "Passage" pa ON pa.id = pt."passageId"
      JOIN "Source" s ON s.id = pa."sourceId"
      GROUP BY s."personId", pt."themeId"
    ),
    ranked AS (
      SELECT person_id, theme_id, cnt,
             ROW_NUMBER() OVER (PARTITION BY person_id ORDER BY cnt DESC, theme_id ASC) AS rn
      FROM per_person_theme
    )
    SELECT per.slug AS person_slug, t.slug AS theme_slug, t.name AS theme_name, r.cnt::int AS cnt
    FROM ranked r
    JOIN "Person" per ON per.id = r.person_id
    JOIN "Theme" t ON t.id = r.theme_id
    WHERE r.rn <= 6`;

  const themeNodes = new Map<string, NetworkNode>();
  const links: NetworkLink[] = [];

  for (const tl of themeLinks) {
    const themeId = `theme:${tl.theme_slug}`;
    if (!themeNodes.has(themeId)) {
      themeNodes.set(themeId, {
        id: themeId,
        kind: "theme",
        label: tl.theme_name,
        slug: tl.theme_slug,
        href: `/themes/${tl.theme_slug}`,
        weight: tl.cnt,
        communityId: null,
      });
    }
    links.push({
      source: `person:${tl.person_slug}`,
      target: themeId,
      relation: "FOCUSES_ON",
      weight: tl.cnt,
    });
  }

  for (const e of crossEdges) {
    links.push({ source: e.sourceId, target: e.targetId, relation: e.relation, weight: e.weight });
  }

  return {
    investors: investors as NetworkNode[],
    themes: [...themeNodes.values()],
    links,
  };
});

export type GraphNeighbor = {
  id: string;
  kind: string;
  label: string;
  href: string | null;
  relation: string;
  direction: "out" | "in";
  weight: number;
};

export type GraphNodeDetail = {
  node: { id: string; kind: string; label: string; href: string | null; weight: number; communityId: number | null };
  neighbors: GraphNeighbor[];
};

/** Ego neighborhood of any node: its edges with the other side's node info. */
export const getGraphNode = cache(async (id: string): Promise<GraphNodeDetail | null> => {
  const node = await db.graphNode.findUnique({
    where: { id },
    select: { id: true, kind: true, label: true, href: true, weight: true, communityId: true },
  });
  if (!node) return null;

  // Passage/source neighbors are capped so the payload stays bounded; the
  // cross-investor and entity edges always come through whole.
  const rows = await db.$queryRaw<GraphNeighbor[]>`
    SELECT CASE WHEN e."sourceId" = ${id} THEN e."targetId" ELSE e."sourceId" END AS id,
           n.kind,
           n.label,
           n.href,
           e.relation,
           CASE WHEN e."sourceId" = ${id} THEN 'out' ELSE 'in' END AS direction,
           e.weight
    FROM "GraphEdge" e
    JOIN "GraphNode" n ON n.id = CASE WHEN e."sourceId" = ${id} THEN e."targetId" ELSE e."sourceId" END
    WHERE e."sourceId" = ${id} OR e."targetId" = ${id}
    ORDER BY (n.kind = 'passage') ASC, e.weight DESC, n.label ASC
    LIMIT 120`;

  return { node, neighbors: rows };
});

/** Cross-investor connections for a public investor page (SSR). */
export type InvestorConnection = {
  slug: string;
  name: string;
  sharedThemes: number;
  sharedCompanies: number;
};

export const getInvestorConnections = cache(async (slug: string): Promise<InvestorConnection[]> => {
  const rows = await db.$queryRaw<InvestorConnection[]>`
    WITH x AS (
      SELECT
        CASE WHEN e."sourceId" = 'person:' || ${slug} THEN e."targetId" ELSE e."sourceId" END AS other_id,
        SUM(CASE WHEN e.relation = 'SHARED_THEME' THEN e.weight ELSE 0 END) AS shared_themes,
        SUM(CASE WHEN e.relation = 'SHARED_COMPANY' THEN e.weight ELSE 0 END) AS shared_companies
      FROM "GraphEdge" e
      WHERE (e."sourceId" = 'person:' || ${slug} OR e."targetId" = 'person:' || ${slug})
        AND e.relation IN ('SHARED_THEME', 'SHARED_COMPANY')
      GROUP BY 1
    )
    SELECT p.slug, p.name,
           COALESCE(x.shared_themes, 0)::int AS "sharedThemes",
           COALESCE(x.shared_companies, 0)::int AS "sharedCompanies"
    FROM x JOIN "GraphNode" g ON g.id = x.other_id
           JOIN "Person" p ON p.slug = REPLACE(g.id, 'person:', '')
    ORDER BY (COALESCE(x.shared_themes, 0) + COALESCE(x.shared_companies, 0)) DESC, p.name ASC
    LIMIT 8`;
  return rows;
});
