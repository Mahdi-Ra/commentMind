'use client'

import { useEffect, useState } from 'react'
import { commentsApi } from '@/lib/api'
import { toast } from 'sonner'
import { useParams } from 'next/navigation'
import { MessageSquare, Bot, CheckCircle2, ShieldAlert, Send } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { PageHeader } from '@/components/layout/page-header'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { EmptyState } from '@/components/ui/empty-state'
import {
  STATUS_LABELS,
  STATUS_VARIANTS,
  INTENT_LABELS,
} from '@/lib/constants'
import { cn } from '@/lib/cn'

interface Comment {
  id: string
  author_name?: string
  content: string
  post_title?: string
  status: string
  intent?: string
  spam_score?: number
  sentiment?: string
  ai_reply?: string
  reply_sent: boolean
  created_at: string
}

interface Stats {
  total: number
  approved: number
  spam: number
  replied: number
  uncertain: number
  today: number
}

const FILTERS = [
  { value: '', label: 'All' },
  { value: 'approved', label: 'Approved' },
  { value: 'replied', label: 'Replied' },
  { value: 'pending', label: 'Pending' },
  { value: 'spam', label: 'Spam' },
  { value: 'uncertain', label: 'Review' },
] as const

export default function CommentsPage() {
  const { siteId } = useParams()
  const id = siteId as string

  const [comments, setComments] = useState<Comment[]>([])
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    load()
    loadStats()
  }, [id, status, page])

  const load = async () => {
    setLoading(true)
    try {
      const res = await commentsApi.list(id, {
        status: status || undefined,
        page,
        limit: 20,
      })
      setComments(res.data)
    } catch {
      toast.error('Failed to load comments')
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const res = await commentsApi.stats(id)
      setStats(res.data)
    } catch {
      /* ignore */
    }
  }

  const handleModerate = async (commentId: string, action: string, ai_reply?: string) => {
    try {
      const res = await commentsApi.moderate(id, commentId, { action, ai_reply })
      setComments((items) => items.map((item) => (item.id === commentId ? res.data : item)))
      loadStats()
      toast.success('Comment updated')
    } catch {
      toast.error('Could not update comment')
    }
  }

  return (
    <>
      <PageHeader
        title="Comments"
        description="Review AI moderation decisions and generated replies."
        backHref="/dashboard"
        backLabel="All sites"
      />

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {stats && (
          <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {[
              { label: 'Total', value: stats.total, className: 'text-slate-900' },
              { label: 'Approved', value: stats.approved, className: 'text-emerald-600' },
              { label: 'Replied', value: stats.replied, className: 'text-violet-600' },
              { label: 'Spam', value: stats.spam, className: 'text-red-600' },
              { label: 'Today', value: stats.today, className: 'text-slate-700' },
            ].map(({ label, value, className }) => (
              <Card key={label} padding className="!p-4 text-center">
                <p className={cn('text-2xl font-semibold tabular-nums', className)}>{value}</p>
                <p className="mt-1 text-xs font-medium text-slate-500">{label}</p>
              </Card>
            ))}
          </div>
        )}

        <div className="mb-6 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => {
                setStatus(f.value)
                setPage(1)
              }}
              className={cn(
                'rounded-lg px-3.5 py-2 text-sm font-medium transition',
                status === f.value
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <Spinner label="Loading comments…" />
        ) : comments.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No comments found"
            description={
              status
                ? 'Try a different filter or check back when new comments arrive.'
                : 'Comments will appear here once your site integration sends them.'
            }
          />
        ) : (
          <ul className="space-y-3">
            {comments.map((c) => (
              <li key={c.id}>
                <CommentCard comment={c} onModerate={handleModerate} />
              </li>
            ))}
          </ul>
        )}

        {!loading && comments.length > 0 && (
          <div className="mt-8 flex items-center justify-center gap-4">
            <Button
              variant="secondary"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <span className="text-sm text-slate-500">Page {page}</span>
            <Button
              variant="secondary"
              size="sm"
              disabled={comments.length < 20}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </>
  )
}

function CommentCard({
  comment: c,
  onModerate,
}: {
  comment: Comment
  onModerate: (commentId: string, action: string, ai_reply?: string) => void
}) {
  const statusVariant = STATUS_VARIANTS[c.status] || 'neutral'
  const [reply, setReply] = useState(c.ai_reply || '')

  return (
    <Card padding className="!p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge variant={statusVariant}>{STATUS_LABELS[c.status] || c.status}</Badge>
            {c.intent && (
              <Badge variant="neutral">{INTENT_LABELS[c.intent] || c.intent}</Badge>
            )}
            {c.sentiment && <Badge variant="neutral">{c.sentiment}</Badge>}
            {c.spam_score !== undefined && c.spam_score !== null && (
              <span className="text-xs text-slate-400">
                Spam {Math.round(c.spam_score * 100)}%
              </span>
            )}
          </div>
          <p className="text-sm leading-relaxed text-slate-800">{c.content}</p>
          {c.ai_reply && (
            <div className="mt-4 rounded-lg border border-violet-100 bg-violet-50/80 p-4">
              <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-violet-700">
                <Bot className="h-3.5 w-3.5" />
                AI reply
              </p>
              <p className="text-sm text-violet-950">{c.ai_reply}</p>
            </div>
          )}
          {(c.status === 'pending' || c.status === 'uncertain') && (
            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <label className="text-xs font-semibold text-slate-500">Reply before approving</label>
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                rows={3}
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                placeholder="Optional reply..."
              />
            </div>
          )}
        </div>
        <aside className="shrink-0 text-right sm:pl-4">
          <p className="text-sm font-medium text-slate-700">{c.author_name || 'Anonymous'}</p>
          <p className="mt-0.5 text-xs text-slate-400">
            {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
          </p>
          {c.post_title && (
            <p className="mt-2 max-w-[160px] truncate text-xs text-violet-600" title={c.post_title}>
              {c.post_title}
            </p>
          )}
          <div className="mt-4 flex flex-col gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onModerate(c.id, 'approve')}
            >
              <CheckCircle2 className="h-4 w-4" />
              Approve
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onModerate(c.id, 'reply', reply)}
              disabled={!reply.trim()}
            >
              <Send className="h-4 w-4" />
              Reply
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => onModerate(c.id, 'spam')}
            >
              <ShieldAlert className="h-4 w-4" />
              Spam
            </Button>
          </div>
        </aside>
      </div>
    </Card>
  )
}
