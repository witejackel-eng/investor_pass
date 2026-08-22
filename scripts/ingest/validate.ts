import { readdirSync } from "fs";
const problems: string[] = [];
const seen = new Map<string, Set<string>>();
let totalP = 0;
for (const f of readdirSync("data/corpora").filter(f => f.endsWith(".jsonl"))) {
  const inv = f.replace(/\.jsonl$/, "");
  seen.set(inv, new Set());
  const lines = (await Bun.file(`data/corpora/${f}`).text()).split("\n").filter(Boolean);
  for (const l of lines) {
    const o = JSON.parse(l);
    if (o.personSlug !== inv) problems.push(`${inv}: wrong personSlug ${o.personSlug}`);
    if (!o.source.slug || !o.source.title) problems.push(`${inv}/${o.source.slug}: bad source meta`);
    for (const p of o.passages ?? []) {
      totalP++;
      if (p.text.length < 100 || p.text.length > 3000) problems.push(`${o.source.slug}#${p.sequence}: len ${p.text.length}`);
      const h = new Bun.CryptoHasher("sha1").update(p.text).digest("hex");
      if (seen.get(inv)!.has(h)) problems.push(`${o.source.slug}#${p.sequence}: DUPLICATE passage`);
      seen.get(inv)!.add(h);
      const years = [...p.text.matchAll(/\b(19\d{2}|20\d{2})\b/g)];
      void years;
    }
  }
}
console.log("total passages:", totalP);
console.log("problems:", problems.length);
problems.slice(0, 10).forEach(p => console.log("  !", p));
console.log(problems.length === 0 ? "VALIDATION CLEAN" : "REVIEW NEEDED");
