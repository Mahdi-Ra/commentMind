'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, LogOut, ChevronDown, UserCircle, Zap } from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { Logo } from '@/components/brand/logo'
import { OnboardingModal } from '@/components/dashboard/onboarding-modal'
import { cn } from '@/lib/cn'
import { Button } from '@/components/ui/button'

const ONBOARDING_KEY = 'cm_onboarding_done'

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, token, fetchMe, logout } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    if (!token) {
      router.replace('/auth')
      return
    }
    fetchMe()
  }, [token, router, fetchMe])

  // Show onboarding once per browser after first login
  useEffect(() => {
    if (user && !localStorage.getItem(ONBOARDING_KEY)) {
      setShowOnboarding(true)
      localStorage.setItem(ONBOARDING_KEY, '1')
    }
  }, [user])

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-600 border-t-transparent" />
      </div>
    )
  }

  const isFree = !user?.plan || user.plan === 'free'

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
        <div className="flex h-16 items-center border-b border-slate-100 px-5">
          <Logo />
        </div>

        <nav className="flex-1 space-y-1 p-4">
          <NavItem
            href="/dashboard"
            active={pathname === '/dashboard'}
            icon={<LayoutDashboard className="h-4 w-4" />}
            label="Overview"
          />
          <NavItem
            href="/dashboard/account"
            active={pathname === '/dashboard/account'}
            icon={<UserCircle className="h-4 w-4" />}
            label="Account"
          />
        </nav>

        <div className="border-t border-slate-100 p-4 space-y-3">
          {/* Upgrade nudge for free users */}
          {isFree && (
            <Link
              href="/pricing"
              className="flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-100 px-3 py-3 transition hover:border-violet-200 hover:from-violet-100 hover:to-indigo-100"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-600 text-white">
                <Zap className="h-3.5 w-3.5" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-violet-800">Upgrade plan</p>
                <p className="text-[10px] text-violet-500">Unlock more sites & comments</p>
              </div>
            </Link>
          )}

          {/* User info */}
          <Link
            href="/dashboard/account"
            className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2.5 transition hover:bg-slate-100"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-semibold text-violet-700">
              {(user?.full_name || user?.email || '?').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900">
                {user?.full_name || 'Account'}
              </p>
              <p className="truncate text-xs text-slate-500">{user?.email}</p>
            </div>
          </Link>

          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-slate-600"
            onClick={() => { logout(); router.push('/auth') }}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur-md lg:hidden">
          <Logo />
          <MobileUserMenu
            email={user?.email}
            onLogout={() => { logout(); router.push('/auth') }}
          />
        </header>
        <main className="flex-1 animate-fade-in">{children}</main>
      </div>

      <OnboardingModal
        open={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onAddSite={() => {}}
        hasSite={false}
      />
    </div>
  )
}

function NavItem({
  href,
  active,
  icon,
  label,
}: {
  href: string
  active: boolean
  icon: React.ReactNode
  label: string
}) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition',
        active
          ? 'bg-violet-50 text-violet-700'
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
      )}
    >
      {icon}
      {label}
    </Link>
  )
}

function MobileUserMenu({ email, onLogout }: { email?: string; onLogout: () => void }) {
  return (
    <details className="relative">
      <summary className="flex cursor-pointer list-none items-center gap-1 rounded-lg px-2 py-1.5 text-sm text-slate-600 hover:bg-slate-100 [&::-webkit-details-marker]:hidden">
        <span className="max-w-[140px] truncate">{email}</span>
        <ChevronDown className="h-4 w-4" />
      </summary>
      <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
        <Link
          href="/dashboard/account"
          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          <UserCircle className="h-4 w-4" />
          Account
        </Link>
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </details>
  )
}
