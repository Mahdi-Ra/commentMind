import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, BookOpen, CheckCircle2 } from 'lucide-react'
import { LandingFooter } from '@/components/landing/footer'
import { LandingNav } from '@/components/landing/nav'

export const metadata: Metadata = {
  title: { absolute: 'AI Comment Moderation: The Complete Guide | CommentMind' },
  description: 'Everything about moderating website comments with AI - why keyword filters are falling behind, how context-aware moderation works, and how to set it up on your platform.',
}

const toc = [
  ['why-different', 'Why comment spam looks different now'],
  ['checklist', 'Where the standard checklist still works - and where it stops'],
  ['context-aware', 'What context-aware moderation actually means'],
  ['support-channel', 'Turning moderation into something that also answers questions'],
  ['comparisons', 'How CommentMind compares to the tools you already know'],
  ['platforms', 'Setting this up on your platform'],
]

export default function AiCommentModerationGuide() {
  return (
    <div className="min-h-screen bg-white">
      <LandingNav />
      <main>
        <section className="border-b border-slate-200 bg-slate-50/70 pb-16 pt-32 sm:pb-20 sm:pt-40">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-semibold uppercase tracking-widest text-violet-600">The complete guide</p>
              <h1 className="mt-4 text-4xl font-bold text-slate-900 sm:text-5xl">AI Comment Moderation</h1>
              <p className="mt-5 text-lg leading-8 text-slate-600">Comment sections have a moderation problem that has changed shape faster than most tools built to handle it. This guide covers what changed, why the standard toolkit is starting to miss it, and what a modern setup looks like.</p>
              <p className="mt-5 text-sm text-slate-500">Updated August 2026 · 8 min read</p>
            </div>
          </div>
        </section>

        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-14 lg:grid-cols-[220px_minmax(0,1fr)] lg:py-20 sm:px-6 lg:px-8">
          <aside className="h-fit border border-slate-200 bg-white p-5 lg:sticky lg:top-24">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">What&apos;s on this page</p>
            <ol className="mt-4 space-y-3">
              {toc.map(([id, label], index) => (
                <li key={id} className="flex gap-2 text-sm leading-5">
                  <span className="font-semibold text-violet-600">{index + 1}.</span>
                  <a className="text-slate-600 transition hover:text-violet-700" href={`#${id}`}>{label}</a>
                </li>
              ))}
            </ol>
          </aside>

          <article className="max-w-3xl text-[17px] leading-8 text-slate-600">
            <section id="why-different" className="scroll-mt-28">
              <h2 className="text-3xl font-bold leading-tight text-slate-900">Why comment spam looks different now</h2>
              <p className="mt-5">The short version: spam used to be cheap and lazy to produce, so filters built around catching cheap, lazy patterns worked well. Generative AI removed the lazy part. A spam comment today can be uniquely worded, grammatically clean, and shaped to sound like it is genuinely engaging with the post it is replying to. That is a structurally different problem than the one keyword filters and blacklists were designed to solve.</p>
              <ExternalArticle href="https://blog.commentmind.website/ai-generated-spam-comments/">AI-Generated Spam Comments Are Getting Past Your Filters</ExternalArticle>
            </section>

            <section id="checklist" className="mt-14 scroll-mt-28">
              <h2 className="text-3xl font-bold leading-tight text-slate-900">Where the standard checklist still works - and where it stops</h2>
              <p className="mt-5">Akismet, manual approval, honeypot fields, and closing comments on old posts: none of this advice is wrong, and skipping it is not the fix. It is still the right first layer because it removes the bulk of low-effort spam for free. The gap is what it was never built to catch: comments that read naturally, contain no flagged links or phrases, and only look like spam once you notice the same pattern of &quot;compliment the post, then pivot to a recommendation&quot; across multiple threads.</p>
              <ExternalArticle href="https://blog.commentmind.website/how-to-stop-spam-comments-wordpress">How to Stop Spam Comments on WordPress in 2026</ExternalArticle>
            </section>

            <section id="context-aware" className="mt-14 scroll-mt-28">
              <h2 className="text-3xl font-bold leading-tight text-slate-900">What context-aware moderation actually means</h2>
              <p className="mt-5">Instead of checking a comment against a list of known-bad patterns, context-aware moderation reads the comment against the specific post it is replying to and asks a different question: does this actually engage with what was written, or could this exact text be dropped under any article on any topic in this niche? That catches AI-generated spam precisely because it does not depend on spam repeating a pattern. It depends on spam being generic relative to its context, which it almost always is even when individually well-written.</p>
            </section>

            <section id="support-channel" className="mt-14 scroll-mt-28">
              <h2 className="text-3xl font-bold leading-tight text-slate-900">Turning moderation into something that also answers questions</h2>
              <p className="mt-5">Moderation alone answers one question: spam or not. Every comment that clears that bar just gets published, including legitimate questions that never get a reply. Treating a comment section as a support channel means the moderation layer also handles the second half: answering the question from your own published content in the thread, instead of leaving it for a human to notice or ignore.</p>
              <ExternalArticle href="https://blog.commentmind.website/blog-comments-customer-support">Turning Your Blog Comments Into a Customer Support Channel</ExternalArticle>
            </section>

            <section id="comparisons" className="mt-14 scroll-mt-28">
              <h2 className="text-3xl font-bold leading-tight text-slate-900">How CommentMind compares to the tools you already know</h2>
              <p className="mt-5">If you are already running one of the standard tools, here is specifically how CommentMind differs and where each one still makes sense on its own:</p>
              <ul className="mt-5 space-y-3">
                <li><Link className="font-medium text-violet-700 hover:text-violet-800" href="/alternatives/akismet/">CommentMind vs Akismet</Link> <span>- pattern-based filtering vs. context-aware moderation with replies</span></li>
                <li><Link className="font-medium text-violet-700 hover:text-violet-800" href="/alternatives/disqus/">CommentMind vs Disqus</Link> <span>- comment hosting and infrastructure vs. an AI moderation and reply layer</span></li>
                <li><Link className="font-medium text-violet-700 hover:text-violet-800" href="/alternatives/commentguard/">CommentMind vs CommentGuard</Link> <span>- social media comment moderation vs. moderation for your own website</span></li>
              </ul>
            </section>

            <section id="platforms" className="mt-14 scroll-mt-28">
              <h2 className="text-3xl font-bold leading-tight text-slate-900">Setting this up on your platform</h2>
              <p className="mt-5">CommentMind is built to drop into the platform you are already running, not to replace your comment system:</p>
              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {[['WordPress', '/wordpress/'], ['WooCommerce', '/woocommerce/'], ['Shopify', '/shopify/'], ['Webflow', '/webflow/']].map(([label, href]) => (
                  <Link key={label} href={href} className="flex items-center justify-between border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-800">
                    {label}<ArrowRight className="h-4 w-4" />
                  </Link>
                ))}
              </div>
            </section>

            <div className="mt-14 border-l-2 border-violet-500 bg-violet-50 p-6 text-base leading-7 text-slate-700">
              <BookOpen className="mb-3 h-5 w-5 text-violet-700" />
              This guide is updated as the AI comment moderation space changes. See <Link className="font-semibold text-violet-700 hover:text-violet-800" href="/pricing">pricing</Link> to get started, or jump to the platform page for your site above.
            </div>
          </article>
        </div>

        <section className="bg-slate-900 py-20 text-center">
          <div className="mx-auto max-w-2xl px-4 sm:px-6">
            <CheckCircle2 className="mx-auto h-6 w-6 text-violet-300" />
            <h2 className="mt-4 text-3xl font-bold text-white">See context-aware moderation in action</h2>
            <p className="mt-4 text-slate-300">Start free and set up CommentMind for the site you already run.</p>
            <Link href="/auth" className="mt-8 inline-flex h-12 items-center gap-2 rounded-lg bg-white px-6 text-base font-semibold text-slate-900 transition hover:bg-slate-100">Try CommentMind free <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  )
}

function ExternalArticle({ href, children }: { href: string; children: string }) {
  return <a className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-violet-700 hover:text-violet-800" href={href} target="_blank" rel="noreferrer">Full breakdown: {children} <ArrowRight className="h-4 w-4" /></a>
}
