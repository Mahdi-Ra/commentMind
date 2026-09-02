import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, BookOpen, CheckCircle2 } from 'lucide-react'
import { LandingFooter } from '@/components/landing/footer'
import { LandingNav } from '@/components/landing/nav'

export const metadata: Metadata = {
  title: { absolute: 'AI Product Q&A: Answering Customer Questions Automatically | CommentMind' },
  description: 'How AI-powered Q&A works on product pages - answering shopper questions from your real product data, moderating fake reviews, and reducing support tickets.',
}

const toc = [
  ['why-different', 'Why product page questions are different from blog comments'],
  ['what-it-means', 'What AI Product Q&A actually means'],
  ['moderation', 'Moderation still matters - fake reviews are a real problem'],
  ['comparison', 'How this compares to a general Q&A app'],
  ['setup', 'Setting this up on your store'],
]

export default function AiProductQaGuide() {
  return (
    <div className="min-h-screen bg-white">
      <LandingNav />
      <main>
        <section className="border-b border-slate-200 bg-slate-50/70 pb-16 pt-32 sm:pb-20 sm:pt-40">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-semibold uppercase tracking-widest text-violet-600">The complete guide</p>
              <h1 className="mt-4 text-4xl font-bold text-slate-900 sm:text-5xl">AI Product Q&amp;A: Answering Customer Questions Automatically</h1>
              <p className="mt-5 text-lg leading-8 text-slate-600">Every question a shopper leaves on a product page is a decision waiting on an answer. This guide covers how AI-powered Q&amp;A works, why it is different from generic comment moderation, and how to set it up on your store.</p>
              <p className="mt-5 text-sm text-slate-500">Updated September 2026 · 6 min read</p>
            </div>
          </div>
        </section>

        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-14 lg:grid-cols-[220px_minmax(0,1fr)] lg:py-20 sm:px-6 lg:px-8">
          <aside className="h-fit border border-slate-200 bg-white p-5 lg:sticky lg:top-24">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">What&apos;s on this page</p>
            <ol className="mt-4 space-y-3">
              {toc.map(([id, label], index) => (
                <li key={id} className="flex gap-2 text-sm leading-5"><span className="font-semibold text-violet-600">{index + 1}.</span><a className="text-slate-600 transition hover:text-violet-700" href={`#${id}`}>{label}</a></li>
              ))}
            </ol>
          </aside>

          <article className="max-w-3xl text-[17px] leading-8 text-slate-600">
            <section id="why-different" className="scroll-mt-28">
              <h2 className="text-3xl font-bold leading-tight text-slate-900">Why product page questions are different from blog comments</h2>
              <p className="mt-5">A comment on a product page is closer to a sales conversation than a discussion. The person asking almost always has a specific, practical question standing between them and checkout, and every later visitor with the same question reads the thread before deciding, whether they comment or not. Unanswered, it does not read as neutral silence. It reads as nobody minding the store.</p>
              <ExternalArticle href="https://blog.commentmind.website/comment-best-practices-ecommerce">Comment Section Best Practices for Ecommerce Product Pages</ExternalArticle>
            </section>

            <section id="what-it-means" className="mt-14 scroll-mt-28">
              <h2 className="text-3xl font-bold leading-tight text-slate-900">What AI Product Q&amp;A actually means</h2>
              <p className="mt-5">Rather than a human checking every product page for new questions, AI Product Q&amp;A reads the question and answers it from your actual product data: pricing, variants, stock, sizing, and policies. It works the same way a staff member would if they had unlimited time to sit in every thread. The answer is grounded in what you have actually published, not generated generically, which is the difference between an answer a shopper trusts and one that reads as an obvious bot reply.</p>
            </section>

            <section id="moderation" className="mt-14 scroll-mt-28">
              <h2 className="text-3xl font-bold leading-tight text-slate-900">Moderation still matters - fake reviews are a real problem</h2>
              <p className="mt-5">Ecommerce comment and review sections attract a kind of noise blog comments mostly do not: bot-generated fake reviews meant to inflate or attack a product&apos;s reputation. A fake review with no link and no obvious spam pattern will not trip a standard spam filter. It needs the same context-aware evaluation used for comment spam, applied to reviews specifically. Answering questions and filtering fake reviews are two sides of the same problem: reading content in context instead of just pattern-matching it.</p>
            </section>

            <section id="comparison" className="mt-14 scroll-mt-28">
              <h2 className="text-3xl font-bold leading-tight text-slate-900">How this compares to a general Q&amp;A app</h2>
              <p className="mt-5">Most AI Q&amp;A tools built for Shopify stop at answering product questions. They do not moderate comment threads or reviews for spam and fake content. CommentMind does both from one dashboard: product Q&amp;A grounded in your catalog, plus comment and review moderation, instead of running a Q&amp;A app and a separate moderation tool side by side.</p>
              <Link href="/shopify/" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-violet-700 hover:text-violet-800">See the Shopify integration <ArrowRight className="h-4 w-4" /></Link>
            </section>

            <section id="setup" className="mt-14 scroll-mt-28">
              <h2 className="text-3xl font-bold leading-tight text-slate-900">Setting this up on your store</h2>
              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                <Link href="/shopify/" className="border border-slate-200 bg-slate-50 p-5 transition hover:border-violet-300 hover:bg-violet-50"><h3 className="text-base font-semibold text-slate-900">Shopify</h3><p className="mt-2 text-sm leading-6 text-slate-600">Native app integration that syncs with your product catalog.</p><span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-violet-700">Explore Shopify <ArrowRight className="h-4 w-4" /></span></Link>
                <Link href="/woocommerce/" className="border border-slate-200 bg-slate-50 p-5 transition hover:border-violet-300 hover:bg-violet-50"><h3 className="text-base font-semibold text-slate-900">WooCommerce</h3><p className="mt-2 text-sm leading-6 text-slate-600">Works alongside your existing product and blog comments.</p><span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-violet-700">Explore WooCommerce <ArrowRight className="h-4 w-4" /></span></Link>
              </div>
            </section>

            <div className="mt-14 border-l-2 border-violet-500 bg-violet-50 p-6 text-base leading-7 text-slate-700"><BookOpen className="mb-3 h-5 w-5 text-violet-700" />See <Link className="font-semibold text-violet-700 hover:text-violet-800" href="/pricing">pricing</Link> to get started, or read the full setup for your platform above.</div>
          </article>
        </div>

        <section className="bg-slate-900 py-20 text-center"><div className="mx-auto max-w-2xl px-4 sm:px-6"><CheckCircle2 className="mx-auto h-6 w-6 text-violet-300" /><h2 className="mt-4 text-3xl font-bold text-white">Turn product questions into confident purchases</h2><p className="mt-4 text-slate-300">Start free and let CommentMind keep the conversation moving on every product page.</p><Link href="/auth" className="mt-8 inline-flex h-12 items-center gap-2 rounded-lg bg-white px-6 text-base font-semibold text-slate-900 transition hover:bg-slate-100">Try CommentMind free <ArrowRight className="h-4 w-4" /></Link></div></section>
      </main>
      <LandingFooter />
    </div>
  )
}

function ExternalArticle({ href, children }: { href: string; children: string }) {
  return <a className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-violet-700 hover:text-violet-800" href={href} target="_blank" rel="noreferrer">Full breakdown: {children} <ArrowRight className="h-4 w-4" /></a>
}
