import { db } from "@/lib/db";
import { json, error } from "@/lib/api";
import { getSessionUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

// GET /api/investors/[slug]/years — year index with counts
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const person = await db.person.findUnique({ where: { slug } });
  if (!person) return error("Investor not found", 404);

  const user = await getSessionUser();
  const isPro = user?.entitlement === "pro";

  const sources = await db.source.findMany({
    where: { personId: person.id, year: { not: null } },
  });

  const yearMap = new Map<number, { year: number; sources: number; passages: number }>();
  for (const s of sources) {
    if (s.year == null) continue;
    const entry = yearMap.get(s.year) ?? { year: s.year, sources: 0, passages: 0 };
    entry.sources += 1;
    yearMap.set(s.year, entry);
  }
  // count passages per year directly
  const passageCounts = await db.passage.groupBy({
    by: ["sourceId"],
    where: {
      source: { personId: person.id },
      visibility: isPro ? { in: ["public", "pro"] } : "public",
    },
    _count: true,
  });
  const sourcePassageCount = new Map<string, number>();
  for (const pc of passageCounts) sourcePassageCount.set(pc.sourceId, pc._count);
  for (const s of sources) {
    if (s.year == null) continue;
    const entry = yearMap.get(s.year)!;
    entry.passages += sourcePassageCount.get(s.id) ?? 0;
    yearMap.set(s.year, entry);
  }

  const years = [...yearMap.values()].sort((a, b) => a.year - b.year);
  return json({ years });
}
