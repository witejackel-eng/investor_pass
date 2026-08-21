import { searchPassages, type SearchFilters } from "@/lib/server/search";
import { getSessionUser } from "@/lib/auth/session";
import { json, error } from "@/lib/api";

export const dynamic = "force-dynamic";

// GET /api/search?q=...&person=buffett&yearFrom=...&yearTo=...&theme=...&company=...&sourceType=...&decade=...
export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q") || "";
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
  const pageSize = Math.min(50, Math.max(1, parseInt(url.searchParams.get("pageSize") || "20", 10)));

  const filters: SearchFilters = {
    person: url.searchParams.get("person") || undefined,
    yearFrom: url.searchParams.get("yearFrom") ? parseInt(url.searchParams.get("yearFrom")!, 10) : undefined,
    yearTo: url.searchParams.get("yearTo") ? parseInt(url.searchParams.get("yearTo")!, 10) : undefined,
    decade: url.searchParams.get("decade") ? parseInt(url.searchParams.get("decade")!, 10) : undefined,
    sourceType: url.searchParams.get("sourceType") || undefined,
    theme: url.searchParams.get("theme") || undefined,
    concept: url.searchParams.get("concept") || undefined,
    company: url.searchParams.get("company") || undefined,
    event: url.searchParams.get("event") || undefined,
  };

  const user = await getSessionUser();
  const isPro = user?.entitlement === "pro";

  const result = await searchPassages(q, filters, isPro, page, pageSize);

  return json({
    query: q,
    filters,
    isPro,
    ...result,
  });
}
