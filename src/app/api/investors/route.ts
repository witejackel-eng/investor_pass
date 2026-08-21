import { db } from "@/lib/db";
import { json } from "@/lib/api";

export const dynamic = "force-dynamic";

// GET /api/investors — list all people (Buffett active, others coming_later)
export async function GET() {
  const people = await db.person.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      sources: { select: { id: true, year: true }, where: { year: { not: null } } },
      _count: { select: { sources: true, decisions: true } },
    },
  });
  const data = people.map((p) => ({
    slug: p.slug,
    name: p.name,
    shortDescription: p.shortDescription,
    bio: p.bio,
    status: p.status,
    birthYear: p.birthYear,
    sourceCount: p._count.sources,
    decisionCount: p._count.decisions,
    yearSpan:
      p.sources.length > 0
        ? {
            from: Math.min(...p.sources.map((s) => s.year!)),
            to: Math.max(...p.sources.map((s) => s.year!)),
          }
        : null,
  }));
  return json({ investors: data });
}
