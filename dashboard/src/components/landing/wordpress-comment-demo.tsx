'use client'

import { useRef, useState } from 'react'
import { Check, Flag, Send } from 'lucide-react'

type Verdict = 'idle' | 'loading' | 'spam' | 'reply'

const SAMPLES = [
  {
    label: 'Does this work with Elementor?',
    text: 'Does this plugin work with Elementor and Divi, or just the default WordPress editor?',
  },
  {
    label: 'A comment that looks like spam',
    text: 'Great post! By the way I found a way to get 10k followers fast, check bit.ly/xyz-promo',
  },
  {
    label: 'How long does setup take?',
    text: 'How long does it take to set up on an existing site with 3 years of old comments?',
  },
]

const SPAM_SIGNALS = ['bit.ly', 'http://', 'https://', 'click here', 'buy now', 'followers fast', 'discount code']

function classifyPreview(text: string): { verdict: 'spam' | 'reply'; message: string } {
  const lower = text.toLowerCase()

  if (SPAM_SIGNALS.some((signal) => lower.includes(signal))) {
    return {
      verdict: 'spam',
      message: 'Contains a promotional link pattern unrelated to the post. It would be held for review instead of being published automatically.',
    }
  }

  if (/elementor|divi|theme|editor|builder/.test(lower)) {
    return {
      verdict: 'reply',
      message: 'CommentMind works with any WordPress theme or page builder, including Elementor, Divi, Gutenberg, and custom themes. It connects to the native comment system, so there is nothing to rebuild on the design side.',
    }
  }

  if (/set ?up|install|time|long|minutes|hours/.test(lower)) {
    return {
      verdict: 'reply',
      message: 'Setup takes a few minutes: install the plugin, connect your site, and point it at your existing content. New comments can be moderated immediately.',
    }
  }

  return {
    verdict: 'reply',
    message: 'On your live site, CommentMind uses your own content as context to create an accurate, on-brand response rather than a generic reply.',
  }
}

export function WordPressCommentDemo() {
  const [value, setValue] = useState('')
  const [verdict, setVerdict] = useState<Verdict>('idle')
  const [message, setMessage] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function fillSample(text: string) {
    setValue(text)
    setVerdict('idle')
    setMessage('')
    textareaRef.current?.focus()
  }

  function handleSubmit() {
    const text = value.trim()
    if (!text || verdict === 'loading') return

    setVerdict('loading')
    setMessage('')

    window.setTimeout(() => {
      const result = classifyPreview(text)
      setVerdict(result.verdict)
      setMessage(result.message)
    }, 700)
  }

  const isSpam = verdict === 'spam'

  return (
    <section className="border-y border-slate-200 bg-slate-950 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-300">Interactive preview</p>
          <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">Type a comment. Watch CommentMind handle it.</h2>
          <p className="mt-4 text-base leading-7 text-slate-300">Try one of the examples or write your own. This local preview illustrates common moderation and reply outcomes with no signup required.</p>
        </div>

        <div className="mx-auto mt-10 max-w-3xl">
          <div className="flex flex-wrap gap-2">
            {SAMPLES.map((sample) => (
              <button
                key={sample.label}
                type="button"
                onClick={() => fillSample(sample.text)}
                className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-left text-xs font-medium text-slate-300 transition hover:border-emerald-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-300"
              >
                {sample.label}
              </button>
            ))}
          </div>

          <div className="mt-4 overflow-hidden rounded-lg border border-slate-700 bg-slate-900 shadow-2xl shadow-black/20">
            <div className="flex items-center gap-2 border-b border-slate-700 px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400/50" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-300/50" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-300/50" />
              <span className="ml-2 text-xs font-medium text-slate-400">yourblog.com - comment form</span>
            </div>
            <div className="p-4 sm:p-5">
              <label className="sr-only" htmlFor="wordpress-comment-demo">Leave a comment</label>
              <textarea
                ref={textareaRef}
                id="wordpress-comment-demo"
                value={value}
                maxLength={280}
                onChange={(event) => setValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) handleSubmit()
                }}
                placeholder="Leave a comment..."
                className="min-h-28 w-full resize-y rounded-md border border-slate-700 bg-slate-800 px-3 py-3 text-sm leading-6 text-white placeholder:text-slate-500 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-300/30"
              />
              <div className="mt-3 flex items-center justify-between gap-4">
                <span className="text-xs text-slate-500">CommentMind analyzes on submit</span>
                <button
                  type="button"
                  disabled={verdict === 'loading' || !value.trim()}
                  onClick={handleSubmit}
                  className="inline-flex h-10 items-center gap-2 rounded-md bg-emerald-300 px-4 text-sm font-semibold text-slate-950 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  <Send className="h-4 w-4" />
                  Post comment
                </button>
              </div>

              {verdict === 'loading' && (
                <div className="mt-5 flex items-center gap-2 text-sm text-slate-400">
                  <span>Preview is analyzing this comment</span>
                  <span className="flex gap-1" aria-hidden="true"><i className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.2s]" /><i className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.1s]" /><i className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" /></span>
                </div>
              )}

              {(verdict === 'spam' || verdict === 'reply') && (
                <div className="mt-5">
                  <div className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold ${isSpam ? 'bg-amber-400/15 text-amber-200' : 'bg-emerald-300/15 text-emerald-200'}`}>
                    {isSpam ? <Flag className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
                    {isSpam ? 'Flagged as likely spam' : 'Genuine comment - reply generated'}
                  </div>
                  <div className={`mt-3 border-l-2 bg-slate-800 p-4 text-sm leading-6 ${isSpam ? 'border-amber-300 text-slate-300' : 'border-emerald-300 text-slate-100'}`}>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-slate-500">{isSpam ? 'Held for review' : "CommentMind's reply"}</p>
                    {message}
                  </div>
                </div>
              )}
            </div>
          </div>
          <p className="mt-4 text-center text-xs leading-5 text-slate-500">This is a scripted preview of common cases. Your live site uses its own content, settings, and moderation rules.</p>
        </div>
      </div>
    </section>
  )
}
