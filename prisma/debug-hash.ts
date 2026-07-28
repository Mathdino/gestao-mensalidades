import 'dotenv/config'
import { hashPassword } from 'better-auth/crypto'

async function main() {
  console.log('🔍 Testando hashPassword...')
  console.log('Senha a ser hashada: fanfarroes123')
  const result = await hashPassword('fanfarroes123')
  console.log('Tipo de retorno:', typeof result)
  console.log('Valor do hash:', result)
  console.log('É string?:', typeof result === 'string')
  console.log('Tamanho:', (result as any)?.length ?? 'n/a')
}
main()
