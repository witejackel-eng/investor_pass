import { isAllAccess } from "@/lib/promo";
import { db } from "@/lib/db";
import { json, error } from "@/lib/api";
import { getSessionUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const person = await db.person.findUnique({ where: { slug } });
  if (!person) return error("Investor not found", 404);

  const user = await getSessionUser();
  const isPro = (user?.entitlement === "pro" || isAllAccess());

  const companies = await db.company.findMany({
    where: { persons: { some: { personId: person.id } } },
    include: {
      industry: true,
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

  const data = companies
    .map((c) => {
      const years = [...new Set(c.passages.map((pc) => pc.passage.source.year).filter(Boolean))] as number[];
      return {
        slug: c.slug,
        name: c.name,
        canonicalName: c.canonicalName,
        ticker: c.ticker,
        industry: c.industry ? { slug: c.industry.slug, name: c.industry.name } : null,
        description: c.description,
        passageCount: c.passages.length,
        years: years.sort((a, b) => a - b),
      };
    })
    .sort((a, b) => b.passageCount - a.passageCount);

  return json({ companies: data });
}
