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
  {
    slug: "buffett",
    name: "Warren Buffett",
    birthYear: 1930,
    sortOrder: 1,
    shortDescription: "Chairman of Berkshire Hathaway and history's most studied capital allocator.",
    bio: "Warren Buffett (b. 1930) ran Buffett Partnership Ltd. from 1957 to 1969 before taking control of Berkshire Hathaway. His annual letters to shareholders, written since 1977, form one of the most complete public records of any investor's thinking.",
  },
  {
    slug: "munger",
    name: "Charlie Munger",
    birthYear: 1924,
    sortOrder: 2,
    shortDescription: "Berkshire Hathaway vice chairman and architect of worldly wisdom.",
    bio: "Charlie Munger (1924–2023) was Berkshire Hathaway's vice chairman and Warren Buffett's partner for over five decades. His Wesco Financial letters and talks on psychology and decision-making shaped modern value investing.",
  },
  {
    slug: "marks",
    name: "Howard Marks",
    birthYear: 1946,
    sortOrder: 3,
    shortDescription: "Oaktree co-founder whose client memos chronicle cycles and risk.",
    bio: "Howard Marks (b. 1946) co-founded Oaktree Capital Management, a leader in credit investing. Since 1990 his memos to clients have been required reading across the investment world.",
  },
  {
    slug: "lynch",
    name: "Peter Lynch",
    birthYear: 1944,
    sortOrder: 4,
    shortDescription: "Magellan Fund manager who taught investors to know what they own.",
    bio: "Peter Lynch (b. 1944) managed Fidelity's Magellan Fund from 1977 to 1990, averaging roughly 29% annually. His lectures and interviews popularized investing in what you know.",
  },
  {
    slug: "graham",
    name: "Benjamin Graham",
    birthYear: 1894,
    sortOrder: 5,
    shortDescription: "Father of value investing and author of Security Analysis.",
    bio: "Benjamin Graham (1894–1976) codified security analysis and the margin of safety. His Senate testimony and late-career interviews remain primary documents of disciplined investing.",
  },
  {
    slug: "bogle",
    name: "John Bogle",
    birthYear: 1929,
    sortOrder: 6,
    shortDescription: "Vanguard founder and permanent champion of the index fund.",
    bio: "John C. Bogle (1929–2019) founded Vanguard and created the first retail index fund. His speeches and essays on costs, compounding, and investor behavior reshaped an industry.",
  },
  {
    slug: "klarman",
    name: "Seth Klarman",
    birthYear: 1957,
    sortOrder: 7,
    shortDescription: "Baupost Group president and author of Margin of Safety.",
    bio: "Seth Klarman (b. 1957) founded The Baupost Group in 1982. His absolute-return, risk-first approach made Margin of Safety (1991) one of the most sought-after investing books ever printed.",
  },
  {
    slug: "soros",
    name: "George Soros",
    birthYear: 1930,
    sortOrder: 8,
    shortDescription: "Macro investor and theorist of reflexivity.",
    bio: "George Soros (b. 1930) built Quantum Fund into one of history's greatest track records. His CEU lectures articulate reflexivity, the feedback loop between market beliefs and reality.",
  },
  {
    slug: "druckenmiller",
    name: "Stanley Druckenmiller",
    birthYear: 1953,
    sortOrder: 9,
    shortDescription: "Duquesne founder; macro concentration and asymmetric bets.",
    bio: "Stanley Druckenmiller (b. 1953) ran Duquesne Capital for three decades without a losing year and co-drove Quantum's legendary run with Soros.",
  },
  {
    slug: "simons",
    name: "Jim Simons",
    birthYear: 1938,
    sortOrder: 10,
    shortDescription: "Mathematician who built Renaissance Technologies.",
    bio: "Jim Simons (1938–2024) applied mathematics and data to found Renaissance Technologies, whose Medallion fund set records for systematic returns.",
  },
  {
    slug: "livermore",
    name: "Jesse Livermore",
    birthYear: 1877,
    sortOrder: 11,
    shortDescription: "Legendary speculator of the 1907 and 1929 crashes.",
    bio: "Jesse Livermore (1877–1940) shorted both the 1907 panic and the 1929 crash. How to Trade in Stocks (1940) distilled his tape-reading discipline.",
  },
  {
    slug: "dalio",
    name: "Ray Dalio",
    birthYear: 1949,
    sortOrder: 12,
    shortDescription: "Bridgewater founder; principles and economic machine frameworks.",
    bio: "Ray Dalio (b. 1949) founded Bridgewater Associates and codified his decision-making into Principles and his template of debt cycles.",
  },
  {
    slug: "templeton",
    name: "John Templeton",
    birthYear: 1912,
    sortOrder: 13,
    shortDescription: "Global contrarian pioneer of bargain hunting worldwide.",
    bio: "Sir John Templeton (1912–2008) pioneered global contrarian investing, buying at maximum pessimism across markets few Americans watched.",
  },
  { slug: "greenblatt", name: "Joel Greenblatt", birthYear: 1957, sortOrder: 14, shortDescription: "Gotham Capital founder; special situations and the Magic Formula.", status: "coming_later" },
  { slug: "fisher", name: "Philip Fisher", birthYear: 1907, sortOrder: 15, shortDescription: "Growth-investing pioneer and author of Common Stocks and Uncommon Profits.", status: "coming_later" },
  { slug: "pabrai", name: "Mohnish Pabrai", birthYear: 1964, sortOrder: 16, shortDescription: "Dhandho value investor and devoted student of Buffett and Munger.", status: "coming_later" },
  { slug: "ackman", name: "Bill Ackman", birthYear: 1966, sortOrder: 17, shortDescription: "Pershing Square founder; activist, concentrated public positions.", status: "coming_later" },
  { slug: "icahn", name: "Carl Icahn", birthYear: 1936, sortOrder: 18, shortDescription: "The original corporate raider turned activist shareholder.", status: "coming_later" },
  { slug: "swensen", name: "David Swensen", birthYear: 1954, sortOrder: 19, shortDescription: "Yale endowment architect of institutional portfolio management.", status: "coming_later" },
  { slug: "smith", name: "Terry Smith", birthYear: 1954, sortOrder: 20, shortDescription: "Fundsmith founder; buy good companies and do nothing.", status: "coming_later" },
];

async function ensureIndustries() {
  const map: Record<string, string> = {};
  for (const ind of INDUSTRIES) {
    const rec = await db.industry.upsert({
      where: { slug: ind.slug },
      update: {},
      create: ind,
    });
    map[ind.slug] = rec.id;
  }
  return map;
}

async function main() {
  const industryMap = await ensureIndustries();

  for (const company of COMPANIES) {
    const { industry, ...rest } = company;
    await db.company.upsert({
      where: { slug: company.slug },
      update: {},
      create: { ...rest, industryId: industryMap[industry] },
    });
  }
  console.log(`companies ensured: ${COMPANIES.length}`);

  for (const theme of THEMES) {
    await db.theme.upsert({ where: { slug: theme.slug }, update: {}, create: theme });
  }
  for (const concept of CONCEPTS) {
    await db.concept.upsert({ where: { slug: concept.slug }, update: {}, create: concept });
  }
  for (const event of EVENTS) {
    await db.event.upsert({ where: { slug: event.slug }, update: {}, create: event });
  }
  console.log(`themes/concepts/events ensured: ${THEMES.length}/${CONCEPTS.length}/${EVENTS.length}`);

  const investorsWithData = new Set(
    readdirSync("data/corpora")
      .filter((f) => f.endsWith(".jsonl"))
      .map((f) => f.replace(/\.jsonl$/, ""))
  );

  for (const person of PEOPLE) {
    const status = investorsWithData.has(person.slug) ? "active" : "coming_later";
    await db.person.upsert({
      where: { slug: person.slug },
      update: { status, sortOrder: person.sortOrder, name: person.name },
      create: { ...person, status },
    });
  }

  const themeIds = Object.fromEntries(
    (await db.theme.findMany()).map((t) => [t.slug, t.id])
  );
  const conceptIds = Object.fromEntries(
    (await db.concept.findMany()).map((c) => [c.slug, c.id])
  );
  const companyIds = Object.fromEntries(
    (await db.company.findMany()).map((c) => [c.slug, c.id])
  );
  const eventIds = Object.fromEntries((await db.event.findMany()).map((e) => [e.slug, e.id]));
  const personIds = Object.fromEntries((await db.person.findMany()).map((p) => [p.slug, p.id]));

  let totalSources = 0;
  let totalPassages = 0;

  const corpusFiles = readdirSync("data/corpora").filter((f) => f.endsWith(".jsonl"));
  for (const file of corpusFiles) {
    const lines = (await Bun.file(`data/corpora/${file}`).text())
      .split("\n")
      .filter(Boolean)
      .map((l) => JSON.parse(l) as CorpusLine);

    for (const line of lines) {
      const personId = personIds[line.personSlug];
      if (!personId) {
        console.warn(`skip ${line.source.slug}: unknown person ${line.personSlug}`);
        continue;
      }

      const source = await db.source.upsert({
        where: { slug: line.source.slug },
        update: {
          title: line.source.title,
          year: line.source.year,
          sourceType: line.source.sourceType,
          publisher: line.source.publisher,
          url: line.source.url,
          provenanceStatus: "verified",
        },
        create: {
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

      await db.passage.deleteMany({ where: { sourceId: source.id } });

      for (const p of line.passages) {
        const created = await db.passage.create({
          data: {
            sourceId: source.id,
            text: p.text,
            sequence: p.sequence,
            visibility: p.visibility === "public" ? "public" : "pro",
          },
        });
        const links = [
          ["passageTheme", "themeId", p.themes, themeIds] as const,
          ["passageConcept", "conceptId", p.concepts, conceptIds] as const,
          ["passageCompany", "companyId", p.companies, companyIds] as const,
          ["passageEvent", "eventId", p.events, eventIds] as const,
        ];
        for (const [model, fk, slugs, idMap] of links) {
          for (const slug of slugs ?? []) {
            const id = idMap[slug];
            if (!id) continue;
            await (db as any)[model].create({
              data: { passageId: created.id, [fk]: id },
            });
          }
        }
        totalPassages++;
      }
      totalSources++;
    }
    console.log(`${file}: done`);
  }

  const counts = {
    people: await db.person.count(),
    sources: await db.source.count(),
    passages: await db.passage.count(),
    themes: await db.theme.count(),
    concepts: await db.concept.count(),
    companies: await db.company.count(),
    events: await db.event.count(),
  };
  console.log("\nIMPORT COMPLETE");
  console.log(JSON.stringify(counts, null, 2));
}

import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
