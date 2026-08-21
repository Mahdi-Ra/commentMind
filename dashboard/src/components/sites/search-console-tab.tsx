'use client'

import { useEffect, useState } from 'react'
import { BarChart3, CheckCircle2, ExternalLink, Unplug } from 'lucide-react'
import { toast } from 'sonner'
import { searchConsoleApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Select } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'

interface SearchConsoleStatus {
  configured: boolean
  connected: boolean
  property_url?: string
  properties: string[]
}

export function SearchConsoleTab({ siteId }: { siteId: string }) {
  const [data, setData] = useState<SearchConsoleStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try { setData((await searchConsoleApi.status(siteId)).data) } catch { toast.error('Could not load Search Console status') } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [siteId])

  const connect = async () => {
    try { window.location.assign((await searchConsoleApi.authorize(siteId)).data.url) } catch { toast.error('Search Console is not configured yet') }
  }
  const selectProperty = async (property_url: string) => {
    setSaving(true)
    try { setData((await searchConsoleApi.selectProperty(siteId, property_url)).data); toast.success('Search Console property connected') } catch { toast.error('Could not select this property') } finally { setSaving(false) }
  }
  const disconnect = async () => {
    setSaving(true)
    try { await searchConsoleApi.disconnect(siteId); await load(); toast.success('Search Console disconnected') } catch { toast.error('Could not disconnect Search Console') } finally { setSaving(false) }
  }

  if (loading) return <Spinner label="Loading Search Console…" />
  if (!data?.configured) return <Card><h3 className="text-sm font-semibold text-slate-900">Google Search Console</h3><p className="mt-2 text-sm leading-6 text-slate-500">This integration is not configured by the CommentMind team yet. Ask your platform administrator to enable it.</p></Card>
  if (!data.connected) return <Card><div className="flex items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700"><BarChart3 className="h-5 w-5" /></span><div><h3 className="text-sm font-semibold text-slate-900">Use search intent in AI replies</h3><p className="mt-1 text-sm leading-6 text-slate-500">Connect a verified Google Search Console property. CommentMind reads top page queries and uses them only when they naturally improve a customer answer.</p></div></div><Button className="mt-5" onClick={connect}><ExternalLink className="h-4 w-4" />Connect Google Search Console</Button></Card>
  return <div className="space-y-5"><Card><div className="flex items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700"><CheckCircle2 className="h-5 w-5" /></span><div><h3 className="text-sm font-semibold text-slate-900">Google account connected</h3><p className="mt-1 text-sm text-slate-500">Choose the verified property that matches this site. Data is read-only and page queries refresh at most once per day.</p></div></div><div className="mt-5 max-w-xl"><Select value={data.property_url || ''} disabled={saving || !data.properties.length} onChange={(event) => selectProperty(event.target.value)}><option value="">Select a verified property</option>{data.properties.map((property) => <option key={property} value={property}>{property}</option>)}</Select></div>{!data.properties.length && <p className="mt-3 text-sm text-amber-700">No verified properties were returned. Confirm this Google account has access in Search Console.</p>}</Card><Button variant="outline" loading={saving} onClick={disconnect}><Unplug className="h-4 w-4" />Disconnect Search Console</Button></div>
}
