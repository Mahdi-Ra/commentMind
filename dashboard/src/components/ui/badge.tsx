import { cn } from '@/lib/cn'

type Variant = 'success' | 'danger' | 'info' | 'warning' | 'neutral' | 'brand'

const variants: Record<Variant, string> = {
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-600/10',
  danger: 'bg-red-50 text-red-700 ring-red-600/10',
  info: 'bg-violet-50 text-violet-700 ring-violet-600/10',
  warning: 'bg-amber-50 text-amber-800 ring-amber-600/10',
  neutral: 'bg-slate-100 text-slate-600 ring-slate-500/10',
  brand: 'bg-violet-100 text-violet-800 ring-violet-600/10',
}

export function Badge({
  children,
  variant = 'neutral',
  className,
}: {
  children: React.ReactNode
  variant?: Variant
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}
