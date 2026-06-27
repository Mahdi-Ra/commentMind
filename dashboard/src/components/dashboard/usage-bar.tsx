'use client'

import Link from 'next/link'
import { Zap } from 'lucide-react'
import { cn } from '@/lib/cn'
import { getPlanById } from '@/lib/plans'

interface UsageBarProps {
  plan: string
  trialDaysLeft?: number
  usedComments: number   // total comments this month across all sites
  usedSites: number      // current number of sites
}

export function UsageBar({ plan, trialDaysLeft, usedComments, usedSites }: UsageBarProps) {
  const planDef = getPlanById(plan)
  const isUnlimited = planDef.maxComments === -1

  const commentPct = isUnlimited
    ? 0
    : Math.min(100, Math.round((usedComments / planDef.maxComments) * 100))

  const sitePct =
    planDef.maxSites === -1
      ? 0
      : Math.min(100, Math.round((usedSites / planDef.maxSites) * 100))

  const commentWarning = !isUnlimited && commentPct >= 80
  const commentDanger = !isUnlimited && commentPct >= 95

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        {/* Left: plan badge + usage */}
        <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
          {/* Plan */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
              <Zap className="h-3.5 w-3.5" />
            </span>
            <span className="text-sm font-semibold text-slate-700">
              {planDef.name} plan
            </span>
            {trialDaysLeft ? (
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                {trialDaysLeft} trial days left
              </span>
            ) : null}
          </div>

          {/* Comments usage */}
          <div className="flex-1 min-w-0">
            <div className="mb-1 flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-slate-500">
                Comments this month
              </span>
              <span
                className={cn(
                  'text-xs font-semibold tabular-nums',
                  commentDanger
                    ? 'text-red-600'
                    : commentWarning
                      ? 'text-amber-600'
                      : 'text-slate-700',
                )}
              >
                {isUnlimited
                  ? `${usedComments.toLocaleString()} / ∞`
                  : `${usedComments.toLocaleString()} / ${planDef.maxComments.toLocaleString()}`}
              </span>
            </div>
            {!isUnlimited && (
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    commentDanger
                      ? 'bg-red-500'
                      : commentWarning
                        ? 'bg-amber-400'
                        : 'bg-violet-500',
                  )}
                  style={{ width: `${commentPct}%` }}
                />
              </div>
            )}
          </div>

          {/* Sites usage */}
          {planDef.maxSites !== -1 && (
            <div className="shrink-0 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">{usedSites}</span>
              {' / '}
              {planDef.maxSites} sites
            </div>
          )}
        </div>

        {/* Upgrade CTA */}
        {plan !== 'agency' && (
          <Link
            href="/pricing"
            className={cn(
              'shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition',
              commentDanger
                ? 'bg-red-600 text-white hover:bg-red-700'
                : commentWarning
                  ? 'bg-amber-500 text-white hover:bg-amber-600'
                  : 'border border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100',
            )}
          >
            {commentDanger ? 'Upgrade now' : commentWarning ? 'Upgrade soon' : 'Upgrade'}
          </Link>
        )}
      </div>

      {/* Warning message */}
      {commentDanger && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
          You&apos;ve used {commentPct}% of your monthly quota. New comments will stop being
          processed when you hit the limit. Upgrade to keep AI moderation running.
        </p>
      )}
      {commentWarning && !commentDanger && (
        <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
          You&apos;re at {commentPct}% of your monthly quota. Consider upgrading before you
          run out.
        </p>
      )}
    </div>
  )
}
