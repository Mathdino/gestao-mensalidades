import { Suspense } from 'react'
import { AppHeader } from '@/components/app-header'
import { MensalistasView } from '@/components/mensalistas-view'
import { DbSetupBanner } from '@/components/db-setup-banner'
import { getMonthPayments } from '@/app/actions/payments'
import { getConfig } from '@/app/actions/config'
import { Loader2 } from 'lucide-react'

async function MensalistasContent() {
  try {
    const now = new Date()
    const month = now.getMonth() + 1
    const year = now.getFullYear()

    const [data, cfg] = await Promise.all([
      getMonthPayments(month, year),
      getConfig(),
    ])

    return <MensalistasView data={data} config={cfg} month={month} year={year} />
  } catch (e) {
    return <DbSetupBanner />
  }
}

export default function HomePage() {
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
          <MensalistasContent />
        </Suspense>
      </main>
    </div>
  )
}
