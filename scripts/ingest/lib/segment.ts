export type PassageDraft = { text: string; sequence: number };

const MIN_LEN = 350;
const MAX_LEN = 1500;

const NOISE =
  /^(table of contents|contents|index|back to top|berkshire hathaway inc\.|oaktree capital management|page \d+|\d+\s*\|?)+$/i;

function isProse(p: string): boolean {
  if (p.length < 40) return false;
  if (NOISE.test(p.trim())) return false;
  const letters = (p.match(/[a-zA-Z]/g) || []).length;
  if (letters / p.length < 0.55) return false;
  return true;
}

export function segment(text: string): PassageDraft[] {
  const paragraphs = text
    .split(/\n\s*\n+/)
    .map((p) => p.replace(/\n/g, " ").replace(/\s{2,}/g, " ").trim())
    .filter(isProse);

  const passages: string[] = [];
  let current = "";

  const flush = () => {
    const t = current.trim();
    if (t.length >= MIN_LEN * 0.6) passages.push(t);
    current = "";
  };

  for (const p of paragraphs) {
    if (p.length > MAX_LEN) {
      flush();
      for (const chunk of splitLongParagraph(p)) {
        if (current.length + chunk.length + 1 <= MAX_LEN) {
          current = current ? `${current} ${chunk}` : chunk;
        } else {
          flush();
          current = chunk;
        }
        flush();
      }
      continue;
    }
    if (!current) {
      current = p;
    } else if (current.length + p.length + 1 <= MAX_LEN && current.length < MIN_LEN) {
      current = `${current} ${p}`;
    } else {
      flush();
      current = p;
    }
    if (current.length >= MIN_LEN) flush();
  }
  flush();

  return passages.map((text, sequence) => ({ text, sequence }));
}

function splitLongParagraph(p: string): string[] {
  const sentences = p.match(/[^.!?]+[.!?]+["')\]]*|\S+$/g) || [p];
  const chunks: string[] = [];
  let cur = "";
  for (const s of sentences) {
    if (cur.length + s.length > MAX_LEN && cur) {
      chunks.push(cur.trim());
      cur = s;
    } else {
      cur += s;
    }
  }
  if (cur.trim()) chunks.push(cur.trim());
  return chunks.filter((c) => c.length > 60);
}
