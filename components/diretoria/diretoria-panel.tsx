'use client'

import { useState } from 'react'
import { Users, Settings, BarChart2, LogOut, Wallet } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import { PaymentsTab } from './payments-tab'
import { PlayersTab } from './players-tab'
import { FinanceTab } from './finance-tab'
import { ConfigTab } from './config-tab'
import { initials } from '@/lib/ui'

type Tab = 'pagamentos' | 'jogadores' | 'financeiro' | 'config'

interface Props {
  payments: any[]
  config: any
  players: any[]
  expenses: any[]
  financial: any
  month: number
  year: number
  userEmail: string
  userName: string
}

export function DiretoriaPanel({
  payments,
  config,
  players,
  expenses,
  financial,
  month,
  year,
  userEmail,
  userName,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('pagamentos')
  const router = useRouter()

  async function handleLogout() {
    await authClient.signOut()
    router.push('/diretoria/login')
    router.refresh()
  }

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'pagamentos', label: 'Pagamentos', icon: Wallet },
    { id: 'jogadores', label: 'Jogadores', icon: Users },
    { id: 'financeiro', label: 'Financeiro', icon: BarChart2 },
    { id: 'config', label: 'Config', icon: Settings },
  ]

  return (
    <div className="mx-auto max-w-lg">
      {/* Barra do usuário */}
      <div className="flex items-center justify-between border-b border-border bg-card/80 px-4 py-2.5 backdrop-blur-sm">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
            {initials(userName || 'D')}
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-foreground">
              {userName}
            </p>
            <p className="truncate text-[11px] text-muted-foreground">
              {userEmail}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sair
        </button>
      </div>

      {/* Conteúdo da aba */}
      <div key={activeTab} className="animate-in-up pb-28">
        {activeTab === 'pagamentos' && (
          <PaymentsTab
            payments={payments}
            config={config}
            month={month}
            year={year}
          />
        )}
        {activeTab === 'jogadores' && <PlayersTab players={players} />}
        {activeTab === 'financeiro' && (
          <FinanceTab
            financial={financial}
            expenses={expenses}
            config={config}
            month={month}
            year={year}
          />
        )}
        {activeTab === 'config' && (
          <ConfigTab config={config} players={players} />
        )}
      </div>

      {/* Bottom nav flutuante */}
      <nav className="pb-safe fixed inset-x-0 bottom-0 z-50 px-3 pb-3">
        <div className="mx-auto flex max-w-lg items-center justify-around rounded-2xl border border-border bg-card/90 p-1.5 shadow-pop backdrop-blur-lg">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex flex-1 flex-col items-center gap-1 rounded-xl py-2 text-[11px] font-semibold transition-all active:scale-95 ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="h-5 w-5" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
