import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { AppHeader } from '@/components/app-header'
import { DiretoriaPanel } from '@/components/diretoria/diretoria-panel'
import { getMonthPayments } from '@/app/actions/payments'
import { getConfig, getExpenses, getFinancialSummary } from '@/app/actions/config'
import { getPlayers } from '@/app/actions/players'
import { DbSetupBanner } from '@/components/db-setup-banner'
import { Loader2 } from 'lucide-react'

async function DiretoriaContent() {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      redirect('/diretoria/login')
    }

    const now = new Date()
    const month = now.getMonth() + 1
    const year = now.getFullYear()

    const [payments, cfg, players, expenses, financial] = await Promise.all([
      getMonthPayments(month, year),
      getConfig(),
      getPlayers(),
      getExpenses(month, year),
      getFinancialSummary(month, year),
    ])

    return (
      <DiretoriaPanel
        payments={payments}
        config={cfg}
        players={players}
        expenses={expenses}
        financial={financial}
        month={month}
        year={year}
        userEmail={session.user.email}
        userName={session.user.name}
      />
    )
  } catch (e) {
    const msg = String(e)
    if (msg.includes('NEXT_REDIRECT')) throw e
    return <DbSetupBanner />
  }
}

export default function DiretoriaPage() {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <AppHeader />
      <main className="flex-1">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          }
        >
          <DiretoriaContent />
        </Suspense>
      </main>
    </div>
  )
}
