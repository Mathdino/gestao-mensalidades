'use client'

import { useMemo, useState } from 'react'
import { PaymentStatusBadge } from '@/components/payment-status-badge'
import {
  MONTHS_PT,
  STATUS_CONFIG,
  AVATAR_CLASS,
  initials,
  brl,
  type Status,
} from '@/lib/ui'
import {
  Users,
  Search,
  Copy,
  CheckCheck,
  CalendarClock,
  AlertTriangle,
} from 'lucide-react'

interface PlayerPayment {
  player: {
    id: string
    name: string
    type: 'mensalista' | 'avulso'
    isPaysMonthly: boolean
    isDiretoria: boolean
    active: boolean
    createdAt: string
  }
  payment: unknown
  status: string
}

interface Config {
  closingDay: number
  pixKey: string
  monthlyFee: string
  pageUrl: string
}

interface MensalistasViewProps {
  data: PlayerPayment[]
  config: Config
  month: number
  year: number
}

type Filter = 'todos' | Status

export function MensalistasView({
  data,
  config,
  month,
  year,
}: MensalistasViewProps) {
  const [filter, setFilter] = useState<Filter>('todos')
  const [query, setQuery] = useState('')
  const [copied, setCopied] = useState(false)

  const counts = useMemo(
    () => ({
      pago: data.filter((d) => d.status === 'pago').length,
      nao_pago: data.filter((d) => d.status === 'nao_pago').length,
      nao_compareceu: data.filter((d) => d.status === 'nao_compareceu').length,
      isento: data.filter((d) => d.status === 'isento').length,
    }),
    [data],
  )

  // Base para a % de pagamento: quem deve pagar (exclui isentos)
  const payableTotal = data.length - counts.isento
  const paidPct =
    payableTotal > 0 ? Math.round((counts.pago / payableTotal) * 100) : 0

  const today = new Date()
  const closingDate = new Date(year, month - 1, config.closingDay)
  const isPastClosing = today > closingDate

  const filtered = useMemo(() => {
    return data.filter((d) => {
      const matchFilter = filter === 'todos' || d.status === filter
      const matchQuery = d.player.name
        .toLowerCase()
        .includes(query.trim().toLowerCase())
      return matchFilter && matchQuery
    })
  }, [data, filter, query])

  async function handleCopyPix() {
    if (!config.pixKey) return
    await navigator.clipboard.writeText(config.pixKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const chips: { key: Filter; label: string; count: number; text: string }[] = [
    { key: 'pago', label: 'Pagos', count: counts.pago, text: STATUS_CONFIG.pago.text },
    {
      key: 'nao_pago',
      label: 'Não pagos',
      count: counts.nao_pago,
      text: STATUS_CONFIG.nao_pago.text,
    },
    {
      key: 'nao_compareceu',
      label: 'Ausentes',
      count: counts.nao_compareceu,
      text: STATUS_CONFIG.nao_compareceu.text,
    },
  ]

  return (
    <div className="mx-auto max-w-lg px-4 py-4">
      {/* ===== Hero do mês ===== */}
      <div className="bg-brand animate-in-up relative mb-4 overflow-hidden rounded-3xl p-5 text-white shadow-card">
        {/* brilho decorativo */}
        <div className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-medium text-white/70">Mensalidades</p>
            <h1 className="text-2xl font-extrabold tracking-tight">
              {MONTHS_PT[month - 1]}{' '}
              <span className="font-semibold text-white/80">{year}</span>
            </h1>
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium backdrop-blur-sm">
              <Users className="h-3.5 w-3.5" />
              {data.length} jogadores
            </div>
          </div>
          <ProgressRing pct={paidPct} />
        </div>

        {/* linha de info: fechamento / pix / mensalidade */}
        <div className="relative mt-4 flex flex-wrap gap-2 text-xs">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium backdrop-blur-sm ${
              isPastClosing
                ? 'bg-white/25 text-white'
                : 'bg-white/15 text-white/90'
            }`}
          >
            {isPastClosing ? (
              <AlertTriangle className="h-3.5 w-3.5" />
            ) : (
              <CalendarClock className="h-3.5 w-3.5" />
            )}
            {isPastClosing ? 'Fechou dia' : 'Fecha dia'} {config.closingDay}
          </span>
          {config.monthlyFee && config.monthlyFee !== '0' && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 font-medium backdrop-blur-sm">
              {brl(parseFloat(config.monthlyFee))}/mês
            </span>
          )}
          {config.pixKey && (
            <button
              onClick={handleCopyPix}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 font-medium backdrop-blur-sm transition-colors hover:bg-white/25 active:scale-95"
            >
              {copied ? (
                <CheckCheck className="h-3.5 w-3.5" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              {copied ? 'PIX copiado!' : 'Copiar PIX'}
            </button>
          )}
        </div>
      </div>

      {/* ===== Chips de resumo / filtro ===== */}
      <div className="mb-3 grid grid-cols-3 gap-2">
        {chips.map((c) => {
          const active = filter === c.key
          return (
            <button
              key={c.key}
              onClick={() => setFilter(active ? 'todos' : c.key)}
              className={`rounded-2xl border p-3 text-center transition-all active:scale-95 ${
                active
                  ? 'border-primary/40 bg-card shadow-card'
                  : 'border-border bg-card shadow-soft hover:border-primary/30'
              }`}
              aria-pressed={active}
            >
              <p className={`text-2xl font-extrabold ${c.text}`}>{c.count}</p>
              <p className="text-[11px] font-medium text-muted-foreground">
                {c.label}
              </p>
            </button>
          )
        })}
      </div>

      {/* ===== Busca ===== */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar jogador..."
          className="w-full rounded-2xl border border-border bg-card py-2.5 pl-10 pr-4 text-sm shadow-soft outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15"
        />
        {filter !== 'todos' && (
          <button
            onClick={() => setFilter('todos')}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-secondary-foreground"
          >
            Limpar filtro
          </button>
        )}
      </div>

      {/* ===== Lista de jogadores ===== */}
      <div className="space-y-2">
        {data.length === 0 ? (
          <EmptyState
            title="Nenhum jogador cadastrado"
            subtitle="Acesse a área da Diretoria para adicionar jogadores."
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="Nada encontrado"
            subtitle="Ajuste a busca ou o filtro selecionado."
          />
        ) : (
          filtered.map((item, i) => (
            <div
              key={item.player.id}
              style={{ animationDelay: `${Math.min(i, 12) * 24}ms` }}
              className="animate-in-up flex items-center justify-between rounded-2xl border border-border bg-card px-3.5 py-3 shadow-soft transition-shadow hover:shadow-card"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${AVATAR_CLASS} text-sm font-bold`}
                >
                  {initials(item.player.name)}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-card-foreground">
                    {item.player.name}
                  </p>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <span className="text-xs capitalize text-muted-foreground">
                      {item.player.type}
                    </span>
                    {item.player.isDiretoria && (
                      <span className="inline-flex items-center rounded-full bg-primary/12 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                        Diretoria
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <PaymentStatusBadge status={item.status as Status} />
            </div>
          ))
        )}
      </div>

      {counts.isento > 0 && filter === 'todos' && !query && (
        <p className="mt-4 text-center text-xs text-muted-foreground">
          {counts.isento} jogador(es) isento(s) de mensalidade
        </p>
      )}
    </div>
  )
}

/** Anel de progresso circular mostrando a % de pagamento. */
function ProgressRing({ pct }: { pct: number }) {
  const size = 72
  const stroke = 7
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-white/20"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="white"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.22,1,0.36,1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-extrabold leading-none">{pct}%</span>
        <span className="text-[9px] font-medium text-white/70">pago</span>
      </div>
    </div>
  )
}

function EmptyState({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center">
      <Users className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
    </div>
  )
}
