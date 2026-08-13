'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/cn'

const FAQS = [
  {
    q: 'Do I need a developer to set it up?',
    a: 'No. You copy one `<script>` tag and paste it before `</body>` on your site. If you use WordPress, install the plugin and enter your API key. That\'s it.',
  },
  {
    q: 'How accurate is the spam detection?',
    a: 'In our testing, the AI correctly identifies spam with ~98% accuracy. You can also tune the spam threshold per site — raise it to be more lenient, lower it to be stricter.',
  },
  {
    q: 'What languages does it support?',
    a: 'English, Persian, Arabic, Turkish, and German are supported for AI replies.',
  },
  {
    q: 'Can I review AI replies before they go live?',
    a: 'Yes. You can turn off auto-reply and set comments to "uncertain" status for manual review. The AI still generates a suggested reply that you can approve or edit.',
  },
  {
    q: 'What happens if I exceed my monthly comment limit?',
    a: 'New comments will be saved but not processed by AI until the next billing cycle. You\'ll get an in-dashboard warning before you hit the limit. You can upgrade at any time.',
  },
  {
    q: 'Is my knowledge base data secure?',
    a: 'Yes. Your knowledge base is stored in an isolated database per account and is never shared with other users or used to train AI models.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Absolutely. Cancel from your account settings at any time. You keep access until the end of your billing period. No questions asked.',
  },
  {
    q: 'Do you offer a free trial on paid plans?',
    a: 'Yes — all paid plans include a 7-day free trial. No credit card required to start.',
  },
]

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
      >
        <span className="text-sm font-semibold text-slate-900">{q}</span>
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200',
            open && 'rotate-180',
          )}
        />
      </button>
      {open && (
        <p className="pb-5 text-sm leading-relaxed text-slate-500">{a}</p>
      )}
    </div>
  )
}

export function FaqSection() {
  return (
    <section id="faq" className="py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-violet-600">
            FAQ
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Common questions
          </h2>
        </div>

        <div className="mt-12 rounded-2xl border border-slate-100 bg-white px-6 shadow-sm">
          {FAQS.map((item) => (
            <FaqItem key={item.q} q={item.q} a={item.a} />
          ))}
        </div>
      </div>
    </section>
  )
}
