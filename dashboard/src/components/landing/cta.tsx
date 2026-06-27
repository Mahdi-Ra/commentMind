import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export function CtaSection() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-violet-700 to-indigo-700 px-8 py-16 text-center shadow-2xl shadow-violet-600/30 sm:px-16">
          {/* Background glow */}
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 h-64 w-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 h-48 w-48 rounded-full bg-indigo-500/20 blur-2xl pointer-events-none" />

          <div className="relative">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to automate your comment moderation?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-violet-200">
              Join hundreds of site owners who save hours every week. Start free —
              no credit card, no setup fees.
            </p>

            <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/auth"
                className="inline-flex h-12 items-center gap-2 rounded-xl bg-white px-6 text-base font-semibold text-violet-700 shadow-lg transition hover:bg-violet-50 active:bg-violet-100"
              >
                Get started free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#pricing"
                className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/30 px-6 text-base font-medium text-white transition hover:bg-white/10"
              >
                View pricing
              </a>
            </div>

            <p className="mt-5 text-sm text-violet-300">
              Free plan forever · 7-day trial on paid plans · Cancel anytime
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
