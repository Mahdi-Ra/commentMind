'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { User, Lock, Zap } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label, Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/store/auth'
import { authApi } from '@/lib/api'

function getErrorDetail(err: unknown): string | undefined {
  if (err && typeof err === 'object' && 'response' in err) {
    return (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
  }
  return undefined
}

const PLAN_COLORS: Record<string, 'neutral' | 'info' | 'success' | 'warning'> = {
  free: 'neutral',
  starter: 'info',
  pro: 'success',
  agency: 'warning',
}

export default function AccountPage() {
  const { user, setUser } = useAuthStore()

  const [fullName, setFullName] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)

  useEffect(() => {
    if (user) setFullName(user.full_name || '')
  }, [user])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingProfile(true)
    try {
      const res = await authApi.updateProfile({ full_name: fullName.trim() || undefined })
      setUser(res.data)
      toast.success('Profile updated')
    } catch (err: unknown) {
      toast.error(getErrorDetail(err) || 'Failed to update profile')
    } finally {
      setSavingProfile(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword.length < 8) { toast.error('Password must be at least 8 characters'); return }
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return }
    setSavingPassword(true)
    try {
      await authApi.changePassword(currentPassword, newPassword)
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
      toast.success('Password changed successfully')
    } catch (err: unknown) {
      toast.error(getErrorDetail(err) || 'Failed to change password')
    } finally {
      setSavingPassword(false)
    }
  }

  const planColor = PLAN_COLORS[user?.plan ?? 'free'] ?? 'neutral'
  const maxSites = user?.plan_max_sites === -1 ? 'Unlimited' : user?.plan_max_sites
  const maxComments =
    user?.plan_max_comments_month === -1
      ? 'Unlimited'
      : user?.plan_max_comments_month?.toLocaleString()

  return (
    <>
      <PageHeader title="Account" description="Manage your profile and security settings." />

      <div className="mx-auto max-w-2xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">

        {/* Plan card */}
        <Card>
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
              <Zap className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Plan</h2>
              <p className="text-sm text-slate-500">Your current subscription and limits.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Badge variant={planColor}>
              {user?.plan_display_name ?? user?.plan ?? 'Free'}
            </Badge>
          </div>

          <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div className="rounded-lg bg-slate-50 px-4 py-3">
              <dt className="text-xs font-medium text-slate-500">Sites</dt>
              <dd className="mt-1 text-lg font-semibold text-slate-900">{maxSites ?? '—'}</dd>
            </div>
            <div className="rounded-lg bg-slate-50 px-4 py-3">
              <dt className="text-xs font-medium text-slate-500">Comments / month</dt>
              <dd className="mt-1 text-lg font-semibold text-slate-900">{maxComments ?? '—'}</dd>
            </div>
          </dl>

          {user?.plan === 'free' && (
            <p className="mt-4 text-xs text-slate-400">
              Need more capacity?{' '}
              <a href="/pricing" className="font-medium text-violet-600 hover:underline">
                View upgrade options →
              </a>
            </p>
          )}
        </Card>

        {/* Profile card */}
        <Card>
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
              <User className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Profile</h2>
              <p className="text-sm text-slate-500">Update how your name appears in the dashboard.</p>
            </div>
          </div>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={user?.email || ''} disabled className="bg-slate-50 text-slate-500" />
              <p className="mt-1 text-xs text-slate-400">Email cannot be changed here.</p>
            </div>
            <div>
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your name"
                autoComplete="name"
              />
            </div>
            <Button type="submit" loading={savingProfile}>Save profile</Button>
          </form>
        </Card>

        {/* Password card */}
        <Card>
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
              <Lock className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Password</h2>
              <p className="text-sm text-slate-500">Choose a strong password you don&apos;t use elsewhere.</p>
            </div>
          </div>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">Current password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="newPassword">New password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm new password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </div>
            </div>
            <Button type="submit" variant="secondary" loading={savingPassword}>
              Change password
            </Button>
          </form>
        </Card>
      </div>
    </>
  )
}
