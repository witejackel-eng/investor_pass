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

await out("templeton", [
  {
    slug: "templeton-prize-address-1985",
    title: "Templeton Prize Address",
    year: 1985,
    sourceType: "speech",
    publisher: "Templeton Prize Foundation",
    url: "https://www.templetonprize.org/laureate-sub/hardy-templeton-speech/",
    format: "html",
  },
]);

await out("greenblatt", [
  {
    slug: "knowledge-project-interview",
    title: "The Knowledge Project Podcast Interview (Transcript)",
    year: null,
    sourceType: "interview",
    publisher: "Farnam Street / fs.blog",
    url: "https://fs.blog/knowledge-project-podcast/joel-greenblatt/",
    format: "html",
  },
]);

const lynch = JSON.parse(await Bun.file("scripts/ingest/registries/lynch.json").text());
lynch.sources.push({
  slug: "pbs-frontline-interview",
  title: "Frontline: Betting on the Market — Interview",
  year: 1996,
  sourceType: "interview",
  publisher: "PBS Frontline / WGBH",
  url: "https://www.pbs.org/wgbh/pages/frontline/shows/betting/pros/lynch.html",
  format: "html",
});
await Bun.write("scripts/ingest/registries/lynch.json", JSON.stringify(lynch, null, 2));

const druck = JSON.parse(await Bun.file("scripts/ingest/registries/druckenmiller.json").text());
druck.sources.push(
  {
    slug: "cnbc-delivering-alpha-2022",
    title: "CNBC Delivering Alpha Interview with Joe Kernen",
    year: 2022,
    sourceType: "interview",
    publisher: "CNBC",
    url: "https://nbcuniversalnewsgroup.com/cnbc/2022/09/28/cnbc-transcript-duquesne-family-office-chairman-ceo-stanley-druckenmiller-speaks-with-cnbcs-joe-kernen-live-during-the-cnbc-delivering-alpha-conference-today/",
    format: "html",
  },
  {
    slug: "cnbc-squawk-box-2024",
    title: "CNBC Squawk Box Exclusive Interview",
    year: 2024,
    sourceType: "interview",
    publisher: "CNBC",
    url: "https://www.cnbc.com/2024/05/07/cnbc-exclusive-cnbc-transcript-billionaire-investor-stanley-druckenmiller-speaks-with-cnbcs-squawk-box-today.html",
    format: "html",
  }
);
await Bun.write("scripts/ingest/registries/druckenmiller.json", JSON.stringify(druck, null, 2));

const simons = JSON.parse(await Bun.file("scripts/ingest/registries/simons.json").text());
simons.sources.push({
  slug: "simons-foundation-cheeger-interview",
  title: "Jim Simons on His Career in Mathematics (Interview with Jeff Cheeger)",
  year: 2012,
  sourceType: "interview",
  publisher: "Simons Foundation",
  url: "https://www.simonsfoundation.org/2012/09/28/simons-foundation-chair-jim-simons-on-his-career-in-mathematics/",
  format: "html",
});
await Bun.write("scripts/ingest/registries/simons.json", JSON.stringify(simons, null, 2));

await out("swensen", [
  {
    slug: "yale-endowment-report-2021",
    title: "Yale Endowment Annual Report 2021",
    year: 2021,
    sourceType: "annual_report",
    publisher: "Yale University Investments Office (mirror)",
    url: "https://swensenmemorial.com/img/2021-Endowment-Report.pdf",
    format: "pdf",
  },
]);

console.log("v4 registries written");
