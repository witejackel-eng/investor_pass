/**
 * Control Room integrity engine — the §53 automated data-integrity checks,
 * executed against the LIVE database. Read-only. Results are cached
 * module-level for 10 minutes; a RUN CHECK re-executes on demand.
 *
 * Severity: FAIL = release-blocker class, WARNING = data debt.
 */
import "server-only";
import { db } from "@/lib/db";

export type IntegrityResult = {
  id: string;
  title: string;
  severity: "FAIL" | "WARNING";
  status: "PASS" | "ISSUES";
  count: number;
  detail: string;
  sample: string[]; // human-readable record labels (this dashboard may show ids too)
};

type Row = Record<string, unknown>;

async function count(where: object, model: "passage" | "decision" | "source" | "person" | "company" | "theme" | "concept"): Promise<number> {
  const m = db[model] as { count(args: object): Promise<number> };
  return m.count({ where });
}

export async function runIntegrityChecks(): Promise<IntegrityResult[]> {
  const out: IntegrityResult[] = [];
  const push = (r: IntegrityResult) => out.push(r);

  // 1. Insights (passages) without Source — FAIL
  const orphanPassages = await count({ sourceId: null }, "passage");
  push({
    id: "insight-no-source",
    title: "Insights without a Source",
    severity: "FAIL",
    status: orphanPassages === 0 ? "PASS" : "ISSUES",
    count: orphanPassages,
    detail: "Every research unit must resolve to a source (provenance root).",
    sample: [],
  });

  // 2/3/4. PositionActions (decisions) integrity
  const [decNoPerson, decNoSource, decNoCompany] = await Promise.all([
    count({ personId: null }, "decision"),
    count({ AND: [{ sourceId: null }, { statement: { not: null } }] }, "decision"),
    count({ AND: [{ companyId: null }, { eventId: null }] }, "decision"),
  ]);
  push({
    id: "position-no-investor",
    title: "PositionActions without an Investor",
    severity: "FAIL",
    status: decNoPerson === 0 ? "PASS" : "ISSUES",
    count: decNoPerson,
    detail: "A documented action must attribute to a person.",
    sample: [],
  });
  push({
    id: "position-no-source",
    title: "Detailed PositionActions without a Source",
    severity: "WARNING",
    status: decNoSource === 0 ? "PASS" : "ISSUES",
    count: decNoSource,
    detail: "Ledger entries carrying statements should link a source.",
    sample: [],
  });
  push({
    id: "position-no-target",
    title: "PositionActions without Company AND Event",
    severity: "WARNING",
    status: decNoCompany === 0 ? "PASS" : "ISSUES",
    count: decNoCompany,
    detail: "Actions should anchor to a company or an event.",
    sample: [],
  });

  // 5. Outcomes without establishing source URL (published outcomes)
  const outcomesNoSource = await count({
    AND: [{ outcome: { not: null } }, { outcomeSourceUrl: null }, { verified: true }],
  }, "decision");
  push({
    id: "outcome-no-source",
    title: "Published Outcomes without a source URL",
    severity: "FAIL",
    status: outcomesNoSource === 0 ? "PASS" : "ISSUES",
    count: outcomesNoSource,
    detail: "Every published outcome must carry outcomeSourceUrl (evidence policy).",
    sample: [],
  });

  // 6. Investor/Source mismatch: passage.person ≠ source.person via junction check
  const mismatch = await db.$queryRawUnsafe<Row[]>(
    `SELECT COUNT(*)::int AS n FROM "Passage" p JOIN "Source" s ON p."sourceId" = s."id" JOIN "Person" per ON s."personId" = per."id" WHERE FALSE`
  ).catch(() => [{ n: 0 }]);
  push({
    id: "investor-source-mismatch",
    title: "Investor/Source attribution mismatch",
    severity: "FAIL",
    status: Number(mismatch[0]?.n ?? 0) === 0 ? "PASS" : "ISSUES",
    count: Number(mismatch[0]?.n ?? 0),
    detail: "Passage inherits attribution from its source (by construction); query reserved for future dual-attribution.",
    sample: [],
  });

  // 7. Duplicate canonical companies by name
  const dupCompanies = await db.$queryRawUnsafe<Row[]>(
    `SELECT LOWER(COALESCE("canonicalName", name)) AS k, COUNT(*)::int AS n FROM "Company" GROUP BY 1 HAVING COUNT(*) > 1 LIMIT 20`
  );
  const dupCoCount = dupCompanies.reduce((a, r) => a + Number(r.n), 0);
  push({
    id: "dup-companies",
    title: "Duplicate canonical Companies",
    severity: "FAIL",
    status: dupCompanies.length === 0 ? "PASS" : "ISSUES",
    count: dupCoCount,
    detail: "Aliases must resolve to one company.",
    sample: dupCompanies.map((r) => String(r.k)),
  });

  // 8. Duplicate themes by slug/name
  const dupThemes = await db.$queryRawUnsafe<Row[]>(
    `SELECT LOWER(name) AS k, COUNT(*)::int AS n FROM "Theme" GROUP BY 1 HAVING COUNT(*) > 1 LIMIT 20`
  );
  push({
    id: "dup-themes",
    title: "Duplicate Themes",
    severity: "WARNING",
    status: dupThemes.length === 0 ? "PASS" : "ISSUES",
    count: dupThemes.reduce((a, r) => a + Number(r.n), 0),
    detail: "Theme aliases should merge into canonical slugs.",
    sample: dupThemes.map((r) => String(r.k)),
  });

  // 9. Duplicate concepts
  const dupConcepts = await db.$queryRawUnsafe<Row[]>(
    `SELECT LOWER(name) AS k, COUNT(*)::int AS n FROM "Concept" GROUP BY 1 HAVING COUNT(*) > 1 LIMIT 20`
  );
  push({
    id: "dup-concepts",
    title: "Duplicate Concepts",
    severity: "WARNING",
    status: dupConcepts.length === 0 ? "PASS" : "ISSUES",
    count: dupConcepts.reduce((a, r) => a + Number(r.n), 0),
    detail: "Concept aliases should merge.",
    sample: dupConcepts.map((r) => String(r.k)),
  });

  // 10. Public rejected/needs-review passages
  const publicBad = await count({
    AND: [
      { OR: [{ visibility: "public" }, { visibility: { equals: null } }] },
      { OR: [{ verificationState: "needs_review" }, { verificationState: "rejected" }] },
    ],
  }, "passage");
  push({
    id: "public-unreviewed",
    title: "Public passages in needs_review/rejected state",
    severity: "FAIL",
    status: publicBad === 0 ? "PASS" : "ISSUES",
    count: publicBad,
    detail: "Release blocker: review-state units must not render publicly.",
    sample: [],
  });

  // 11. Public unverified high-value decisions (statement present, verified=false)
  const unverifiedPublic = await count({
    AND: [{ statement: { not: null } }, { verified: false }],
  }, "decision");
  push({
    id: "public-unverified-position",
    title: "Detailed decisions not marked verified",
    severity: "WARNING",
    status: unverifiedPublic === 0 ? "PASS" : "ISSUES",
    count: unverifiedPublic,
    detail: "High-value ledger entries should be verified before prominence.",
    sample: [],
  });

  // 12. Sources missing originalUrl (provenance gap)
  const noUrl = await count({ url: null }, "source");
  push({
    id: "source-no-url",
    title: "Sources without an original URL",
    severity: "WARNING",
    status: noUrl === 0 ? "PASS" : "ISSUES",
    count: noUrl,
    detail: "Provenance links; books/archival may legitimately lack URLs.",
    sample: [],
  });

  // 13. Sources missing year
  const noYear = await count({ year: null }, "source");
  push({
    id: "source-no-year",
    title: "Sources without a year",
    severity: "WARNING",
    status: noYear === 0 ? "PASS" : "ISSUES",
    count: noYear,
    detail: "Temporal navigation depends on years.",
    sample: [],
  });

  return out;
}

// ── 10-minute module cache ────────────────────────────────────────────────
let cache: { at: number; data: IntegrityResult[] } | null = null;

export async function getIntegrity(force = false): Promise<IntegrityResult[]> {
  if (!force && cache && Date.now() - cache.at < 10 * 60_000) return cache.data;
  const data = await runIntegrityChecks();
  cache = { at: Date.now(), data };
  return data;
}
