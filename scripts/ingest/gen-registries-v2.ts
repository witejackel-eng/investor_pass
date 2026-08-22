type RSource = {
  slug: string;
  title: string;
  year: number | null;
  sourceType: string;
  publisher: string;
  url: string;
  format: "html" | "pdf";
};

const write = (slug: string, sources: RSource[]) =>
  Bun.write(`scripts/ingest/registries/${slug}.json`, JSON.stringify({ personSlug: slug, sources }, null, 2));

await write("klarman", [
  {
    slug: "mib-interview-2026",
    title: "Masters in Business Interview (Barry Ritholtz)",
    year: 2026,
    sourceType: "interview",
    publisher: "Bloomberg Radio / ritholtz.com",
    url: "https://ritholtz.com/2026/06/transcript-seth-klarman/",
    format: "html",
  },
]);

await write("soros", [
  {
    slug: "ceu-reflexivity-lecture-transcript",
    title: "General Theory of Reflexivity (CEU Lecture Transcript)",
    year: 2009,
    sourceType: "speech",
    publisher: "Open Society Foundations / Central European University",
    url: "https://www.opensocietyfoundations.org/uploads/9ae17912-2262-4646-8ffc-d01afc934c36/george-soros-general-theory-of-reflexivity-transcript.pdf",
    format: "pdf",
  },
  {
    slug: "ceu-open-society-lecture-transcript",
    title: "Open Society (CEU Lecture Transcript)",
    year: 2009,
    sourceType: "speech",
    publisher: "Open Society Foundations / Central European University",
    url: "https://archive.org/download/george-soros-general-theory-of-reflexivity-transcript/george-soros-open-society-transcript.pdf",
    format: "pdf",
  },
]);

await write("druckenmiller", [
  {
    slug: "econ-club-ny-2020",
    title: "Economic Club of New York Address",
    year: 2020,
    sourceType: "speech",
    publisher: "Economic Club of New York",
    url: "https://www.econclubny.org/documents/10184/109144/2020DruckenmillerTranscript.pdf",
    format: "pdf",
  },
  {
    slug: "lost-tree-club-talk",
    title: "Lost Tree Club Talk with Ken Langone Q&A",
    year: 2015,
    sourceType: "speech",
    publisher: "Cove Street Capital (transcript)",
    url: "https://gist.githubusercontent.com/timhwang21/e6a2b24e064182dd9099ad00e4f4f9a6/raw",
    format: "html",
  },
]);

await write("simons", [
  {
    slug: "ted-interview-2015",
    title: "A Rare Interview with the Mathematician Who Cracked Wall Street",
    year: 2015,
    sourceType: "interview",
    publisher: "TED Conferences",
    url: "https://www.ted.com/talks/jim_simons_a_rare_interview_with_the_mathematician_who_cracked_wall_street/transcript",
    format: "html",
  },
]);

await write("livermore", [
  {
    slug: "how-to-trade-in-stocks-1940",
    title: "How to Trade in Stocks",
    year: 1940,
    sourceType: "book",
    publisher: "Duell, Sloan and Pearce (public domain, Internet Archive)",
    url: "https://archive.org/details/howtotradeinstoc0000live",
    format: "html",
  },
]);

const dalioCandidates: RSource[] = [
  {
    slug: "economic-machine-transcript",
    title: "How the Economic Machine Works (Transcript)",
    year: 2013,
    sourceType: "speech",
    publisher: "Bridgewater Associates / economicprinciples.org",
    url: "https://economicprinciples.org/downloads/HowTheEconomicMachineWorksTranscript.pdf",
    format: "pdf",
  },
];

const td = await fetch(
  "https://www.ted.com/talks/ray_dalio_how_the_economic_machine_works/transcript",
  { headers: { "User-Agent": "Mozilla/5.0" } }
);
if (td.ok && /paragraphs/.test(await td.clone().text())) {
  dalioCandidates.push({
    slug: "ted-economic-machine",
    title: "How the Economic Machine Works (TED Transcript)",
    year: 2013,
    sourceType: "speech",
    publisher: "TED Conferences",
    url: "https://www.ted.com/talks/ray_dalio_how_the_economic_machine_works/transcript",
    format: "html",
  });
}
await write("dalio", dalioCandidates);

await write("templeton", [
  {
    slug: "16-rules-investment-success",
    title: "16 Rules for Investment Success",
    year: 1993,
    sourceType: "essay",
    publisher: "John Templeton Foundation / World Monitor: The Christian Science Monitor Monthly",
    url: "https://www.templetonworldcharity.org/learning/twelve-rules-for-investment-success",
    format: "html",
  },
]);

console.log("v2 registries written");
