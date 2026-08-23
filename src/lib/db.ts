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
 * connection_limit=3 keeps the 3 build workers at 9 clients (under the 15
 * cap) while giving each instance enough throughput to prerender pages
 * concurrently; pool_timeout=60 lets bursts queue instead of failing.
 * Idempotent: a URL that already carries a connection_limit passes through.
 */
function datasourceUrl(): string | undefined {
  const url = process.env.DATABASE_URL
  if (!url || url.startsWith('file:')) return url
  if (url.includes('connection_limit=')) return url
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}connection_limit=3&pool_timeout=60&connect_timeout=10`
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Query logging is a dev-only affordance; never log SQL in production.
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['query', 'error'],
    datasources: { db: { url: datasourceUrl() } },
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
