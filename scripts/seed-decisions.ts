/**
 * Seeds the Decision Ledger from data/decisions/*.json.
 * Idempotent: keyed on (personId, title). Run: bun scripts/seed-decisions.ts
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
    let skipped = 0;
    for (const e of entries) {
      const existing = await db.decision.findFirst({
        where: { personId: person.id, title: e.title },
        select: { id: true },
      });
      if (existing) {
        skipped++;
        continue;
      }
      await db.decision.create({
        data: {
          personId: person.id,
          title: e.title,
          decisionDate: e.decisionDate ?? null,
          action: e.action ?? null,
          statement: e.statement ?? null,
          outcome: e.outcome ?? null,
          outcomeSourceUrl: e.outcomeSourceUrl ?? null,
          confidence: e.confidence ?? "medium",
          verified: Boolean(e.verified),
          description: Array.isArray(e.tags) ? `tags: ${e.tags.join(",")}` : null,
        },
      });
      created++;
    }
    console.log(`${personSlug}: created=${created} skipped=${skipped}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
