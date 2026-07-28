'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { Mail, Lock, Loader2, Eye, EyeOff, UserPlus } from 'lucide-react'

type Mode = 'signin' | 'signup'

function normalizeEmail(input: string, mode: Mode): string {
  const trimmed = input.trim()
  if (mode === 'signin') {
    if (!trimmed.includes('@')) {
      if (trimmed.toLowerCase() === 'diretoria') {
        return 'diretoria@fanfarroes.com'
      }
      return `${trimmed}@fanfarroes.com`
    }
    return trimmed
  }
  return trimmed
}

export function LoginForm() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('signin')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const normalizedEmail = normalizeEmail(email, mode)
    try {
      if (mode === 'signin') {
        const { error } = await authClient.signIn.email({
          email: normalizedEmail,
          password,
          rememberMe: true,
        })
        if (error) {
          setError(error.message || 'Email ou senha incorretos.')
          return
        }
      } else {
        const { error } = await authClient.signUp.email({
          email: normalizedEmail,
          password,
          name,
        })
        if (error) {
          setError(error.message || 'Erro ao criar conta.')
          return
        }
      }
      router.push('/diretoria')
      router.refresh()
    } catch (e) {
      console.error('[LoginForm] catch error:', e)
      setError('Erro de conexão. Verifique o banco de dados.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="animate-in-up rounded-3xl border border-border bg-card p-6 shadow-card">
        <div className="mb-6 flex flex-col items-center gap-3">
          <div className="bg-brand flex h-20 w-20 items-center justify-center rounded-2xl p-2 shadow-pop">
            <img
              src="/logo.webp"
              alt="Logo Mensalistas FC"
              className="h-full w-full object-contain"
            />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-extrabold tracking-tight text-foreground">
              Área da Diretoria
            </h1>
            <p className="mt-1 text-sm text-balance text-muted-foreground">
              {mode === 'signin'
                ? 'Faça login para gerenciar as mensalidades'
                : 'Crie sua conta de diretoria'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'signup' && (
            <div>
              <label
                htmlFor="name"
                className="mb-1.5 block text-xs font-semibold text-foreground"
              >
                Nome
              </label>
              <div className="relative">
                <UserPlus className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                  required
                  className="w-full rounded-xl border border-input bg-background py-2.5 pl-10 pr-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-xs font-semibold text-foreground"
            >
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="email"
                type={mode === 'signin' ? 'text' : 'email'}
                autoComplete={mode === 'signin' ? 'username' : 'email'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={
                  mode === 'signin' ? 'diretoria' : 'diretoria@email.com'
                }
                required
                className="w-full rounded-xl border border-input bg-background py-2.5 pl-10 pr-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-xs font-semibold text-foreground"
            >
              Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete={
                  mode === 'signin' ? 'current-password' : 'new-password'
                }
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
                className="w-full rounded-xl border border-input bg-background py-2.5 pl-10 pr-10 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-[0.99] disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading
              ? 'Entrando...'
              : mode === 'signin'
                ? 'Entrar'
                : 'Criar conta'}
          </button>
        </form>
      </div>
    </div>
  )
}
