import type { Metadata } from 'next'
import { CheckCircle2 } from 'lucide-react'
import { LandingFooter } from '@/components/landing/footer'
import { LandingNav } from '@/components/landing/nav'

export const metadata: Metadata = {
  title: 'Service Status | CommentMind',
  description: 'Current operational status for CommentMind services.',
}

const services = ['Dashboard', 'Comment processing API', 'AI moderation workers', 'WordPress integration']

export default function StatusPage() {
  return <div className="min-h-screen bg-white"><LandingNav /><main className="mx-auto max-w-3xl px-4 pb-24 pt-32 sm:px-6 sm:pt-40"><div className="border border-emerald-200 bg-emerald-50 p-6 text-center"><CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600" /><h1 className="mt-3 text-2xl font-bold text-slate-900">All systems operational</h1><p className="mt-2 text-sm text-slate-600">CommentMind services are currently available.</p></div><section className="mt-10"><h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400">Services</h2><div className="mt-4 divide-y divide-slate-200 border-y border-slate-200">{services.map((service) => <div key={service} className="flex items-center justify-between py-5"><span className="text-sm font-medium text-slate-800">{service}</span><span className="inline-flex items-center gap-2 text-sm font-medium text-emerald-700"><span className="h-2 w-2 rounded-full bg-emerald-500" />Operational</span></div>)}</div></section><p className="mt-10 text-center text-sm text-slate-500">Experiencing an issue? Contact <a className="font-medium text-violet-700 hover:text-violet-800" href="mailto:hello@commentmind.website">hello@commentmind.website</a>.</p></main><LandingFooter /></div>
}
