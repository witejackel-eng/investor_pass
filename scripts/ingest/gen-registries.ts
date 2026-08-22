import { readdirSync } from "fs";

const out = (slug: string, data: unknown) =>
  Bun.write(`scripts/ingest/registries/${slug}.json`, JSON.stringify(data, null, 2));

const deSlug = (s: string) =>
  s
    .replace(/-/g, " ")
    .replace(/\.pdf$/, "")
    .replace(/\b\w/g, (c) => c.toUpperCase());

async function marks() {
  const files = readdirSync("data/corpora/raw").filter(
    (f) => f.startsWith("marks-") && f.endsWith(".pdf")
  );
  const sources = files.map((f) => {
    const base = f.replace(/^marks-/, "").replace(/\.pdf$/, "");
    return {
      slug: base,
      title: deSlug(base),
      year: null as number | null,
      sourceType: "memo",
      publisher: "Oaktree Capital Management, L.P.",
      url: `https://github.com/l33tquant/investing_memos (${base})`,
      format: "pdf" as const,
    };
  });
  await out("marks", { personSlug: "marks", sources });
  console.log(`marks.json: ${sources.length}`);
}

function wesco() {
  const sources: any[] = [];
  for (let y = 1997; y <= 2009; y++) {
    sources.push({
      slug: `wesco-${y}-letter`,
      title: `Wesco Financial ${y} Letter to Shareholders`,
      year: y,
      sourceType: "shareholder_letter",
      publisher: "Wesco Financial Corporation",
      url: `https://www.berkshirehathaway.com/wesco/cm${y}.pdf`,
      format: "pdf",
    });
  }
  sources.push({
    slug: "wesco-letters-1983-1995-collection",
    title: "Wesco Letters to Shareholders 1983-1995 (Collection)",
    year: null,
    sourceType: "shareholder_letter",
    publisher: "Wesco Financial Corporation",
    url: "https://www.safalniveshak.com/wp-content/uploads/2013/12/Charlie-Munger-Wesco-Letters-1983-1995.pdf",
    format: "pdf",
  });
  sources.push({
    slug: "djco-meeting-2016-transcript",
    title: "Daily Journal Annual Meeting 2016 Transcript",
    year: 2016,
    sourceType: "meeting_transcript",
    publisher: "Daily Journal Corporation (transcript by Whitney Tilson)",
    url: "https://tilsonfunds.com/MungerDJ-2-16.pdf",
    format: "pdf",
  });
  sources.push({
    slug: "psychology-of-human-misjudgment",
    title: "The Psychology of Human Misjudgment",
    year: 1995,
    sourceType: "speech",
    publisher: "Harvard University / distributed by author",
    url: "https://www.rbcpa.com/mungerspeech_june_95.pdf",
    format: "pdf",
  });
  return { personSlug: "munger", sources };
}

function graham() {
  const sources = [
    {
      slug: "senate-testimony-1955",
      title: "Stock Market Study — Senate Banking Committee Testimony",
      year: 1955,
      sourceType: "meeting_transcript",
      publisher: "U.S. Senate Committee on Banking and Currency (public domain)",
      url: "http://www.grahamanddoddsville.net/wordpress/Files/Gurus/Benjamin%20Graham/Ben%20Graham%20Testimony%20-%201955.pdf",
      format: "pdf",
    },
    {
      slug: "an-hour-with-mr-graham",
      title: "An Hour with Mr. Graham (Interview by Hartman L. Butler Jr.)",
      year: 1976,
      sourceType: "interview",
      publisher: "Financial Analysts Research Foundation",
      url: "http://www.grahamanddoddsville.net/wordpress/Files/Gurus/Benjamin%20Graham/an-hour-ben-graham.pdf",
      format: "pdf",
    },
    {
      slug: "father-of-financial-analysis",
      title: "Benjamin Graham: The Father of Financial Analysis (Kahn & Milne)",
      year: 1977,
      sourceType: "book",
      publisher: "The Financial Analysts Research Foundation / CFA Institute",
      url: "https://rpc.cfainstitute.org/sites/default/files/-/media/documents/book/rf-publication/1977/rf-v1977-n1-4731-pdf.pdf",
      format: "pdf",
    },
  ];
  return { personSlug: "graham", sources };
}

function lynch() {
  const sources = [
    {
      slug: "npc-1994-lecture",
      title: "National Press Club Lecture on Investing",
      year: 1994,
      sourceType: "speech",
      publisher: "National Press Club (transcript via brewbooks.blog)",
      url: "https://brewbooks.blog/2021/02/22/transcript-of-peter-lynch-8-october-1994-lecture-to-the-national-press-club/",
      format: "html" as const,
    },
  ];
  return { personSlug: "lynch", sources };
}

async function bogle() {
  const res = await fetch("https://johncbogle.com/wordpress/bogle-speeches/", {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; InvestorPassCorpusBuilder/1.0)" },
  });
  const html = await res.text();
  const seen = new Set<string>();
  const sources: any[] = [];
  const linkRe =
    /<a[^>]+href="(https?:\/\/(?:www\.)?johncbogle\.com\/wordpress\/wp-content\/uploads\/[^"]+?\.pdf)"[^>]*>([\s\S]*?)<\/a>/gi;
  let m: RegExpExecArray | null;
  while ((m = linkRe.exec(html)) !== null) {
    const url = m[1];
    if (seen.has(url)) continue;
    seen.add(url);
    const titleHtml = m[2].replace(/<[^>]+>/g, "").trim().replace(/\s+/g, " ");
    if (!titleHtml || titleHtml.length < 8) continue;
    const ym = url.match(/uploads\/(20\d{2}|19\d{2})\//);
    const yrMatch = titleHtml.match(/\b(19[89]\d|20[01]\d)\b/);
    const year = ym ? parseInt(ym[1]) : yrMatch ? parseInt(yrMatch[1]) : null;
    const slug = url
      .split("/")
      .pop()!
      .replace(/\.pdf$/i, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .slice(0, 60);
    sources.push({
      slug: `bogle-${sources.length}-${slug}`,
      title: titleHtml.slice(0, 120),
      year,
      sourceType: "speech",
      publisher: "John C. Bogle / The Bogle eBlog",
      url,
      format: "pdf",
    });
  }
  console.log(`bogle scraped: ${sources.length} PDFs`);
  return { personSlug: "bogle", sources };
}

await marks();
await out("munger", wesco());
await out("graham", graham());
await out("lynch", lynch());
const bogleReg = await bogle();
await out("bogle", bogleReg);
console.log("ALL REGISTRIES WRITTEN");
