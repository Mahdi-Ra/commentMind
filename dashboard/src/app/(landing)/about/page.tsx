import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Code2, MessageSquareText, ShieldCheck } from 'lucide-react'
import { LandingFooter } from '@/components/landing/footer'
import { LandingNav } from '@/components/landing/nav'

export const metadata: Metadata = {
  title: 'About CommentMind | Built by DeepDev',
  description: 'CommentMind is built by DeepDev, a software team that has spent years building WordPress plugins and custom SaaS products. Here\'s why we built it.',
}

const reasons = [
  {
    icon: Code2,
    title: 'We\'ve shipped the plugins ourselves',
    description: 'DeepDev has built WordPress plugins and custom software for businesses across multiple industries. We are not guessing at what site owners need from a comment tool; we have maintained the comment sections ourselves.',
  },
  {
    icon: ShieldCheck,
    title: 'Spam got smarter, so moderation had to too',
    description: 'Keyword-based spam filters were built for a different era. AI-generated comments now read like real ones, and blocking them takes an understanding of context - the same technology we use to generate replies.',
  },
  {
    icon: MessageSquareText,
    title: 'A comment section should do work, not just sit there',
    description: 'Every unanswered question in a comment thread is a missed conversation with a reader, customer, or potential sale. CommentMind makes sure those questions are answered instead of ignored.',
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <LandingNav />
      <main>
        <section className="border-b border-slate-100 bg-slate-50/70 pb-20 pt-32 sm:pb-28 sm:pt-40">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <p className="text-sm font-semibold uppercase tracking-widest text-violet-600">Built by developers who were tired of moderating comments themselves</p>
            <h1 className="mt-5 text-4xl font-bold text-slate-900 sm:text-5xl">We built CommentMind because we were doing this by hand</h1>
            <p className="mx-auto mt-7 max-w-3xl text-lg leading-8 text-slate-600">
              CommentMind comes out of <a className="font-medium text-violet-700 hover:text-violet-800" href="https://deepdevteam.com/" target="_blank" rel="noreferrer">DeepDev</a>, a software team that has spent years building WordPress plugins, custom CRMs, and SaaS products for clients around the world. Comment moderation kept showing up as the same recurring problem on almost every content-driven site we shipped: spam that keyword filters could not catch, and real reader questions sitting unanswered for days. We built CommentMind to fix that - first for our own projects, then as a product on its own.
            </p>
          </div>
        </section>

        <section className="py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-widest text-violet-600">Why we are building this</p>
              <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">A better way to keep conversations moving</h2>
            </div>
            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {reasons.map(({ icon: Icon, title, description }) => (
                <article key={title} className="border border-slate-200 bg-white p-6 shadow-sm">
                  <Icon className="h-5 w-5 text-violet-600" />
                  <h3 className="mt-5 text-lg font-semibold text-slate-900">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-slate-200 bg-slate-900 py-20 text-center">
          <div className="mx-auto max-w-2xl px-4 sm:px-6">
            <p className="text-sm font-semibold uppercase tracking-widest text-violet-300">Who is behind it</p>
            <h2 className="mt-4 text-3xl font-bold text-white">Built and maintained by DeepDev</h2>
            <p className="mt-5 text-base leading-7 text-slate-300">CommentMind is developed and maintained by <a className="font-medium text-white underline decoration-violet-400 underline-offset-4" href="https://deepdevteam.com/" target="_blank" rel="noreferrer">DeepDev</a>, a software team working on web development, WordPress plugin development, custom CRM systems, and SaaS products. The same team can also help with custom development beyond what CommentMind covers.</p>
            <Link href="/auth" className="mt-8 inline-flex h-12 items-center gap-2 rounded-lg bg-white px-6 text-base font-semibold text-slate-900 transition hover:bg-slate-100">Try CommentMind free <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  )
}
