import 'dotenv/config'
import { prisma } from '../lib/prisma'
import { hashPassword } from 'better-auth/crypto'
import crypto from 'crypto'

const EMAIL = 'diretoria@fanfarroes.com'
const PASSWORD = 'fanfarroes123'
const NAME = 'Diretoria Fanfarrões'

function genId() {
  return crypto.randomBytes(16).toString('hex')
}

async function main() {
  console.log('🔄 Resetando usuário da diretoria com senha válida...')

  const hash = await hashPassword(PASSWORD)
  console.log('Hash a ser salvo:', hash.substring(0, 30) + '...')

  const existing = await prisma.user.findUnique({ where: { email: EMAIL } })

  // Deletar sessões, contas e usuário existente
  if (existing) {
    await prisma.session.deleteMany({ where: { userId: existing.id } })
    await prisma.account.deleteMany({ where: { userId: existing.id } })
    await prisma.user.delete({ where: { id: existing.id } })
    console.log('Usuário antigo removido.')
  }

  const userId = genId()
  const accountId = genId()

  // Criar usuário primeiro (sem nested create)
  await prisma.user.create({
    data: {
      id: userId,
      name: NAME,
      email: EMAIL,
      emailVerified: true,
      image: '/placeholder-user.jpg',
    },
  })
  console.log('Usuário criado. ID:', userId)

  // Criar conta separadamente
  await prisma.account.create({
    data: {
      id: accountId,
      accountId: userId,
      providerId: 'credential',
      userId: userId,
      password: hash,
    },
  })
  console.log('Account criada. ID:', accountId)

  // Verificar
  const acc = await prisma.account.findFirst({ where: { userId } })
  console.log('\n✅ Verificação final:')
  console.log('  Account.password null?:', acc?.password === null)
  console.log('  Account.password length:', acc?.password?.length ?? 'n/a')
  console.log('  User.email:', (await prisma.user.findUnique({ where: { id: userId } }))?.email)

  console.log('\n🎉 Usuário recriado com sucesso!')
  console.log('  📧 Email:', EMAIL)
  console.log('  🔑 Senha:', PASSWORD)
}

main()
  .catch((e) => { console.error('❌ ERRO:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
