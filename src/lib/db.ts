import { PrismaClient, Prisma } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createDb> | undefined
}

/**
 * Serverless pool discipline: the Supabase session pooler caps this database
 * at 15 clients total. Every Vercel function instance creates its own
 * PrismaClient — with a per-instance limit >1, a handful of concurrent
 * instances exhausts the pooler instantly (EMAXCONNSESSION → user-visible
 * 500s, reproduced under concurrent load 2026-08-23).
 *
 * connection_limit=1 is the Supabase-recommended serverless setting: the
 * runtime can now run up to 15 concurrent instances before touching the cap
 * (and the 3 build workers use 3 clients total). pool_timeout=60 lets
 * bursts queue inside Prisma instead of failing; connect_timeout=10 fails
 * fast on a genuinely unreachable database.
 *
 * Transient pool rejections are additionally retried by the query extension
 * below, so a short burst beyond the cap degrades to latency, not errors.
 *
 * Idempotent: a URL that already carries a connection_limit passes through.
 */
function datasourceUrl(): string | undefined {
  const url = process.env.DATABASE_URL
  if (!url || url.startsWith('file:')) return url
  if (url.includes('connection_limit=')) return url

  // OUTAGE FIX (2026-08-23): the Supabase SESSION pooler (port 5432) caps
  // this database at 15 clients, and frozen serverless instances pin those
  // slots indefinitely → persistent EMAXCONNSESSION, site-wide 500s.
  // Serverless-correct path is the TRANSACTION pooler (port 6543) which is
  // not client-capped; Prisma needs pgbouncer=true there (disables prepared
  // statements). Set IP_DB_SESSION_POOLER=1 to keep session mode explicitly.
  let out = url
  if (process.env.IP_DB_SESSION_POOLER !== '1' && /pooler\.supabase\.com:5432/.test(out)) {
    out = out.replace('pooler.supabase.com:5432', 'pooler.supabase.com:6543')
  }

  const params = ['connection_limit=1', 'pool_timeout=60', 'connect_timeout=10']
  if (/pooler\.supabase\.com:6543/.test(out) && !out.includes('pgbouncer=')) {
    params.push('pgbouncer=true')
  }
  const sep = out.includes('?') ? '&' : '?'
  return `${out}${sep}${params.join('&')}`
}

const TRANSIENT = /EMAXCONNSESSION|max clients|Timed out fetching|Connection terminated|Connection reset/i
const TRANSIENT_CODES = new Set(['P2024', 'P1017', 'P1001'])
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

function isTransient(e: unknown): boolean {
  if (e instanceof Prisma.PrismaClientInitializationError) {
    if (e.errorCode && TRANSIENT_CODES.has(e.errorCode)) return true
    return TRANSIENT.test(e.message)
  }
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    return TRANSIENT_CODES.has(e.code)
  }
  return e instanceof Error && TRANSIENT.test(e.message)
}

function createDb() {
  const base = new PrismaClient({
    // Query logging is a dev-only affordance; never log SQL in production.
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['query', 'error'],
    datasources: { db: { url: datasourceUrl() } },
  })

  if (process.env.IP_DB_RETRY_OFF) return base

  // Retry transient pool/connection failures (small fixed backoff). The
  // $allOperations hook wraps connection acquisition too, so bursts that
  // momentarily exceed the pooler cap recover instead of surfacing 500s.
  return base.$extends({
    query: {
      $allOperations: async ({ operation, args, query }) => {
        const delays = [350, 900]
        for (let attempt = 0; ; attempt++) {
          try {
            return await query(args)
          } catch (e) {
            if (attempt < delays.length && isTransient(e)) {
              await sleep(delays[attempt])
              continue
            }
            throw e
          }
        }
      },
    },
  })
}

// The retry extension is transparent (same methods/args), but its generated
// type unions break `groupBy` overload resolution at call sites — so export
// under the base type. Runtime behavior: base client + retry hook.
export const db = (globalForPrisma.prisma ?? createDb()) as unknown as PrismaClient

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
