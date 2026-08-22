/**
 * Generates public/og.png (1200x630) and public/apple-icon.png (180x180)
 * from inline brand SVG. Run: bun scripts/generate-og.mjs
 */
import sharp from "sharp";

const ogSvg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#E4DFD3" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="1200" height="630" fill="#F7F4EC"/>
  <rect width="1200" height="630" fill="url(#grid)"/>
  <rect x="48" y="48" width="1104" height="534" fill="none" stroke="#191919" stroke-width="3"/>
  <rect x="60" y="60" width="1080" height="510" fill="#F7F4EC"/>

  <g transform="translate(120,150)">
    <rect x="-28" y="-38" width="76" height="76" rx="14" fill="#2D2D2D"/>
    <g transform="scale(2)" fill="#FFFFFF">
      <path d="M34.5 15.5l-3.1 4.4c-.5.7-1.4 1.2-2.3 1.2h-18v-4.9c0-.4.3-.7.7-.7h22.7z"/>
      <polygon points="56,15.5 29.6,48.5 11.8,48.5 38.2,15.5"/>
      <path d="M31.9 48.5l3.1-4.4c.5-.7 1.4-1.2 2.3-1.2h18.4v4.9c0 .4-.3.7-.7.7H31.9z"/>
    </g>
    <text x="80" y="26" font-family="Georgia, 'Times New Roman', serif" font-size="88" font-weight="700" letter-spacing="-3" fill="#191919">INVESTOR<tspan fill="#C8371E">/</tspan>PASS</text>
    <text x="84" y="86" font-family="Georgia, serif" font-size="30" font-style="italic" fill="#5A5648">The public record, properly indexed.</text>
  </g>

  <line x1="120" y1="330" x2="1080" y2="330" stroke="#191919" stroke-width="2"/>
  <text x="120" y="392" font-family="Georgia, serif" font-size="34" fill="#191919">Shareholder letters · speeches · interviews</text>
  <text x="120" y="442" font-family="Georgia, serif" font-size="34" fill="#191919">— searchable, structured, connected.</text>

  <text x="120" y="530" font-family="'Courier New', monospace" font-size="22" font-weight="bold" letter-spacing="4" fill="#C8371E">FREE TO EXPLORE · PRO FOR EVERYTHING</text>
</svg>`;

const iconSvg = `
<svg width="180" height="180" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <rect width="64" height="64" rx="12" fill="#2D2D2D"/>
  <g fill="#FFFFFF">
    <path d="M34.5 15.5l-3.1 4.4c-.5.7-1.4 1.2-2.3 1.2h-18v-4.9c0-.4.3-.7.7-.7h22.7z"/>
    <polygon points="56,15.5 29.6,48.5 11.8,48.5 38.2,15.5"/>
    <path d="M31.9 48.5l3.1-4.4c.5-.7 1.4-1.2 2.3-1.2h18.4v4.9c0 .4-.3.7-.7.7H31.9z"/>
  </g>
</svg>`;

await sharp(Buffer.from(ogSvg)).png({ quality: 90 }).toFile("public/og.png");
await sharp(Buffer.from(iconSvg)).png().toFile("public/apple-icon.png");
console.log("og.png + apple-icon.png generated");
