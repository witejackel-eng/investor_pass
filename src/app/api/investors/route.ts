import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GET /api/investors — list all people (Buffett active, others coming_later)
export async function GET() {
  const people = await db.person.findMany({
    orderBy: { sortOrder: "asc" },
    select: {
      slug: true,
      name: true,
      shortDescription: true,
      bio: true,
      status: true,
      birthYear: true,
      kind: true,
      region: true,
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
    kind: p.kind,
    region: p.region,
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
  return NextResponse.json(
    { investors: data },
    // Session-independent public data — safe to cache at the edge + in browsers.
    { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } }
  );
}
