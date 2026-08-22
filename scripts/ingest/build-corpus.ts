import { fetchDoc, decodeBuffer, sha1, sleep } from "./lib/fetch";
import { extractHtmlText, extractPdfText } from "./lib/extract";
import { segment } from "./lib/segment";
import { tagPassage } from "./lib/tag";

type RegistrySource = {
  slug: string;
  title: string;
  year: number | null;
  sourceType: string;
  publisher: string;
  url: string;
  format: "html" | "pdf";
};

type Registry = {
  personSlug: string;
  sources: RegistrySource[];
};

const POLITE_DELAY_MS = 700;
const PUBLIC_SHARE = 15;

type CorpusLine = {
  personSlug: string;
  source: Omit<RegistrySource, "format">;
  passages: {
    text: string;
    sequence: number;
    visibility: "public" | "pro";
    themes: string[];
    concepts: string[];
    companies: string[];
    events: string[];
  }[];
};

function visibilityFor(text: string): "public" | "pro" {
  return parseInt(sha1(text).slice(0, 8), 16) % 100 < PUBLIC_SHARE ? "public" : "pro";
}

const MONTHS =
  "January|February|March|April|May|June|July|August|September|October|November|December";

export function inferPublicationYear(text: string): number | null {
  const dated = [
    ...text.matchAll(new RegExp(`\\b(${MONTHS})\\s+\\d{1,2},\\s*((?:19|20)\\d{2})\\b`, "g")),
  ];
  if (dated.length) {
    const last = dated[dated.length - 1];
    return parseInt(last[2], 10);
  }
  const copyright = [
    ...text.matchAll(new RegExp(`(?:©|Copyright)?\\s*((?:19[89]\\d|20[012]\\d))\\s+(?:Oaktree|Berkshire|Wesco)`, "g")),
  ];
  if (copyright.length) return parseInt(copyright[copyright.length - 1][1], 10);
  return null;
}

async function sourceText(src: RegistrySource): Promise<string> {
  const buf = await fetchDoc(src.url);
  if (src.format === "pdf") return await extractPdfText(buf);
  return extractHtmlText(decodeBuffer(buf));
}

async function main() {
  const investor = process.argv[2];
  if (!investor) throw new Error("usage: bun scripts/ingest/build-corpus.ts <investor>");
  const registryPath = `scripts/ingest/registries/${investor}.json`;
  const registry: Registry = JSON.parse(await Bun.file(registryPath).text());

  const outLines: CorpusLine[] = [];
  let okCount = 0;
  let failCount = 0;

  for (const src of registry.sources) {
    try {
      const rawPath = `data/corpora/raw/${investor}-${src.slug}.${src.format}`;
      const file = Bun.file(rawPath);
      if (!(await file.exists())) {
        const buf = await fetchDoc(src.url);
        await Bun.write(rawPath, buf);
        await sleep(POLITE_DELAY_MS);
      }
      const cached = await Bun.file(rawPath).arrayBuffer();
      const text =
        src.format === "pdf"
          ? await extractPdfText(cached)
          : extractHtmlText(decodeBuffer(cached));

      if (text.length < 500) {
        console.warn(`WARN ${src.slug}: extracted only ${text.length} chars — skipping`);
        failCount++;
        continue;
      }

      const drafts = segment(text).filter((p) => p.text.length >= 120);
      const year =
        src.year ??
        (src.format === "pdf" || src.year === null ? inferPublicationYear(text) : src.year);
      if (!src.year && year) console.log(`    year inferred: ${year}`);
      const tagged = drafts.map((d) => {
        const tags = tagPassage(d.text);
        return {
          text: d.text,
          sequence: d.sequence,
          visibility: visibilityFor(`${src.slug}:${d.text}`),
          themes: tags.themes,
          concepts: tags.concepts,
          companies: tags.companies,
          events: tags.events,
        };
      });

      outLines.push({
        personSlug: registry.personSlug,
        source: {
          slug: src.slug,
          title: src.title,
          year: year ?? null,
          sourceType: src.sourceType,
          publisher: src.publisher,
          url: src.url,
        },
        passages: tagged,
      });
      okCount++;
      const proN = tagged.filter((t) => t.visibility === "pro").length;
      console.log(
        `OK ${src.slug} [${src.year}] ${drafts.length} passages (${tagged.length - proN} public / ${proN} pro)`
      );
    } catch (err) {
      failCount++;
      console.error(`FAIL ${src.slug}: ${err instanceof Error ? err.message : err}`);
    }
  }

  const outPath = `data/corpora/${investor}.jsonl`;
  const body = outLines.map((l) => JSON.stringify(l)).join("\n") + (outLines.length ? "\n" : "");
  await Bun.write(outPath, body);

  const totalPassages = outLines.reduce((n, l) => n + l.passages.length, 0);
  const totalPublic = outLines.reduce(
    (n, l) => n + l.passages.filter((p) => p.visibility === "public").length,
    0
  );
  console.log(`\n=== ${investor} corpus ===`);
  console.log(`sources: ${okCount} ok, ${failCount} failed/skipped`);
  console.log(`passages: ${totalPassages} (${totalPublic} public, ${totalPassages - totalPublic} pro)`);
  console.log(`written: ${outPath}`);
}

main();
