import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { AppHeader } from '@/components/app-header'
import { LoginForm } from '@/components/diretoria/login-form'

export default async function LoginPage() {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (session?.user) {
      redirect('/diretoria')
    }
  } catch {
    // DB nao configurado, mostrar login de qualquer forma
  }

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <AppHeader />
      <main className="relative flex flex-1 items-center justify-center overflow-hidden px-4 py-8">
        {/* brilhos decorativos de fundo */}
        <div className="pointer-events-none absolute -left-16 top-0 h-56 w-56 rounded-full bg-primary/15 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 bottom-0 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
        <LoginForm />
      </main>
    </div>
  )
}
