import { isAllAccess } from "@/lib/promo";
import { searchPassages, type SearchFilters } from "@/lib/server/search";
import { getSessionUser } from "@/lib/auth/session";
import { json, error } from "@/lib/api";

export const dynamic = "force-dynamic";

// GET /api/search?q=...&person=buffett&yearFrom=...&yearTo=...&theme=...&company=...&sourceType=...&decade=...
// Query strings are parsed server-side into structured filters (intent.ts);
// explicit filter params win over entities parsed from the query.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q") || "";
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
  const pageSize = Math.min(50, Math.max(1, parseInt(url.searchParams.get("pageSize") || "20", 10)));

  const num = (key: string) => {
    const v = url.searchParams.get(key);
    if (!v) return undefined;
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : undefined;
  };

  const filters: SearchFilters = {
    person: url.searchParams.get("person") || undefined,
    yearFrom: num("yearFrom"),
    yearTo: num("yearTo"),
    decade: num("decade"),
    sourceType: url.searchParams.get("sourceType") || undefined,
    theme: url.searchParams.get("theme") || undefined,
    concept: url.searchParams.get("concept") || undefined,
    company: url.searchParams.get("company") || undefined,
    event: url.searchParams.get("event") || undefined,
  };

  const user = await getSessionUser();
  const isPro = (user?.entitlement === "pro" || isAllAccess());

  try {
    const result = await searchPassages(q, filters, isPro, page, pageSize);
    return json({
      query: q,
      filters,
      isPro,
      ...result,
    });
  } catch {
    return error("Search is temporarily unavailable. Try again in a moment.", 500);
  }
}
