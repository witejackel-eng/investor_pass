import { db } from "@/lib/db";
import { json, error } from "@/lib/api";
import { getSessionUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

// POST /api/admin/import — minimal protected import endpoint (admin only).
// Accepts the JSON shape from the master prompt §25 and inserts records.
export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return error("Authentication required", 401);
  if (user.role !== "admin") return error("Admin access required", 403);

  let body: {
    person?: string;
    source?: { title: string; year?: number; type?: string; url?: string; publisher?: string };
    passages?: { text: string; themes?: string[]; concepts?: string[]; companies?: string[] }[];
  };
  try { body = await req.json(); } catch { return error("Invalid JSON", 400); }
  if (!body.person || !body.source) return error("person and source are required", 400);

  const person = await db.person.findUnique({ where: { slug: body.person } });
  if (!person) return error(`Person '${body.person}' not found`, 404);

  const slug = `${body.person}-${body.source.year ?? "nd"}-${Date.now().toString(36)}`;
  const source = await db.source.create({
    data: {
      personId: person.id,
      slug,
      title: body.source.title,
      sourceType: body.source.type || "imported",
      year: body.source.year ?? null,
      publisher: body.source.publisher || null,
      url: body.source.url || null,
      provenanceStatus: "imported",
    },
  });

  let passageCount = 0;
  for (const p of body.passages || []) {
    const passage = await db.passage.create({
      data: { sourceId: source.id, text: p.text, visibility: "pro", sequence: passageCount++ },
    });
    for (const ts of p.themes || []) {
      const t = await db.theme.upsert({ where: { slug: ts }, update: {}, create: { slug: ts, name: ts.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) } });
      await db.passageTheme.upsert({ where: { passageId_themeId: { passageId: passage.id, themeId: t.id } }, update: {}, create: { passageId: passage.id, themeId: t.id } });
    }
    for (const cs of p.concepts || []) {
      const c = await db.concept.upsert({ where: { slug: cs }, update: {}, create: { slug: cs, name: cs.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) } });
      await db.passageConcept.upsert({ where: { passageId_conceptId: { passageId: passage.id, conceptId: c.id } }, update: {}, create: { passageId: passage.id, conceptId: c.id } });
    }
    for (const co of p.companies || []) {
      const c = await db.company.upsert({ where: { slug: co }, update: {}, create: { slug: co, name: co.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) } });
      await db.passageCompany.upsert({ where: { passageId_companyId: { passageId: passage.id, companyId: c.id } }, update: {}, create: { passageId: passage.id, companyId: c.id } });
    }
  }

  return json({ ok: true, source: { slug, title: source.title, passageCount } });
}
