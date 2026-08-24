/**
 * Cloudflare R2 storage client (S3-compatible).
 * Stores compressed filing text at filings/{country}/{companyId}/{formType}/{accession}.zst
 *
 * Free tier: 10 GB. With zstd compression, ~300,000 filings fit comfortably.
 *
 * Credentials come from env (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID,
 * R2_SECRET_ACCESS_KEY, R2_BUCKET). Never hard-code.
 */
import { S3Client, PutObjectCommand, GetObjectCommand, HeadBucketCommand } from "@aws-sdk/client-s3";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET = process.env.R2_BUCKET || "investorpass";

export const r2Config = {
  accountId: R2_ACCOUNT_ID,
  bucket: R2_BUCKET,
  configured: Boolean(R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY),
};

let _client: S3Client | null = null;

export function r2Client(): S3Client {
  if (!_client) {
    if (!r2Config.configured) {
      throw new Error("R2 not configured — set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY");
    }
    _client = new S3Client({
      region: "auto",
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID!,
        secretAccessKey: R2_SECRET_ACCESS_KEY!,
      },
    });
  }
  return _client;
}

/**
 * Upload a compressed filing to R2.
 * @param key — e.g. "filings/US/AAPL/10-K/0000320193-23-000106.html.zst"
 * @param body — the compressed bytes (zstd)
 * @returns the R2 storage path
 */
export async function r2Put(key: string, body: Uint8Array, contentType = "application/octet-stream"): Promise<string> {
  const cmd = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    Body: body,
    ContentType: contentType,
  });
  await r2Client().send(cmd);
  return key;
}

/**
 * Download a filing from R2.
 * @param key — the storage path
 * @returns the compressed bytes (caller decompresses)
 */
export async function r2Get(key: string): Promise<Uint8Array | null> {
  try {
    const cmd = new GetObjectCommand({ Bucket: R2_BUCKET, Key: key });
    const res = await r2Client().send(cmd);
    if (!res.Body) return null;
    // Body is a Readable stream — collect chunks
    const chunks: Uint8Array[] = [];
    const body = res.Body as unknown as NodeJS.ReadableStream;
    for await (const chunk of body) {
      chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk as Uint8Array);
    }
    return Buffer.concat(chunks);
  } catch {
    return null;
  }
}

/**
 * Verify the R2 bucket exists and is writable.
 */
export async function r2CheckBucket(): Promise<boolean> {
  try {
    const cmd = new HeadBucketCommand({ Bucket: R2_BUCKET });
    await r2Client().send(cmd);
    return true;
  } catch (e) {
    console.error("[r2] bucket check failed:", e instanceof Error ? e.message : e);
    return false;
  }
}

/**
 * Build a canonical R2 storage path for a filing.
 * Pattern: filings/{country}/{companyId}/{formType}/{accession}.{ext}.zst
 */
export function filingStoragePath(
  country: string,
  companyId: string,
  formType: string,
  accession: string,
  ext: string
): string {
  const safeAccession = accession.replace(/[^a-zA-Z0-9-]/g, "-");
  return `filings/${country}/${companyId}/${formType}/${safeAccession}.${ext}.zst`;
}
