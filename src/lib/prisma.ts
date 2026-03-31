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
  // Prisma 7 requires passing `adapter` but the generated client types don't
  // yet expose this option directly — cast is necessary for compatibility.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new PrismaClient({ adapter } as any)
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
