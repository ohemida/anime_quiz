import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import path from 'path'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  const dbUrl = process.env.DATABASE_URL ?? 'file:./prisma/dev.db'
  const dbPath = dbUrl.startsWith('file:')
    ? path.resolve(process.cwd(), dbUrl.slice('file:'.length))
    : dbUrl
  const adapter = new PrismaBetterSqlite3({ url: dbPath })
  // Prisma 7 requires passing `adapter` for the BetterSQLite3 adapter.
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
