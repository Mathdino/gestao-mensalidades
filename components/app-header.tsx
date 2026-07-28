'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShieldCheck, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

export function AppHeader() {
  const pathname = usePathname()

  const links = [
    { href: '/', label: 'Mensalistas', icon: Users, active: pathname === '/' },
    {
      href: '/diretoria',
      label: 'Diretoria',
      icon: ShieldCheck,
      active: pathname.startsWith('/diretoria'),
    },
  ]

  return (
    <header className="bg-brand sticky top-0 z-50 shadow-soft">
      <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
        <Link href="/" className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/20 p-1 ring-1 ring-white/30 backdrop-blur-sm">
            <img
              src="/logo.webp"
              alt="Logo Mensalistas FC"
              className="h-full w-full object-contain"
            />
          </div>
          <span className="truncate text-base font-extrabold tracking-tight text-white">
            Mensalistas FC
          </span>
        </Link>
        <nav className="flex shrink-0 items-center gap-1 rounded-full bg-black/10 p-1">
          {links.map((l) => {
            const Icon = l.icon
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition-all',
                  l.active
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-white/80 hover:bg-white/10 hover:text-white',
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden text-xs sm:inline sm:text-sm">
                  {l.label}
                </span>
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
