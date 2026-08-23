import { readdirSync } from "fs";
import { INDUSTRIES, COMPANIES, THEMES, CONCEPTS, EVENTS } from "./entities";

type PassageLine = {
  text: string;
  sequence: number;
  visibility: string;
  themes: string[];
  concepts: string[];
  companies: string[];
  events: string[];
};

type CorpusLine = {
  personSlug: string;
  source: {
    slug: string;
    title: string;
    year: number | null;
    sourceType: string;
    publisher: string;
    url: string;
  };
  passages: PassageLine[];
};

const PEOPLE = [
  { slug: "buffett", name: "Warren Buffett", birthYear: 1930, sortOrder: 1, shortDescription: "Chairman of Berkshire Hathaway and history's most studied capital allocator.", bio: "Warren Buffett (b. 1930) ran Buffett Partnership Ltd. from 1957 to 1969 before taking control of Berkshire Hathaway. His annual letters to shareholders, written since 1977, form one of the most complete public records of any investor's thinking." },
  { slug: "munger", name: "Charlie Munger", birthYear: 1924, sortOrder: 2, shortDescription: "Berkshire Hathaway vice chairman and architect of worldly wisdom.", bio: "Charlie Munger (1924\u20132023) was Berkshire Hathaway's vice chairman and Warren Buffett's partner for over five decades. His Wesco Financial letters and talks on psychology and decision-making shaped modern value investing." },
  { slug: "marks", name: "Howard Marks", birthYear: 1946, sortOrder: 3, shortDescription: "Oaktree co-founder whose client memos chronicle cycles and risk.", bio: "Howard Marks (b. 1946) co-founded Oaktree Capital Management, a leader in credit investing. Since 1990 his memos to clients have been required reading across the investment world." },
  { slug: "lynch", name: "Peter Lynch", birthYear: 1944, sortOrder: 4, shortDescription: "Magellan Fund manager who taught investors to know what they own.", bio: "Peter Lynch (b. 1944) managed Fidelity's Magellan Fund from 1977 to 1990, averaging roughly 29% annually. His lectures and interviews popularized investing in what you know." },
  { slug: "graham", name: "Benjamin Graham", birthYear: 1894, sortOrder: 5, shortDescription: "Father of value investing and author of Security Analysis.", bio: "Benjamin Graham (1894\u20131976) codified security analysis and the margin of safety. His Senate testimony and late-career interviews remain primary documents of disciplined investing." },
  { slug: "bogle", name: "John Bogle", birthYear: 1929, sortOrder: 6, shortDescription: "Vanguard founder and permanent champion of the index fund.", bio: "John C. Bogle (1929\u20132019) founded Vanguard and created the first retail index fund. His speeches and essays on costs, compounding, and investor behavior reshaped an industry." },
  { slug: "klarman", name: "Seth Klarman", birthYear: 1957, sortOrder: 7, shortDescription: "Baupost Group president and author of Margin of Safety.", bio: "Seth Klarman (b. 1957) founded The Baupost Group in 1982. His absolute-return, risk-first approach made Margin of Safety (1991) one of the most sought-after investing books ever printed." },
  { slug: "soros", name: "George Soros", birthYear: 1930, sortOrder: 8, shortDescription: "Macro investor and theorist of reflexivity.", bio: "George Soros (b. 1930) built Quantum Fund into one of history's greatest track records. His CEU lectures articulate reflexivity, the feedback loop between market beliefs and reality." },
  { slug: "druckenmiller", name: "Stanley Druckenmiller", birthYear: 1953, sortOrder: 9, shortDescription: "Duquesne founder; macro concentration and asymmetric bets.", bio: "Stanley Druckenmiller (b. 1953) ran Duquesne Capital for three decades without a losing year and co-drove Quantum's legendary run with Soros." },
  { slug: "simons", name: "Jim Simons", birthYear: 1938, sortOrder: 10, shortDescription: "Mathematician who built Renaissance Technologies.", bio: "Jim Simons (1938\u20132024) applied mathematics and data to found Renaissance Technologies, whose Medallion fund set records for systematic returns." },
  { slug: "livermore", name: "Jesse Livermore", birthYear: 1877, sortOrder: 11, shortDescription: "Legendary speculator of the 1907 and 1929 crashes.", bio: "Jesse Livermore (1877\u20131940) shorted both the 1907 panic and the 1929 crash. How to Trade in Stocks (1940) distilled his tape-reading discipline." },
  { slug: "dalio", name: "Ray Dalio", birthYear: 1949, sortOrder: 12, shortDescription: "Bridgewater founder; principles and economic machine frameworks.", bio: "Ray Dalio (b. 1949) founded Bridgewater Associates and codified his decision-making into Principles and his template of debt cycles." },
  { slug: "templeton", name: "John Templeton", birthYear: 1912, sortOrder: 13, shortDescription: "Global contrarian pioneer of bargain hunting worldwide.", bio: "Sir John Templeton (1912\u20132008) pioneered global contrarian investing, buying at maximum pessimism across markets few Americans watched." },
  { slug: "greenblatt", name: "Joel Greenblatt", birthYear: 1957, sortOrder: 14, shortDescription: "Gotham Capital founder; special situations and the Magic Formula.", status: "coming_later" },
  { slug: "fisher", name: "Philip Fisher", birthYear: 1907, sortOrder: 15, shortDescription: "Growth-investing pioneer and author of Common Stocks and Uncommon Profits." },
  { slug: "pabrai", name: "Mohnish Pabrai", birthYear: 1964, sortOrder: 16, shortDescription: "Dhandho value investor and devoted student of Buffett and Munger.", status: "coming_later" },
  { slug: "ackman", name: "Bill Ackman", birthYear: 1966, sortOrder: 17, shortDescription: "Pershing Square founder; activist, concentrated public positions.", status: "coming_later" },
  { slug: "icahn", name: "Carl Icahn", birthYear: 1936, sortOrder: 18, shortDescription: "The original corporate raider turned activist shareholder." },
  { slug: "swensen", name: "David Swensen", birthYear: 1954, sortOrder: 19, shortDescription: "Yale endowment architect of institutional portfolio management.", status: "coming_later" },
  { slug: "smith", name: "Terry Smith", birthYear: 1954, sortOrder: 20, shortDescription: "Fundsmith founder; buy good companies and do nothing.", status: "coming_later" },
];

import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

async function main() {
  // Keep person rows in sync with the PEOPLE roster (status, descriptions).
  for (const p of PEOPLE) {
    await db.person.upsert({
      where: { slug: p.slug },
      update: { status: "active" },
      create: {
        slug: p.slug,
        name: p.name,
        birthYear: p.birthYear,
        sortOrder: p.sortOrder,
        shortDescription: p.shortDescription,
        bio: p.bio,
        status: p.status || "active",
      },
    });
  }

  const industryMap: Record<string, string> = {};
  await db.$transaction(async (tx) => {
    for (const ind of INDUSTRIES) {
      const rec = await tx.industry.upsert({ where: { slug: ind.slug }, update: {}, create: ind });
      industryMap[ind.slug] = rec.id;
    }
    for (const company of COMPANIES) {
      const { industry, ...rest } = company;
      const existing = await tx.company.findUnique({ where: { slug: company.slug } });
      if (!existing)
        await tx.company.create({ data: { ...rest, industryId: industryMap[industry] } });
    }
    for (const t of THEMES) {
      const e = await tx.theme.findUnique({ where: { slug: t.slug } });
      if (!e) await tx.theme.create({ data: t });
    }
    for (const c of CONCEPTS) {
      const e = await tx.concept.findUnique({ where: { slug: c.slug } });
      if (!e) await tx.concept.create({ data: c });
    }
    for (const ev of EVENTS) {
      const e = await tx.event.findUnique({ where: { slug: ev.slug } });
      if (!e) await tx.event.create({ data: ev });
    }
    console.log("entities ensured");
  }, { maxWait: 30000, timeout: 300000 });

  const themeIds = Object.fromEntries((await db.theme.findMany()).map((t) => [t.slug, t.id]));
  const conceptIds = Object.fromEntries((await db.concept.findMany()).map((c) => [c.slug, c.id]));
  const companyIds = Object.fromEntries((await db.company.findMany()).map((c) => [c.slug, c.id]));
  const eventIds = Object.fromEntries((await db.event.findMany()).map((e) => [e.slug, e.id]));
  const personIds = Object.fromEntries(
    (await db.person.findMany()).map((p) => [p.slug, p.id])
  );

  let totalPassages = 0;

  // Optional CLI filter: `bun scripts/ingest/import-db.ts fisher icahn` imports only
// those corpora files. Without args, imports everything (full re-seed).
const onlyFiles = process.argv.slice(2).map((a) => (a.endsWith(".jsonl") ? a : `${a}.jsonl`));
const corpusFiles = readdirSync("data/corpora")
  .filter((f) => f.endsWith(".jsonl"))
  .filter((f) => onlyFiles.length === 0 || onlyFiles.includes(f));
  for (const file of corpusFiles) {
    const lines = (await Bun.file(`data/corpora/${file}`).text())
      .split("\n")
      .filter(Boolean)
      .map((l) => JSON.parse(l) as CorpusLine);

    for (const line of lines) {
      const personId = personIds[line.personSlug];
      if (!personId) continue;

      let source = await db.source.findUnique({ where: { slug: line.source.slug } });
      if (!source) {
        source = await db.source.create({
          data: {
            personId,
            slug: line.source.slug,
            title: line.source.title,
            year: line.source.year,
            sourceType: line.source.sourceType,
            publisher: line.source.publisher,
            url: line.source.url,
            provenanceStatus: "verified",
          },
        });
      } else {
        await db.source.update({
          where: { id: source.id },
          data: { year: line.source.year, title: line.source.title },
        });
      }

      await db.passage.deleteMany({ where: { sourceId: source.id } });

      const valid = line.passages.filter((p) => p.text && p.text.length >= 50);
      if (!valid.length) continue;

      // BULK: one insert per source instead of thousands of round trips
      await db.passage.createMany({
        data: valid.map((p) => ({
          sourceId: source!.id,
          text: p.text,
          sequence: p.sequence,
          visibility: p.visibility === "public" ? "public" : "pro",
        })),
      });

      const created = await db.passage.findMany({
        where: { sourceId: source.id },
        select: { id: true, sequence: true },
      });
      const bySeq = new Map(created.map((r) => [r.sequence, r.id]));

      const themeRows: { passageId: string; themeId: string }[] = [];
      const conceptRows: { passageId: string; conceptId: string }[] = [];
      const companyRows: { passageId: string; companyId: string }[] = [];
      const eventRows: { passageId: string; eventId: string }[] = [];
      for (const p of valid) {
        const pid = bySeq.get(p.sequence);
        if (!pid) continue;
        for (const s of p.themes ?? []) { const id = themeIds[s]; if (id) themeRows.push({ passageId: pid, themeId: id }); }
        for (const s of p.concepts ?? []) { const id = conceptIds[s]; if (id) conceptRows.push({ passageId: pid, conceptId: id }); }
        for (const s of p.companies ?? []) { const id = companyIds[s]; if (id) companyRows.push({ passageId: pid, companyId: id }); }
        for (const s of p.events ?? []) { const id = eventIds[s]; if (id) eventRows.push({ passageId: pid, eventId: id }); }
      }
      if (themeRows.length) await db.passageTheme.createMany({ data: themeRows, skipDuplicates: true });
      if (conceptRows.length) await db.passageConcept.createMany({ data: conceptRows, skipDuplicates: true });
      if (companyRows.length) await db.passageCompany.createMany({ data: companyRows, skipDuplicates: true });
      if (eventRows.length) await db.passageEvent.createMany({ data: eventRows, skipDuplicates: true });

      totalPassages += valid.length;
    }
    process.stdout.write(`${file} done (${totalPassages} total)\n`);
  }

  const counts = {
    people: await db.person.count(),
    sources: await db.source.count(),
    passages: await db.passage.count(),
  };
  console.log("IMPORT COMPLETE", JSON.stringify(counts));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
