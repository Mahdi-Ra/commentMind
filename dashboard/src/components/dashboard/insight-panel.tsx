'use client'

import Link from 'next/link'
import {
  AlertTriangle,
  BarChart3,
  Bot,
  Brain,
  CheckCircle2,
  Clock,
  DollarSign,
  FileQuestion,
  Gauge,
  HelpCircle,
  MessageSquareWarning,
  ShoppingCart,
  Sparkles,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/cn'
import { knowledgeApi } from '@/lib/api'
import { toast } from 'sonner'

interface Insights {
  roi: {
    comments_handled: number
    hours_saved: number
    questions_answered: number
    estimated_support_value_usd: number
  }
  lost_sales: { count: number; examples: { id: string; site_id: string; content: string; status: string }[] }
  confidence: { auto_publish: number; needs_review: number; do_not_answer: number }
  knowledge_gaps: { topic: string; count: number; example?: string; suggestion: string }[]
  suggested_faqs: { question: string; source_comment: string; site_id: string }[]
  comment_funnel: Record<string, number>
  review_queue: {
    id: string
    site_id: string
    reason: string
    author_name?: string
    content: string
    status: string
    sentiment?: string
  }[]
  risk_radar: { negative_comments: number; unanswered_complaints: number; repeated_issue?: string | null }
  weekly_report: { summary: string; suggested_action: string }
}

export function InsightPanel({ insights }: { insights: Insights }) {
  const funnel = insights.comment_funnel

  const addFaqToKnowledge = async (siteId: string, question: string, source: string) => {
    try {
      await knowledgeApi.add(
        siteId,
        `FAQ\nQuestion: ${question}\nSuggested answer: Add your official answer here.\nSource comment: ${source}`,
        'auto-faq-suggestion',
      )
      toast.success('FAQ draft added to knowledge base')
    } catch {
      toast.error('Could not add FAQ to knowledge base')
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard
          icon={Bot}
          label="AI handled"
          value={insights.roi.comments_handled.toLocaleString()}
          detail="comments this week"
        />
        <MetricCard
          icon={Clock}
          label="Time saved"
          value={`${insights.roi.hours_saved}h`}
          detail="estimated support time"
        />
        <MetricCard
          icon={HelpCircle}
          label="Questions answered"
          value={insights.roi.questions_answered.toLocaleString()}
          detail="with AI replies"
        />
        <MetricCard
          icon={DollarSign}
          label="Support value"
          value={`$${insights.roi.estimated_support_value_usd}`}
          detail="estimated savings"
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-violet-600" />
                <h3 className="text-sm font-semibold text-slate-900">Lost sales detector</h3>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                Buying-intent comments that should get fast attention.
              </p>
            </div>
            <Badge variant={insights.lost_sales.count ? 'warning' : 'success'}>
              {insights.lost_sales.count} found
            </Badge>
          </div>
          <div className="mt-4 space-y-2">
            {insights.lost_sales.examples.length ? (
              insights.lost_sales.examples.slice(0, 3).map((item) => (
                <Link
                  key={item.id}
                  href={`/dashboard/sites/${item.site_id}/comments`}
                  className="block rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-700 hover:border-violet-200 hover:bg-violet-50"
                >
                  {item.content}
                </Link>
              ))
            ) : (
              <p className="rounded-lg bg-slate-50 px-3 py-3 text-sm text-slate-500">
                No purchase-intent comments yet. They will appear here when visitors ask about price,
                stock, warranty, or delivery.
              </p>
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2">
            <Gauge className="h-4 w-4 text-violet-600" />
            <h3 className="text-sm font-semibold text-slate-900">Smart reply confidence</h3>
          </div>
          <div className="mt-4 space-y-3">
            <ConfidenceRow label="Auto-publish" value={insights.confidence.auto_publish} tone="success" />
            <ConfidenceRow label="Needs review" value={insights.confidence.needs_review} tone="warning" />
            <ConfidenceRow label="Do not answer" value={insights.confidence.do_not_answer} tone="danger" />
          </div>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card>
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-violet-600" />
            <h3 className="text-sm font-semibold text-slate-900">Brand voice studio</h3>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Your site settings already control tone, language, and custom instructions. Add 2-3 example replies
            to make responses sound unmistakably like your brand.
          </p>
          <Link href="/dashboard" className="mt-4 inline-block text-sm font-semibold text-violet-700">
            Open site settings
          </Link>
        </Card>

        <Card>
          <div className="flex items-center gap-2">
            <FileQuestion className="h-4 w-4 text-violet-600" />
            <h3 className="text-sm font-semibold text-slate-900">Knowledge gap alerts</h3>
          </div>
          <div className="mt-3 space-y-2">
            {insights.knowledge_gaps.length ? (
              insights.knowledge_gaps.slice(0, 3).map((gap) => (
                <div key={gap.topic} className="rounded-lg bg-amber-50 px-3 py-2">
                  <p className="text-sm font-semibold text-amber-900">{gap.topic} · {gap.count}</p>
                  <p className="text-xs text-amber-700">{gap.suggestion}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No repeated gaps yet. Warranty, delivery, return and pricing gaps will surface here.</p>
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-violet-600" />
            <h3 className="text-sm font-semibold text-slate-900">Auto FAQ builder</h3>
          </div>
          <div className="mt-3 space-y-2">
            {insights.suggested_faqs.length ? (
              insights.suggested_faqs.slice(0, 3).map((faq) => (
                <div key={faq.question} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                  <p className="text-sm text-slate-700">{faq.question}</p>
                  <button
                    type="button"
                    onClick={() => addFaqToKnowledge(faq.site_id, faq.question, faq.source_comment)}
                    className="mt-2 text-xs font-semibold text-violet-700 hover:text-violet-900"
                  >
                    Add to knowledge
                  </button>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">Suggested FAQs will appear after visitors repeat the same questions.</p>
            )}
          </div>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
        <Card>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-violet-600" />
            <h3 className="text-sm font-semibold text-slate-900">Comment funnel</h3>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {[
              ['Questions', funnel.questions],
              ['Complaints', funnel.complaints],
              ['Purchase intent', funnel.purchase_intent],
              ['Spam', funnel.spam],
              ['Praise', funnel.praise],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg bg-slate-50 px-3 py-3">
                <p className="text-xl font-semibold text-slate-900">{value as number}</p>
                <p className="text-xs text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <MessageSquareWarning className="h-4 w-4 text-violet-600" />
                <h3 className="text-sm font-semibold text-slate-900">Smart review queue</h3>
              </div>
              <p className="mt-1 text-sm text-slate-500">Prioritized by risk, buying intent, and confidence.</p>
            </div>
            <Badge variant={insights.review_queue.length ? 'warning' : 'success'}>
              {insights.review_queue.length}
            </Badge>
          </div>
          <div className="mt-4 space-y-2">
            {insights.review_queue.length ? (
              insights.review_queue.slice(0, 4).map((item) => (
                <Link
                  key={item.id}
                  href={`/dashboard/sites/${item.site_id}/comments`}
                  className="flex gap-3 rounded-lg border border-slate-100 bg-white px-3 py-2 hover:bg-slate-50"
                >
                  <Badge variant="neutral">{item.reason}</Badge>
                  <p className="line-clamp-1 min-w-0 flex-1 text-sm text-slate-700">{item.content}</p>
                </Link>
              ))
            ) : (
              <p className="rounded-lg bg-emerald-50 px-3 py-3 text-sm text-emerald-700">No high-priority comments right now.</p>
            )}
          </div>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card>
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-violet-600" />
            <h3 className="text-sm font-semibold text-slate-900">WooCommerce context</h3>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Product title and URL are already captured. Next, connect stock, price, SKU and sale state for richer answers.
          </p>
        </Card>

        <Card>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <h3 className="text-sm font-semibold text-slate-900">Risk radar</h3>
          </div>
          <div className="mt-3 space-y-2 text-sm">
            <RiskRow label="Negative comments" value={insights.risk_radar.negative_comments} />
            <RiskRow label="Unanswered complaints" value={insights.risk_radar.unanswered_complaints} />
            <RiskRow label="Repeated issue" value={insights.risk_radar.repeated_issue || 'None yet'} />
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <h3 className="text-sm font-semibold text-slate-900">Weekly AI report</h3>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">{insights.weekly_report.summary}</p>
          <p className="mt-3 rounded-lg bg-violet-50 px-3 py-2 text-sm text-violet-800">
            {insights.weekly_report.suggested_action}
          </p>
        </Card>
      </div>
    </div>
  )
}

function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  detail: string
}) {
  return (
    <Card padding className="!p-4">
      <Icon className="h-4 w-4 text-violet-600" />
      <p className="mt-3 text-2xl font-semibold text-slate-900">{value}</p>
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-xs text-slate-400">{detail}</p>
    </Card>
  )
}

function ConfidenceRow({ label, value, tone }: { label: string; value: number; tone: 'success' | 'warning' | 'danger' }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-slate-600">{label}</span>
      <span
        className={cn(
          'rounded-full px-2 py-0.5 text-xs font-semibold',
          tone === 'success' && 'bg-emerald-50 text-emerald-700',
          tone === 'warning' && 'bg-amber-50 text-amber-700',
          tone === 'danger' && 'bg-red-50 text-red-700',
        )}
      >
        {value}
      </span>
    </div>
  )
}

function RiskRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-slate-800">{value}</span>
    </div>
  )
}
