import Link from 'next/link'
import type { ReactNode } from 'react'
import { ArrowRight, CheckCircle2, MessageSquareText, ShieldCheck, Sparkles } from 'lucide-react'
import { LandingFooter } from '@/components/landing/footer'
import { LandingNav } from '@/components/landing/nav'

type Feature = { title: string; description: string }
type Faq = { question: string; answer: string }

export function PlatformLanding({
  eyebrow,
  title,
  description,
  features,
  steps,
  faqs,
  cta,
  interactiveDemo,
}: {
  eyebrow: string
  title: string
  description: string
  features: Feature[]
  steps: string[]
  faqs: Faq[]
  cta: { label: string; href: string }
  interactiveDemo?: ReactNode
}) {
  return (
    <div className="min-h-screen bg-white">
      <LandingNav />
      <main>
        <section className="relative overflow-hidden border-b border-slate-100 bg-white pb-20 pt-32 sm:pb-28 sm:pt-40">
          <div className="hero-grid pointer-events-none absolute inset-0" />
          <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <p className="mb-5 text-sm font-semibold uppercase tracking-widest text-violet-600">{eyebrow}</p>
            <h1 className="text-4xl font-bold text-slate-900 sm:text-5xl lg:text-6xl">{title}</h1>
            <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-slate-600">{description}</p>
            <Link href={cta.href} className="mt-10 inline-flex h-12 items-center gap-2 rounded-lg bg-violet-600 px-6 text-base font-semibold text-white shadow-lg shadow-violet-600/25 transition hover:bg-violet-700">
              {cta.label}<ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <section className="py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center"><p className="text-sm font-semibold uppercase tracking-widest text-violet-600">Built for the workflow</p><h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">Keep every conversation moving</h2></div>
            <div className="mt-14 grid gap-5 sm:grid-cols-2">
              {features.map((feature, index) => {
                const icons = [MessageSquareText, ShieldCheck, Sparkles, CheckCircle2]
                const Icon = icons[index % icons.length]
                return <article key={feature.title} className="border border-slate-200 bg-white p-6 shadow-sm"><Icon className="mb-5 h-5 w-5 text-violet-600" /><h3 className="text-lg font-semibold text-slate-900">{feature.title}</h3><p className="mt-3 text-sm leading-6 text-slate-600">{feature.description}</p></article>
              })}
            </div>
          </div>
        </section>

        {interactiveDemo}

        <section className="border-y border-slate-200 bg-slate-50 py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl"><p className="text-sm font-semibold uppercase tracking-widest text-violet-600">How it works</p><h2 className="mt-3 text-3xl font-bold text-slate-900">Set it up once, stay in control</h2></div>
            <ol className="mt-12 grid gap-6 md:grid-cols-3">{steps.map((step, index) => <li key={step} className="border border-slate-200 bg-white p-6"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-600 text-sm font-bold text-white">{index + 1}</span><p className="mt-5 text-base font-medium leading-7 text-slate-800">{step}</p></li>)}</ol>
          </div>
        </section>

        <section className="py-20 sm:py-28">
          <div className="mx-auto max-w-3xl px-4 sm:px-6"><p className="text-center text-sm font-semibold uppercase tracking-widest text-violet-600">FAQ</p><h2 className="mt-3 text-center text-3xl font-bold text-slate-900">Questions, answered</h2><div className="mt-12 divide-y divide-slate-200 border-y border-slate-200">{faqs.map((faq) => <article key={faq.question} className="py-6"><h3 className="text-base font-semibold text-slate-900">{faq.question}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{faq.answer}</p></article>)}</div></div>
        </section>

        <section className="bg-slate-900 py-20 text-center"><div className="mx-auto max-w-2xl px-4 sm:px-6"><h2 className="text-3xl font-bold text-white">Make comments work for your site</h2><p className="mt-4 text-slate-300">Start with a free plan and configure exactly how CommentMind handles each conversation.</p><Link href={cta.href} className="mt-8 inline-flex h-12 items-center gap-2 rounded-lg bg-white px-6 text-base font-semibold text-slate-900 transition hover:bg-slate-100">{cta.label}<ArrowRight className="h-4 w-4" /></Link></div></section>
      </main>
      <LandingFooter />
    </div>
  )
}

export function faqSchema(faqs: Faq[]) {
  return { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map((faq) => ({ '@type': 'Question', name: faq.question, acceptedAnswer: { '@type': 'Answer', text: faq.answer } })) }
}
