/**
 * Seeds the Decision Ledger from data/decisions/*.json.
 * Idempotent: keyed on (personId, title). Uses upsert so re-running
 * updates tags/fields on existing rows. Run: bun scripts/seed-decisions.ts
 */
import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const dir = join(process.cwd(), "data", "decisions");
  const files = readdirSync(dir).filter((f) => f.endsWith(".json"));

  for (const file of files) {
    const personSlug = file.replace(".json", "");
    const person = await db.person.findUnique({ where: { slug: personSlug } });
    if (!person) {
      console.log(`skip ${file}: person '${personSlug}' not found`);
      continue;
    }
    const entries = JSON.parse(readFileSync(join(dir, file), "utf-8"));
    let created = 0;
    let updated = 0;
    for (const e of entries) {
      // Find existing by (personId, title) — the unique business key.
      const existing = await db.decision.findFirst({
        where: { personId: person.id, title: e.title },
        select: { id: true },
      });
      const tags = Array.isArray(e.tags) ? e.tags : [];
      const data = {
        personId: person.id,
        title: e.title,
        decisionDate: e.decisionDate ?? null,
        action: e.action ?? null,
        statement: e.statement ?? null,
        outcome: e.outcome ?? null,
        outcomeSourceUrl: e.outcomeSourceUrl ?? null,
        confidence: e.confidence ?? "medium",
        verified: Boolean(e.verified),
        tags,
        description: Array.isArray(e.tags) && e.tags.length ? `tags: ${e.tags.join(",")}` : null,
      };
      if (existing) {
        await db.decision.update({ where: { id: existing.id }, data });
        updated++;
      } else {
        await db.decision.create({ data });
        created++;
      }
    }
    console.log(`${personSlug}: created=${created} updated=${updated}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
