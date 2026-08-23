/**
 * scripts/db/build-graph.ts — materialize the Graphify-style knowledge graph.
 *
 * Maps EVERY entity in the corpus into "GraphNode" rows and every relationship
 * into typed "GraphEdge" rows (graph.json format: id/label/kind +
 * relation/confidence/weight), then computes:
 *   - node weights (degree → "god node" ranking)
 *   - communities (label propagation over the investor×theme×company graph)
 *   - cross-investor edges (SHARED_THEME / SHARED_COMPANY, INFERRED)
 *
 * Fully derived data: TRUNCATE + rebuild, safe to run any time. Set-based SQL
 * end to end — the whole graph (≈13k nodes, ≈60k edges) builds in seconds.
 *
 *   DATABASE_URL=... bun scripts/db/build-graph.ts
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function exec(label: string, sql: string) {
  const t0 = Date.now();
  const n = await db.$executeRawUnsafe(sql);
  console.log(`  ${label}: ${n} rows (${Date.now() - t0}ms)`);
}

async function main() {
  console.log("→ resetting graph tables…");
  await db.$executeRawUnsafe(`TRUNCATE TABLE "GraphEdge", "GraphNode"`);

  console.log("→ materializing nodes…");
  await exec(
    "investors",
    `INSERT INTO "GraphNode" (id, kind, label, slug, href, "updatedAt")
     SELECT 'person:' || p.slug, 'investor', p.name, p.slug, '/investors/' || p.slug, now()
     FROM "Person" p`
  );
  await exec(
    "sources",
    `INSERT INTO "GraphNode" (id, kind, label, slug, href, "updatedAt")
     SELECT 'source:' || s.slug, 'source', s.title, s.slug, '/#/view=source&slug=' || s.slug, now()
     FROM "Source" s`
  );
  await exec(
    "passages",
    `INSERT INTO "GraphNode" (id, kind, label, href, "updatedAt")
     SELECT 'passage:' || pa.id, 'passage', 'Reference · ' || COALESCE(s.title, 'source'), '/#/view=source&slug=' || s.slug || '&p=' || pa.id, now()
     FROM "Passage" pa JOIN "Source" s ON s.id = pa."sourceId"`
  );
  await exec(
    "themes",
    `INSERT INTO "GraphNode" (id, kind, label, slug, href, "updatedAt")
     SELECT 'theme:' || t.slug, 'theme', t.name, t.slug, '/themes/' || t.slug, now()
     FROM "Theme" t`
  );
  await exec(
    "concepts",
    `INSERT INTO "GraphNode" (id, kind, label, slug, href, "updatedAt")
     SELECT 'concept:' || c.slug, 'concept', c.name, c.slug, '/#/view=search&concept=' || c.slug, now()
     FROM "Concept" c`
  );
  await exec(
    "companies",
    `INSERT INTO "GraphNode" (id, kind, label, slug, href, "updatedAt")
     SELECT 'company:' || c.slug, 'company', c.name, c.slug, '/companies/' || c.slug, now()
     FROM "Company" c`
  );
  await exec(
    "events",
    `INSERT INTO "GraphNode" (id, kind, label, slug, href, "updatedAt")
     SELECT 'event:' || e.slug, 'event', e.name, e.slug, '/events/' || e.slug, now()
     FROM "Event" e`
  );
  await exec(
    "years",
    `INSERT INTO "GraphNode" (id, kind, label, slug, href, "updatedAt")
     SELECT 'year:' || y, 'year', y::text, y::text, '/years/' || y, now()
     FROM (SELECT DISTINCT year AS y FROM "Source" WHERE year IS NOT NULL) ys`
  );
  await exec(
    "decisions",
    `INSERT INTO "GraphNode" (id, kind, label, slug, href, "updatedAt")
     SELECT 'decision:' || d.id, 'decision', d.title, NULL, '/#/view=investor&slug=' || p.slug, now()
     FROM "Decision" d JOIN "Person" p ON p.id = d."personId"`
  );

  console.log("→ materializing edges (EXTRACTED)…");
  await exec(
    "investor -WROTE→ source",
    `INSERT INTO "GraphEdge" (id, "sourceId", "targetId", relation, confidence, weight)
     SELECT md5('person:' || p.slug || '|source:' || s.slug || '|WROTE'), 'person:' || p.slug, 'source:' || s.slug, 'WROTE', 'EXTRACTED', 1
     FROM "Source" s JOIN "Person" p ON p.id = s."personId"
     ON CONFLICT DO NOTHING`
  );
  await exec(
    "source -CONTAINS→ passage",
    `INSERT INTO "GraphEdge" (id, "sourceId", "targetId", relation, confidence, weight)
     SELECT md5('source:' || s.slug || '|passage:' || pa.id || '|CONTAINS'), 'source:' || s.slug, 'passage:' || pa.id, 'CONTAINS', 'EXTRACTED', 1
     FROM "Passage" pa JOIN "Source" s ON s.id = pa."sourceId"
     ON CONFLICT DO NOTHING`
  );
  await exec(
    "passage -TAGGED→ theme",
    `INSERT INTO "GraphEdge" (id, "sourceId", "targetId", relation, confidence, weight)
     SELECT md5('passage:' || pa.id || '|theme:' || t.slug || '|TAGGED'), 'passage:' || pa.id, 'theme:' || t.slug, 'TAGGED', 'EXTRACTED', 1
     FROM "PassageTheme" pt
     JOIN "Passage" pa ON pa.id = pt."passageId"
     JOIN "Theme" t ON t.id = pt."themeId"
     ON CONFLICT DO NOTHING`
  );
  await exec(
    "passage -COVERS→ concept",
    `INSERT INTO "GraphEdge" (id, "sourceId", "targetId", relation, confidence, weight)
     SELECT md5('passage:' || pa.id || '|concept:' || c.slug || '|COVERS'), 'passage:' || pa.id, 'concept:' || c.slug, 'COVERS', 'EXTRACTED', 1
     FROM "PassageConcept" pc
     JOIN "Passage" pa ON pa.id = pc."passageId"
     JOIN "Concept" c ON c.id = pc."conceptId"
     ON CONFLICT DO NOTHING`
  );
  await exec(
    "passage -MENTIONS→ company",
    `INSERT INTO "GraphEdge" (id, "sourceId", "targetId", relation, confidence, weight)
     SELECT md5('passage:' || pa.id || '|company:' || c.slug || '|MENTIONS'), 'passage:' || pa.id, 'company:' || c.slug, 'MENTIONS', 'EXTRACTED', 1
     FROM "PassageCompany" pco
     JOIN "Passage" pa ON pa.id = pco."passageId"
     JOIN "Company" c ON c.id = pco."companyId"
     ON CONFLICT DO NOTHING`
  );
  await exec(
    "passage -REFERENCES→ event",
    `INSERT INTO "GraphEdge" (id, "sourceId", "targetId", relation, confidence, weight)
     SELECT md5('passage:' || pa.id || '|event:' || e.slug || '|REFERENCES'), 'passage:' || pa.id, 'event:' || e.slug, 'REFERENCES', 'EXTRACTED', 1
     FROM "PassageEvent" pe
     JOIN "Passage" pa ON pa.id = pe."passageId"
     JOIN "Event" e ON e.id = pe."eventId"
     ON CONFLICT DO NOTHING`
  );
  await exec(
    "source -PUBLISHED_IN→ year",
    `INSERT INTO "GraphEdge" (id, "sourceId", "targetId", relation, confidence, weight)
     SELECT md5('source:' || s.slug || '|year:' || s.year || '|PUBLISHED_IN'), 'source:' || s.slug, 'year:' || s.year, 'PUBLISHED_IN', 'EXTRACTED', 1
     FROM "Source" s WHERE s.year IS NOT NULL
     ON CONFLICT DO NOTHING`
  );
  await exec(
    "investor -MADE→ decision",
    `INSERT INTO "GraphEdge" (id, "sourceId", "targetId", relation, confidence, weight)
     SELECT md5('person:' || p.slug || '|decision:' || d.id || '|MADE'), 'person:' || p.slug, 'decision:' || d.id, 'MADE', 'EXTRACTED', 1
     FROM "Decision" d JOIN "Person" p ON p.id = d."personId"
     ON CONFLICT DO NOTHING`
  );
  await exec(
    "decision -REGARDING→ company",
    `INSERT INTO "GraphEdge" (id, "sourceId", "targetId", relation, confidence, weight)
     SELECT md5('decision:' || d.id || '|company:' || c.slug || '|REGARDING'), 'decision:' || d.id, 'company:' || c.slug, 'REGARDING', 'EXTRACTED', 1
     FROM "Decision" d JOIN "Company" c ON c.id = d."companyId" WHERE d."companyId" IS NOT NULL
     ON CONFLICT DO NOTHING`
  );
  await exec(
    "investor -ASSOCIATED_WITH→ company",
    `INSERT INTO "GraphEdge" (id, "sourceId", "targetId", relation, confidence, weight)
     SELECT md5('person:' || p.slug || '|company:' || c.slug || '|ASSOCIATED_WITH'), 'person:' || p.slug, 'company:' || c.slug, 'ASSOCIATED_WITH', 'EXTRACTED', 1
     FROM "PersonCompany" pc JOIN "Person" p ON p.id = pc."personId" JOIN "Company" c ON c.id = pc."companyId"
     ON CONFLICT DO NOTHING`
  );
  await exec(
    "investor -FOCUSES_ON→ theme",
    `INSERT INTO "GraphEdge" (id, "sourceId", "targetId", relation, confidence, weight)
     SELECT md5('person:' || p.slug || '|theme:' || t.slug || '|FOCUSES_ON'), 'person:' || p.slug, 'theme:' || t.slug, 'FOCUSES_ON', 'EXTRACTED', 1
     FROM "PersonTheme" pt JOIN "Person" p ON p.id = pt."personId" JOIN "Theme" t ON t.id = pt."themeId"
     ON CONFLICT DO NOTHING`
  );
  await exec(
    "source -RELATED_TO→ source",
    `INSERT INTO "GraphEdge" (id, "sourceId", "targetId", relation, confidence, weight)
     SELECT md5('source:' || a.slug || '|source:' || b.slug || '|RELATED_TO'), 'source:' || a.slug, 'source:' || b.slug, 'RELATED_TO', 'EXTRACTED', 1
     FROM "RelatedSource" rs JOIN "Source" a ON a.id = rs."sourceAId" JOIN "Source" b ON b.id = rs."sourceBId"
     ON CONFLICT DO NOTHING`
  );

  console.log("→ deriving cross-investor edges (INFERRED)…");
  await exec(
    "investor -SHARED_THEME→ investor (pairs)",
    `INSERT INTO "GraphEdge" (id, "sourceId", "targetId", relation, confidence, weight)
     WITH per_person_theme AS (
       SELECT DISTINCT s."personId" AS person_id, pt."themeId" AS theme_id
       FROM "PassageTheme" pt
       JOIN "Passage" pa ON pa.id = pt."passageId"
       JOIN "Source" s ON s.id = pa."sourceId"
     ),
     pairs AS (
       SELECT a.person_id AS a_id, b.person_id AS b_id, COUNT(*) AS shared
       FROM per_person_theme a
       JOIN per_person_theme b ON a.theme_id = b.theme_id AND a.person_id < b.person_id
       GROUP BY a.person_id, b.person_id
       HAVING COUNT(*) >= 2
     )
     SELECT md5('person:' || pa.slug || '|person:' || pb.slug || '|SHARED_THEME'),
            'person:' || pa.slug, 'person:' || pb.slug, 'SHARED_THEME', 'INFERRED', p.shared
     FROM pairs p JOIN "Person" pa ON pa.id = p.a_id JOIN "Person" pb ON pb.id = p.b_id
     ON CONFLICT DO NOTHING`
  );
  await exec(
    "investor -SHARED_COMPANY→ investor (pairs)",
    `INSERT INTO "GraphEdge" (id, "sourceId", "targetId", relation, confidence, weight)
     WITH per_person_company AS (
       SELECT DISTINCT s."personId" AS person_id, pco."companyId" AS company_id
       FROM "PassageCompany" pco
       JOIN "Passage" pa ON pa.id = pco."passageId"
       JOIN "Source" s ON s.id = pa."sourceId"
     ),
     pairs AS (
       SELECT a.person_id AS a_id, b.person_id AS b_id, COUNT(*) AS shared
       FROM per_person_company a
       JOIN per_person_company b ON a.company_id = b.company_id AND a.person_id < b.person_id
       GROUP BY a.person_id, b.person_id
       HAVING COUNT(*) >= 2
     )
     SELECT md5('person:' || pa.slug || '|person:' || pb.slug || '|SHARED_COMPANY'),
            'person:' || pa.slug, 'person:' || pb.slug, 'SHARED_COMPANY', 'INFERRED', p.shared
     FROM pairs p JOIN "Person" pa ON pa.id = p.a_id JOIN "Person" pb ON pb.id = p.b_id
     ON CONFLICT DO NOTHING`
  );

  console.log("→ materializing lineage/cohort edges (InvestorRelation)…");
  await exec(
    "investor -STUDIES→ investor (lineage)",
    `INSERT INTO "GraphEdge" (id, "sourceId", "targetId", relation, confidence, weight)
     SELECT md5(ir."fromSlug" || '|' || ir."toSlug" || '|' || ir.kind),
            'person:' || ir."fromSlug", 'person:' || ir."toSlug",
            CASE ir.kind WHEN 'apprenticeship' THEN 'STUDIES_WITH'
                         WHEN 'lineage' THEN 'LINEAGE_OF'
                         ELSE 'COHORT_OF' END,
            'INFERRED', 1
     FROM "InvestorRelation" ir
     JOIN "GraphNode" a ON a.id = 'person:' || ir."fromSlug"
     JOIN "GraphNode" b ON b.id = 'person:' || ir."toSlug"
     ON CONFLICT DO NOTHING`
  );

  console.log("→ computing node weights (degree)…");
  await db.$executeRawUnsafe(`
    UPDATE "GraphNode" n SET weight = d.degree
    FROM (
      SELECT node_id, SUM(cnt) AS degree FROM (
        SELECT "sourceId" AS node_id, COUNT(*) AS cnt FROM "GraphEdge" GROUP BY "sourceId"
        UNION ALL
        SELECT "targetId" AS node_id, COUNT(*) AS cnt FROM "GraphEdge" GROUP BY "targetId"
      ) s GROUP BY node_id
    ) d WHERE d.node_id = n.id`);

  console.log("→ computing communities (label propagation over investor×theme×company)…");
  // Seed communities: each investor/theme/company node starts as its own community.
  await db.$executeRawUnsafe(`
    UPDATE "GraphNode" SET "communityId" = NULL`);
  const nodes = await db.$queryRaw<{ id: string; community: number }[]>`
    WITH seeded AS (
      SELECT id, ROW_NUMBER() OVER (ORDER BY id) - 1 AS rn
      FROM "GraphNode" WHERE kind IN ('investor', 'theme', 'company')
    )
    SELECT id, rn AS community FROM seeded`;
  const label = new Map<string, number>(nodes.map((n) => [n.id, n.community]));
  const adj = new Map<string, string[]>();
  const relRows = await db.$queryRaw<{ src: string; tgt: string }[]>`
    SELECT "sourceId" AS src, "targetId" AS tgt FROM "GraphEdge"
    WHERE relation IN ('SHARED_THEME', 'SHARED_COMPANY', 'TAGGED', 'MENTIONS', 'FOCUSES_ON', 'ASSOCIATED_WITH', 'WROTE')`;
  for (const r of relRows) {
    if (!label.has(r.src) || !label.has(r.tgt)) continue;
    if (!adj.has(r.src)) adj.set(r.src, []);
    if (!adj.has(r.tgt)) adj.set(r.tgt, []);
    adj.get(r.src)!.push(r.tgt);
    adj.get(r.tgt)!.push(r.src);
  }
  // Asynchronous label propagation — 12 rounds.
  const ids = [...label.keys()];
  for (let round = 0; round < 12; round++) {
    let changed = 0;
    for (const id of ids) {
      const neighbors = adj.get(id) ?? [];
      if (neighbors.length === 0) continue;
      const counts = new Map<number, number>();
      for (const nb of neighbors) {
        const l = label.get(nb);
        if (l === undefined) continue;
        counts.set(l, (counts.get(l) ?? 0) + 1);
      }
      let best = label.get(id)!;
      let bestCount = -1;
      for (const [l, c] of counts) {
        if (c > bestCount || (c === bestCount && l < best)) {
          best = l;
          bestCount = c;
        }
      }
      if (best !== label.get(id)) {
        label.set(id, best);
        changed++;
      }
    }
    if (changed === 0) break;
  }
  // Persist communities. Node ids are our own slugs; refuse anything with a
  // quote so the IN-list can never be injected through.
  const safe = (s: string) => !s.includes("'") && !s.includes("\\");
  const byCommunity = new Map<number, string[]>();
  for (const [id, c] of label) {
    if (!safe(id)) continue;
    if (!byCommunity.has(c)) byCommunity.set(c, []);
    byCommunity.get(c)!.push(id);
  }
  for (const [c, members] of byCommunity) {
    if (members.length < 2) continue; // isolates stay community-less
    await db.$executeRawUnsafe(
      `UPDATE "GraphNode" SET "communityId" = ${c} WHERE id IN (${members.map((m) => `'${m}'`).join(",")})`
    );
  }

  const [nodeCount, edgeCount] = await Promise.all([
    db.graphNode.count(),
    db.graphEdge.count(),
  ]);
  console.log(
    `✓ graph built: ${nodeCount} nodes, ${edgeCount} edges, ${byCommunity.size} communities.`
  );
}

main()
  .catch((e) => {
    console.error("build-graph failed:", e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
