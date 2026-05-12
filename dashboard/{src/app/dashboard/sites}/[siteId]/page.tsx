'use client'
import { useEffect, useState } from 'react'
import { sitesApi, knowledgeApi } from '@/lib/api'
import { toast } from 'sonner'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Trash2, Upload, Plus, Eye, EyeOff, Copy, RefreshCw } from 'lucide-react'

interface Site {
  id: string
  name: string
  domain: string
  tone: string
  language: string
  custom_instructions?: string
  auto_reply: boolean
  auto_approve: boolean
  auto_spam: boolean
  spam_threshold: number
  approve_threshold: number
}

interface KnowledgeChunk {
  id: string
  source_name: string
  content: string
  chunk_index: number
}

export default function SiteSettingsPage() {
  const { siteId } = useParams()
  const [site, setSite] = useState<Site | null>(null)
  const [knowledge, setKnowledge] = useState<KnowledgeChunk[]>([])
  const [newKB, setNewKB] = useState('')
  const [tab, setTab] = useState<'settings' | 'knowledge' | 'apikey'>('settings')
  const [saving, setSaving] = useState(false)
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [showKey, setShowKey] = useState(false)
  const [regenLoading, setRegenLoading] = useState(false)

  useEffect(() => {
    loadSite()
    loadKnowledge()
  }, [])

  const loadSite = async () => {
    const res = await sitesApi.list()
    const found = res.data.find((s: Site) => s.id === siteId)
    setSite(found)
  }

  const loadKnowledge = async () => {
    try {
      const res = await knowledgeApi.list(siteId as string)
      setKnowledge(res.data)
    } catch {}
  }

  const handleSave = async () => {
    if (!site) return
    setSaving(true)
    try {
      await sitesApi.update(site.id, {
        tone: site.tone,
        language: site.language,
        custom_instructions: site.custom_instructions,
        auto_reply: site.auto_reply,
        auto_approve: site.auto_approve,
        auto_spam: site.auto_spam,
        spam_threshold: site.spam_threshold,
        approve_threshold: site.approve_threshold,
      })
      toast.success('تنظیمات ذخیره شد')
    } catch {
      toast.error('خطا در ذخیره')
    } finally {
      setSaving(false)
    }
  }

  const handleAddKB = async () => {
    if (!newKB.trim()) return
    try {
      await knowledgeApi.add(siteId as string, newKB, 'manual')
      setNewKB('')
      loadKnowledge()
      toast.success('دانش اضافه شد')
    } catch {
      toast.error('خطا')
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      await knowledgeApi.upload(siteId as string, file)
      loadKnowledge()
      toast.success('فایل آپلود شد')
    } catch {
      toast.error('خطا در آپلود')
    }
  }

  const handleDeleteChunk = async (id: string) => {
    try {
      await knowledgeApi.delete(siteId as string, id)
      setKnowledge(k => k.filter(c => c.id !== id))
      toast.success('حذف شد')
    } catch {}
  }

  const handleRegenKey = async () => {
    if (!confirm('مطمئنی؟ کلید قدیمی دیگه کار نمی‌کنه!')) return
    setRegenLoading(true)
    try {
      const res = await sitesApi.regenerateKey(siteId as string)
      setApiKey(res.data.api_key)
      setShowKey(true)
      toast.success('کلید جدید ساخته شد')
    } catch {
      toast.error('خطا در ساخت کلید جدید')
    } finally {
      setRegenLoading(false)
    }
  }

  const handleCopyKey = () => {
    if (!apiKey) return
    navigator.clipboard.writeText(apiKey)
    toast.success('کپی شد!')
  }

  if (!site) return <div className="p-8 text-center text-gray-400">در حال بارگذاری...</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/dashboard" className="text-gray-500 hover:text-indigo-600 transition">
            <ArrowRight size={20} />
          </Link>
          <h1 className="text-lg font-bold">{site.name}</h1>
          <span className="text-sm text-gray-400">{site.domain}</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {([
            { key: 'settings', label: '⚙️ تنظیمات' },
            { key: 'knowledge', label: '📚 پایگاه دانش' },
            { key: 'apikey', label: '🔑 API Key' },
          ] as const).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                tab === t.key ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-600'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ─── API Key Tab ─────────────────────────────────────────── */}
        {tab === 'apikey' && (
          <div className="space-y-4">
            <div className="card">
              <h3 className="font-semibold mb-1">API Key سایت</h3>
              <p className="text-sm text-gray-500 mb-4">
                این کلید رو توی افزونه وردپرس یا JS Widget وارد کن.
              </p>

              {apiKey ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                    <code className="flex-1 text-sm font-mono text-gray-800 break-all" dir="ltr">
                      {showKey ? apiKey : '•'.repeat(40)}
                    </code>
                    <button onClick={() => setShowKey(v => !v)} className="text-gray-400 hover:text-gray-600 shrink-0">
                      {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <button onClick={handleCopyKey} className="text-gray-400 hover:text-indigo-600 shrink-0">
                      <Copy size={16} />
                    </button>
                  </div>
                  <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                    ⚠️ این کلید رو الان کپی کن. اگه صفحه رو ببندی دیگه نمی‌تونی ببینیش!
                  </p>
                </div>
              ) : (
                <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg px-4 py-6 text-center">
                  <p className="text-gray-500 text-sm mb-1">کلید فعلی مخفی است.</p>
                  <p className="text-gray-400 text-xs">برای دیدن کلید جدید، از دکمه زیر استفاده کن.</p>
                </div>
              )}
            </div>

            <div className="card border-red-100">
              <h3 className="font-semibold text-red-700 mb-1">ساخت کلید جدید</h3>
              <p className="text-sm text-gray-500 mb-4">
                با این کار کلید قدیمی <strong>باطل</strong> می‌شه و باید توی افزونه وردپرس هم بروزرسانی بشه.
              </p>
              <button
                onClick={handleRegenKey}
                disabled={regenLoading}
                className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition disabled:opacity-50"
              >
                <RefreshCw size={14} className={regenLoading ? 'animate-spin' : ''} />
                {regenLoading ? 'در حال ساخت...' : 'ساخت کلید جدید'}
              </button>
            </div>
          </div>
        )}

        {/* ─── Settings Tab ─────────────────────────────────────────── */}
        {tab === 'settings' && (
          <div className="space-y-4">
            <div className="card">
              <h3 className="font-semibold mb-4">تنظیمات AI</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">لحن</label>
                    <select
                      value={site.tone}
                      onChange={e => setSite(s => s ? { ...s, tone: e.target.value } : s)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2"
                    >
                      <option value="friendly">دوستانه</option>
                      <option value="formal">رسمی</option>
                      <option value="professional">حرفه‌ای</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">زبان</label>
                    <select
                      value={site.language}
                      onChange={e => setSite(s => s ? { ...s, language: e.target.value } : s)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2"
                    >
                      <option value="fa">فارسی</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">دستورالعمل خاص (اختیاری)</label>
                  <textarea
                    value={site.custom_instructions || ''}
                    onChange={e => setSite(s => s ? { ...s, custom_instructions: e.target.value } : s)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 resize-none"
                    rows={3}
                    placeholder="مثال: اگه کسی از قیمت پرسید، بگو با پشتیبانی تماس بگیره"
                  />
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="font-semibold mb-4">مدیریت کامنت‌ها</h3>
              <div className="space-y-3">
                {[
                  { key: 'auto_reply', label: 'پاسخ خودکار', desc: 'AI به کامنت‌ها جواب دهد' },
                  { key: 'auto_approve', label: 'تأیید خودکار', desc: 'کامنت‌های معتبر نیاز به تأیید دستی ندارند' },
                  { key: 'auto_spam', label: 'فیلتر اسپم', desc: 'کامنت‌های اسپم به‌طور خودکار فیلتر شوند' },
                ].map(({ key, label, desc }) => (
                  <label key={key} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 cursor-pointer hover:bg-gray-50">
                    <div>
                      <div className="font-medium text-sm">{label}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{desc}</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={(site as any)[key]}
                      onChange={e => setSite(s => s ? { ...s, [key]: e.target.checked } : s)}
                      className="w-4 h-4 accent-indigo-600"
                    />
                  </label>
                ))}
              </div>
            </div>

            <button onClick={handleSave} disabled={saving} className="btn-primary w-full">
              {saving ? 'در حال ذخیره...' : 'ذخیره تنظیمات'}
            </button>
          </div>
        )}

        {/* ─── Knowledge Tab ─────────────────────────────────────────── */}
        {tab === 'knowledge' && (
          <div className="space-y-4">
            <div className="card">
              <h3 className="font-semibold mb-3">افزودن دانش</h3>
              <textarea
                value={newKB}
                onChange={e => setNewKB(e.target.value)}
                placeholder="اطلاعاتی که AI باید بداند را اینجا وارد کنید..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 resize-none"
                rows={4}
              />
              <div className="flex gap-2 mt-2">
                <button onClick={handleAddKB} className="btn-primary flex items-center gap-1">
                  <Plus size={14} /> افزودن متن
                </button>
                <label className="btn-secondary flex items-center gap-1 cursor-pointer">
                  <Upload size={14} /> آپلود فایل (.txt)
                  <input type="file" accept=".txt,.md" onChange={handleUpload} className="hidden" />
                </label>
              </div>
            </div>

            {knowledge.length === 0 ? (
              <div className="card text-center py-8 text-gray-400">
                پایگاه دانش خالی است. اطلاعات سایت خود را اضافه کنید.
              </div>
            ) : (
              <div className="space-y-2">
                {knowledge.map((chunk) => (
                  <div key={chunk.id} className="card py-3 px-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-indigo-500 mb-1 font-medium">
                          {chunk.source_name} #{chunk.chunk_index + 1}
                        </div>
                        <p className="text-sm text-gray-700 line-clamp-3">{chunk.content}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteChunk(chunk.id)}
                        className="text-gray-400 hover:text-red-500 transition shrink-0"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}