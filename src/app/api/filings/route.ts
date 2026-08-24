/**
 * GET /api/filings?q=<text>&country=<US|IN>&company=<slug>&form=<type>&from=<date>&to=<date>&page=<n>&limit=<n>
 *
 * Full-text search across the Filing library. Returns paginated results
 * with text preview + source URL + R2 storage path.
 */
import { db } from "@/lib/db";
import { error } from "@/lib/api";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim() || "";
  const country = url.searchParams.get("country") || undefined;
  const companySlug = url.searchParams.get("company") || undefined;
  const form = url.searchParams.get("form") || undefined;
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(url.searchParams.get("limit") || String(DEFAULT_LIMIT), 10)));

  const where: Record<string, unknown> = {};
  if (country) where.country = country;
  if (companySlug) where.companySlug = companySlug;
  if (form) where.formType = form;
  if (from || to) {
    where.filingDate = {};
    if (from) (where.filingDate as any).gte = new Date(from);
    if (to) (where.filingDate as any).lte = new Date(to);
  }
  if (q) {
    where.OR = [
      { searchText: { ilike: `%${q}%` } },
      { textPreview: { ilike: `%${q}%` } },
      { title: { ilike: `%${q}%` } },
      { companyName: { ilike: `%${q}%` } },
    ];
  }

  try {
    const [filings, total] = await Promise.all([
      db.filing.findMany({
        where,
        orderBy: { filingDate: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true, country: true, companyId: true, companyName: true,
          formType: true, filingDate: true, periodOfReport: true,
          accessionNumber: true, title: true, sourceUrl: true, storagePath: true,
          fileType: true, fileSizeOriginal: true, fileSizeCompressed: true,
          textPreview: true, companySlug: true, personId: true,
        },
      }),
      db.filing.count({ where }),
    ]);

    const [countries, forms, companies] = await Promise.all([
      db.filing.groupBy({ by: ["country"], _count: true, orderBy: { _count: { country: "desc" } } }),
      db.filing.groupBy({ by: ["formType"], _count: true, orderBy: { _count: { formType: "desc" } }, take: 30 }),
      db.filing.groupBy({ by: ["companyName"], _count: true, orderBy: { _count: { companyName: "desc" } }, take: 30 }),
    ]);

    return NextResponse.json({
      filings, total, page, limit,
      hasMore: total > page * limit,
      facets: {
        countries: countries.map((c) => ({ value: c.country, count: c._count })),
        forms: forms.map((f) => ({ value: f.formType, count: f._count })),
        companies: companies.map((c) => ({ value: c.companyName, count: c._count })),
      },
    });
  } catch (e) {
    return error("Filings search failed", 503);
  }
}
