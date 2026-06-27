import Link from 'next/link'
import { Brain } from 'lucide-react'
import { cn } from '@/lib/cn'

export function Logo({ className, href = '/dashboard' }: { className?: string; href?: string }) {
  return (
    <Link href={href} className={cn('flex items-center gap-2.5 group', className)}>
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-violet-800 text-white shadow-md shadow-violet-600/25 transition group-hover:shadow-lg group-hover:shadow-violet-600/30">
        <Brain className="h-5 w-5" strokeWidth={2} />
      </span>
      <span className="font-semibold tracking-tight text-slate-900">
        Comment<span className="text-violet-600">Mind</span>
      </span>
    </Link>
  )
}
