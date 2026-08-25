/**
 * Founder-class tagging migration (constitution-compliant, idempotent).
 *
 * The Chinese + Indian founder corpora (commits 00315b2 + 77c96dd) were
 * imported by scripts/ingest/import-db.ts as Person rows of kind="investor"
 * (the schema default). This script re-tags those rows as kind="founder"
 * with the right `region`, so the /founders surface and founder-branded
 * detail pages can find them.
 *
 * Idempotent: safe to re-run after every fresh import. Touches ONLY slugs
 * that exist in the CHINESE_FOUNDERS / INDIAN_FOUNDERS lists — existing
 * investors (Buffett/Munger/Marks/…) keep kind="investor".
 *
 * Run AFTER `bun scripts/ingest/import-db.ts`:
 *   DATABASE_URL=… bun scripts/ingest/tag-founders.ts
 *
 * Output: per-slug updated rows + final count grouped by region.
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

// 52 Chinese founders — derived from the 52 corpora added in commit 00315b2.
const CHINESE_FOUNDERS = [
  "cao-dewang", "chen-tianqiao", "chen-yidan", "cheng-wei", "colin-huang",
  "ding-lei", "dong-mingzhu", "guo-guangchang", "he-xiaopeng", "jack-ma",
  "kai-fu-lee", "lai-meisong", "lei-jun", "li-xiang", "li-xiting",
  "liang-wenfeng", "liu-chuanzhi", "liu-hongsheng", "liu-yonghao",
  "liu-yongxing", "lu-guanqiu", "pan-shiyi", "pony-ma", "qin-yinglin",
  "ren-jianxin", "ren-zhengfei", "richard-liu", "robin-li", "rong-desheng",
  "rong-zongjing", "shi-zhengrong", "su-hua", "wang-chuanfu",
  "wang-jianlin", "wang-ning", "wang-wei-sf-express", "wang-xing",
  "wei-jianjun", "william-li", "xu-jiayin", "yang-guoqiang", "yu-minhong",
  "zhang-chaoyang", "zhang-jian", "zhang-ruimin", "zhang-xin",
  "zhang-yiming", "zhang-yin", "zhang-yong", "zhong-shanshan",
  "zhou-hongyi", "zong-qinghou",
] as const;

// 51 Indian founders — derived from the 51 corpora added in commit 77c96dd.
const INDIAN_FOUNDERS = [
  "anand-mahindra", "anil-agarwal", "ardeshir-godrej", "ashneer-grover",
  "azim-premji", "bhavish-and-ankit-ola", "brijmohan-lall-munjal",
  "byju-raveendran", "cyrus-poonawalla", "deepinder-goyal",
  "dhirubhai-ambani", "divyank-turakhia", "falguni-nayar", "fc-kohli",
  "gautam-adani", "gd-birla", "ghazal-alagh", "girish-mathrubootham",
  "harsh-and-bhavit-dream11", "jamnalal-bajaj", "jamsetji-tata",
  "jrd-tata", "karsanbhai-patel", "kiran-mazumdar-shaw",
  "kishore-biyani", "kk-birla", "kumar-mangalam-birla",
  "kunal-and-rohit-snapdeal", "mukesh-ambani", "nandan-nilekani",
  "narayana-murthy", "naveen-jindal", "nithin-and-nikhil-kamath",
  "op-jindal", "rahul-bajaj", "ramalinga-raju", "ramesh-chauhan",
  "ramkrishna-bajaj", "ratan-tata", "ritesh-agarwal",
  "sachin-and-binny-bansal", "sameer-nigam", "shiv-nadar",
  "sriharsha-and-nandan-swiggy", "suchi-mukherjee", "sunil-bharti-mittal",
  "varun-alagh", "verghese-kurien", "vijay-shekhar-sharma",
  "walchand-hirachand", "yc-deveshwar",
] as const;

type Region = "us" | "china" | "india";

// 14 US founders — founders-collection branch (2026-08-24): Vanderbilt,
// Carnegie, J.P. Morgan, Rockefeller, Henry Ford, Disney, Walton, Schultz,
// Jobs, Gates, Hastings, Bezos, Musk, Zuckerberg. (Dalio's corpus expansion
// lands under his existing investor row — kind stays "investor".)
const US_FOUNDERS = [
  "vanderbilt", "carnegie", "jp-morgan", "rockefeller", "henry-ford",
  "walt-disney", "sam-walton", "howard-schultz", "steve-jobs", "bill-gates",
  "reed-hastings", "bezos", "elon-musk", "zuckerberg",
] as const;

async function tag(slug: string, region: Region): Promise<boolean> {
  try {
    const r = await db.person.updateMany({
      where: { slug },
      data: { kind: "founder", region },
    });
    return r.count > 0;
  } catch (e) {
    console.log(`  ! ${slug} FAILED: ${e instanceof Error ? e.message.slice(0, 100) : e}`);
    return false;
  }
}

async function main() {
  console.log(`Tagging founders — 14 US + 52 Chinese + 51 Indian = 117 Person rows`);
  console.log("Existing investors (Buffett/Munger/Marks/…) are untouched.\n");

  let usHit = 0;
  let usMiss: string[] = [];
  for (const slug of US_FOUNDERS) {
    const ok = await tag(slug, "us");
    if (ok) usHit++; else usMiss.push(slug);
  }
  console.log(`us: ${usHit}/${US_FOUNDERS.length} tagged`);

  let cnHit = 0;
  let cnMiss: string[] = [];
  for (const slug of CHINESE_FOUNDERS) {
    const ok = await tag(slug, "china");
    if (ok) cnHit++; else cnMiss.push(slug);
  }
  console.log(`china: ${cnHit}/${CHINESE_FOUNDERS.length} tagged`);

  let inHit = 0;
  let inMiss: string[] = [];
  for (const slug of INDIAN_FOUNDERS) {
    const ok = await tag(slug, "india");
    if (ok) inHit++; else inMiss.push(slug);
  }
  console.log(`india: ${inHit}/${INDIAN_FOUNDERS.length} tagged`);

  if (usMiss.length) console.log(`missing us slugs (DB has no row): ${usMiss.join(", ")}`);
  if (cnMiss.length) console.log(`missing china slugs (DB has no row): ${cnMiss.join(", ")}`);
  if (inMiss.length) console.log(`missing india slugs (DB has no row): ${inMiss.join(", ")}`);

  const total = await db.person.count();
  const founders = await db.person.count({ where: { kind: "founder" } });
  const investors = await db.person.count({ where: { kind: "investor" } });
  const byRegion = await db.person.groupBy({
    by: ["region"],
    _count: { _all: true },
  });
  console.log(`\nFinal: ${founders} founders + ${investors} investors = ${total} people`);
  console.log(`by region: ${byRegion.map((r) => `${r.region ?? "null"}=${r._count._all}`).join(", ")}`);
  console.log("\nNext: run `bun scripts/db/compress-text.ts --rewrite` for lossless");
  console.log("      column compression, then `bun scripts/expand-paraphrases.ts --apply`");
  console.log("      to merge thin sequence-adjacent passages into bigger ones.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
