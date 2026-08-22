type RSource = {
  slug: string;
  title: string;
  year: number | null;
  sourceType: string;
  publisher: string;
  url: string;
  format: "html" | "pdf";
};

const out = (slug: string, data: unknown) =>
  Bun.write(`scripts/ingest/registries/${slug}.json`, JSON.stringify({ personSlug: slug, sources: data }, null, 2));

const wb = (ts: string, original: string) => `https://web.archive.org/web/${ts}id_/${original}`;

const ackman: RSource[] = [
  {
    slug: "letter-to-investors-jan-2022",
    title: "Letter to Investors (Netflix position)",
    year: 2022,
    sourceType: "shareholder_letter",
    publisher: "Pershing Square Capital Management",
    url: "https://assets.pershingsquareholdings.com/2022/01/26170421/Pershing-Square-Capital-Management-L.P.-Releases-Letter-to-Investors-01-26-2022.pdf",
    format: "pdf",
  },
  {
    slug: "psth-letter-2021",
    title: "Letter to Shareholders from PSTH CEO Bill Ackman",
    year: 2021,
    sourceType: "shareholder_letter",
    publisher: "Pershing Square Tontine Holdings",
    url: "https://www.pershingsquareholdings.com/wp-content/uploads/2021/07/Letter-to-Shareholders-from-PSTH-CEO-Bill-Ackman.pdf",
    format: "pdf",
  },
  {
    slug: "psh-annual-report-2025",
    title: "Pershing Square Holdings 2025 Annual Report (incl. Letter to Shareholders)",
    year: 2026,
    sourceType: "annual_report",
    publisher: "Pershing Square Holdings, Ltd.",
    url: "https://assets.pershingsquareholdings.com/wp-content/uploads/2026/02/18175039/Pershing-Square-Holdings-Ltd.-2025-Annual-Report.pdf",
    format: "pdf",
  },
];

const smithYears: [string, number][] = [
  ["2iiacacc/annual-letter-to-shareholders-2010-pdf", 2010],
  ["khugzwcd/annual-letter-to-shareholders-2011-pdf", 2011],
  ["h2qekhgk/annual-letter-to-shareholders-2012-pdf", 2012],
  ["r42lzm0b/annual-letter-to-shareholders-2013-pdf", 2013],
  ["wiulqdhi/annual-letter-to-shareholders-2014-pdf", 2014],
  ["5jgdehk1/annual-letter-to-shareholders-2015", 2015],
  ["wmul2sfh/2016-annual-letter-to-shareholders", 2016],
  ["ceadumtv/annual-letter-to-shareholders-2017", 2017],
  ["eiobz20w/2018-annual-letter", 2018],
  ["thedhlvw/2019-annual-letter", 2019],
  ["ifbnw1ta/2020-annual-letter", 2020],
  ["bm0lyc22/annual-letter-to-shareholders-2022", 2022],
];
const smithTs: Record<string, string> = {
  "2iiacacc": "20210105", khugzwcd: "20210105", h2qekhgk: "20210105", r42lzm0b: "20210105",
  wiulqdhi: "20210105", "5jgdehk1": "20210105", wmul2sfh: "20210105", ceadumtv: "20210105",
  eiobz20w: "20220101", thedhlvw: "20220101", ifbnw1ta: "20220101", bm0lyc22: "20230101",
};
const smith: RSource[] = smithYears.map(([path, y]) => {
  const id = path.split("/")[0];
  const file = path.split("/")[1];
  return {
    slug: `fundsmith-${y}-annual-letter`,
    title: `Fundsmith Equity Fund ${y} Annual Letter to Shareholders`,
    year: y,
    sourceType: "shareholder_letter",
    publisher: "Fundsmith LLP (via Internet Archive)",
    url: wb(smithTs[id], `https://www.fundsmith.co.uk/media/${path}.pdf`),
    format: "pdf" as const,
  };
});
smith.push(
  {
    slug: "fundsmith-2023-annual-letter",
    title: "Fundsmith Equity Fund 2023 Annual Letter to Shareholders",
    year: 2023,
    sourceType: "shareholder_letter",
    publisher: "Fundsmith LLP (via Internet Archive)",
    url: wb("20240101", "https://www.fundsmith.co.uk/media/31plodnq/2023-fef-annual-letter-to-shareholders.pdf"),
    format: "pdf",
  },
  {
    slug: "fundsmith-2024-annual-letter",
    title: "Fundsmith Equity Fund 2024 Annual Letter to Shareholders",
    year: 2024,
    sourceType: "shareholder_letter",
    publisher: "Fundsmith LLP (via Internet Archive)",
    url: wb("20250101", "https://www.fundsmith.co.uk/media/pirmvyly/fundsmith-annual-letter-to-shareholders-2024.pdf"),
    format: "pdf",
  },
  {
    slug: "fundsmith-2025-annual-letter",
    title: "Fundsmith Equity Fund 2025 Annual Letter to Shareholders",
    year: 2025,
    sourceType: "shareholder_letter",
    publisher: "Fundsmith LLP (via Internet Archive)",
    url: wb("20260101", "https://www.fundsmith.co.uk/media/5ygndq2f/2025-annual-letter.pdf"),
    format: "pdf",
  }
);

const swensen: RSource[] = [];
for (let y = 2001; y <= 2021; y++) {
  swensen.push({
    slug: `yale-endowment-report-${y}`,
    title: `Yale Endowment Annual Report ${y}`,
    year: y,
    sourceType: "annual_report",
    publisher: "Yale Investments Office (Yale University)",
    url: `https://investments.yale.edu/wp-content/uploads/2024/10/${y}YaleEndowment.pdf`,
    format: "pdf",
  });
}

const pabraiRoot: [string, string][] = [
  ["120899", "2003"], ["010102", "2003"], ["010103", "2003"], ["010104", "2003"],
  ["020102", "2003"], ["020103", "2003"], ["020200", "2003"], ["020301", "2003"],
  ["030900", "2003"], ["040102", "2003"], ["040201", "2003"], ["060101", "2003"],
  ["060102", "2003"], ["060103", "2003"], ["070102", "2003"], ["070103", "2003"],
  ["070104", "2003"], ["070300", "2003"], ["070501", "2003"], ["080101", "2003"],
  ["080102", "2003"], ["081103", "2003"], ["081800", "2003"], ["090101", "2003"],
  ["100101", "2003"], ["100600", "2003"], ["101103", "2003"], ["120101", "2003"],
  ["120400", "2003"], ["121103", "2003"],
];
const pabraiWebsite: [string, string][] = [
  ["032199", "2016"], ["010106", "2006"], ["010107", "2007"], ["010109", "2009"],
  ["010110", "2010"], ["010111", "2011"], ["010112", "2012"], ["010113", "2013"],
  ["010114", "2014"], ["010115", "2015"], ["010116", "2016"], ["010118", "2018"],
  ["010119", "2019"], ["010121", "2021"], ["040103", "2019"], ["040105", "2025"],
  ["040106", "2006"], ["040111", "2011"], ["040113", "2013"], ["040115", "2015"],
  ["040116", "2016"], ["040119", "2019"], ["070106", "2006"], ["070109", "2009"],
  ["070112", "2012"], ["070114", "2014"], ["070115", "2015"], ["070116", "2016"],
  ["070117", "2017"], ["070118", "2018"], ["070119", "2019"], ["100106", "2006"],
  ["100108", "2008"], ["100111", "2011"], ["100113", "2013"], ["100114", "2014"],
  ["100116", "2016"], ["100117", "2017"], ["100118", "2018"], ["100119", "2019"],
  ["120105", "2006"],
];
const MONTH_ABBR = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function pabraiLetter(code: string, ts: string, pathPrefix: string): RSource {
  const mm = parseInt(code.slice(0, 2), 10);
  const yy = parseInt(code.slice(4), 10);
  const fullYear = yy >= 90 ? 1900 + yy : 2000 + yy;
  const mon = MONTH_ABBR[mm - 1] ?? "";
  return {
    slug: `pabrai-l${code}`,
    title: `Letter to Partners (${mon} ${fullYear})`,
    year: fullYear,
    sourceType: "shareholder_letter",
    publisher: "Pabrai Investment Funds (via Internet Archive)",
    url: wb(ts, `http://${pathPrefix}pabraifunds.com${pathPrefix === "www." ? "/" : "/website/"}l_${code}.pdf`),
    format: "pdf",
  };
}
const pabrai: RSource[] = [
  ...pabraiRoot.map(([c, t]) => pabraiLetter(c, t, "www.")),
  ...pabraiWebsite.map(([c, t]) => pabraiLetter(c, t, "")),
];
for (const [file, ts, yr] of [
  ["2005_PIF_AM_Transcript", "2006", 2005],
  ["2011_PIF_AM_Transcript", "2012", 2011],
  ["2012_PIF_AM_Transcript", "2025", 2012],
  ["2017_PIF_AM_Transcript", "2018", 2017],
  ["2018_PIF_AM_Transcript", "2019", 2018],
  ["2019_PIF_AM_Transcript", "2019", 2019],
] as [string, string, number][]) {
  pabrai.push({
    slug: `pabrai-am-transcript-${yr}`,
    title: `Annual Meeting Transcript ${yr}`,
    year: yr,
    sourceType: "meeting_transcript",
    publisher: "Pabrai Investment Funds (via Internet Archive)",
    url: wb(ts, `http://www.pabraifunds.com/website/${file}.pdf`),
    format: "pdf",
  });
}

const dalio: RSource[] = [
  {
    slug: "how-the-economic-machine-works",
    title: "How the Economic Machine Works (Transcript Page)",
    year: 2013,
    sourceType: "speech",
    publisher: "Ray Dalio / economicprinciples.org",
    url: "https://economicprinciples.org/how-the-economic-machine-works",
    format: "html",
  },
];

await out("ackman", ackman);
await out("smith", smith);
await out("swensen", swensen);
await out("pabrai", pabrai);
await out("dalio", dalio);
console.log(`v3 registries: ackman=${ackman.length} smith=${smith.length} swensen=${swensen.length} pabrai=${pabrai.length} dalio=${dalio.length}`);
