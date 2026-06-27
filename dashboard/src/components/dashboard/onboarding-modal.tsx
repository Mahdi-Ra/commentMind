'use client'

import { useState } from 'react'
import { Database, Code2, CheckCircle2, ArrowRight, X } from 'lucide-react'
import { cn } from '@/lib/cn'

const STEPS = [
  {
    icon: CheckCircle2,
    title: 'Account created',
    description: "You're in. CommentMind is ready to moderate comments on your website.",
    color: 'bg-emerald-100 text-emerald-600',
    done: true,
  },
  {
    icon: Database,
    title: 'Add your knowledge base',
    description:
      'Go to your site settings → Knowledge tab. Paste your FAQs, return policy, or product info. The AI uses this to give accurate answers.',
    color: 'bg-amber-100 text-amber-600',
    done: false,
  },
  {
    icon: Code2,
    title: 'Embed the widget',
    description:
      'Go to your site settings → Integration tab. Copy the script snippet and paste it before </body> on your site.',
    color: 'bg-violet-100 text-violet-600',
    done: false,
  },
]

interface OnboardingModalProps {
  open: boolean
  onClose: () => void
  onAddSite: () => void
  hasSite: boolean
}

export function OnboardingModal({ open, onClose, onAddSite, hasSite }: OnboardingModalProps) {
  const [step, setStep] = useState(0)

  if (!open) return null

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl shadow-slate-900/20">
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 pt-6">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-1.5 rounded-full transition-all duration-300',
                i === step ? 'w-6 bg-violet-600' : i < step ? 'w-1.5 bg-violet-300' : 'w-1.5 bg-slate-200',
              )}
            />
          ))}
        </div>

        {/* Content */}
        <div className="px-8 py-6 text-center">
          <div
            className={`mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${current.color}`}
          >
            <current.icon className="h-7 w-7" />
          </div>

          <h2 className="text-xl font-bold text-slate-900">{current.title}</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-500">{current.description}</p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 px-8 pb-8">
          {step === 0 && !hasSite ? (
            <button
              type="button"
              onClick={() => { onClose(); onAddSite() }}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-violet-600 text-sm font-semibold text-white shadow-sm shadow-violet-600/25 transition hover:bg-violet-700"
            >
              Add your first site
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : !isLast ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-violet-600 text-sm font-semibold text-white shadow-sm shadow-violet-600/25 transition hover:bg-violet-700"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-violet-600 text-sm font-semibold text-white shadow-sm shadow-violet-600/25 transition hover:bg-violet-700"
            >
              Go to dashboard
              <ArrowRight className="h-4 w-4" />
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="text-sm text-slate-400 transition hover:text-slate-600"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  )
}
