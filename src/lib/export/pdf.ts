/**
 * Minimal dependency-free PDF writer (Helvetica, Letter size, wrapped text).
 * Output is a valid PDF 1.4 byte stream. Text is Latin-1 encoded with octal
 * escapes; control chars stripped. Good for research-volume exports.
 */

export type PdfBlock = { text: string; style?: "h1" | "h2" | "body" | "small" };

const PAGE_W = 612, PAGE_H = 792, MARGIN = 56;

function esc(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function toLatin1(s: string): string {
  // Map common typography to Latin-1-friendly ASCII, drop the rest.
  const map: Record<string, string> = { "\u2018": "'", "\u2019": "'", "\u201C": '"', "\u201D": '"', "\u2013": "-", "\u2014": "—", "\u2026": "...", "\u00A0": " ", "\u2022": "-" };
  let out = "";
  for (const ch of s) {
    if (map[ch]) { out += map[ch]; continue; }
    const c = ch.codePointAt(0)!;
    out += c >= 32 && c <= 255 ? ch : c === 10 || c === 13 ? " " : "?";
  }
  return out;
}

function wrap(text: string, maxChars: number): string[] {
  const words = toLatin1(text).split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > maxChars) {
      if (cur) lines.push(cur);
      cur = w.length > maxChars ? w.slice(0, maxChars) : w;
    } else cur = (cur + " " + w).trim();
  }
  if (cur) lines.push(cur);
  return lines.length ? lines : [""];
}

export function buildPdf(title: string, subtitle: string, blocks: PdfBlock[]): Buffer {
  const pages: string[] = [];
  let ops: string[] = [];
  let y = PAGE_H - MARGIN;

  const styleFor = (s?: string) =>
    s === "h1" ? { size: 20, lead: 26, bold: true } :
    s === "h2" ? { size: 14, lead: 20, bold: true } :
    s === "small" ? { size: 8, lead: 11, bold: false } :
    { size: 10, lead: 14, bold: false };

  const flushPage = () => {
    if (ops.length) pages.push(ops.join("\n"));
    ops = [];
    y = PAGE_H - MARGIN;
  };

  // Title block on first page
  const push = (text: string, style?: string) => {
    const { size, lead, bold } = styleFor(style);
    const font = bold ? "/F2" : "/F1";
    const maxChars = Math.floor((PAGE_W - 2 * MARGIN) / (size * 0.5));
    for (const line of wrap(text, maxChars)) {
      if (y < MARGIN + lead) flushPage();
      ops.push(`BT ${font} ${size} Tf 1 0 0 1 ${MARGIN} ${y.toFixed(1)} Tm (${esc(line)}) Tj ET`);
      y -= lead;
    }
    y -= style === "h1" || style === "h2" ? 6 : 2;
  };

  push(title, "h1");
  push(subtitle, "small");
  y -= 8;
  for (const b of blocks) push(b.text, b.style);
  flushPage();

  // Assemble objects
  const objects: string[] = [];
  const nPages = pages.length;
  // 1: catalog, 2: pages, 3: F1 Helvetica, 4: F2 Helvetica-Bold, then page+content pairs
  const kids = pages.map((_, i) => `${5 + i * 2} 0 R`).join(" ");
  objects[1] = `<< /Type /Catalog /Pages 2 0 R >>`;
  objects[2] = `<< /Type /Pages /Count ${nPages} /Kids [${kids}] >>`;
  objects[3] = `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>`;
  objects[4] = `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>`;
  pages.forEach((content, i) => {
    const pageObj = 5 + i * 2, contentObj = pageObj + 1;
    objects[pageObj] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentObj} 0 R >>`;
    objects[contentObj] = `<< /Length ${Buffer.byteLength(content, "latin1")} >>\nstream\n${content}\nendstream`;
  });

  let out = "%PDF-1.4\n";
  const offsets: number[] = [];
  for (let i = 1; i < objects.length; i++) {
    if (!objects[i]) continue;
    offsets[i] = Buffer.byteLength(out, "latin1");
    out += `${i} 0 obj\n${objects[i]}\nendobj\n`;
  }
  const xrefPos = Buffer.byteLength(out, "latin1");
  const count = objects.length;
  out += `xref\n0 ${count}\n0000000000 65535 f \n`;
  for (let i = 1; i < count; i++) {
    out += `${String(offsets[i] ?? 0).padStart(10, "0")} 00000 n \n`;
  }
  out += `trailer\n<< /Size ${count} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF`;
  return Buffer.from(out, "latin1");
}
