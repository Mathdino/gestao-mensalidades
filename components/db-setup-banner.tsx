'use client'

import { useState } from 'react'
import { setupDatabase } from '@/app/actions/setup'
import { Database, Loader2, CheckCircle2, XCircle } from 'lucide-react'

export function DbSetupBanner() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSetup() {
    setStatus('loading')
    try {
      const result = await setupDatabase()
      if (result.success) {
        setStatus('success')
        setTimeout(() => window.location.reload(), 1500)
      } else {
        setStatus('error')
        setErrorMsg(result.error || 'Erro desconhecido')
      }
    } catch (e) {
      setStatus('error')
      setErrorMsg(String(e))
    }
  }

  return (
    <div className="mx-4 mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
      <div className="flex items-start gap-3">
        <Database className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
            Banco de dados nao configurado
          </p>
          <p className="mt-0.5 text-xs text-amber-700 dark:text-amber-400">
            Clique no botao abaixo para criar as tabelas necessarias.
            Certifique-se de que a variavel DATABASE_URL esta configurada.
          </p>
          {status === 'error' && (
            <p className="mt-1 rounded bg-red-100 p-1.5 text-xs text-red-700 dark:bg-red-900/30 dark:text-red-400">
              {errorMsg}
            </p>
          )}
          <button
            onClick={handleSetup}
            disabled={status === 'loading' || status === 'success'}
            className="mt-3 flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-amber-700 disabled:opacity-60"
          >
            {status === 'loading' && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {status === 'success' && <CheckCircle2 className="h-3.5 w-3.5" />}
            {status === 'error' && <XCircle className="h-3.5 w-3.5" />}
            {status === 'idle' && 'Configurar banco de dados'}
            {status === 'loading' && 'Configurando...'}
            {status === 'success' && 'Configurado! Recarregando...'}
            {status === 'error' && 'Tentar novamente'}
          </button>
        </div>
      </div>
    </div>
  )
}
