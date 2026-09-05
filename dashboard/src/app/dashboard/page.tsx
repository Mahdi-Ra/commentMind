'use client'

import { useEffect, useState } from 'react'
import type { ComponentProps } from 'react'
import Link from 'next/link'
import { authApi, sitesApi, commentsApi } from '@/lib/api'
import { toast } from 'sonner'
import {
  Globe,
  MessageSquare,
  Plus,
  Settings,
  MessageCircle,
  ShieldAlert,
  TrendingUp,
  Download,
  CheckCircle2,
  Circle,
  BookOpen,
  Plug,
  ArrowRight,
} from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Modal } from '@/components/ui/modal'
import { EmptyState } from '@/components/ui/empty-state'
import { Spinner } from '@/components/ui/spinner'
import { Label, Input, Select } from '@/components/ui/input'
import { UsageBar } from '@/components/dashboard/usage-bar'
import { InsightPanel } from '@/components/dashboard/insight-panel'
import { TONE_OPTIONS, LANGUAGE_OPTIONS } from '@/lib/constants'
import { useAuthStore } from '@/store/auth'
import { cn } from '@/lib/cn'

interface Site {
  id: string
  name: string
  domain: string
  tone: string
  auto_reply: boolean
  auto_approve: boolean
  auto_spam: boolean
  is_active: boolean
  last_connected_at?: string
}

interface Stats {
  total: number
  approved: number
  spam: number
  replied: number
  uncertain: number
  today: number
}

interface Usage {
  comments_this_month: number
  sites_count: number
}

interface OnboardingStatus {
  has_site: boolean
  has_knowledge: boolean
  has_connection: boolean
  has_processed_comment: boolean
}

type Insights = ComponentProps<typeof InsightPanel>['insights']

export default function DashboardPage() {
  const { user } = useAuthStore()
  const [sites, setSites] = useState<Site[]>([])
  const [statsMap, setStatsMap] = useState<Record<string, Stats>>({})
  const [usage, setUsage] = useState<Usage | null>(null)
  const [insights, setInsights] = useState<Insights | null>(null)
  const [onboarding, setOnboarding] = useState<OnboardingStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAddSite, setShowAddSite] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newSite, setNewSite] = useState({
    name: '',
    domain: '',
    tone: 'friendly',
    language: 'en',
  })

  useEffect(() => {
    loadSites()
  }, [])

  const loadSites = async () => {
    setLoading(true)
    try {
      const res = await sitesApi.list()
      const list: Site[] = res.data
      setSites(list)
      await Promise.all([
        ...list.map(async (site) => {
          try {
            const s = await commentsApi.stats(site.id)
            setStatsMap((prev) => ({ ...prev, [site.id]: s.data }))
          } catch { /* ignore */ }
        }),
        commentsApi.usage().then((r) => setUsage(r.data)).catch(() => {}),
        commentsApi.insights().then((r) => setInsights(r.data)).catch(() => {}),
        authApi.onboarding().then((r) => setOnboarding(r.data)).catch(() => {}),
      ])
    } catch {
      toast.error('Failed to load sites')
    } finally {
      setLoading(false)
    }
  }

  const handleAddSite = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    try {
      const res = await sitesApi.create(newSite)
      toast.success('Site created', {
        description: "Copy your API key now — it won't be shown again.",
        duration: 12000,
      })
      if (res.data.api_key) {
        await navigator.clipboard.writeText(res.data.api_key)
        toast.message('API key copied to clipboard')
      }
      setShowAddSite(false)
      setNewSite({ name: '', domain: '', tone: 'friendly', language: 'en' })
      loadSites()
    } catch (err: unknown) {
      const detail =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
          : undefined
      toast.error(typeof detail === 'string' ? detail : 'Could not create site')
    } finally {
      setCreating(false)
    }
  }

  const firstName = user?.full_name?.split(' ')[0] || 'there'

  return (
    <>
      <PageHeader
        title={`Good ${getGreeting()}, ${firstName}`}
        description="Manage AI moderation for all your connected sites."
        actions={
          <Button onClick={() => setShowAddSite(true)}>
            <Plus className="h-4 w-4" />
            Add site
          </Button>
        }
      />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {/* Usage bar */}
        {user && usage !== null && (
          <UsageBar
            plan={user.plan}
            trialDaysLeft={user.trial_days_left}
            usedComments={usage?.comments_this_month ?? 0}
            usedSites={usage?.sites_count ?? sites.length}
          />
        )}

        {onboarding && (
          <ActivationChecklist
            status={onboarding}
            firstSite={sites[0]}
            onAddSite={() => setShowAddSite(true)}
          />
        )}

        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Your sites</h2>
              <p className="mt-1 text-sm text-slate-500">Open comments or update settings for a connected site.</p>
            </div>
            <a
              href="https://wordpress.org/plugins/commentmind-ai/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <Download className="h-4 w-4" />
              Get the WordPress plugin
            </a>
          </div>

          {loading ? (
            <Spinner label="Loading your sites…" />
          ) : sites.length === 0 ? (
            <EmptyState
              icon={Globe}
              title="No sites yet"
              description="Connect your first website to start moderating comments with AI."
              action={{ label: 'Add your first site', onClick: () => setShowAddSite(true) }}
            />
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {sites.map((site) => (
                <SiteCard key={site.id} site={site} stats={statsMap[site.id]} />
              ))}
            </div>
          )}
        </section>

        {!loading && insights && <InsightPanel insights={insights} />}
      </div>

      <Modal
        open={showAddSite}
        onClose={() => setShowAddSite(false)}
        title="Add a new site"
        description="You'll receive an API key to use in the WordPress plugin or API integration."
      >
        <form onSubmit={handleAddSite} className="space-y-4">
          <div>
            <Label htmlFor="site-name">Site name</Label>
            <Input
              id="site-name"
              required
              value={newSite.name}
              onChange={(e) => setNewSite((p) => ({ ...p, name: e.target.value }))}
              placeholder="My Store"
            />
          </div>
          <div>
            <Label htmlFor="site-domain">Domain</Label>
            <Input
              id="site-domain"
              required
              value={newSite.domain}
              onChange={(e) => setNewSite((p) => ({ ...p, domain: e.target.value }))}
              placeholder="example.com"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tone">Reply tone</Label>
              <Select
                id="tone"
                value={newSite.tone}
                onChange={(e) => setNewSite((p) => ({ ...p, tone: e.target.value }))}
              >
                {TONE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="lang">Language</Label>
              <Select
                id="lang"
                value={newSite.language}
                onChange={(e) => setNewSite((p) => ({ ...p, language: e.target.value }))}
              >
                {LANGUAGE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </Select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={creating} className="flex-1">
              Create site
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => setShowAddSite(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}

function ActivationChecklist({
  status,
  firstSite,
  onAddSite,
}: {
  status: OnboardingStatus
  firstSite?: Site
  onAddSite: () => void
}) {
  const steps = [
    {
      title: 'Add a site',
      description: 'Create the website you want CommentMind to moderate.',
      complete: status.has_site,
      action: !status.has_site ? <Button size="sm" onClick={onAddSite}>Add site <ArrowRight className="h-3.5 w-3.5" /></Button> : null,
      icon: Globe,
    },
    {
      title: 'Add your knowledge',
      description: 'Give AI your FAQs, policies, or product information.',
      complete: status.has_knowledge,
      action: status.has_site && !status.has_knowledge && firstSite ? <Link href={`/dashboard/sites/${firstSite.id}?tab=knowledge`}><Button size="sm" variant="secondary">Add knowledge <BookOpen className="h-3.5 w-3.5" /></Button></Link> : null,
      icon: BookOpen,
    },
    {
      title: 'Connect your site',
      description: 'Install the plugin or add the JavaScript widget, then test the key.',
      complete: status.has_connection,
      action: status.has_site && !status.has_connection && firstSite ? <Link href={`/dashboard/sites/${firstSite.id}?tab=integration`}><Button size="sm" variant="secondary">Open integration <Plug className="h-3.5 w-3.5" /></Button></Link> : null,
      icon: Plug,
    },
    {
      title: 'Process your first comment',
      description: 'Leave a real test comment to confirm the AI workflow.',
      complete: status.has_processed_comment,
      action: null,
      icon: MessageSquare,
    },
  ]
  const completed = steps.filter((step) => step.complete).length

  if (completed === steps.length) return null

  return (
    <section className="border-y border-violet-100 bg-violet-50/60 py-5 sm:border sm:rounded-lg sm:px-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Activate CommentMind</h2>
          <p className="mt-1 text-sm text-slate-600">{completed} of {steps.length} steps complete. Your first live workflow is close.</p>
        </div>
        <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-violet-700">{Math.round((completed / steps.length) * 100)}%</span>
      </div>
      <div className="mt-5 grid gap-3 lg:grid-cols-4">
        {steps.map((step, index) => {
          const Icon = step.icon
          return (
            <div key={step.title} className="min-w-0 border-t border-violet-100 pt-3 lg:border-l lg:border-t-0 lg:pl-3 lg:first:border-l-0 lg:first:pl-0">
              <div className="flex items-center gap-2">
                {step.complete ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" /> : <Circle className="h-4 w-4 shrink-0 text-violet-400" />}
                <span className="text-xs font-medium text-slate-400">0{index + 1}</span>
              </div>
              <div className="mt-2 flex items-center gap-2"><Icon className="h-4 w-4 text-violet-600" /><h3 className="text-sm font-semibold text-slate-900">{step.title}</h3></div>
              <p className="mt-1 min-h-10 text-xs leading-5 text-slate-500">{step.description}</p>
              <div className="mt-3">{step.complete ? <span className="text-xs font-semibold text-emerald-700">Complete</span> : step.action}</div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function SiteCard({ site, stats }: { site: Site; stats?: Stats }) {
  return (
    <Card hover className="flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-900">{site.name}</h3>
          <p className="mt-0.5 text-sm text-slate-500">{site.domain}</p>
        </div>
        <Badge variant={site.is_active ? 'success' : 'neutral'}>
          {site.is_active ? 'Active' : 'Inactive'}
        </Badge>
      </div>

      <div className="mt-4 flex gap-2">
        <Link href={`/dashboard/sites/${site.id}/comments`} className="flex-1">
          <Button variant="secondary" size="sm" className="w-full">
            <MessageSquare className="h-4 w-4" />
            Comments
          </Button>
        </Link>
        <Link href={`/dashboard/sites/${site.id}`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full">
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </Link>
      </div>

      {stats && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          <StatMini icon={MessageCircle} label="Total" value={stats.total} />
          <StatMini icon={TrendingUp} label="Today" value={stats.today} accent />
          <StatMini icon={ShieldAlert} label="Spam" value={stats.spam} warn={stats.spam > 0} />
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-1.5">
        <Badge variant={site.last_connected_at ? 'success' : 'neutral'}>{site.last_connected_at ? 'Connected' : 'Not connected'}</Badge>
        {site.auto_reply && <Badge variant="info">Auto-reply</Badge>}
        {site.auto_approve && <Badge variant="success">Auto-approve</Badge>}
        {site.auto_spam && <Badge variant="warning">Spam filter</Badge>}
      </div>
    </Card>
  )
}

function StatMini({
  icon: Icon,
  label,
  value,
  accent,
  warn,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number
  accent?: boolean
  warn?: boolean
}) {
  return (
    <div
      className={cn(
        'rounded-lg px-2 py-2.5 text-center',
        warn ? 'bg-red-50' : accent ? 'bg-violet-50' : 'bg-slate-50',
      )}
    >
      <Icon
        className={cn(
          'mx-auto mb-1 h-3.5 w-3.5',
          warn ? 'text-red-500' : accent ? 'text-violet-600' : 'text-slate-400',
        )}
      />
      <div
        className={cn(
          'text-lg font-semibold tabular-nums',
          warn ? 'text-red-700' : accent ? 'text-violet-700' : 'text-slate-900',
        )}
      >
        {value}
      </div>
      <div className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
        {label}
      </div>
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
