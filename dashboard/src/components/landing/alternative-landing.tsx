import Link from 'next/link'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { LandingFooter } from '@/components/landing/footer'
import { LandingNav } from '@/components/landing/nav'

type ComparisonRow = {
  label: string
  alternative: string
  commentmind: string
}

type Faq = {
  question: string
  answer: string
}

export function AlternativeLanding({
  alternative,
  introduction,
  rows,
  conclusion,
  faqs,
  cta,
}: {
  alternative: string
  introduction: string
  rows: ComparisonRow[]
  conclusion: string
  faqs: Faq[]
  cta: { label: string; href: string }
}) {
  return (
    <div className="min-h-screen bg-white">
      <LandingNav />
      <main>
        <section className="border-b border-slate-100 bg-slate-50/70 pb-16 pt-32 sm:pb-20 sm:pt-40">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <p className="text-sm font-semibold uppercase tracking-widest text-violet-600">Alternative comparison</p>
            <h1 className="mt-4 text-4xl font-bold text-slate-900 sm:text-5xl">CommentMind vs {alternative}</h1>
            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-600">{introduction}</p>
          </div>
        </section>

        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-widest text-violet-600">At a glance</p>
              <h2 className="mt-3 text-3xl font-bold text-slate-900">What is actually different?</h2>
            </div>
            <div className="overflow-x-auto border border-slate-200 bg-white">
              <table className="w-full min-w-[680px] border-collapse text-left text-sm">
                <thead className="bg-slate-900 text-white">
                  <tr>
                    <th className="w-[26%] px-5 py-4 font-semibold">Capability</th>
                    <th className="w-[37%] px-5 py-4 font-semibold">{alternative}</th>
                    <th className="w-[37%] px-5 py-4 font-semibold text-violet-200">CommentMind</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {rows.map((row) => (
                    <tr key={row.label} className="align-top">
                      <th scope="row" className="bg-slate-50 px-5 py-5 font-semibold text-slate-900">{row.label}</th>
                      <td className="px-5 py-5 leading-6 text-slate-600">{row.alternative}</td>
                      <td className="px-5 py-5 leading-6 text-slate-700">{row.commentmind}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-slate-50 py-16 sm:py-20">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:items-start sm:px-6 lg:px-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-violet-600">An honest fit</p>
              <h2 className="mt-3 text-3xl font-bold text-slate-900">Choose the tool that fits the job</h2>
            </div>
            <div className="border-l-2 border-violet-500 pl-6 text-base leading-8 text-slate-600">{conclusion}</div>
          </div>
        </section>

        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <p className="text-center text-sm font-semibold uppercase tracking-widest text-violet-600">FAQ</p>
            <h2 className="mt-3 text-center text-3xl font-bold text-slate-900">Questions, answered</h2>
            <div className="mt-10 divide-y divide-slate-200 border-y border-slate-200">
              {faqs.map((faq) => (
                <article key={faq.question} className="py-6">
                  <h3 className="text-base font-semibold text-slate-900">{faq.question}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{faq.answer}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-900 py-20 text-center">
          <div className="mx-auto max-w-2xl px-4 sm:px-6">
            <CheckCircle2 className="mx-auto h-6 w-6 text-violet-300" />
            <h2 className="mt-4 text-3xl font-bold text-white">Make every website comment count</h2>
            <p className="mt-4 text-slate-300">Start with a free plan and see how CommentMind handles your real comment workflow.</p>
            <Link href={cta.href} className="mt-8 inline-flex h-12 items-center gap-2 rounded-lg bg-white px-6 text-base font-semibold text-slate-900 transition hover:bg-slate-100">
              {cta.label} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  )
}

export function alternativeFaqSchema(faqs: Faq[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  }
}
