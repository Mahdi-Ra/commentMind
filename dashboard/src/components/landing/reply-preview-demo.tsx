'use client'

import { useMemo, useState } from 'react'
import { Bot, Sparkles } from 'lucide-react'

const EXAMPLES = [
  'Does this product include a warranty?',
  'How long does delivery usually take?',
  'The price feels high. Do you offer discounts?',
]

function buildReply(comment: string) {
  const text = comment.toLowerCase()
  if (text.includes('warranty') || text.includes('guarantee')) {
    return 'Yes, this product includes a valid warranty. Share the exact model or order number and our team can confirm the warranty period and coverage details.'
  }
  if (text.includes('delivery') || text.includes('shipping')) {
    return 'Delivery is available and usually takes 2 to 5 business days depending on the destination. Once your order ships, you will receive a tracking code.'
  }
  if (text.includes('price') || text.includes('discount')) {
    return 'Thanks for asking. Any active promotion or discount code will appear on the product page. For larger orders, our support team can help check available options.'
  }
  return 'Thanks for your message. CommentMind prepares a concise answer from your site knowledge and sends uncertain cases to the review queue.'
}

export function ReplyPreviewDemo() {
  const [comment, setComment] = useState(EXAMPLES[0])
  const reply = useMemo(() => buildReply(comment), [comment])

  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-violet-600">
              Try the feeling
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
              See the reply before you install anything.
            </h2>
            <p className="mt-4 text-lg leading-8 text-slate-500">
              Paste a real customer question and show your team how CommentMind turns comments into support,
              sales recovery, and cleaner moderation.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {EXAMPLES.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setComment(item)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Customer comment
            </label>
            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              rows={4}
              dir="auto"
              className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            />
            <div className="mt-4 rounded-xl border border-violet-100 bg-white p-4">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-violet-700">
                <Bot className="h-4 w-4" />
                AI reply preview
              </div>
              <p className="text-sm leading-7 text-slate-800" dir="auto">
                {reply}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  <Sparkles className="h-3.5 w-3.5" />
                  Auto-reply ready
                </span>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                  Brand voice: friendly
                </span>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                  Confidence: high
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
