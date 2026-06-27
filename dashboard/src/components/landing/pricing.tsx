'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Check, Clock, FileText, Minus, ShieldCheck, TrendingUp } from 'lucide-react'
import { PLANS } from '@/lib/plans'
import { cn } from '@/lib/cn'

export function PricingSection() {
  const [annual, setAnnual] = useState(false)

  return (
    <section id="pricing" className="bg-slate-50/60 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-violet-600">
            Pricing
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-lg text-slate-500">
            Start free. Upgrade when you need more. No hidden fees, no per-seat charges.
          </p>

          {/* Billing toggle */}
          <div className="mt-8 inline-flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setAnnual(false)}
              className={cn(
                'rounded-lg px-4 py-2 text-sm font-medium transition',
                !annual
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700',
              )}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setAnnual(true)}
              className={cn(
                'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition',
                annual
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700',
              )}
            >
              Annual
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.5 text-[10px] font-bold',
                  annual ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-700',
                )}
              >
                −20%
              </span>
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((plan) => (
            <PlanCard key={plan.id} plan={plan} annual={annual} />
          ))}
        </div>

        {/* Footer note */}
        <p className="mt-10 text-center text-sm text-slate-400">
          Paid plans include a 7-day free trial. No payment required to start.
          Cancel anytime.
        </p>

        <UpgradeReasons />
      </div>
    </section>
  )
}

function PlanCard({
  plan,
  annual,
}: {
  plan: (typeof PLANS)[number]
  annual: boolean
}) {
  const price = annual ? plan.annualPrice : plan.monthlyPrice
  const isHighlighted = !!plan.badge
  const billing = annual ? 'annual' : 'monthly'
  const checkoutPath = `/dashboard/checkout?plan=${plan.id}&billing=${billing}`
  const trialPath = `${checkoutPath}&trial=1`
  const authPath = `/auth?next=${encodeURIComponent(trialPath)}`
  const payAuthPath = `/auth?next=${encodeURIComponent(checkoutPath)}`
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsLoggedIn(!!localStorage.getItem('cm_token'))
    }
  }, [])

  return (
    <div
      className={cn(
        'relative flex flex-col rounded-2xl p-6 transition',
        isHighlighted
          ? 'border-2 border-violet-500 bg-white shadow-xl shadow-violet-500/10'
          : 'border border-slate-200 bg-white shadow-sm hover:border-slate-300 hover:shadow-md',
      )}
    >
      {/* Popular badge */}
      {plan.badge && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center rounded-full bg-violet-600 px-3 py-1 text-xs font-semibold text-white shadow-sm shadow-violet-600/30">
            {plan.badge}
          </span>
        </div>
      )}

      {/* Plan name & description */}
      <div className="mb-5">
        <h3 className="text-base font-semibold text-slate-900">{plan.name}</h3>
        <p className="mt-1 text-sm text-slate-500">{plan.description}</p>
      </div>

      {/* Price */}
      <div className="mb-6">
        {price === 0 ? (
          <div className="flex items-end gap-1">
            <span className="text-4xl font-bold text-slate-900">Free</span>
          </div>
        ) : (
          <div className="flex items-end gap-1">
            <span className="text-4xl font-bold text-slate-900">${price}</span>
            <span className="mb-1 text-sm text-slate-500">/ mo</span>
          </div>
        )}
        {annual && price > 0 && (
          <p className="mt-1 text-xs text-emerald-600 font-medium">
            Billed ${price * 12}/year · Save ${(plan.monthlyPrice - price) * 12}/yr
          </p>
        )}
        {!annual && price > 0 && (
          <p className="mt-1 text-xs text-slate-400">
            or ${plan.annualPrice}/mo billed annually
          </p>
        )}
      </div>

      {/* CTA */}
      <Link
        href={plan.id === 'free' ? (isLoggedIn ? '/dashboard' : '/auth') : isLoggedIn ? trialPath : authPath}
        className={cn(
          'mb-2 block rounded-xl py-2.5 text-center text-sm font-semibold transition',
          isHighlighted
            ? 'bg-violet-600 text-white shadow-sm shadow-violet-600/25 hover:bg-violet-700'
            : 'border border-slate-200 bg-white text-slate-700 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700',
        )}
      >
        {plan.id === 'free' ? plan.cta : 'Start 7-day free trial'}
      </Link>
      {plan.id !== 'free' && (
        <Link
          href={isLoggedIn ? checkoutPath : payAuthPath}
          className="mb-6 block text-center text-xs font-semibold text-slate-400 transition hover:text-violet-600"
        >
          Pay now with USDT/TRX
        </Link>
      )}
      {plan.id !== 'free' && (
        <p className="mb-5 rounded-lg bg-emerald-50 px-3 py-2 text-center text-xs font-medium text-emerald-700">
          Full access for 7 days. No payment today.
        </p>
      )}

      {/* Divider */}
      <div className="mb-5 border-t border-slate-100" />

      {/* Features */}
      <ul className="flex-1 space-y-3">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm text-slate-700">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
            {f}
          </li>
        ))}
        {plan.notIncluded?.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm text-slate-400">
            <Minus className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" />
            {f}
          </li>
        ))}
      </ul>
    </div>
  )
}

function UpgradeReasons() {
  const items = [
    {
      icon: ShieldCheck,
      title: 'Stop spam before it reaches the site',
      body: 'Paid limits let busy sites keep moderation running during real traffic spikes.',
    },
    {
      icon: FileText,
      title: 'Answers grounded in your own knowledge',
      body: 'Upload policies, FAQs, product details, and reply with fewer support handoffs.',
    },
    {
      icon: Clock,
      title: 'Reply while the visitor still cares',
      body: 'Auto-replies turn comment sections into a lightweight support channel.',
    },
    {
      icon: TrendingUp,
      title: 'Scale without hiring another moderator',
      body: 'Usage, review queue, and AI decisions make the value visible every day.',
    },
  ]

  return (
    <div className="mt-14 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="grid gap-5 md:grid-cols-[260px_1fr] md:items-start">
        <div>
          <p className="text-sm font-semibold text-violet-700">Why upgrade</p>
          <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-900">
            Make comment moderation feel handled, not postponed.
          </h3>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            The free plan proves the workflow. Paid plans make it reliable enough for real sites.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <Icon className="h-5 w-5 text-violet-600" />
              <h4 className="mt-3 text-sm font-semibold text-slate-900">{title}</h4>
              <p className="mt-1 text-sm leading-6 text-slate-500">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
