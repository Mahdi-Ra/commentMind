import { cn } from '@/lib/cn'
import { Loader2 } from 'lucide-react'

export function Spinner({ className, label }: { className?: string; label?: string }) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 py-16', className)}>
      <Loader2 className="h-8 w-8 animate-spin text-violet-600" aria-hidden />
      {label && <p className="text-sm text-slate-500">{label}</p>}
    </div>
  )
}
