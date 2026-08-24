import { isAllAccess } from "@/lib/promo";
import { db } from "@/lib/db";
import { json, error } from "@/lib/api";
import { getSessionUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

// GET /api/investors/[slug]/themes — themes for an investor with passage counts
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const person = await db.person.findUnique({ where: { slug } });
  if (!person) return error("Investor not found", 404);

  const user = await getSessionUser();
  const isPro = (user?.entitlement === "pro" || isAllAccess());

  const themes = await db.theme.findMany({
    where: { persons: { some: { personId: person.id } } },
    include: {
      passages: {
        where: {
          passage: {
            source: { personId: person.id },
            visibility: isPro ? { in: ["public", "pro"] } : "public",
          },
        },
        include: { passage: { include: { source: true } } },
      },
    },
  });

  const data = themes
    .map((t) => {
      const years = [...new Set(t.passages.map((pt) => pt.passage.source.year).filter(Boolean))] as number[];
      const companies = new Set<string>();
      return {
        slug: t.slug,
        name: t.name,
        description: t.description,
        passageCount: t.passages.length,
        years: years.sort((a, b) => a - b),
      };
    })
    .sort((a, b) => b.passageCount - a.passageCount);

  return json({ themes: data });
}
