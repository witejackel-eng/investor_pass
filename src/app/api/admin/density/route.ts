/**
 * GET /api/admin/density — corpus density dashboard (Master Plan PHASE 27-28).
 * Admin-only. Per-investor coverage profile and per-theme investor density,
 * all database-derived, plus tier classification (A/B/C by cross-link
 * density) so weak investors are visible before users find them.
 */
import { db } from "@/lib/db";
import { json, error } from "@/lib/api";
import { getSessionUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return error("Authentication required", 401);
  if (user.role !== "admin") return error("Admin access required", 403);

  try {
    // Per-investor coverage (PHASE 27)
    const investors = await db.$queryRaw<
      {
        slug: string;
        name: string;
        sources: number;
        passages: number;
        public_passages: number;
        themes: number;
        companies: number;
        decisions: number;
        years_from: number | null;
        years_to: number | null;
        cross_links: number;
        verified_pct: number;
      }[]
    >`
      WITH per_person AS (
        SELECT p.id, p.slug, p.name,
          (SELECT COUNT(*) FROM "Source" s WHERE s."personId" = p.id) AS sources,
          (SELECT COUNT(*) FROM "Passage" pa JOIN "Source" s ON s.id = pa."sourceId" WHERE s."personId" = p.id) AS passages,
          (SELECT COUNT(*) FROM "Passage" pa JOIN "Source" s ON s.id = pa."sourceId" WHERE s."personId" = p.id AND pa.visibility = 'public') AS public_passages,
          (SELECT COUNT(DISTINCT pt."themeId") FROM "PassageTheme" pt
             JOIN "Passage" pa ON pa.id = pt."passageId"
             JOIN "Source" s ON s.id = pa."sourceId" WHERE s."personId" = p.id) AS themes,
          (SELECT COUNT(DISTINCT pco."companyId") FROM "PassageCompany" pco
             JOIN "Passage" pa ON pa.id = pco."passageId"
             JOIN "Source" s ON s.id = pa."sourceId" WHERE s."personId" = p.id) AS companies,
          (SELECT COUNT(*) FROM "Decision" d WHERE d."personId" = p.id) AS decisions,
          (SELECT MIN(s.year) FROM "Source" s WHERE s."personId" = p.id AND s.year IS NOT NULL) AS years_from,
          (SELECT MAX(s.year) FROM "Source" s WHERE s."personId" = p.id AND s.year IS NOT NULL) AS years_to,
          (SELECT COUNT(*) FROM "GraphEdge" ge
             WHERE (ge."sourceId" = 'person:' || p.slug OR ge."targetId" = 'person:' || p.slug)
               AND ge.relation IN ('SHARED_THEME','SHARED_COMPANY','STUDIES_WITH','LINEAGE_OF','COHORT_OF')) AS cross_links,
          (SELECT CASE WHEN COUNT(*) = 0 THEN 100 ELSE
             100.0 * SUM(CASE WHEN pa."verificationState" = 'verified' THEN 1 ELSE 0 END) / COUNT(*)
             END
           FROM "Passage" pa JOIN "Source" s ON s.id = pa."sourceId" WHERE s."personId" = p.id) AS verified_pct
        FROM "Person" p WHERE p.status = 'active'
      )
      SELECT slug, name, sources::int AS sources, passages::int AS passages,
             public_passages::int AS public_passages, themes::int AS themes,
             companies::int AS companies, decisions::int AS decisions,
             years_from, years_to, cross_links::int AS cross_links,
             ROUND(verified_pct)::int AS verified_pct
      FROM per_person
      ORDER BY passages DESC`;

    // Tier classification: cross-link density (plan §45)
    const tiered = investors.map((inv) => ({
      ...inv,
      tier:
        inv.passages >= 1000 ? "A" :
        inv.passages >= 100 ? "B" :
        "C",
    }));

    // Per-theme density (PHASE 28)
    const themes = await db.$queryRaw<
      { slug: string; name: string; investors: number; passages: number; companies: number }[]
    >`
      SELECT t.slug, t.name,
        (SELECT COUNT(DISTINCT s."personId") FROM "PassageTheme" pt
           JOIN "Passage" pa ON pa.id = pt."passageId"
           JOIN "Source" s ON s.id = pa."sourceId"
           WHERE pt."themeId" = t.id AND s."personId" IS NOT NULL)::int AS investors,
        (SELECT COUNT(*) FROM "PassageTheme" pt WHERE pt."themeId" = t.id)::int AS passages,
        (SELECT COUNT(DISTINCT pco."companyId") FROM "PassageTheme" pt
           JOIN "Passage" pa ON pa.id = pt."passageId"
           JOIN "PassageCompany" pco ON pco."passageId" = pa.id
           WHERE pt."themeId" = t.id)::int AS companies
      FROM "Theme" t
      ORDER BY investors DESC, passages DESC`;

    // Decisions per theme: investors who write on the theme AND have decisions.
    const themeDecisions = await db.$queryRaw<{ slug: string; decisions: number }[]>`
      SELECT t.slug,
        (SELECT COUNT(DISTINCT d.id) FROM "Decision" d
           JOIN "Person" p2 ON p2.id = d."personId"
           WHERE EXISTS (
             SELECT 1 FROM "PassageTheme" pt
               JOIN "Passage" pa ON pa.id = pt."passageId"
               JOIN "Source" s ON s.id = pa."sourceId"
             WHERE pt."themeId" = t.id AND s."personId" = p2.id
           ))::int AS decisions
      FROM "Theme" t`;
    const decisionByTheme = new Map(themeDecisions.map((r) => [r.slug, r.decisions]));

    const strongThemes = themes
      .filter((t) => t.investors >= 5)
      .map((t) => ({ ...t, decisions: decisionByTheme.get(t.slug) ?? 0 }));
    const weakThemes = themes.filter((t) => t.investors < 3);

    return json({
      generatedAt: new Date().toISOString(),
      investors: tiered,
      tierSummary: {
        A: tiered.filter((t) => t.tier === "A").length,
        B: tiered.filter((t) => t.tier === "B").length,
        C: tiered.filter((t) => t.tier === "C").length,
      },
      strongThemes,
      weakThemes: weakThemes.map((t) => ({ slug: t.slug, name: t.name, investors: t.investors })),
    });
  } catch (e) {
    console.error("[admin-density]", e instanceof Error ? e.message : e);
    return error("Density dashboard is temporarily unavailable.", 503);
  }
}
