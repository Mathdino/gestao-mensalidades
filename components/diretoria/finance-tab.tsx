'use client'

import { useState, useEffect, useTransition } from 'react'
import {
  addExpense,
  deleteExpense,
  getAvailableMonths,
  loadHistoricalMonth,
} from '@/app/actions/config'
import {
  TrendingUp,
  TrendingDown,
  Plus,
  Trash2,
  Pin,
  Calendar,
  ArrowLeft,
  History,
  FileText,
  Loader2,
  CheckCircle2,
  XCircle,
  MinusCircle,
  Wallet,
} from 'lucide-react'
import { MONTHS_PT, brl, AVATAR_CLASS, initials } from '@/lib/ui'

type HistoryView = 'list' | { month: number; year: number }

interface Props {
  financial: {
    paidCount: number
    notPaidCount: number
    notAttendedCount: number
    totalRevenue: number
    totalExpenses: number
    balance: number
    fee: number
    expenses: any[]
  }
  expenses: any[]
  config: any
  month: number
  year: number
}

export function FinanceTab({
  financial: initialFinancial,
  expenses: initialExpenses,
  config,
  month,
  year,
}: Props) {
  const [subTab, setSubTab] = useState<'atual' | 'historico'>('atual')
  const [historyView, setHistoryView] = useState<HistoryView>('list')
  const [availableMonths, setAvailableMonths] = useState<
    { month: number; year: number; hasPayments: boolean; hasExpenses: boolean }[]
  >([])
  const [monthsLoading, setMonthsLoading] = useState(false)
  const [historicalData, setHistoricalData] = useState<any>(null)
  const [historicalLoading, setHistoricalLoading] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [financial, setFinancial] = useState(initialFinancial)
  const [expenses, setExpenses] = useState(initialExpenses)
  const [showAdd, setShowAdd] = useState(false)
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [isFixed, setIsFixed] = useState(false)

  useEffect(() => {
    if (subTab === 'historico' && availableMonths.length === 0) {
      setMonthsLoading(true)
      getAvailableMonths()
        .then((list) => setAvailableMonths(list))
        .finally(() => setMonthsLoading(false))
    }
  }, [subTab])

  function openHistoricalMonth(m: number, y: number) {
    setHistoricalLoading(true)
    loadHistoricalMonth(m, y)
      .then((data) => {
        setHistoricalData(data)
        setHistoryView({ month: m, year: y })
      })
      .finally(() => setHistoricalLoading(false))
  }

  function goBackToList() {
    setHistoricalData(null)
    setHistoryView('list')
  }

  async function handleAddExpense(e: React.FormEvent) {
    e.preventDefault()
    if (!description || !amount) return
    startTransition(async () => {
      await addExpense(description, amount, month, year, isFixed)
      const newExpense = {
        id: Date.now().toString(),
        description,
        amount,
        month,
        year,
        isFixed,
        createdAt: new Date().toISOString(),
      }
      const newExpenses = [...expenses, newExpense]
      setExpenses(newExpenses)
      const newTotal = newExpenses.reduce((s, e) => s + parseFloat(e.amount), 0)
      setFinancial((prev) => ({
        ...prev,
        totalExpenses: newTotal,
        balance: prev.totalRevenue - newTotal,
      }))
      setDescription('')
      setAmount('')
      setIsFixed(false)
      setShowAdd(false)
    })
  }

  async function handleDelete(id: string) {
    startTransition(async () => {
      await deleteExpense(id)
      const newExpenses = expenses.filter((e) => e.id !== id)
      setExpenses(newExpenses)
      const newTotal = newExpenses.reduce((s, e) => s + parseFloat(e.amount), 0)
      setFinancial((prev) => ({
        ...prev,
        totalExpenses: newTotal,
        balance: prev.totalRevenue - newTotal,
      }))
    })
  }

  function renderSummaryCards(fin: any, expCount: number) {
    const balancePositive = fin.balance >= 0
    return (
      <>
        {/* Hero de saldo */}
        <div
          className={`relative mb-3 overflow-hidden rounded-3xl p-5 text-white shadow-card ${
            balancePositive ? 'bg-brand' : ''
          }`}
          style={
            balancePositive
              ? undefined
              : {
                  backgroundImage:
                    'linear-gradient(135deg, oklch(0.62 0.22 27), oklch(0.5 0.2 20))',
                }
          }
        >
          <div className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex items-center gap-2 text-white/80">
            <Wallet className="h-4 w-4" />
            <span className="text-xs font-medium">Saldo do mês</span>
          </div>
          <p className="relative mt-1 text-3xl font-extrabold tracking-tight">
            {brl(fin.balance)}
          </p>
          <div className="relative mt-3 flex flex-wrap gap-2 text-[11px]">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 font-medium backdrop-blur-sm">
              {fin.notPaidCount} em aberto
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 font-medium backdrop-blur-sm">
              {fin.notAttendedCount} ausentes
            </span>
            {fin.fee > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 font-medium backdrop-blur-sm">
                {brl(fin.fee)}/jogador
              </span>
            )}
          </div>
        </div>

        {/* Receita x Gastos */}
        <div className="mb-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-paid/20 bg-paid/8 p-4 shadow-soft">
            <div className="flex items-center gap-1.5 text-paid">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs font-semibold">Receita</span>
            </div>
            <p className="mt-2 text-xl font-extrabold text-paid">
              {brl(fin.totalRevenue)}
            </p>
            <p className="text-xs text-muted-foreground">
              {fin.paidCount} pagamentos
            </p>
          </div>
          <div className="rounded-2xl border border-unpaid/20 bg-unpaid/8 p-4 shadow-soft">
            <div className="flex items-center gap-1.5 text-unpaid">
              <TrendingDown className="h-4 w-4" />
              <span className="text-xs font-semibold">Gastos</span>
            </div>
            <p className="mt-2 text-xl font-extrabold text-unpaid">
              {brl(fin.totalExpenses)}
            </p>
            <p className="text-xs text-muted-foreground">{expCount} despesas</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <div className="px-4 py-4">
      {/* Sub-abas */}
      <div className="mb-4 flex gap-1 rounded-2xl border border-border bg-card p-1 shadow-soft">
        <button
          onClick={() => {
            setSubTab('atual')
            goBackToList()
          }}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all active:scale-95 ${
            subTab === 'atual'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Calendar className="h-3.5 w-3.5" />
          Mês Atual
        </button>
        <button
          onClick={() => setSubTab('historico')}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all active:scale-95 ${
            subTab === 'historico'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <History className="h-3.5 w-3.5" />
          Histórico
        </button>
      </div>

      {/* ========== MÊS ATUAL ========== */}
      {subTab === 'atual' && (
        <>
          <h2 className="mb-3 text-base font-bold text-foreground">
            Financeiro — {MONTHS_PT[month - 1]} {year}
          </h2>
          {renderSummaryCards(financial, expenses.length)}

          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Despesas</h3>
            <button
              onClick={() => setShowAdd(!showAdd)}
              className="flex items-center gap-1 rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-all hover:bg-primary/90 active:scale-95"
            >
              <Plus
                className={`h-3.5 w-3.5 transition-transform ${showAdd ? 'rotate-45' : ''}`}
              />
              {showAdd ? 'Fechar' : 'Adicionar'}
            </button>
          </div>

          {showAdd && (
            <form
              onSubmit={handleAddExpense}
              className="animate-in-up mb-4 space-y-3 rounded-2xl border border-primary/20 bg-primary/5 p-4"
            >
              <div>
                <label className="mb-1.5 block text-xs font-medium text-foreground">
                  Descrição
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Aluguel da quadra, Bola..."
                  required
                  className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-foreground">
                  Valor (R$)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0,00"
                  step="0.01"
                  min="0"
                  required
                  className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <label className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={isFixed}
                  onChange={(e) => setIsFixed(e.target.checked)}
                  className="h-4 w-4 rounded border-input accent-primary"
                />
                <span className="text-xs text-foreground">Gasto fixo mensal</span>
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="flex-1 rounded-xl border border-border py-2.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 rounded-xl bg-primary py-2.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
                >
                  {isPending ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          )}

          <div className="space-y-2">
            {expenses.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Nenhuma despesa cadastrada.
                </p>
              </div>
            )}
            {expenses.map((exp) => (
              <div
                key={exp.id}
                className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 shadow-soft"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-unpaid/10 text-unpaid">
                    {exp.isFixed ? (
                      <Pin className="h-4 w-4" />
                    ) : (
                      <FileText className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-card-foreground">
                      {exp.description}
                    </p>
                    {exp.isFixed && (
                      <p className="text-[11px] text-muted-foreground">
                        Gasto fixo
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-unpaid">
                    {brl(parseFloat(exp.amount))}
                  </span>
                  <button
                    onClick={() => handleDelete(exp.id)}
                    className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ========== HISTÓRICO - LISTA ========== */}
      {subTab === 'historico' && historyView === 'list' && (
        <>
          <h2 className="mb-4 text-base font-bold text-foreground">
            Histórico de Meses
          </h2>

          {monthsLoading && (
            <div className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-card p-8 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Carregando...</span>
            </div>
          )}

          {!monthsLoading && availableMonths.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center">
              <History className="mx-auto mb-2 h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                Nenhum mês histórico ainda.
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Dados aparecerão aqui a partir do próximo mês.
              </p>
            </div>
          )}

          {!monthsLoading && availableMonths.length > 0 && (
            <div className="space-y-2">
              {availableMonths.map((m) => {
                const isCurrent = m.month === month && m.year === year
                return (
                  <button
                    key={`${m.year}-${m.month}`}
                    onClick={() => openHistoricalMonth(m.month, m.year)}
                    className="flex w-full items-center justify-between rounded-2xl border border-border bg-card px-4 py-3.5 text-left shadow-soft transition-all hover:border-primary/40 hover:shadow-card active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-card-foreground">
                          {MONTHS_PT[m.month - 1]} {m.year}
                          {isCurrent && (
                            <span className="ml-2 inline-flex items-center rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                              Atual
                            </span>
                          )}
                        </p>
                        <div className="mt-0.5 flex gap-3 text-[11px] text-muted-foreground">
                          {m.hasPayments && (
                            <span className="inline-flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3 text-paid" />
                              Pagamentos
                            </span>
                          )}
                          {m.hasExpenses && (
                            <span className="inline-flex items-center gap-1">
                              <FileText className="h-3 w-3 text-unpaid" />
                              Despesas
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <ArrowLeft className="h-4 w-4 -scale-x-100 text-muted-foreground" />
                  </button>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* ========== HISTÓRICO - DETALHE ========== */}
      {subTab === 'historico' &&
        typeof historyView !== 'string' &&
        historicalData && (
          <>
            <button
              onClick={goBackToList}
              className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Voltar ao histórico
            </button>
            <h2 className="mb-4 text-base font-bold text-foreground">
              {MONTHS_PT[historicalData.month - 1]} {historicalData.year}
            </h2>

            {renderSummaryCards(
              historicalData.summary,
              historicalData.expenses.length,
            )}

            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">
                Pagamentos do mês
              </h3>
            </div>

            <div className="mb-6 space-y-2">
              {historicalData.payments.length === 0 && (
                <div className="rounded-2xl border border-dashed border-border p-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    Sem pagamentos registrados.
                  </p>
                </div>
              )}
              {historicalData.payments.map((p: any) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 shadow-soft"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${AVATAR_CLASS} text-sm font-bold`}
                    >
                      {p.player?.name ? initials(p.player.name) : '?'}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-card-foreground">
                        {p.player?.name ?? 'Jogador removido'}
                      </p>
                      {p.paidAt && (
                        <p className="text-[11px] text-muted-foreground">
                          Pago em{' '}
                          {new Date(p.paidAt).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </div>
                  </div>
                  <div
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                      p.status === 'pago'
                        ? 'bg-paid/12 text-paid'
                        : p.status === 'nao_pago'
                          ? 'bg-unpaid/12 text-unpaid'
                          : 'bg-absent/15 text-absent'
                    }`}
                  >
                    {p.status === 'pago' && <CheckCircle2 className="h-3 w-3" />}
                    {p.status === 'nao_pago' && <XCircle className="h-3 w-3" />}
                    {p.status === 'nao_compareceu' && (
                      <MinusCircle className="h-3 w-3" />
                    )}
                    {p.status === 'pago'
                      ? 'Pago'
                      : p.status === 'nao_pago'
                        ? 'Em aberto'
                        : 'Ausente'}
                  </div>
                </div>
              ))}
            </div>

            <div className="mb-3">
              <h3 className="text-sm font-semibold text-foreground">Despesas</h3>
            </div>
            <div className="space-y-2">
              {historicalData.expenses.length === 0 && (
                <div className="rounded-2xl border border-dashed border-border p-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    Sem despesas registradas.
                  </p>
                </div>
              )}
              {historicalData.expenses.map((e: any) => (
                <div
                  key={e.id}
                  className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 shadow-soft"
                >
                  <div className="flex items-center gap-2">
                    {e.isFixed && (
                      <Pin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-card-foreground">
                        {e.description}
                      </p>
                      {e.isFixed && (
                        <p className="text-[11px] text-muted-foreground">Fixo</p>
                      )}
                    </div>
                  </div>
                  <span className="text-sm font-bold text-unpaid">
                    {brl(parseFloat(e.amount))}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

      {subTab === 'historico' &&
        typeof historyView !== 'string' &&
        historicalLoading &&
        !historicalData && (
          <div className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-card p-8 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Carregando mês...</span>
          </div>
        )}
    </div>
  )
}
