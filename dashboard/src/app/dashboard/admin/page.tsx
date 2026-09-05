'use client'

import { useEffect, useState } from 'react'
import { ShieldCheck, Users, Globe2, MessageSquare, CreditCard, Search, CheckCircle2, Star } from 'lucide-react'
import { toast } from 'sonner'
import { adminApi } from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import { PageHeader } from '@/components/layout/page-header'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/cn'

type Tab = 'users' | 'sites' | 'payments' | 'feedback'

interface Overview {
  total_users: number
  active_users: number
  total_sites: number
  comments_this_month: number
  pending_payments: number
}

interface AdminUser {
  id: string
  email: string
  full_name?: string
  plan: string
  is_active: boolean
  is_admin: boolean
  sites_count: number
  comments_count: number
  created_at: string
}

interface AdminSite {
  id: string
  name: string
  domain: string
  owner_email: string
  owner_name?: string
  is_active: boolean
  comments_count: number
  created_at: string
}

interface AdminPayment {
  id: string
  user_email: string
  plan: string
  billing_cycle: string
  currency: string
  amount: number
  status: string
  tx_hash?: string
  created_at: string
}

interface AdminFeedback {
  id: string
  user_email: string
  user_name?: string
  rating: number
  message?: string
  created_at: string
}

const tabs: { id: Tab; label: string }[] = [
  { id: 'users', label: 'Users' },
  { id: 'sites', label: 'Sites' },
  { id: 'payments', label: 'Payments' },
  { id: 'feedback', label: 'Feedback' },
]

export default function PlatformAdminPage() {
  const { user } = useAuthStore()
  const [tab, setTab] = useState<Tab>('users')
  const [overview, setOverview] = useState<Overview | null>(null)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [sites, setSites] = useState<AdminSite[]>([])
  const [payments, setPayments] = useState<AdminPayment[]>([])
  const [feedback, setFeedback] = useState<AdminFeedback[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const [overviewRes, usersRes, sitesRes, paymentsRes, feedbackRes] = await Promise.all([
        adminApi.overview(), adminApi.users(), adminApi.sites(), adminApi.payments(), adminApi.feedback(),
      ])
      setOverview(overviewRes.data)
      setUsers(usersRes.data)
      setSites(sitesRes.data)
      setPayments(paymentsRes.data)
      setFeedback(feedbackRes.data)
    } catch {
      toast.error('Could not load platform data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.is_admin) load()
  }, [user?.is_admin])

  const updateUser = async (id: string, data: { plan?: string; is_active?: boolean }) => {
    setSavingId(id)
    try {
      const res = await adminApi.updateUser(id, data)
      setUsers((items) => items.map((item) => item.id === id ? res.data : item))
      toast.success('User updated')
    } catch {
      toast.error('Could not update user')
    } finally {
      setSavingId(null)
    }
  }

  const confirmPayment = async (id: string) => {
    setSavingId(id)
    try {
      const res = await adminApi.confirmPayment(id)
      setPayments((items) => items.map((item) => item.id === id ? res.data : item))
      setOverview((current) => current ? { ...current, pending_payments: Math.max(0, current.pending_payments - 1) } : current)
      toast.success('Payment confirmed and plan activated')
    } catch {
      toast.error('Could not confirm payment')
    } finally {
      setSavingId(null)
    }
  }

  const filteredUsers = users.filter((item) => {
    const term = search.trim().toLowerCase()
    return !term || item.email.toLowerCase().includes(term) || item.full_name?.toLowerCase().includes(term)
  })

  if (!user) return <Spinner label="Loading admin…" />
  if (!user.is_admin) return <EmptyState icon={ShieldCheck} title="Admin access required" description="This area is available to platform administrators only." />

  return (
    <>
      <PageHeader title="Platform admin" description="Manage customers, sites, plans, and crypto payments." backHref="/dashboard" backLabel="Dashboard" />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {overview && (
          <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-5">
            <Metric icon={Users} label="Users" value={overview.total_users} detail={`${overview.active_users} active`} />
            <Metric icon={Globe2} label="Sites" value={overview.total_sites} />
            <Metric icon={MessageSquare} label="This month" value={overview.comments_this_month} detail="comments" />
            <Metric icon={CreditCard} label="Payments" value={overview.pending_payments} detail="awaiting review" alert />
            <Metric icon={ShieldCheck} label="Access" value="Protected" detail="server enforced" />
          </div>
        )}

        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200">
          <div className="flex gap-1">
            {tabs.map((item) => (
              <button key={item.id} onClick={() => setTab(item.id)} className={cn('border-b-2 px-3 py-2.5 text-sm font-medium transition', tab === item.id ? 'border-violet-600 text-violet-700' : 'border-transparent text-slate-500 hover:text-slate-800')}>
                {item.label}
              </button>
            ))}
          </div>
          {tab === 'users' && <label className="relative mb-2 block"><Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users" className="h-9 rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-violet-400" /></label>}
        </div>

        {loading ? <Spinner label="Loading platform data…" /> : tab === 'users' ? <UsersTable users={filteredUsers} savingId={savingId} onUpdate={updateUser} /> : tab === 'sites' ? <SitesTable sites={sites} /> : tab === 'payments' ? <PaymentsTable payments={payments} savingId={savingId} onConfirm={confirmPayment} /> : <FeedbackTable feedback={feedback} />}
      </div>
    </>
  )
}

function Metric({ icon: Icon, label, value, detail, alert }: { icon: typeof Users; label: string; value: string | number; detail?: string; alert?: boolean }) {
  return <Card padding className="!p-4"><Icon className={cn('mb-3 h-4 w-4', alert ? 'text-amber-600' : 'text-violet-600')} /><p className="text-xl font-semibold tabular-nums text-slate-900">{value}</p><p className="mt-1 text-xs font-medium text-slate-500">{label}{detail ? ` · ${detail}` : ''}</p></Card>
}

function UsersTable({ users, savingId, onUpdate }: { users: AdminUser[]; savingId: string | null; onUpdate: (id: string, data: { plan?: string; is_active?: boolean }) => void }) {
  if (!users.length) return <EmptyState icon={Users} title="No users found" description="Try a different search term." />
  return <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white"><table className="w-full min-w-[780px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">User</th><th className="px-4 py-3">Plan</th><th className="px-4 py-3">Sites</th><th className="px-4 py-3">Comments</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Action</th></tr></thead><tbody className="divide-y divide-slate-100">{users.map((item) => <tr key={item.id}><td className="px-4 py-3"><p className="font-medium text-slate-900">{item.full_name || 'Unnamed user'}</p><p className="text-xs text-slate-500">{item.email}</p></td><td className="px-4 py-3">{item.is_admin ? <Badge variant="brand">Platform admin</Badge> : <select value={item.plan} disabled={savingId === item.id} onChange={(e) => onUpdate(item.id, { plan: e.target.value })} className="rounded-md border border-slate-200 bg-white px-2 py-1 text-sm capitalize outline-none focus:border-violet-400">{['free', 'starter', 'pro', 'agency'].map((plan) => <option key={plan}>{plan}</option>)}</select>}</td><td className="px-4 py-3 tabular-nums">{item.sites_count}</td><td className="px-4 py-3 tabular-nums">{item.comments_count.toLocaleString()}</td><td className="px-4 py-3"><Badge variant={item.is_active ? 'success' : 'danger'}>{item.is_active ? 'Active' : 'Suspended'}</Badge></td><td className="px-4 py-3 text-right">{!item.is_admin && <Button size="sm" variant={item.is_active ? 'outline' : 'primary'} loading={savingId === item.id} onClick={() => onUpdate(item.id, { is_active: !item.is_active })}>{item.is_active ? 'Suspend' : 'Activate'}</Button>}</td></tr>)}</tbody></table></div>
}

function SitesTable({ sites }: { sites: AdminSite[] }) {
  if (!sites.length) return <EmptyState icon={Globe2} title="No sites yet" description="Customer sites will appear here." />
  return <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white"><table className="w-full min-w-[680px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Site</th><th className="px-4 py-3">Owner</th><th className="px-4 py-3">Comments</th><th className="px-4 py-3">Status</th></tr></thead><tbody className="divide-y divide-slate-100">{sites.map((site) => <tr key={site.id}><td className="px-4 py-3"><p className="font-medium text-slate-900">{site.name}</p><p className="text-xs text-slate-500">{site.domain}</p></td><td className="px-4 py-3"><p>{site.owner_name || 'Unnamed user'}</p><p className="text-xs text-slate-500">{site.owner_email}</p></td><td className="px-4 py-3 tabular-nums">{site.comments_count.toLocaleString()}</td><td className="px-4 py-3"><Badge variant={site.is_active ? 'success' : 'danger'}>{site.is_active ? 'Active' : 'Inactive'}</Badge></td></tr>)}</tbody></table></div>
}

function PaymentsTable({ payments, savingId, onConfirm }: { payments: AdminPayment[]; savingId: string | null; onConfirm: (id: string) => void }) {
  if (!payments.length) return <EmptyState icon={CreditCard} title="No payments yet" description="Crypto checkout requests will appear here." />
  return <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white"><table className="w-full min-w-[750px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Plan</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Transaction</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Action</th></tr></thead><tbody className="divide-y divide-slate-100">{payments.map((payment) => <tr key={payment.id}><td className="px-4 py-3 text-slate-700">{payment.user_email}</td><td className="px-4 py-3 capitalize">{payment.plan}<span className="text-xs text-slate-400"> · {payment.billing_cycle}</span></td><td className="px-4 py-3 tabular-nums">{payment.amount} {payment.currency}</td><td className="max-w-[160px] truncate px-4 py-3 font-mono text-xs text-slate-500" title={payment.tx_hash}>{payment.tx_hash || 'Not submitted'}</td><td className="px-4 py-3"><Badge variant={payment.status === 'confirmed' ? 'success' : payment.status === 'submitted' ? 'warning' : 'neutral'}>{payment.status}</Badge></td><td className="px-4 py-3 text-right">{payment.status === 'submitted' ? <Button size="sm" loading={savingId === payment.id} onClick={() => onConfirm(payment.id)}><CheckCircle2 className="h-4 w-4" />Confirm</Button> : null}</td></tr>)}</tbody></table></div>
}

function FeedbackTable({ feedback }: { feedback: AdminFeedback[] }) {
  if (!feedback.length) return <EmptyState icon={Star} title="No feedback yet" description="Customer feedback will appear here after users activate their first workflow." />
  return <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white"><table className="w-full min-w-[680px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Rating</th><th className="px-4 py-3">Message</th><th className="px-4 py-3">Received</th></tr></thead><tbody className="divide-y divide-slate-100">{feedback.map((item) => <tr key={item.id}><td className="px-4 py-3"><p className="font-medium text-slate-900">{item.user_name || 'Unnamed user'}</p><p className="text-xs text-slate-500">{item.user_email}</p></td><td className="px-4 py-3"><span className="inline-flex items-center gap-1 font-medium text-amber-700"><Star className="h-4 w-4 fill-amber-400 text-amber-500" />{item.rating}/5</span></td><td className="max-w-md px-4 py-3 text-slate-600">{item.message || <span className="text-slate-400">No written feedback</span>}</td><td className="whitespace-nowrap px-4 py-3 text-slate-500">{new Date(item.created_at).toLocaleDateString()}</td></tr>)}</tbody></table></div>
}
