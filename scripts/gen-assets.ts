/**
 * Generate brand-exact static assets: og.png, apple-icon.png, logo.svg.
 * Run: bun scripts/gen-assets.ts   (writes into public/ and src/app/)
 *
 * Everything is drawn programmatically — exact brand hexes (#f2efe7 paper,
 * #11110f ink, #2f5bff signal), no AI generation, deterministic output.
 */
import sharp from "sharp";
import { writeFileSync } from "fs";

const PAPER = "#f2efe7";
const PAPER2 = "#e9e4d9";
const INK = "#11110f";
const GRAPHITE = "#5b5952";
const RULE = "#c9c3b7";
const SIGNAL = "#2f5bff";
const SIGNAL_DARK = "#1736a5";

const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
const DISPLAY = "Bricolage Grotesque, Geo gubernare none, Arial, sans-serif";

/* ── OG card 1200×630 ─────────────────────────────────────────────────── */
const ogSvg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="grid" width="100%" height="22" patternUnits="userSpaceOnUse">
      <line x1="0" y1="0" x2="1200" y2="0" stroke="rgba(17,17,15,0.06)" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="1200" height="630" fill="${PAPER}"/>
  <rect width="1200" height="630" fill="url(#grid)"/>
  <rect x="24" y="24" width="1152" height="582" fill="none" stroke="${INK}" stroke-width="3"/>

  <!-- wordmark -->
  <text x="72" y="118" font-family="${DISPLAY}" font-size="44" font-weight="800" letter-spacing="-3" fill="${INK}">INVESTOR<tspan font-weight="340" fill="${SIGNAL}">/</tspan>PASS</text>

  <!-- headline (3-line hero) -->
  <text x="72" y="240" font-family="${DISPLAY}" font-size="74" font-weight="720" letter-spacing="-4" fill="${INK}">Understand the money.</text>
  <text x="72" y="322" font-family="${DISPLAY}" font-size="74" font-weight="720" letter-spacing="-4" fill="${SIGNAL_DARK}">Study the minds.</text>
  <text x="72" y="404" font-family="${DISPLAY}" font-size="74" font-weight="720" letter-spacing="-4" fill="${INK}">Follow the evidence.</text>

  <!-- support line -->
  <text x="72" y="452" font-family="Georgia, serif" font-style="italic" font-size="26" fill="${GRAPHITE}">Learn how finance works · study exceptional investors · research the evidence</text>

  <!-- stats row -->
  <g font-family="${MONO}" font-size="21" letter-spacing="1.5">
    <text x="72" y="512" fill="${INK}" font-weight="700">31 INVESTORS</text>
    <text x="322" y="512" fill="${INK}" font-weight="700">619 SOURCES</text>
    <text x="572" y="512" fill="${INK}" font-weight="700">12,078 RESEARCH UNITS</text>
    <text x="922" y="512" fill="${INK}" font-weight="700">42 THEMES</text>
  </g>
  <line x1="72" y1="530" x2="1128" y2="530" stroke="${RULE}" stroke-width="1"/>

  <!-- footer kicker -->
  <g font-family="${MONO}" font-size="19" letter-spacing="1.2">
    <text x="72" y="570" fill="${GRAPHITE}">FREE TO EXPLORE · PRO $9/MO · EVERY RECORD SOURCED</text>
  </g>
</svg>`;

/* ── Apple icon 180×180 ───────────────────────────────────────────────── */
const appleSvg = `
<svg width="180" height="180" viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg">
  <rect width="180" height="180" fill="${PAPER}"/>
  <rect x="6" y="6" width="168" height="168" fill="none" stroke="${INK}" stroke-width="3"/>
  <text x="90" y="118" text-anchor="middle" font-family="${DISPLAY}" font-size="86" font-weight="800" letter-spacing="-6" fill="${INK}">I<tspan font-weight="340" fill="${SIGNAL}">/</tspan>P</text>
</svg>`;

/* ── app icon.svg (64×64, Next auto-detects src/app/icon.svg) ─────────── */
const iconSvg = `<?xml version="1.0" encoding="utf-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="8" fill="#f2efe7"/>
  <rect x="3" y="3" width="58" height="58" rx="6" fill="none" stroke="#11110f" stroke-width="2.5"/>
  <text x="32" y="43" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" font-weight="800" letter-spacing="-2" fill="#11110f">I<tspan font-weight="400" fill="#2f5bff">/</tspan>P</text>
</svg>`;

async function main() {
  await sharp(Buffer.from(ogSvg)).png().toFile("public/og.png");
  await sharp(Buffer.from(appleSvg)).png().toFile("public/apple-icon.png");
  writeFileSync("src/app/icon.svg", iconSvg);
  console.log("✓ public/og.png (1200×630), public/apple-icon.png (180×180), src/app/icon.svg");
}
main();
