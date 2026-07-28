import {
  CheckCircle2,
  XCircle,
  MinusCircle,
  ShieldOff,
} from 'lucide-react'

export const MONTHS_PT = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

export const MONTHS_PT_SHORT = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
]

export type Status = 'pago' | 'nao_pago' | 'nao_compareceu' | 'isento'

/** Configuração central de cada status — cor, ícone, rótulo e classes utilitárias. */
export const STATUS_CONFIG: Record<
  Status,
  {
    label: string
    icon: React.ElementType
    /** classes para o badge (pílula) */
    badge: string
    /** classe de texto colorido */
    text: string
    /** classe de fundo suave para cards de resumo */
    surface: string
  }
> = {
  pago: {
    label: 'Pago',
    icon: CheckCircle2,
    badge:
      'bg-paid/12 text-paid ring-1 ring-inset ring-paid/25',
    text: 'text-paid',
    surface:
      'border-paid/20 bg-paid/8',
  },
  nao_pago: {
    label: 'Não pago',
    icon: XCircle,
    badge:
      'bg-unpaid/12 text-unpaid ring-1 ring-inset ring-unpaid/25',
    text: 'text-unpaid',
    surface:
      'border-unpaid/20 bg-unpaid/8',
  },
  nao_compareceu: {
    label: 'Ausente',
    icon: MinusCircle,
    badge:
      'bg-absent/15 text-absent ring-1 ring-inset ring-absent/25',
    text: 'text-absent',
    surface:
      'border-absent/20 bg-absent/8',
  },
  isento: {
    label: 'Isento',
    icon: ShieldOff,
    badge:
      'bg-exempt/12 text-exempt ring-1 ring-inset ring-exempt/25',
    text: 'text-exempt',
    surface:
      'border-exempt/20 bg-exempt/8',
  },
}

/** Formata número como moeda BRL. */
export const brl = (n: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(n)

/**
 * Estilo único e sóbrio para todos os avatares (sem arco-íris).
 * Fundo suave da cor primária + texto na cor primária.
 */
export const AVATAR_CLASS = 'bg-primary/10 text-primary'

/** Primeira + última letra do PRIMEIRO nome. Ex: "Anderson" -> "AN". */
export function initials(name: string) {
  const first = name.trim().split(/\s+/)[0] || ''
  if (first.length === 0) return '?'
  if (first.length === 1) return first.toUpperCase()
  return (first.charAt(0) + first.charAt(first.length - 1)).toUpperCase()
}
