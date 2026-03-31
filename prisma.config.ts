import { defineConfig } from 'prisma/config'

const dbUrl = process.env.DATABASE_URL ?? 'file:./prisma/dev.db'

export default defineConfig({
  datasource: {
    url: dbUrl,
  },
})
