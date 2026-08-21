'use client'

import { useEffect, useState } from 'react'
import { sitesApi, knowledgeApi } from '@/lib/api'
import { toast } from 'sonner'
import { useParams } from 'next/navigation'
import {
  Key,
  Settings2,
  BookOpen,
  Plug,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  Plus,
  Upload,
  Trash2,
  BarChart3,
} from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs } from '@/components/ui/tabs'
import { Toggle } from '@/components/ui/toggle'
import { Spinner } from '@/components/ui/spinner'
import { Label, Input, Select, Textarea } from '@/components/ui/input'
import { TONE_OPTIONS, LANGUAGE_OPTIONS } from '@/lib/constants'
import { IntegrationTab } from '@/components/sites/integration-tab'
import { SearchConsoleTab } from '@/components/sites/search-console-tab'

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

type TabId = 'settings' | 'knowledge' | 'search-console' | 'apikey' | 'integration'

export default function SiteSettingsPage() {
  const { siteId } = useParams()
  const id = siteId as string

  const [site, setSite] = useState<Site | null>(null)
  const [knowledge, setKnowledge] = useState<KnowledgeChunk[]>([])
  const [newKB, setNewKB] = useState('')
  const [tab, setTab] = useState<TabId>('settings')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [showKey, setShowKey] = useState(false)
  const [regenLoading, setRegenLoading] = useState(false)

  useEffect(() => {
    loadSite()
    loadKnowledge()
  }, [id])

  const loadSite = async () => {
    setLoading(true)
    try {
      const res = await sitesApi.get(id)
      setSite(res.data)
    } catch {
      toast.error('Site not found')
    } finally {
      setLoading(false)
    }
  }

  const loadKnowledge = async () => {
    try {
      const res = await knowledgeApi.list(id)
      setKnowledge(res.data)
    } catch {
      /* empty */
    }
  }

  const handleSave = async () => {
    if (!site) return
    setSaving(true)
    try {
      await sitesApi.update(site.id, {
        name: site.name.trim(),
        domain: site.domain.trim(),
        tone: site.tone,
        language: site.language,
        custom_instructions: site.custom_instructions,
        auto_reply: site.auto_reply,
        auto_approve: site.auto_approve,
        auto_spam: site.auto_spam,
        spam_threshold: site.spam_threshold,
        approve_threshold: site.approve_threshold,
      })
      toast.success('Settings saved')
    } catch {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleAddKB = async () => {
    if (!newKB.trim()) return
    try {
      await knowledgeApi.add(id, newKB, 'manual')
      setNewKB('')
      loadKnowledge()
      toast.success('Knowledge added')
    } catch {
      toast.error('Failed to add knowledge')
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      await knowledgeApi.upload(id, file)
      loadKnowledge()
      toast.success('File uploaded')
    } catch {
      toast.error('Upload failed')
    }
    e.target.value = ''
  }

  const handleDeleteChunk = async (chunkId: string) => {
    try {
      await knowledgeApi.delete(id, chunkId)
      setKnowledge((k) => k.filter((c) => c.id !== chunkId))
      toast.success('Removed')
    } catch {
      toast.error('Delete failed')
    }
  }

  const handleRegenKey = async () => {
    if (!confirm('Regenerate API key? The old key will stop working immediately.')) return
    setRegenLoading(true)
    try {
      const res = await sitesApi.regenerateKey(id)
      setApiKey(res.data.api_key)
      setShowKey(true)
      toast.success('New API key generated')
    } catch {
      toast.error('Could not regenerate key')
    } finally {
      setRegenLoading(false)
    }
  }

  const handleCopyKey = () => {
    if (!apiKey) return
    navigator.clipboard.writeText(apiKey)
    toast.success('Copied to clipboard')
  }

  if (loading) {
    return <Spinner label="Loading site settings…" />
  }

  if (!site) {
    return (
      <div className="py-20 text-center text-slate-500">
        Site not found.{' '}
        <a href="/dashboard" className="text-violet-600 hover:underline">
          Back to overview
        </a>
      </div>
    )
  }

  return (
    <>
      <PageHeader
        title={site.name}
        description={site.domain}
        backHref="/dashboard"
        backLabel="All sites"
      />

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={[
            { id: 'settings', label: 'Settings', icon: <Settings2 className="h-4 w-4" /> },
            { id: 'knowledge', label: 'Knowledge', icon: <BookOpen className="h-4 w-4" /> },
            { id: 'search-console', label: 'SEO', icon: <BarChart3 className="h-4 w-4" /> },
            { id: 'apikey', label: 'API Key', icon: <Key className="h-4 w-4" /> },
            { id: 'integration', label: 'Integration', icon: <Plug className="h-4 w-4" /> },
          ]}
        />

        <div className="mt-6 space-y-5">
          {tab === 'settings' && (
            <>
              <Card>
                <h3 className="text-sm font-semibold text-slate-900">General</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Update your site name and domain shown in the dashboard.
                </p>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="site-name">Site name</Label>
                    <Input
                      id="site-name"
                      value={site.name}
                      onChange={(e) => setSite((s) => (s ? { ...s, name: e.target.value } : s))}
                      placeholder="My Store"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="site-domain">Domain</Label>
                    <Input
                      id="site-domain"
                      value={site.domain}
                      onChange={(e) => setSite((s) => (s ? { ...s, domain: e.target.value } : s))}
                      placeholder="example.com"
                      required
                    />
                  </div>
                </div>
              </Card>

              <Card>
                <h3 className="text-sm font-semibold text-slate-900">AI behavior</h3>
                <p className="mt-1 text-sm text-slate-500">
                  How the model writes replies and which language it uses.
                </p>
                <div className="mt-5 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="tone">Reply tone</Label>
                      <Select
                        id="tone"
                        value={site.tone}
                        onChange={(e) => setSite((s) => (s ? { ...s, tone: e.target.value } : s))}
                      >
                        {TONE_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="language">Language</Label>
                      <Select
                        id="language"
                        value={site.language}
                        onChange={(e) => setSite((s) => (s ? { ...s, language: e.target.value } : s))}
                      >
                        {LANGUAGE_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="instructions">Custom instructions (optional)</Label>
                    <Textarea
                      id="instructions"
                      value={site.custom_instructions || ''}
                      onChange={(e) =>
                        setSite((s) => (s ? { ...s, custom_instructions: e.target.value } : s))
                      }
                      placeholder="e.g. For pricing questions, ask users to contact support."
                      rows={3}
                    />
                  </div>
                </div>
              </Card>

              <Card>
                <h3 className="text-sm font-semibold text-slate-900">Moderation</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Control automatic approval, replies, and spam filtering.
                </p>
                <div className="mt-4 space-y-2">
                  <Toggle
                    checked={site.auto_reply}
                    onChange={(v) => setSite((s) => (s ? { ...s, auto_reply: v } : s))}
                    label="Auto-reply"
                    description="Post AI-generated replies to comments"
                  />
                  <Toggle
                    checked={site.auto_approve}
                    onChange={(v) => setSite((s) => (s ? { ...s, auto_approve: v } : s))}
                    label="Auto-approve"
                    description="Approve legitimate comments without manual review"
                  />
                  <Toggle
                    checked={site.auto_spam}
                    onChange={(v) => setSite((s) => (s ? { ...s, auto_spam: v } : s))}
                    label="Spam filter"
                    description="Mark high spam-score comments as spam"
                  />
                </div>
              </Card>

              <Button onClick={handleSave} loading={saving} className="w-full" size="lg">
                Save changes
              </Button>
            </>
          )}

          {tab === 'knowledge' && (
            <>
              <Card>
                <h3 className="text-sm font-semibold text-slate-900">Add knowledge</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Policies, FAQs, and product info the AI uses when replying.
                </p>
                <Textarea
                  className="mt-4"
                  value={newKB}
                  onChange={(e) => setNewKB(e.target.value)}
                  placeholder="Paste text your AI should know about your business…"
                  rows={5}
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button onClick={handleAddKB} disabled={!newKB.trim()}>
                    <Plus className="h-4 w-4" />
                    Add text
                  </Button>
                  <label className="inline-flex cursor-pointer">
                    <span className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                      <Upload className="h-4 w-4" />
                      Upload .txt / .md
                    </span>
                    <input
                      type="file"
                      accept=".txt,.md"
                      onChange={handleUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </Card>

              {knowledge.length === 0 ? (
                <Card className="text-center py-10 text-sm text-slate-500">
                  No knowledge yet. Add content so replies stay accurate and on-brand.
                </Card>
              ) : (
                <ul className="space-y-2">
                  {knowledge.map((chunk) => (
                    <li key={chunk.id}>
                      <Card padding className="!p-4">
                        <div className="flex gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-violet-600">
                              {chunk.source_name} · chunk {chunk.chunk_index + 1}
                            </p>
                            <p className="mt-1 line-clamp-3 text-sm text-slate-700">{chunk.content}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteChunk(chunk.id)}
                            aria-label="Delete chunk"
                          >
                            <Trash2 className="h-4 w-4 text-slate-400 hover:text-red-500" />
                          </Button>
                        </div>
                      </Card>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}

          {tab === 'apikey' && (
            <>
              <Card>
                <h3 className="text-sm font-semibold text-slate-900">Integration key</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Use this key in the WordPress plugin or your API client as{' '}
                  <code className="rounded bg-slate-100 px-1 text-xs">Authorization: Bearer …</code>
                </p>

                {apiKey ? (
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
                      <code className="flex-1 break-all font-mono text-sm text-slate-800">
                        {showKey ? apiKey : '•'.repeat(36)}
                      </code>
                      <Button variant="ghost" size="sm" onClick={() => setShowKey((v) => !v)} aria-label="Toggle visibility">
                        {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={handleCopyKey} aria-label="Copy">
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                      Copy this key now. You won&apos;t be able to view it again after leaving this page.
                    </p>
                  </div>
                ) : (
                  <p className="mt-4 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                    Your current key is hidden. Regenerate to reveal a new one.
                  </p>
                )}
              </Card>

              <Card className="border-red-100">
                <h3 className="text-sm font-semibold text-red-800">Regenerate key</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Invalidates the previous key. Update the WordPress plugin immediately.
                </p>
                <Button
                  variant="outline"
                  className="mt-4 border-red-200 text-red-700 hover:bg-red-50"
                  onClick={handleRegenKey}
                  loading={regenLoading}
                >
                  <RefreshCw className="h-4 w-4" />
                  Generate new key
                </Button>
              </Card>
            </>
          )}

          {tab === 'integration' && <IntegrationTab siteId={id} />}
          {tab === 'search-console' && <SearchConsoleTab siteId={id} />}
        </div>
      </div>
    </>
  )
}
