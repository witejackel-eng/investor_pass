/**
 * Paraphrase expansion pipeline (editorial, constitution-compliant).
 *
 * Goal: research units that are too thin get combined into fuller, richer
 * paraphrases — WITHOUT inventing a single fact. The only safe expansion is
 * merging sequence-adjacent units from the SAME source (they paraphrase the
 * same original document, so concatenation preserves every claim and keeps
 * provenance intact).
 *
 * Rules (docs/EVIDENCE_AND_RIGHTS_POLICY.md):
 * - Dry-run by default → writes proposals to scripts/out/paraphrase-proposals.json
 * - `--apply` executes merges in a transaction:
 *     · survivor keeps the first unit's id (stable public links)
 *     · text = joined texts, whitespace-normalized, dedup overlapping tail/head
 *     · context/section/page = first non-null + "[merged N units]" note
 *     · all PassageTheme/Concept/Company/Event junctions re-pointed to survivor
 *     · visibility = strictest of merged units ("pro" if any was "pro")
 *     · verificationState = "needs_review" (a human re-approves before it
 *       counts as verified — agents never auto-verify)
 * - Passages in needs_review/rejected are skipped entirely.
 * - Backup: scripts/out/paraphrase-backup-<ts>.json (full rows of every
 *   modified/deleted passage) before any mutation.
 *
 * Run: DATABASE_URL=... bun scripts/expand-paraphrases.ts [--apply] [--min=240] [--max=1600] [--runs=2]
 */
import { PrismaClient } from "@prisma/client";
import { writeFileSync, mkdirSync } from "fs";

const db = new PrismaClient();
const args = process.argv.slice(2);
const APPLY = args.includes("--apply");
const arg = (k: string, d: number) => {
  const a = args.find((x) => x.startsWith(`--${k}=`));
  return a ? Number(a.split("=")[1]) : d;
};
const MIN_CHARS = arg("min", 240);   // units below this are "thin"
const MAX_CHARS = arg("max", 1600);  // merged result must stay under this
const MAX_RUNS = arg("runs", 4);     // max units per merge

type P = { id: string; sourceId: string; sequence: number; text: string; context: string | null; section: string | null; page: string | null; visibility: string; verificationState: string };

function normalizeJoin(a: string, b: string): string {
  const head = a.trim().replace(/\s+/g, " ");
  const tail = b.trim().replace(/\s+/g, " ");
  // If the tail repeats the head's ending (ingest artifact), cut the overlap.
  const words = head.split(" ");
  for (let n = Math.min(12, words.length, tail.split(" ").length); n >= 4; n--) {
    const headEnd = words.slice(-n).join(" ").toLowerCase();
    if (tail.toLowerCase().startsWith(headEnd)) {
      return head + " " + tail.slice(headEnd.length).trim();
    }
  }
  return head + " " + tail;
}

async function main() {
  console.log(`Paraphrase expansion — ${APPLY ? "APPLY" : "DRY RUN"} (min=${MIN_CHARS} max=${MAX_CHARS} runs≤${MAX_RUNS})`);
  const passages = (await db.passage.findMany({
    orderBy: [{ sourceId: "asc" }, { sequence: "asc" }],
    select: { id: true, sourceId: true, sequence: true, text: true, context: true, section: true, page: true, visibility: true, verificationState: true },
  })) as P[];

  const lens = passages.map((p) => p.text.length).sort((a, b) => a - b);
  const stats = {
    total: passages.length,
    avg: Math.round(lens.reduce((a, b) => a + b, 0) / (lens.length || 1)),
    p10: lens[Math.floor(lens.length * 0.1)] ?? 0,
    median: lens[Math.floor(lens.length / 2)] ?? 0,
    p90: lens[Math.floor(lens.length * 0.9)] ?? 0,
    thin: passages.filter((p) => p.text.length < MIN_CHARS).length,
  };
  console.log("length stats:", JSON.stringify(stats));

  // Group by source, find mergeable runs of thin units
  const bySource = new Map<string, P[]>();
  for (const p of passages) {
    if (p.verificationState === "needs_review" || p.verificationState === "rejected") continue;
    const arr = bySource.get(p.sourceId) ?? [];
    arr.push(p);
    bySource.set(p.sourceId, arr);
  }

  const proposals: { survivorId: string; mergeIds: string[]; mergedPreview: string; sourceId: string }[] = [];
  for (const [sourceId, units] of bySource) {
    let run: P[] = [];
    const flush = () => {
      if (run.length >= 2) {
        const merged = run.map((r) => r.text).reduce(normalizeJoin);
        if (merged.length <= MAX_CHARS) {
          proposals.push({ survivorId: run[0].id, mergeIds: run.slice(1).map((r) => r.id), mergedPreview: merged.slice(0, 160), sourceId });
        }
      }
      run = [];
    };
    for (const p of units) {
      if (p.text.length < MIN_CHARS) {
        const prospective = run.map((r) => r.text).concat(p.text).reduce(normalizeJoin);
        if (run.length < MAX_RUNS && prospective.length <= MAX_CHARS) run.push(p);
        else {
          flush();
          run = [p];
        }
      } else flush();
    }
    flush();
    void sourceId;
  }

  console.log(`proposals: ${proposals.length} merges covering ${proposals.reduce((a, p) => a + p.mergeIds.length, 0)} thin units`);

  mkdirSync("scripts/out", { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  writeFileSync(`scripts/out/paraphrase-proposals-${stamp}.json`, JSON.stringify({ generatedAt: new Date().toISOString(), stats, proposals }, null, 1));
  console.log(`proposals → scripts/out/paraphrase-proposals-${stamp}.json`);

  if (!APPLY) {
    console.log("dry run complete — review the file, then re-run with --apply");
    return;
  }

  // Backup everything we're about to touch
  const allIds = proposals.flatMap((p) => [p.survivorId, ...p.mergeIds]);
  const backupRows = await db.passage.findMany({ where: { id: { in: allIds } } });
  writeFileSync(`scripts/out/paraphrase-backup-${stamp}.json`, JSON.stringify({ generatedAt: new Date().toISOString(), rows: backupRows }, null, 1));
  console.log(`backup → scripts/out/paraphrase-backup-${stamp}.json (${backupRows.length} rows)`);

  let mergedCount = 0;
  for (const prop of proposals) {
    const rows = (await db.passage.findMany({
      where: { id: { in: [prop.survivorId, ...prop.mergeIds] } },
      orderBy: [{ sequence: "asc" }],
    })) as P[];
    if (rows.length < 2) continue;
    const mergedText = rows.map((r) => r.text).reduce(normalizeJoin);
    const survivor = rows[0];
    const visibility = rows.some((r) => r.visibility === "pro") ? "pro" : survivor.visibility;
    const notes = [...new Set(rows.map((r) => r.section).filter(Boolean))] as string[];

    // Each proposal is its own transaction. A single failure (e.g., a
    // junction-row duplicate) must NOT abort the whole run — log + skip.
    try {
      await db.$transaction(async (tx) => {
        // Re-point junctions to the survivor. We must first DELETE any
        // duplicate junction rows on the merged-away passages whose
        // entityId already exists on the survivor — otherwise the
        // updateMany would create a (passageId, entityId) duplicate and
        // the unique constraint would reject the whole transaction.
        for (const [table, entityCol] of [
          ["passageTheme", "themeId"],
          ["passageConcept", "conceptId"],
          ["passageCompany", "companyId"],
          ["passageEvent", "eventId"],
        ] as const) {
          // @ts-expect-error dynamic junction model
          const existing = await tx[table].findMany({
            where: { passageId: prop.survivorId },
            select: { [entityCol]: true } as any,
          });
          const existingIds = (existing as any[]).map((r) => r[entityCol]).filter(Boolean);
          if (existingIds.length > 0) {
            // @ts-expect-error dynamic junction model
            await tx[table].deleteMany({
              where: { passageId: { in: prop.mergeIds }, [entityCol]: { in: existingIds } } as any,
            });
          }
          // @ts-expect-error dynamic junction model
          await tx[table].updateMany({ where: { passageId: { in: prop.mergeIds } }, data: { passageId: prop.survivorId } });
        }
        await tx.passage.update({
          where: { id: prop.survivorId },
          data: {
            text: mergedText,
            context: survivor.context ? `${survivor.context} [merged ${rows.length} units]` : `[merged ${rows.length} units · sections: ${notes.join("; ")}]`,
            verificationState: "needs_review", // human re-approval required
            visibility,
          },
        });
        await tx.passage.deleteMany({ where: { id: { in: prop.mergeIds } } });
      });
      mergedCount++;
      if (mergedCount % 25 === 0) console.log(`  merged ${mergedCount}/${proposals.length}`);
    } catch (mergeErr) {
      console.error(`  SKIP merge ${prop.survivorId} ← ${prop.mergeIds.join(",")}: ${(mergeErr as Error).message.split("\n")[0]}`);
    }
  }

  console.log(`APPLIED ${mergedCount} merges. Survivors are needs_review until approved in review.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
