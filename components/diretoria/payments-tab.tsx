'use client'

import { useMemo, useState, useTransition } from 'react'
import { updatePaymentStatus } from '@/app/actions/payments'
import { PaymentStatusBadge } from '@/components/payment-status-badge'
import { MONTHS_PT, STATUS_CONFIG, AVATAR_CLASS, initials } from '@/lib/ui'
import {
  Calendar,
  Copy,
  CheckCheck,
  ChevronDown,
  Search,
  Loader2,
} from 'lucide-react'

type StatusValue = 'pago' | 'nao_pago' | 'nao_compareceu'
type AllStatus = StatusValue | 'isento'
type Filter = 'todos' | StatusValue

interface Props {
  payments: any[]
  config: any
  month: number
  year: number
}

export function PaymentsTab({ payments, config, month, year }: Props) {
  const [isPending, startTransition] = useTransition()
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [localData, setLocalData] = useState(payments)
  const [filter, setFilter] = useState<Filter>('todos')
  const [query, setQuery] = useState('')

  const counts = useMemo(
    () => ({
      pago: localData.filter((d) => d.status === 'pago').length,
      nao_pago: localData.filter((d) => d.status === 'nao_pago').length,
      nao_compareceu: localData.filter((d) => d.status === 'nao_compareceu')
        .length,
    }),
    [localData],
  )

  function handleStatusChange(playerId: string, status: StatusValue) {
    setPendingId(playerId)
    setOpenDropdown(null)
    startTransition(async () => {
      await updatePaymentStatus(playerId, month, year, status)
      setLocalData((prev) =>
        prev.map((item) =>
          item.player.id === playerId
            ? { ...item, status, payment: { ...(item.payment || {}), status } }
            : item,
        ),
      )
      setPendingId(null)
    })
  }

  function buildWhatsAppMessage() {
    const monthName = MONTHS_PT[month - 1]
    const paid = localData
      .filter((d) => d.status === 'pago')
      .map((d) => `✅ ${d.player.name}`)
    const notPaid = localData
      .filter((d) => d.status === 'nao_pago')
      .map((d) => `❌ ${d.player.name}`)
    const absent = localData
      .filter((d) => d.status === 'nao_compareceu')
      .map((d) => `⚫ ${d.player.name}`)

    let msg = `*Mensalidades - ${monthName}/${year}*\n\n`
    if (paid.length) msg += `*Pagos (${paid.length}):*\n${paid.join('\n')}\n\n`
    if (notPaid.length)
      msg += `*Não pagos (${notPaid.length}):*\n${notPaid.join('\n')}\n\n`
    if (absent.length)
      msg += `*Não compareceram (${absent.length}):*\n${absent.join('\n')}\n\n`
    if (config.pixKey) msg += `*PIX para pagamento:* ${config.pixKey}\n`
    if (config.pageUrl) msg += `*Ver lista completa:* ${config.pageUrl}\n`
    return msg.trim()
  }

  async function handleCopyMessage() {
    await navigator.clipboard.writeText(buildWhatsAppMessage())
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const filtered = useMemo(
    () =>
      localData.filter((d) => {
        const mf = filter === 'todos' || d.status === filter
        const mq = d.player.name
          .toLowerCase()
          .includes(query.trim().toLowerCase())
        return mf && mq
      }),
    [localData, filter, query],
  )

  const statusOptions: { value: StatusValue; label: string }[] = [
    { value: 'pago', label: 'Pago' },
    { value: 'nao_pago', label: 'Não pago' },
    { value: 'nao_compareceu', label: 'Ausente' },
  ]

  const filterChips: { key: Filter; label: string }[] = [
    { key: 'todos', label: `Todos ${localData.length}` },
    { key: 'pago', label: `Pagos ${counts.pago}` },
    { key: 'nao_pago', label: `Não pagos ${counts.nao_pago}` },
    { key: 'nao_compareceu', label: `Ausentes ${counts.nao_compareceu}` },
  ]

  return (
    <div className="px-4 py-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Calendar className="h-4.5 w-4.5" />
          </div>
          <div>
            <h2 className="text-base font-bold leading-tight text-foreground">
              {MONTHS_PT[month - 1]}
            </h2>
            <p className="text-xs text-muted-foreground">{year}</p>
          </div>
        </div>
        <button
          onClick={handleCopyMessage}
          className="flex items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary transition-all hover:bg-primary/20 active:scale-95"
        >
          {copied ? (
            <CheckCheck className="h-3.5 w-3.5" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
          {copied ? 'Copiado!' : 'WhatsApp'}
        </button>
      </div>

      {/* Filtros segmentados (scroll horizontal) */}
      <div className="-mx-4 mb-3 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {filterChips.map((c) => {
          const active = filter === c.key
          return (
            <button
              key={c.key}
              onClick={() => setFilter(c.key)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-all active:scale-95 ${
                active
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'border border-border bg-card text-muted-foreground hover:text-foreground'
              }`}
            >
              {c.label}
            </button>
          )
        })}
      </div>

      {/* Busca */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar jogador..."
          className="w-full rounded-2xl border border-border bg-card py-2.5 pl-10 pr-4 text-sm shadow-soft outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15"
        />
      </div>

      <div className="space-y-2" onClick={() => setOpenDropdown(null)}>
        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center">
            <p className="text-sm text-muted-foreground">
              {localData.length === 0
                ? 'Nenhum mensalista cadastrado.'
                : 'Nenhum jogador neste filtro.'}
            </p>
          </div>
        )}
        {filtered.map((item) => {
          const isExempt = item.status === 'isento'
          const isOpen = openDropdown === item.player.id
          const rowPending = isPending && pendingId === item.player.id
          return (
            <div
              key={item.player.id}
              className="rounded-2xl border border-border bg-card shadow-soft"
            >
              <div className="flex items-center justify-between px-3.5 py-3">
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
                    {item.player.isDiretoria && (
                      <span className="inline-flex items-center rounded-full bg-primary/12 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                        Diretoria
                      </span>
                    )}
                  </div>
                </div>

                {isExempt ? (
                  <PaymentStatusBadge status="isento" />
                ) : (
                  <div className="relative" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() =>
                        setOpenDropdown(isOpen ? null : item.player.id)
                      }
                      disabled={rowPending}
                      className="flex items-center gap-1 rounded-xl transition-transform active:scale-95 disabled:opacity-50"
                    >
                      {rowPending ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        </span>
                      ) : (
                        <PaymentStatusBadge status={item.status as AllStatus} />
                      )}
                      <ChevronDown
                        className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="animate-scale-in absolute right-0 top-full z-50 mt-1.5 w-44 origin-top-right overflow-hidden rounded-2xl border border-border bg-card shadow-pop">
                        {statusOptions.map((opt) => {
                          const cfg = STATUS_CONFIG[opt.value]
                          const Icon = cfg.icon
                          const selected = item.status === opt.value
                          return (
                            <button
                              key={opt.value}
                              onClick={() =>
                                handleStatusChange(item.player.id, opt.value)
                              }
                              className={`flex w-full items-center gap-2 px-3 py-2.5 text-xs font-semibold transition-colors hover:bg-secondary ${cfg.text} ${
                                selected ? 'bg-secondary/60' : ''
                              }`}
                            >
                              <Icon className="h-4 w-4" />
                              {opt.label}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
