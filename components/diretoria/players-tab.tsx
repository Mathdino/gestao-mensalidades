'use client'

import { useMemo, useState, useTransition } from 'react'
import {
  addPlayer,
  updatePlayer,
  deactivatePlayer,
  getPlayerPaymentHistory,
} from '@/app/actions/players'
import {
  Plus,
  Trash2,
  History,
  ShieldCheck,
  X,
  Search,
  Loader2,
} from 'lucide-react'
import { PaymentStatusBadge } from '@/components/payment-status-badge'
import { MONTHS_PT_SHORT, AVATAR_CLASS, initials, type Status } from '@/lib/ui'

interface Player {
  id: string
  name: string
  type: 'mensalista' | 'avulso'
  isPaysMonthly: boolean
  isDiretoria: boolean
  active: boolean
  createdAt: Date
}

interface Props {
  players: Player[]
}

export function PlayersTab({ players: initialPlayers }: Props) {
  const [isPending, startTransition] = useTransition()
  const [players, setPlayers] = useState(initialPlayers)
  const [showAdd, setShowAdd] = useState(false)
  const [name, setName] = useState('')
  const [type, setType] = useState<'mensalista' | 'avulso'>('mensalista')
  const [isPaysMonthly, setIsPaysMonthly] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [historyPlayer, setHistoryPlayer] = useState<Player | null>(null)
  const [history, setHistory] = useState<any[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setError('Informe o nome do jogador.')
      return
    }
    setError('')
    startTransition(async () => {
      const result = await addPlayer(name.trim(), type, isPaysMonthly)
      setPlayers((prev) => [
        ...prev,
        {
          id: result.id,
          name: name.trim(),
          type,
          isPaysMonthly,
          isDiretoria: false,
          active: true,
          createdAt: new Date(),
        },
      ])
      setName('')
      setShowAdd(false)
    })
  }

  async function handleDeactivate(id: string) {
    if (!confirm('Remover este jogador?')) return
    startTransition(async () => {
      await deactivatePlayer(id)
      setPlayers((prev) => prev.filter((p) => p.id !== id))
    })
  }

  async function handleToggleDiretoria(player: Player) {
    startTransition(async () => {
      await updatePlayer(player.id, { isDiretoria: !player.isDiretoria })
      setPlayers((prev) =>
        prev.map((p) =>
          p.id === player.id ? { ...p, isDiretoria: !p.isDiretoria } : p,
        ),
      )
    })
  }

  async function handleTogglePaysMonthly(player: Player) {
    startTransition(async () => {
      await updatePlayer(player.id, { isPaysMonthly: !player.isPaysMonthly })
      setPlayers((prev) =>
        prev.map((p) =>
          p.id === player.id ? { ...p, isPaysMonthly: !p.isPaysMonthly } : p,
        ),
      )
    })
  }

  async function openHistory(player: Player) {
    setHistoryPlayer(player)
    setLoadingHistory(true)
    const data = await getPlayerPaymentHistory(player.id)
    setHistory(data)
    setLoadingHistory(false)
  }

  const filtered = useMemo(
    () =>
      players.filter((p) =>
        p.name.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [players, query],
  )

  // ===== Tela de histórico =====
  if (historyPlayer) {
    return (
      <div className="px-4 py-4">
        <div className="mb-4 flex items-center gap-3">
          <button
            onClick={() => setHistoryPlayer(null)}
            className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-secondary"
            aria-label="Voltar"
          >
            <X className="h-5 w-5" />
          </button>
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full ${AVATAR_CLASS} text-sm font-bold`}
          >
            {initials(historyPlayer.name)}
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground">
              {historyPlayer.name}
            </h2>
            <p className="text-xs text-muted-foreground">
              Histórico de pagamentos
            </p>
          </div>
        </div>

        {loadingHistory && (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Carregando...
          </div>
        )}

        {!loadingHistory && history.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Nenhum registro de pagamento encontrado.
            </p>
          </div>
        )}

        <div className="space-y-2">
          {history.map((record) => (
            <div
              key={record.id}
              className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 shadow-soft"
            >
              <p className="text-sm font-medium text-card-foreground">
                {MONTHS_PT_SHORT[record.month - 1]}/{record.year}
              </p>
              <PaymentStatusBadge status={record.status as Status} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ===== Lista de jogadores =====
  return (
    <div className="px-4 py-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-bold text-foreground">
          Jogadores{' '}
          <span className="text-sm font-normal text-muted-foreground">
            ({players.length})
          </span>
        </h2>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-95"
        >
          <Plus
            className={`h-4 w-4 transition-transform ${showAdd ? 'rotate-45' : ''}`}
          />
          {showAdd ? 'Fechar' : 'Adicionar'}
        </button>
      </div>

      {showAdd && (
        <form
          onSubmit={handleAdd}
          className="animate-in-up mb-4 space-y-3 rounded-2xl border border-primary/20 bg-primary/5 p-4"
        >
          <h3 className="text-sm font-semibold text-foreground">Novo jogador</h3>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-foreground">
              Nome *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome do jogador"
              className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-foreground">
              Tipo
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['mensalista', 'avulso'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`rounded-xl border py-2.5 text-xs font-semibold capitalize transition-all active:scale-95 ${
                    type === t
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background text-muted-foreground'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2.5">
            <input
              type="checkbox"
              checked={isPaysMonthly}
              onChange={(e) => setIsPaysMonthly(e.target.checked)}
              className="h-4 w-4 rounded border-input accent-primary"
            />
            <span className="text-xs text-foreground">Paga mensalidade</span>
          </label>

          {error && <p className="text-xs text-destructive">{error}</p>}

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

      {/* Busca */}
      {players.length > 6 && (
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
      )}

      <div className="space-y-2">
        {players.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Nenhum jogador cadastrado ainda.
            </p>
          </div>
        )}
        {filtered.map((player) => (
          <div
            key={player.id}
            className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft"
          >
            <div className="flex items-center justify-between px-3.5 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                    player.isDiretoria
                      ? 'bg-primary text-primary-foreground'
                      : AVATAR_CLASS
                  }`}
                >
                  {initials(player.name)}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-card-foreground">
                    {player.name}
                    {player.isDiretoria && (
                      <span className="ml-1.5 inline-flex items-center rounded-full bg-primary/12 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                        Diretoria
                      </span>
                    )}
                  </p>
                  <p className="text-xs capitalize text-muted-foreground">
                    {player.type} · {player.isPaysMonthly ? 'Pagante' : 'Isento'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-0.5">
                <button
                  onClick={() => openHistory(player)}
                  className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  title="Histórico"
                >
                  <History className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleToggleDiretoria(player)}
                  className={`rounded-lg p-2 transition-colors ${
                    player.isDiretoria
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`}
                  title="Alternar diretoria"
                >
                  <ShieldCheck className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeactivate(player.id)}
                  className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  title="Remover"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            {/* Toggle mensalidade */}
            <div className="flex items-center justify-between border-t border-border/50 bg-muted/30 px-3.5 py-2">
              <span className="text-xs text-muted-foreground">
                Paga mensalidade
              </span>
              <button
                onClick={() => handleTogglePaysMonthly(player)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  player.isPaysMonthly ? 'bg-primary' : 'bg-muted-foreground/30'
                }`}
                role="switch"
                aria-checked={player.isPaysMonthly}
              >
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                    player.isPaysMonthly ? 'translate-x-4.5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
