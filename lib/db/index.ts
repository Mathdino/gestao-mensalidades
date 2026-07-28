import { prisma } from '@/lib/prisma'
import * as schema from './schema'

export { schema }

export const db = prisma

export const pool = {
  query: (sql: string, params?: any[]) => prisma.$queryRawUnsafe(sql, ...(params ?? [])),
  connect: async () => ({
    query: (sql: string, params?: any[]) => prisma.$queryRawUnsafe(sql, ...(params ?? [])),
    release: () => {},
  }),
}
