import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Code2, KeyRound, Settings2 } from 'lucide-react'
import { LandingFooter } from '@/components/landing/footer'
import { LandingNav } from '@/components/landing/nav'

export const metadata: Metadata = {
  title: 'JavaScript Comment Widget | CommentMind',
  description: 'Add AI-moderated comments to any website with the CommentMind JavaScript widget.',
}

const steps = [
  { icon: KeyRound, title: 'Create a site', description: 'Add your domain from the CommentMind dashboard. Each site receives its own API key.' },
  { icon: Code2, title: 'Copy the generated snippet', description: 'Open the Integration tab for that site, enter its API key, and copy the complete embed code.' },
  { icon: Settings2, title: 'Add it before </body>', description: 'Paste the snippet into your page and publish. The widget keeps your site styles isolated and comments process asynchronously.' },
]

export default function JsWidgetPage() {
  return <div className="min-h-screen bg-white"><LandingNav /><main className="pt-28 sm:pt-36"><section className="mx-auto max-w-4xl px-4 pb-16 text-center sm:px-6"><p className="text-sm font-semibold uppercase tracking-widest text-violet-600">JavaScript widget</p><h1 className="mt-4 text-4xl font-bold text-slate-900 sm:text-5xl">AI-moderated comments for any website</h1><p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">Add the CommentMind widget to Webflow, a custom site, a CMS, or any page that lets you add a script tag. No front-end framework is required.</p><Link href="/auth" className="mt-8 inline-flex h-11 items-center gap-2 rounded-lg bg-violet-600 px-5 text-sm font-semibold text-white transition hover:bg-violet-700">Open your dashboard <ArrowRight className="h-4 w-4" /></Link></section><section className="border-y border-slate-200 bg-slate-50 py-16 sm:py-20"><div className="mx-auto max-w-6xl px-4 sm:px-6"><ol className="grid gap-5 md:grid-cols-3">{steps.map(({ icon: Icon, title, description }, index) => <li key={title} className="border border-slate-200 bg-white p-6 shadow-sm"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-600 text-sm font-bold text-white">{index + 1}</span><Icon className="mt-6 h-5 w-5 text-violet-600" /><h2 className="mt-4 text-lg font-semibold text-slate-900">{title}</h2><p className="mt-3 text-sm leading-6 text-slate-600">{description}</p></li>)}</ol></div></section></main><LandingFooter /></div>
}
