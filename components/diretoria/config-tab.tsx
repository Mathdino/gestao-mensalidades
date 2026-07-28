'use client'

import { useState, useTransition } from 'react'
import { saveConfig } from '@/app/actions/config'
import {
  Settings,
  Calendar,
  CreditCard,
  DollarSign,
  Link2,
  Save,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react'

interface Props {
  config: {
    closingDay: number
    pixKey: string
    monthlyFee: string
    pageUrl: string
  }
  players: any[]
}

export function ConfigTab({ config: initialConfig, players }: Props) {
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [closingDay, setClosingDay] = useState(String(initialConfig.closingDay))
  const [pixKey, setPixKey] = useState(initialConfig.pixKey)
  const [monthlyFee, setMonthlyFee] = useState(initialConfig.monthlyFee)
  const [pageUrl, setPageUrl] = useState(initialConfig.pageUrl)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      await saveConfig({
        closingDay: parseInt(closingDay) || 10,
        pixKey,
        monthlyFee,
        pageUrl,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    })
  }

  const diretoriaPlayers = players.filter((p) => p.isDiretoria)

  const fields = [
    {
      icon: Calendar,
      title: 'Fechamento mensal',
      label: 'Dia do mês para fechamento',
      hint: 'Após este dia, os não pagos são marcados como atrasados.',
      input: (
        <input
          type="number"
          value={closingDay}
          onChange={(e) => setClosingDay(e.target.value)}
          min="1"
          max="31"
          className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      ),
    },
    {
      icon: DollarSign,
      title: 'Valor da mensalidade',
      label: 'Valor em reais (R$)',
      input: (
        <input
          type="number"
          value={monthlyFee}
          onChange={(e) => setMonthlyFee(e.target.value)}
          step="0.01"
          min="0"
          placeholder="0,00"
          className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      ),
    },
    {
      icon: CreditCard,
      title: 'Chave PIX',
      label: 'CPF, email, telefone ou chave aleatória',
      input: (
        <input
          type="text"
          value={pixKey}
          onChange={(e) => setPixKey(e.target.value)}
          placeholder="Ex: 000.000.000-00"
          className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      ),
    },
    {
      icon: Link2,
      title: 'Link da página pública',
      label: 'URL para incluir na mensagem do WhatsApp',
      input: (
        <input
          type="url"
          value={pageUrl}
          onChange={(e) => setPageUrl(e.target.value)}
          placeholder="https://seuprojeto.vercel.app"
          className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      ),
    },
  ]

  return (
    <div className="px-4 py-4">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Settings className="h-4.5 w-4.5" />
        </div>
        <h2 className="text-base font-bold text-foreground">Configurações</h2>
      </div>

      <form onSubmit={handleSave} className="space-y-3">
        {fields.map((f) => {
          const Icon = f.icon
          return (
            <div
              key={f.title}
              className="space-y-3 rounded-2xl border border-border bg-card p-4 shadow-soft"
            >
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">
                  {f.title}
                </h3>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  {f.label}
                </label>
                {f.input}
                {f.hint && (
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {f.hint}
                  </p>
                )}
              </div>
            </div>
          )
        })}

        {diretoriaPlayers.length > 0 && (
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
            <div className="mb-2 flex items-center gap-1.5 text-primary">
              <ShieldCheck className="h-4 w-4" />
              <p className="text-xs font-semibold">Membros da diretoria</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {diretoriaPlayers.map((p) => (
                <span
                  key={p.id}
                  className="rounded-full bg-primary/12 px-2.5 py-1 text-xs font-medium text-primary"
                >
                  {p.name}
                </span>
              ))}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-[0.99] disabled:opacity-60"
        >
          {saved ? (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Salvo com sucesso!
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              {isPending ? 'Salvando...' : 'Salvar configurações'}
            </>
          )}
        </button>
      </form>
    </div>
  )
}
