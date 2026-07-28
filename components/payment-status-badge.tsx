import { cn } from '@/lib/utils'
import { STATUS_CONFIG, type Status } from '@/lib/ui'

interface PaymentStatusBadgeProps {
  status: Status
  className?: string
  showLabel?: boolean
}

export function PaymentStatusBadge({
  status,
  className,
  showLabel = true,
}: PaymentStatusBadgeProps) {
  const config = STATUS_CONFIG[status]
  const Icon = config.icon

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold',
        config.badge,
        className,
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      {showLabel && <span>{config.label}</span>}
    </span>
  )
}
