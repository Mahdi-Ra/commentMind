import Link from 'next/link'
import { Brain } from 'lucide-react'

const LINKS = {
  Product: [
    { label: 'Features', href: '/#features' },
    { label: 'How it works', href: '/#how-it-works' },
    { label: 'Pricing', href: '/#pricing' },
    { label: 'FAQ', href: '/#faq' },
  ],
  Developers: [
    { label: 'API docs', href: '/docs' },
    { label: 'WordPress plugin', href: '/downloads/commentmind-ai-wordpress-plugin.zip' },
    { label: 'JS widget', href: '/js-widget' },
    { label: 'Status', href: '/status' },
  ],
  Integrations: [
    { label: 'WordPress', href: '/wordpress/' },
    { label: 'WooCommerce', href: '/woocommerce/' },
    { label: 'Shopify', href: '/shopify/' },
    { label: 'Webflow', href: '/webflow/' },
  ],
  Company: [
    { label: 'About', href: '/about' },
    { label: 'Contact', href: 'mailto:hello@commentmind.website' },
    { label: 'Privacy policy', href: '/privacy' },
    { label: 'Terms of service', href: '/terms' },
  ],
}

export function LandingFooter() {
  return (
    <footer className="border-t border-slate-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.8fr)_repeat(4,minmax(0,1fr))] lg:gap-8">
          {/* Brand */}
          <div className="max-w-sm">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-violet-800 text-white">
                <Brain className="h-4 w-4" strokeWidth={2} />
              </span>
              <span className="font-semibold tracking-tight text-slate-900">
                Comment<span className="text-violet-600">Mind</span>
              </span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-slate-500">
              AI-powered comment moderation for websites of all sizes, built for faster customer conversations.
            </p>
            <p className="mt-4 text-xs text-slate-400">
              © {new Date().getFullYear()} CommentMind AI. All rights reserved.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([group, items]) => (
            <div key={group}>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
                {group}
              </h4>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      className="text-sm text-slate-500 transition hover:text-slate-900"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  )
}
