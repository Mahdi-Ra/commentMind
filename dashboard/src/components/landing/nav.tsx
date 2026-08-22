'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Brain, Menu, X } from 'lucide-react'
import { cn } from '@/lib/cn'

const NAV_LINKS = [
  { label: 'Features', href: '/#features' },
  { label: 'How it works', href: '/#how-it-works' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'FAQ', href: '/#faq' },
]

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    const syncAuth = () => setIsLoggedIn(!!localStorage.getItem('cm_token'))
    syncAuth()
    window.addEventListener('storage', syncAuth)
    window.addEventListener('focus', syncAuth)
    return () => {
      window.removeEventListener('storage', syncAuth)
      window.removeEventListener('focus', syncAuth)
    }
  }, [])

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm shadow-slate-900/[0.04]'
          : 'bg-transparent',
      )}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-violet-800 text-white shadow-sm shadow-violet-600/30 transition group-hover:shadow-md group-hover:shadow-violet-600/40">
            <Brain className="h-4 w-4" strokeWidth={2} />
          </span>
          <span className="font-semibold tracking-tight text-slate-900">
            Comment<span className="text-violet-600">Mind</span>
          </span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href={isLoggedIn ? '/dashboard/account' : '/auth'}
            className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
          >
            {isLoggedIn ? 'Account' : 'Sign in'}
          </Link>
          <Link
            href={isLoggedIn ? '/dashboard' : '/auth'}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-violet-600 px-4 text-sm font-medium text-white shadow-sm shadow-violet-600/25 transition hover:bg-violet-700 active:bg-violet-800"
          >
            {isLoggedIn ? 'Dashboard' : 'Get started free'}
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-slate-200 bg-white px-4 pb-4 md:hidden">
          <ul className="mt-2 space-y-1">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-col gap-2">
            <Link
              href={isLoggedIn ? '/dashboard/account' : '/auth'}
              className="block rounded-lg border border-slate-200 px-4 py-2.5 text-center text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              {isLoggedIn ? 'Account' : 'Sign in'}
            </Link>
            <Link
              href={isLoggedIn ? '/dashboard' : '/auth'}
              className="block rounded-lg bg-violet-600 px-4 py-2.5 text-center text-sm font-medium text-white transition hover:bg-violet-700"
            >
              {isLoggedIn ? 'Dashboard' : 'Get started free'}
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
