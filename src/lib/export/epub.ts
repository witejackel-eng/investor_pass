/**
 * Minimal dependency-free EPUB 3 writer (store-mode ZIP: our own CRC32 +
 * local/central headers — zero new dependencies).
 */
import { deflateRawSync } from "zlib";

type Chapter = { title: string; html: string };

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function escXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function xhtml(title: string, bodyHtml: string): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops"><head><title>${escXml(title)}</title></head><body>${bodyHtml}</body></html>`;
}

function zipEntry(name: string, data: Buffer, store: boolean): { local: Buffer; central: Buffer } {
  const crc = crc32(data);
  const nameBuf = Buffer.from(name, "utf8");
  const now = new Date();
  const time = ((now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() / 2)) & 0xffff;
  const date = (((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate()) & 0xffff;
  const method = store ? 0 : 8;
  const compressed = store ? data : deflateRawSync(data);

  const local = Buffer.alloc(30 + nameBuf.length);
  local.writeUInt32LE(0x04034b50, 0);
  local.writeUInt16LE(20, 4);
  local.writeUInt16LE(0, 6);
  local.writeUInt16LE(method, 8);
  local.writeUInt16LE(time, 10);
  local.writeUInt16LE(date, 12);
  local.writeUInt32LE(crc, 14);
  local.writeUInt32LE(compressed.length, 18);
  local.writeUInt32LE(data.length, 22);
  local.writeUInt16LE(nameBuf.length, 26);
  local.writeUInt16LE(0, 28);
  nameBuf.copy(local, 30);

  const central = Buffer.alloc(46 + nameBuf.length);
  central.writeUInt32LE(0x02014b50, 0);
  central.writeUInt16LE(20, 4);
  central.writeUInt16LE(20, 6);
  central.writeUInt16LE(0, 8);
  central.writeUInt16LE(method, 10);
  central.writeUInt16LE(time, 12);
  central.writeUInt16LE(date, 14);
  central.writeUInt32LE(crc, 16);
  central.writeUInt32LE(compressed.length, 20);
  central.writeUInt32LE(data.length, 24);
  central.writeUInt16LE(nameBuf.length, 28);
  central.writeUInt32LE(0, 42);
  nameBuf.copy(central, 46);

  return { local: Buffer.concat([local, compressed]), central };
}

export function buildEpub(opts: { title: string; author: string; chapters: Chapter[] }): Buffer {
  const { title, author, chapters } = opts;
  const entries: { name: string; data: Buffer; store: boolean }[] = [
    { name: "mimetype", data: Buffer.from("application/epub+zip"), store: true },
    {
      name: "META-INF/container.xml",
      data: Buffer.from(`<?xml version="1.0"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>`),
      store: false,
    },
    {
      name: "OEBPS/content.opf",
      data: Buffer.from(`<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="bookid"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:identifier id="bookid">urn:uuid:investorpass-${Date.now()}</dc:identifier><dc:title>${escXml(title)}</dc:title><dc:creator>${escXml(author)}</dc:creator><dc:language>en</dc:language></metadata><manifest><item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>${chapters.map((_, i) => `<item id="c${i}" href="c${i}.xhtml" media-type="application/xhtml+xml"/>`).join("")}</manifest><spine>${chapters.map((_, i) => `<itemref idref="c${i}"/>`).join("")}</spine></package>`),
      store: false,
    },
    {
      name: "OEBPS/nav.xhtml",
      data: Buffer.from(xhtml(title, `<nav epub:type="toc"><h1>${escXml(title)}</h1><ol>${chapters.map((c, i) => `<li><a href="c${i}.xhtml">${escXml(c.title)}</a></li>`).join("")}</ol></nav>`)),
      store: false,
    },
    ...chapters.map((c, i) => ({
      name: `OEBPS/c${i}.xhtml`,
      data: Buffer.from(xhtml(c.title, c.html)),
      store: false,
    })),
  ];

  const locals: Buffer[] = [];
  const centrals: Buffer[] = [];
  let offset = 0;
  for (const e of entries) {
    const z = zipEntry(e.name, e.data, e.store);
    z.central.writeUInt32LE(offset, 42);
    locals.push(z.local);
    centrals.push(z.central);
    offset += z.local.length;
  }
  const centralBuf = Buffer.concat(centrals);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(entries.length, 8);
  eocd.writeUInt16LE(entries.length, 10);
  eocd.writeUInt32LE(centralBuf.length, 12);
  eocd.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, centralBuf, eocd]);
}
