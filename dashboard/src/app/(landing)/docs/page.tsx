import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, BookOpen, KeyRound, PlugZap } from 'lucide-react'
import { LandingFooter } from '@/components/landing/footer'
import { LandingNav } from '@/components/landing/nav'

export const metadata: Metadata = {
  title: 'Developer Documentation | CommentMind',
  description: 'Connect CommentMind to your website with the WordPress plugin or JavaScript widget.',
}

const guides = [
  { icon: PlugZap, title: 'JavaScript widget', description: 'Add a fully moderated comment section to any website with one generated script snippet.', href: '/js-widget', label: 'View widget guide' },
  { icon: BookOpen, title: 'WordPress plugin', description: 'Install the CommentMind plugin and connect it with a site-specific API key from your dashboard.', href: '/wordpress/', label: 'View WordPress guide' },
  { icon: KeyRound, title: 'Site API keys', description: 'Generate and rotate a unique API key for every connected website from its settings page.', href: '/auth', label: 'Open dashboard' },
]

export default function DocsPage() {
  return <div className="min-h-screen bg-white"><LandingNav /><main className="pt-28 sm:pt-36"><section className="mx-auto max-w-4xl px-4 pb-16 text-center sm:px-6"><p className="text-sm font-semibold uppercase tracking-widest text-violet-600">Developer documentation</p><h1 className="mt-4 text-4xl font-bold text-slate-900 sm:text-5xl">Connect CommentMind to your site</h1><p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">Start with the integration that fits your stack. Each site has its own API key and moderation settings, all managed from one dashboard.</p></section><section className="border-y border-slate-200 bg-slate-50 py-16 sm:py-20"><div className="mx-auto grid max-w-6xl gap-5 px-4 md:grid-cols-3 sm:px-6">{guides.map(({ icon: Icon, title, description, href, label }) => <article key={title} className="border border-slate-200 bg-white p-6 shadow-sm"><Icon className="h-5 w-5 text-violet-600" /><h2 className="mt-5 text-lg font-semibold text-slate-900">{title}</h2><p className="mt-3 text-sm leading-6 text-slate-600">{description}</p><Link href={href} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-violet-700 hover:text-violet-800">{label}<ArrowRight className="h-4 w-4" /></Link></article>)}</div></section></main><LandingFooter /></div>
}
