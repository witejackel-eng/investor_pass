import { readdirSync } from "fs";
let removed = 0;
for (const f of readdirSync("data/corpora").filter(f => f.endsWith(".jsonl"))) {
  const seen = new Set<string>();
  const outLines: string[] = [];
  for (const l of (await Bun.file(`data/corpora/${f}`).text()).split("\n").filter(Boolean)) {
    const o = JSON.parse(l);
    const keep = [];
    for (const p of o.passages ?? []) {
      const h = new Bun.CryptoHasher("sha1").update(p.text).digest("hex");
      if (seen.has(h)) { removed++; continue; }
      seen.add(h); keep.push(p);
    }
    o.passages = keep;
    if (keep.length > 0 || true) outLines.push(JSON.stringify(o));
  }
  await Bun.write(`data/corpora/${f}`, outLines.join("\n") + "\n");
}
console.log("duplicates removed:", removed);
