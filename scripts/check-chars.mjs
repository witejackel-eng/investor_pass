/**
 * Character integrity audit - zero broken characters allowed.
 * Scans source/data surfaces for double-encoded mojibake and
 * replacement characters outside the brand whitelist.
 * All suspects built from \u escapes so this file can never lie about itself.
 * Run: bun scripts/check-chars.mjs   (exit 1 on findings)
 */
import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

const ROOTS = ["src", "data"];
const FILE_RE = /\.(ts|tsx|js|mjs|json|css)$/;

// Common UTF-8-read-as-CP1252 fingerprints, spelled in escapes:
// Ã‰ Ã© Ã¨ Ã§ Â» Â« â€œ â€ â€˜ â€™ â€” â€“ â‚¬ Â£ Â¥ Ã¼ Ã± ï¿½
const MOJIBAKE = [
  "\u00C3\u0089", "\u00C3\u00A9", "\u00C3\u00A8", "\u00C3\u00A7",
  "\u00C2\u00BB", "\u00C2\u00AB", "\u00E2\u20AC\u0153", "\u00E2\u20AC",
  "\u00E2\u20AC\u02DC", "\u00E2\u20AC\u2122", "\u00E2\u20AC\u201D",
  "\u00E2\u20AC\u201C", "\u00E2\u201A\u00AC", "\u00C2\u00A3", "\u00C2\u00A5",
  "\u00C3\u00BC", "\u00C3\u00B1", "\u00EF\u00BF\u00BD", "\u00C2\u00A0",
  // Observed-in-the-wild variants (fixed 2026-08-22):
  "\u00E2\u2020\u2019",   // mojibake right single quote
  "\u00C2\u00B7",          // mojibake middle dot
];
// U+FFFD replacement char anywhere = broken encoding, period.
const REPLACEMENT = "\uFFFD";

let bad = 0;
function walk(dir) {
  let entries = [];
  try { entries = readdirSync(dir); } catch { return; }
  for (const name of entries) {
    if (name === "node_modules" || name === ".next") continue;
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) walk(p);
    else if (FILE_RE.test(name)) scan(p);
  }
}

function scan(p) {
  let text;
  try { text = readFileSync(p, "utf-8"); } catch { return; }
  const lines = text.split(/\r?\n/);
  lines.forEach((line, i) => {
    const hitMojibake = MOJIBAKE.some((m) => line.includes(m));
    const hitReplacement = line.includes(REPLACEMENT);
    if (hitMojibake || hitReplacement) {
      console.log(`${p}:${i + 1}: ${line.trim().slice(0, 120)}`);
      bad++;
    }
  });
}

ROOTS.forEach(walk);

if (bad > 0) {
  console.error(`\nX ${bad} suspicious line(s). Fix encoding before shipping.`);
  process.exit(1);
}
console.log("OK character integrity clean");
