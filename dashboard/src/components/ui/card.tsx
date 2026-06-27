import { cn } from '@/lib/cn'

export function Card({
  children,
  className,
  hover,
  padding = true,
}: {
  children: React.ReactNode
  className?: string
  hover?: boolean
  padding?: boolean
}) {
  return (
    <div
      className={cn(
        hover ? 'surface-hover' : 'surface',
        padding && 'p-6',
        className,
      )}
    >
      {children}
    </div>
  )
}
