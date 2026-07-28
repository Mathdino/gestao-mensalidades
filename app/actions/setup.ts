'use server'

import { prisma } from '@/lib/prisma'

export async function setupDatabase() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return { success: true }
  } catch (error) {
    console.error('[setupDatabase] error:', error)
    return { success: false, error: String(error) }
  }
}
