import * as cheerio from "cheerio";
import { PDFParse } from "pdf-parse";
import { decodeBuffer } from "./fetch";

export function extractHtmlText(html: string): string {
  const $ = cheerio.load(html);
  $("script, style, noscript, iframe, form, head").remove();
  const bodyText = $("body").text() || $.root().text();
  return normalize(bodyText);
}

export async function extractPdfText(data: ArrayBuffer): Promise<string> {
  const parser = new PDFParse({ data: new Uint8Array(data) });
  try {
    const result = await parser.getText();
    return normalize(result.text);
  } finally {
    await parser.destroy();
  }
}

export function decodeHtml(buf: ArrayBuffer): string {
  return extractHtmlText(decodeBuffer(buf));
}

function normalize(text: string): string {
  return text
    .replace(/\r\n?/g, "\n")
    .replace(/\u00a0|\u200b/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .split("\n")
    .filter((line) => !/^\s*(page\s+)?\d{1,3}\s*$/.test(line))
    .join("\n")
    .trim();
}
