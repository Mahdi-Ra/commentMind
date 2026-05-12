'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { sitesApi, commentsApi } from '@/lib/api'
import { toast } from 'sonner'
import Link from 'next/link'
import { Globe, MessageSquare, Plus, Settings, BarChart2, Shield } from 'lucide-react'

interface Site {
  id: string
  name: string
  domain: string
  tone: string
  auto_reply: boolean
  auto_approve: boolean
  auto_spam: boolean
  is_active: boolean
}

interface Stats {
  total: number
  approved: number
  spam: number
  replied: number
  uncertain: number
  today: number
}

export default function DashboardPage() {
  const { user, token, fetchMe, logout } = useAuthStore()
  const [sites, setSites] = useState<Site[]>([])
  const [statsMap, setStatsMap] = useState<Record<string, Stats>>({})
  const [showAddSite, setShowAddSite] = useState(false)
  const [newSite, setNewSite] = useState({ name: '', domain: '', tone: 'friendly', language: 'fa' })
  const router = useRouter()

  useEffect(() => {
    if (!token) {
      router.push('/auth')
      return
    }
    fetchMe()
    loadSites()
  }, [])

  const loadSites = async () => {
    try {
      const res = await sitesApi.list()
      const list: Site[] = res.data
      setSites(list)
      // Load stats for each site
      list.forEach(async (site) => {
        try {
          const s = await commentsApi.stats(site.id)
          setStatsMap(prev => ({ ...prev, [site.id]: s.data }))
        } catch {}
      })
    } catch {
      toast.error('خطا در بارگذاری سایت‌ها')
    }
  }

  const handleAddSite = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await sitesApi.create(newSite)
      toast.success(`سایت اضافه شد! API Key: ${res.data.api_key}`, { duration: 10000 })
      setShowAddSite(false)
      setNewSite({ name: '', domain: '', tone: 'friendly', language: 'fa' })
      loadSites()
    } catch {
      toast.error('خطا در ایجاد سایت')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🧠</span>
            <span className="font-bold text-xl text-indigo-600">CommentMind AI</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{user?.email}</span>
            <button onClick={logout} className="text-sm text-gray-500 hover:text-red-500 transition">خروج</button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">سلام {user?.full_name || ''}! 👋</h2>
          <p className="text-gray-500 mt-1">اینجا می‌تونی سایت‌هات رو مدیریت کنی.</p>
        </div>

        {/* Sites Grid */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">سایت‌های من</h3>
          <button onClick={() => setShowAddSite(true)} className="btn-primary flex items-center gap-2">
            <Plus size={16} />
            افزودن سایت
          </button>
        </div>

        {sites.length === 0 ? (
          <div className="card text-center py-16">
            <Globe size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">هنوز سایتی اضافه نکردی!</p>
            <p className="text-gray-400 text-sm mt-1">با کلیک روی «افزودن سایت» شروع کن.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sites.map((site) => {
              const s = statsMap[site.id]
              return (
                <div key={site.id} className="card hover:shadow-md transition">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">{site.name}</h4>
                      <p className="text-sm text-gray-500 mt-0.5">{site.domain}</p>
                    </div>
                    <span className={`badge ${site.is_active ? 'badge-green' : 'badge-gray'}`}>
                      {site.is_active ? 'فعال' : 'غیرفعال'}
                    </span>
                  </div>

                  {s && (
                    <div className="grid grid-cols-3 gap-2 my-3">
                      <StatChip label="کل" value={s.total} color="blue" />
                      <StatChip label="امروز" value={s.today} color="indigo" />
                      <StatChip label="اسپم" value={s.spam} color="red" />
                    </div>
                  )}

                  <div className="flex gap-2 flex-wrap mt-2">
                    {site.auto_reply && <span className="badge badge-blue">جواب خودکار</span>}
                    {site.auto_approve && <span className="badge badge-green">تأیید خودکار</span>}
                    {site.auto_spam && <span className="badge badge-yellow">فیلتر اسپم</span>}
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Link href={`/dashboard/sites/${site.id}/comments`} className="btn-secondary flex items-center gap-1 text-sm flex-1 justify-center">
                      <MessageSquare size={14} />
                      کامنت‌ها
                    </Link>
                    <Link href={`/dashboard/sites/${site.id}`} className="btn-secondary flex items-center gap-1 text-sm flex-1 justify-center">
                      <Settings size={14} />
                      تنظیمات
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Add Site Modal */}
        {showAddSite && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
              <h3 className="text-lg font-bold mb-4">افزودن سایت جدید</h3>
              <form onSubmit={handleAddSite} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">نام سایت</label>
                  <input
                    type="text" required
                    value={newSite.name}
                    onChange={e => setNewSite(p => ({ ...p, name: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    placeholder="فروشگاه من"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">دامنه</label>
                  <input
                    type="text" required
                    value={newSite.domain}
                    onChange={e => setNewSite(p => ({ ...p, domain: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    placeholder="mysite.ir"
                    dir="ltr"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">لحن</label>
                    <select
                      value={newSite.tone}
                      onChange={e => setNewSite(p => ({ ...p, tone: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2"
                    >
                      <option value="friendly">دوستانه</option>
                      <option value="formal">رسمی</option>
                      <option value="professional">حرفه‌ای</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">زبان</label>
                    <select
                      value={newSite.language}
                      onChange={e => setNewSite(p => ({ ...p, language: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2"
                    >
                      <option value="fa">فارسی</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" className="btn-primary flex-1">ایجاد سایت</button>
                  <button type="button" onClick={() => setShowAddSite(false)} className="btn-secondary flex-1">انصراف</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function StatChip({ label, value, color }: { label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-700',
    indigo: 'bg-indigo-50 text-indigo-700',
    red: 'bg-red-50 text-red-700',
    green: 'bg-green-50 text-green-700',
  }
  return (
    <div className={`rounded-lg p-2 text-center ${colors[color] || colors.blue}`}>
      <div className="text-lg font-bold">{value}</div>
      <div className="text-xs opacity-75">{label}</div>
    </div>
  )
}
