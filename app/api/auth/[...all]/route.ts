import type { NextRequest } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Import lazy: evita avaliar o módulo de auth (better-auth + prisma adapter)
// durante o "collect page data" do build. Só carrega em request-time.
async function getHandler() {
  const [{ auth }, { toNextJsHandler }] = await Promise.all([
    import('@/lib/auth'),
    import('better-auth/next-js'),
  ])
  return toNextJsHandler(auth.handler)
}

export async function GET(req: NextRequest) {
  const { GET } = await getHandler()
  return GET(req)
}

export async function POST(req: NextRequest) {
  const { POST } = await getHandler()
  return POST(req)
}
