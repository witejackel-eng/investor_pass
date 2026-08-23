import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * Serverless/build safety: the Supabase session pooler caps clients
 * (pool_size 15). `next build` runs 3 parallel workers, each with its own
 * PrismaClient — uncapped pools blew past the limit during prerendering
 * (EMAXCONNSESSION). Cap every client's pool and make connection attempts
 * queue instead of fail. Idempotent: a URL that already carries a
 * connection_limit is passed through untouched.
 */
function datasourceUrl(): string | undefined {
  const url = process.env.DATABASE_URL
  if (!url || url.startsWith('file:')) return url
  if (url.includes('connection_limit=')) return url
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}connection_limit=3&pool_timeout=20`
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Query logging is a dev-only affordance; never log SQL in production.
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['query', 'error'],
    datasources: { db: { url: datasourceUrl() } },
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
