import { PrismaClient, Prisma } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * Supabase pooler discipline (session pooler caps this database at 15 clients).
 *
 * LESSON (2026-08-23, postmortem in docs/CHANGELOG.md): the session→transaction
 * pooler auto-rewrite (5432→6543 + pgbouncer=true) fixed nothing at runtime —
 * it BROKE every production build from 23c7d96..0ffb912: heavy SSG investor
 * pages (Marks = 4,071 passages with junction includes) hold the single
 * connection far longer through PgBouncer transaction mode (no prepared
 * statements), so the 3 build workers queue past pool_timeout=60 and static
 * export dies. We no longer rewrite URLs, ever.
 *
 * Current, build-and-runtime-proven configuration:
 * - BUILD (NEXT_PHASE=phase-production-build): connection_limit=3 per build
 *   worker × 3 workers = 9 clients — the configuration every successful
 *   deployment before 23c7d96 used.
 * - RUNTIME: connection_limit=1 per serverless instance (many instances,
 *   small queries) + transient-retry below. This is the b315e7c runtime
 *   configuration, verified live under 15-way concurrent load.
 * - If the owner ever points DATABASE_URL at the transaction pooler (:6543)
 *   explicitly, we append pgbouncer=true because Prisma requires it there —
 *   honoring the operator's choice, never making it for them.
 * - pool_timeout=60 lets bursts queue inside Prisma instead of failing;
 *   connect_timeout=10 fails fast on a genuinely unreachable database.
 *
 * Idempotent: a URL that already carries a connection_limit passes through.
 */
function datasourceUrl(): string | undefined {
  const url = process.env.DATABASE_URL
  if (!url || url.startsWith('file:')) return url
  if (url.includes('connection_limit=')) return url

  const isBuild = process.env.NEXT_PHASE === 'phase-production-build'
  const params = [
    `connection_limit=${isBuild ? 3 : 1}`,
    'pool_timeout=60',
    'connect_timeout=10',
  ]
  if (url.includes(':6543') && !url.includes('pgbouncer=')) {
    params.push('pgbouncer=true') // Prisma requirement on transaction poolers
  }
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}${params.join('&')}`
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

  // Retry transient pool/connection failures (small fixed backoff) so short
  // bursts beyond the pooler cap degrade to latency, not user-visible 500s.
  return base.$extends({
    query: {
      $allOperations: async ({ args, query }) => {
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

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}
