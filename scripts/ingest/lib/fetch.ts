const UA =
  "Mozilla/5.0 (compatible; InvestorPassCorpusBuilder/1.0; +https://investor-pass.vercel.app)";

export async function fetchDoc(url: string, attempt = 0): Promise<ArrayBuffer> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA },
      redirect: "follow",
      signal: AbortSignal.timeout(45000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return await res.arrayBuffer();
  } catch (err) {
    if (attempt < 3) {
      await sleep(1500 * (attempt + 1));
      return fetchDoc(url, attempt + 1);
    }
    throw err;
  }
}

export function decodeBuffer(buf: ArrayBuffer): string {
  const head = Buffer.from(buf.slice(0, 4096)).toString("latin1");
  if (/charset=["']?(windows-1252|iso-8859-1|us-ascii)/i.test(head)) {
    return new TextDecoder("windows-1252").decode(buf);
  }
  return new TextDecoder("utf-8").decode(buf);
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function sha1(s: string): string {
  return new Bun.CryptoHasher("sha1").update(s).digest("hex");
}
