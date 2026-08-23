/**
 * In-memory sliding-window rate limiter.
 *
 * Per-instance (serverless-friendly best effort): each Vercel function instance
 * keeps its own counters, so effective limits scale with instance count — still
 * enough to blunt credential-stuffing and abuse bursts on auth endpoints.
 * For hard guarantees, front this with an edge rule or a shared store.
 */

type Bucket = { hits: number[]; };

const buckets = new Map<string, Bucket>();
const MAX_KEYS = 10_000;

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  retryAfterMs: number;
};

/**
 * Consume one hit from `key`. Returns ok:false when the caller has exceeded
 * `limit` requests inside `windowMs`.
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  let bucket = buckets.get(key);

  if (!bucket) {
    if (buckets.size >= MAX_KEYS) {
      // Cheap GC: drop expired entries before refusing new keys.
      for (const [k, v] of buckets) {
        if (v.hits.length === 0 || v.hits[v.hits.length - 1] <= now - windowMs) buckets.delete(k);
      }
    }
    bucket = { hits: [] };
    buckets.set(key, bucket);
  }

  bucket.hits = bucket.hits.filter((t) => t > now - windowMs);

  if (bucket.hits.length >= limit) {
    const oldest = bucket.hits[0];
    return { ok: false, remaining: 0, retryAfterMs: Math.max(0, oldest + windowMs - now) };
  }

  bucket.hits.push(now);
  return { ok: true, remaining: limit - bucket.hits.length, retryAfterMs: 0 };
}

/** Best-effort client IP extraction behind Vercel's proxy. */
export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}
