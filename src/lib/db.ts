import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * Serverless pool discipline: the Supabase session pooler caps this database
 * at 15 clients total. Every Vercel function instance (and each of the 3
 * build workers) creates its own PrismaClient — with the default pool size
 * (num_cpus × 2 + 1) that exhausts the pooler instantly (EMAXCONNSESSION).
 *
 * connection_limit=1 gives each instance exactly one pooled connection and
 * lets Prisma queue queries internally; pool_timeout=20 makes bursts wait
 * instead of failing; connect_timeout=10 fails fast on cold pooler issues.
 * Idempotent: a URL that already carries a connection_limit passes through.
 */
function datasourceUrl(): string | undefined {
  const url = process.env.DATABASE_URL
  if (!url || url.startsWith('file:')) return url
  if (url.includes('connection_limit=')) return url
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}connection_limit=1&pool_timeout=20&connect_timeout=10`
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Query logging is a dev-only affordance; never log SQL in production.
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['query', 'error'],
    datasources: { db: { url: datasourceUrl() } },
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
