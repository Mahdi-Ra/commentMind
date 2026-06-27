import Link from 'next/link'
import { ArrowRight, Bot, ShieldCheck, Zap } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white pt-32 pb-20 sm:pt-40 sm:pb-28">
      {/* Background decorations */}
      <div className="hero-grid absolute inset-0 pointer-events-none" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[600px] rounded-full bg-violet-100/60 blur-3xl pointer-events-none" />
      <div className="absolute top-20 right-0 h-[400px] w-[400px] rounded-full bg-indigo-100/40 blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        {/* Eyebrow badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-1.5 text-sm font-medium text-violet-700 animate-fade-in">
          <span className="flex h-2 w-2 rounded-full bg-violet-500" />
          Powered by GPT-4o
        </div>

        {/* Headline */}
        <h1 className="animate-slide-up text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
          Your website comments,{' '}
          <span className="gradient-text">moderated by AI</span>
        </h1>

        {/* Sub-headline */}
        <p className="animate-slide-up-delay-1 mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-500">
          CommentMind automatically replies to questions, filters spam, and approves
          legitimate comments — trained on your own knowledge base. Works with WordPress,
          any JS site, and more.
        </p>

        {/* CTA buttons */}
        <div className="animate-slide-up-delay-2 mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/auth"
            className="inline-flex h-12 items-center gap-2 rounded-xl bg-violet-600 px-6 text-base font-semibold text-white shadow-lg shadow-violet-600/30 transition hover:bg-violet-700 hover:shadow-violet-600/40 active:bg-violet-800"
          >
            Start for free
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="#how-it-works"
            className="inline-flex h-12 items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 text-base font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
          >
            See how it works
          </a>
        </div>

        {/* Trust line */}
        <p className="animate-slide-up-delay-3 mt-5 text-sm text-slate-400">
          No credit card required · Free plan forever · Setup in 5 minutes
        </p>

        {/* Hero stats */}
        <div className="animate-slide-up-delay-3 mx-auto mt-16 grid max-w-2xl grid-cols-3 gap-4">
          {[
            { icon: Bot, value: '< 1s', label: 'Avg. reply time' },
            { icon: ShieldCheck, value: '98%', label: 'Spam accuracy' },
            { icon: Zap, value: '5 min', label: 'Setup time' },
          ].map(({ icon: Icon, value, label }) => (
            <div
              key={label}
              className="rounded-2xl border border-slate-100 bg-white/80 px-4 py-5 shadow-sm backdrop-blur-sm"
            >
              <Icon className="mx-auto mb-2 h-5 w-5 text-violet-500" />
              <p className="text-2xl font-bold text-slate-900">{value}</p>
              <p className="mt-0.5 text-xs font-medium text-slate-500">{label}</p>
            </div>
          ))}
        </div>

        {/* Mock comment card */}
        <div className="animate-slide-up-delay-3 mx-auto mt-12 max-w-lg rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-xl shadow-slate-900/[0.06]">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">
              A
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-800">Ali Rezaei</p>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-600/10">
                  Replied ✓
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-600">
                Does this product come with a warranty? How long is it?
              </p>
              <div className="mt-3 rounded-xl border border-violet-100 bg-violet-50/80 p-3">
                <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-violet-600">
                  <Bot className="h-3.5 w-3.5" />
                  AI reply
                </p>
                <p className="text-sm text-violet-900">
                  Hi Ali! Yes, this product comes with an 18-month manufacturer warranty.
                  Feel free to contact our support team for any warranty claims.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
