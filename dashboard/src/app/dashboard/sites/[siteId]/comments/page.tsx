'use client'
import { useEffect, useState } from 'react'
import { commentsApi } from '@/lib/api'
import { toast } from 'sonner'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, MessageSquare } from 'lucide-react'
import { format } from 'date-fns'

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

const STATUS_LABELS: Record<string, string> = {
  approved: 'تأیید شده',
  spam: 'اسپم',
  replied: 'پاسخ داده شده',
  uncertain: 'نامشخص',
  pending: 'در انتظار',
}

const STATUS_BADGE: Record<string, string> = {
  approved: 'badge-green',
  spam: 'badge-red',
  replied: 'badge-blue',
  uncertain: 'badge-yellow',
  pending: 'badge-gray',
}

export default function CommentsPage() {
  const { siteId } = useParams()
  const [comments, setComments] = useState<Comment[]>([])
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    load()
    loadStats()
  }, [siteId, status, page])

  const load = async () => {
    setLoading(true)
    try {
      const res = await commentsApi.list(siteId as string, { status: status || undefined, page, limit: 20 })
      setComments(res.data)
    } catch {
      toast.error('خطا در بارگذاری کامنت‌ها')
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const res = await commentsApi.stats(siteId as string)
      setStats(res.data)
    } catch {}
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/dashboard" className="text-gray-500 hover:text-indigo-600 transition">
            <ArrowRight size={20} />
          </Link>
          <h1 className="text-lg font-bold">کامنت‌ها</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
            {[
              { label: 'کل', value: stats.total, color: 'blue' },
              { label: 'تأیید شده', value: stats.approved, color: 'green' },
              { label: 'پاسخ داده شده', value: stats.replied, color: 'indigo' },
              { label: 'اسپم', value: stats.spam, color: 'red' },
              { label: 'امروز', value: stats.today, color: 'yellow' },
            ].map(({ label, value, color }) => (
              <div key={label} className="card text-center py-4">
                <div className={`text-2xl font-bold text-${color}-600`}>{value}</div>
                <div className="text-xs text-gray-500 mt-1">{label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Filter */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {['', 'approved', 'replied', 'spam', 'uncertain'].map((s) => (
            <button
              key={s}
              onClick={() => { setStatus(s); setPage(1) }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                status === s ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {s === '' ? 'همه' : STATUS_LABELS[s]}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-400">در حال بارگذاری...</div>
        ) : comments.length === 0 ? (
          <div className="card text-center py-16">
            <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">کامنتی یافت نشد.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {comments.map((c) => (
              <div key={c.id} className="card">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`badge ${STATUS_BADGE[c.status] || 'badge-gray'}`}>
                        {STATUS_LABELS[c.status] || c.status}
                      </span>
                      {c.intent && <span className="badge badge-gray">{c.intent}</span>}
                      {c.sentiment && <span className="badge badge-gray">{c.sentiment}</span>}
                      {c.spam_score !== undefined && (
                        <span className="text-xs text-gray-400">اسپم: {Math.round(c.spam_score * 100)}%</span>
                      )}
                    </div>
                    <p className="text-gray-800 text-sm leading-relaxed">{c.content}</p>
                    {c.ai_reply && (
                      <div className="mt-3 bg-indigo-50 border border-indigo-100 rounded-lg p-3">
                        <p className="text-xs text-indigo-500 font-medium mb-1">🤖 پاسخ AI:</p>
                        <p className="text-sm text-indigo-900">{c.ai_reply}</p>
                      </div>
                    )}
                  </div>
                  <div className="text-left shrink-0">
                    <p className="text-xs text-gray-500">{c.author_name || 'ناشناس'}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {format(new Date(c.created_at), 'yyyy/MM/dd HH:mm')}
                    </p>
                    {c.post_title && (
                      <p className="text-xs text-indigo-500 mt-1 truncate max-w-[120px]">{c.post_title}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="flex justify-center gap-3 mt-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn-secondary disabled:opacity-40"
          >
            قبلی
          </button>
          <span className="flex items-center text-sm text-gray-500">صفحه {page}</span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={comments.length < 20}
            className="btn-secondary disabled:opacity-40"
          >
            بعدی
          </button>
        </div>
      </main>
    </div>
  )
}
