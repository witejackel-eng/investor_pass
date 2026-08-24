/**
 * SEC EDGAR Filing Crawler.
 *
 * Downloads SEC filings (10-K, 10-Q, 8-K, S-1, DEF 14A, Form 4, 13F, 13D/G)
 * for a list of US public companies, extracts clean text, compresses with
 * gzip (fallback — zstd needs native bindings), uploads to Cloudflare R2,
 * and stores metadata + text preview in the Filing table.
 *
 * Rate limit: SEC requires max 10 req/sec + a descriptive User-Agent.
 * We use a 100ms sleep between requests to stay safely under.
 *
 * Usage:
 *   bun scripts/filings/crawl-sec.ts                          # crawl all US companies
 *   bun scripts/filings/crawl-sec.ts AAPL MSFT GOOGL          # crawl specific tickers
 *   bun scripts/filings/crawl-sec.ts --since=2024-01-01      # only filings since date
 *   bun scripts/filings/crawl-sec.ts --forms=10-K,10-Q        # only specific forms
 */
import { db } from "@/lib/db";
import { r2Put, filingStoragePath, r2Config } from "@/lib/r2";
import { gzipSync } from "zlib";

const SEC_USER_AGENT = "InvestorPass research-library contact@investorpass.vercel.app";
const SEC_RATE_LIMIT_MS = 120; // ~8 req/sec — stays under 10/sec limit
const FORMS_OF_INTEREST = new Set([
  "10-K", "10-K/A", "10-Q", "10-Q/A", "8-K", "8-K/A",
  "S-1", "S-1/A", "S-3", "424B1", "424B3", "424B4",
  "DEF 14A", "DEFA14A", "PRE 14A",
  "3", "4", "5", "SC 13D", "SC 13D/A", "SC 13G", "SC 13G/A", "13F-HR",
  "20-F", "6-K", "40-F",
]);

type TickerEntry = { cik: string; ticker: string; name: string };

/** Fetch the SEC tickers→CIK master list (all ~10k US public companies). */
async function fetchTickerMap(): Promise<Map<string, TickerEntry>> {
  const res = await fetch("https://www.sec.gov/files/company_tickers.json", {
    headers: { "User-Agent": SEC_USER_AGENT },
  });
  if (!res.ok) throw new Error(`SEC tickers fetch failed: ${res.status}`);
  const data = (await res.json()) as Record<string, { cik_str: number; ticker: string; title: string }>;
  const map = new Map<string, TickerEntry>();
  for (const v of Object.values(data)) {
    map.set(v.ticker.toUpperCase(), { cik: String(v.cik_str), ticker: v.ticker, name: v.title });
  }
  return map;
}

/** Fetch the full submission history for a CIK (all filings ever). */
async function fetchSubmissions(cik: string): Promise<{
  name: string;
  tickers: string[];
  filings: {
    recent: {
      accessionNumber: string[];
      filingDate: string[];
      reportDate: string[];
      form: string[];
      primaryDocument: string[];
      primaryDocDescription: string[];
      size: number[];
    };
    files: { name: string; filingCount: number; size: string; subKey: string; subPath: string }[];
  };
}> {
  // CIK must be 10-digit zero-padded for the URL
  const padded = cik.padStart(10, "0");
  const res = await fetch(`https://data.sec.gov/submissions/CIK${padded}.json`, {
    headers: { "User-Agent": SEC_USER_AGENT },
  });
  if (!res.ok) throw new Error(`submissions fetch failed for CIK ${cik}: ${res.status}`);
  return res.json();
}

/** Fetch a single document from SEC EDGAR archive. */
async function fetchDocument(url: string): Promise<{ text: string; contentType: string; size: number }> {
  await sleep(SEC_RATE_LIMIT_MS);
  const res = await fetch(url, { headers: { "User-Agent": SEC_USER_AGENT } });
  if (!res.ok) throw new Error(`document fetch failed: ${url} → ${res.status}`);
  const contentType = res.headers.get("content-type") || "text/html";
  const buf = Buffer.from(await res.arrayBuffer());
  const text = buf.toString("utf-8");
  return { text, contentType, size: buf.length };
}

/** Extract clean text from HTML (SEC filings are HTML-heavy). */
function extractTextFromHtml(html: string): string {
  // Strip script/style blocks
  let s = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ");
  s = s.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ");
  // SEC XBRL blocks are huge — strip them
  s = s.replace(/<xbrl[^>]*>[\s\S]*?<\/xbrl>/gi, " ");
  // Convert <br>, <p>, <div> to newlines
  s = s.replace(/<br\s*\/?>/gi, "\n");
  s = s.replace(/<\/(p|div|tr|li|h[1-6])>/gi, "\n\n");
  // Strip all remaining tags
  s = s.replace(/<[^>]+>/g, " ");
  // Decode HTML entities
  s = s.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
  // Collapse whitespace
  s = s.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
  return s;
}

/** Sleep helper. */
function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

/** Parse CLI args. */
function parseArgs() {
  const args = process.argv.slice(2);
  const tickers: string[] = [];
  let since: Date | null = null;
  let forms: Set<string> | null = null;
  for (const a of args) {
    if (a.startsWith("--since=")) since = new Date(a.slice(8));
    else if (a.startsWith("--forms=")) forms = new Set(a.slice(8).split(","));
    else if (!a.startsWith("--")) tickers.push(a.toUpperCase());
  }
  return { tickers, since, forms };
}

async function main() {
  const { tickers, since, forms: formsFilter } = parseArgs();
  console.log(`[sec-crawler] starting. R2 configured: ${r2Config.configured}`);

  // Fetch the full SEC ticker→CIK map
  const tickerMap = await fetchTickerMap();
  console.log(`[sec-crawler] loaded ${tickerMap.size} tickers from SEC`);

  // Determine which companies to crawl
  let targets: TickerEntry[];
  if (tickers.length > 0) {
    targets = tickers.map((t) => tickerMap.get(t)).filter(Boolean) as TickerEntry[];
    if (targets.length === 0) {
      console.error(`No matching tickers found for: ${tickers.join(", ")}`);
      process.exit(1);
    }
  } else {
    // Default: crawl companies linked to existing investorpass Persons + top 50 by market cap
    // For now, start with the most-followed companies (linked to our investor corpus)
    const linkedCompanies = await db.company.findMany({
      select: { slug: true, name: true },
      take: 100,
    });
    // Match against SEC tickers by name similarity (rough)
    targets = [];
    for (const c of linkedCompanies) {
      // Try to match company name to a ticker (the SEC name is usually "APPLE INC" etc.)
      const match = [...tickerMap.values()].find((t) =>
        t.name.toLowerCase().includes(c.name.toLowerCase().split(" ")[0]) ||
        c.name.toLowerCase().includes(t.name.toLowerCase().split(" ")[0])
      );
      if (match) targets.push(match);
    }
    // Deduplicate
    const seen = new Set<string>();
    targets = targets.filter((t) => {
      if (seen.has(t.ticker)) return false;
      seen.add(t.ticker);
      return true;
    });
    console.log(`[sec-crawler] matched ${targets.length} companies from existing investorpass corpus`);
    if (targets.length === 0) {
      // Fallback: top 20 by S&P 500
      const fallback = ["AAPL", "MSFT", "GOOGL", "AMZN", "META", "NVDA", "BRK-B", "JPM", "V", "JNJ", "WMT", "MA", "PG", "UNH", "HD", "KO", "PEP", "BAC", "XOM", "CVX"];
      targets = fallback.map((t) => tickerMap.get(t)).filter(Boolean) as TickerEntry[];
      console.log(`[sec-crawler] using fallback top-20: ${targets.length} companies`);
    }
  }

  let totalProcessed = 0;
  let totalSkipped = 0;
  let totalFailed = 0;

  for (const target of targets) {
    try {
      const submissions = await fetchSubmissions(target.cik);
      const recent = submissions.filings.recent;
      const forms = recent.form || [];
      const dates = recent.filingDate || [];
      const accessions = recent.accessionNumber || [];
      const primaryDocs = recent.primaryDocument || [];
      const reportDates = recent.reportDate || [];
      const sizes = recent.size || [];

      const count = forms.length;
      let filingsToProcess: { form: string; date: string; accession: string; primaryDoc: string; reportDate: string; size: number }[] = [];
      for (let i = 0; i < count; i++) {
        const form = forms[i];
        const date = dates[i];
        const accession = accessions[i];
        const primaryDoc = primaryDocs[i];
        const reportDate = reportDates[i];
        const size = sizes[i];
        if (!form || !date || !accession || !primaryDoc) continue;
        if (!FORMS_OF_INTEREST.has(form)) continue;
        if (formsFilter && !formsFilter.has(form)) continue;
        if (since && new Date(date) < since) continue;
        filingsToProcess.push({ form, date, accession, primaryDoc, reportDate, size });
      }

      console.log(`[sec-crawler] ${target.ticker} (${submissions.name}): ${filingsToProcess.length} filings to process (of ${count} total)`);

      for (const f of filingsToProcess.slice(0, 50)) { // cap per company to avoid timeouts
        try {
          // Check if already crawled (by accession number)
          const existing = await db.filing.findUnique({ where: { accessionNumber: f.accession } });
          if (existing) { totalSkipped++; continue; }

          // Build the SEC document URL
          // Pattern: https://www.sec.gov/Archives/edgar/data/{CIK}/{accession-no-dashes}/{primaryDoc}
          const cikNoLead = target.cik.replace(/^0+/, "");
          const accessionNoDashes = f.accession.replace(/-/g, "");
          const docUrl = `https://www.sec.gov/Archives/edgar/data/${cikNoLead}/${accessionNoDashes}/${f.primaryDoc}`;

          const { text: rawText, contentType, size: fileSize } = await fetchDocument(docUrl);
          const isHtml = contentType.includes("html") || f.primaryDoc.endsWith(".htm") || f.primaryDoc.endsWith(".html");
          const extractedText = isHtml ? extractTextFromHtml(rawText) : rawText;

          // Compress with gzip (zstd needs native bindings — gzip is universal)
          const compressed = gzipSync(Buffer.from(extractedText, "utf-8"));
          const ext = f.primaryDoc.split(".").pop() || "html";

          // Upload to R2 if configured
          let storagePath: string | null = null;
          if (r2Config.configured) {
            const r2Key = filingStoragePath("US", target.ticker, f.form, f.accession, ext) + ".gz"; // .gz not .zst since we use gzip
            try {
              storagePath = await r2Put(r2Key, compressed, "application/gzip");
            } catch (e) {
              console.warn(`[sec-crawler] R2 upload failed for ${f.accession}:`, e instanceof Error ? e.message : e);
            }
          }

          // Build text preview (first 2000 chars)
          const textPreview = extractedText.slice(0, 2000);

          // Find linked investorpass Person (by company name match)
          let personId: string | null = null;
          const companyMatch = await db.company.findFirst({
            where: { name: { contains: target.name.split(" ")[0], mode: "insensitive" } },
            select: { id: true, slug: true },
          });
          let companySlug: string | null = companyMatch?.slug ?? null;

          // Insert the Filing row
          await db.filing.create({
            data: {
              country: "US",
              companyId: target.cik,
              companyName: target.name,
              formType: f.form,
              filingDate: new Date(f.date),
              periodOfReport: f.reportDate ? new Date(f.reportDate) : null,
              accessionNumber: f.accession,
              title: `${f.form} — ${target.name} (${f.date})`,
              sourceUrl: docUrl,
              storagePath,
              fileType: ext,
              fileSizeOriginal: fileSize,
              fileSizeCompressed: compressed.length,
              textExtracted: true,
              textPreview,
              searchText: extractedText.slice(0, 50000), // cap for DB storage
              companySlug,
              personId,
            },
          });
          totalProcessed++;
          if (totalProcessed % 10 === 0) console.log(`[sec-crawler] progress: ${totalProcessed} processed, ${totalSkipped} skipped`);
        } catch (e) {
          totalFailed++;
          console.warn(`[sec-crawler] failed ${target.ticker} ${f.form} ${f.date}:`, e instanceof Error ? e.message.slice(0, 100) : e);
        }
      }
    } catch (e) {
      console.error(`[sec-crawler] company ${target.ticker} failed:`, e instanceof Error ? e.message : e);
    }
  }

  console.log(`[sec-crawler] DONE. Processed: ${totalProcessed}, Skipped (already crawled): ${totalSkipped}, Failed: ${totalFailed}`);
  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
