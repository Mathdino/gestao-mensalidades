import 'dotenv/config'
import { prisma } from '../lib/prisma'

async function main() {
  console.log('🔍 Verificando dados no banco...')
  const users = await prisma.user.findMany()
  console.log(`\n👥 Usuários (${users.length}):`)
  for (const u of users) {
    console.log('  -', JSON.stringify(u, null, 2))
  }
  const accounts = await prisma.account.findMany()
  console.log(`\n🔑 Contas/Accounts (${accounts.length}):`)
  for (const a of accounts) {
    const safe = { ...a, password: a.password ? `HASHED (${a.password.length} chars)` : null }
    console.log('  -', JSON.stringify(safe, null, 2))
  }
  const sessions = await prisma.session.findMany()
  console.log(`\n📋 Sessões (${sessions.length}):`)
  for (const s of sessions) {
    console.log('  -', JSON.stringify({ id: s.id, userId: s.userId, expiresAt: s.expiresAt }, null, 2))
  }
}
main().finally(() => prisma.$disconnect())
