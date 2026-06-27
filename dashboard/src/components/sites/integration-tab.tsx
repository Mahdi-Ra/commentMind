'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Code2, Copy, Plug, CheckCircle2 } from 'lucide-react'
import { sitesApi } from '@/lib/api'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label, Input } from '@/components/ui/input'

interface EmbedData {
  api_url: string
  widget_url: string
  domain: string
  site_name: string
  snippet: string
}

export function IntegrationTab({ siteId }: { siteId: string }) {
  const [embed, setEmbed] = useState<EmbedData | null>(null)
  const [apiKey, setApiKey] = useState('')
  const [snippet, setSnippet] = useState('')
  const [testing, setTesting] = useState(false)
  const [testOk, setTestOk] = useState<boolean | null>(null)

  useEffect(() => {
    loadEmbed()
  }, [siteId])

  const loadEmbed = async () => {
    try {
      const res = await sitesApi.getEmbed(siteId)
      setEmbed(res.data)
      setSnippet(res.data.snippet)
    } catch {
      toast.error('Failed to load integration settings')
    }
  }

  const buildSnippet = (key: string) => {
    if (!embed) return ''
    return embed.snippet.replace('YOUR_API_KEY', key || 'YOUR_API_KEY')
  }

  useEffect(() => {
    if (embed) {
      setSnippet(buildSnippet(apiKey))
    }
  }, [apiKey, embed])

  const handleCopy = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text)
    toast.success(`${label} copied`)
  }

  const handleTest = async () => {
    if (!apiKey.trim()) {
      toast.error('Paste your API key to test the connection')
      return
    }
    setTesting(true)
    setTestOk(null)
    try {
      const res = await sitesApi.testConnection(siteId, apiKey.trim())
      setTestOk(true)
      toast.success(res.data.message || 'Connection successful')
    } catch (err: unknown) {
      setTestOk(false)
      const detail =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
          : undefined
      toast.error(typeof detail === 'string' ? detail : 'Connection failed')
    } finally {
      setTesting(false)
    }
  }

  if (!embed) {
    return (
      <Card className="text-center py-10 text-sm text-slate-500">Loading integration…</Card>
    )
  }

  return (
    <div className="space-y-5">
      <Card>
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
            <Plug className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">JavaScript widget</h3>
            <p className="text-sm text-slate-500">
              For any non-WordPress site. Add this snippet before{' '}
              <code className="rounded bg-slate-100 px-1 text-xs">&lt;/body&gt;</code>.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="embed-api-key">API key (for snippet & test)</Label>
            <Input
              id="embed-api-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="cm_..."
              className="font-mono text-sm"
            />
            <p className="mt-1 text-xs text-slate-400">
              Use the key from the API Key tab. It is only stored in your browser for this page.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={handleTest} loading={testing}>
              <CheckCircle2 className="h-4 w-4" />
              Test connection
            </Button>
            {testOk === true && (
              <span className="flex items-center text-sm text-emerald-600">Connected to {embed.site_name}</span>
            )}
            {testOk === false && (
              <span className="flex items-center text-sm text-red-600">Connection failed</span>
            )}
          </div>
        </div>
      </Card>

      <Card>
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Code2 className="h-4 w-4 text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-900">Embed code</h3>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleCopy(snippet, 'Embed code')}
          >
            <Copy className="h-4 w-4" />
            Copy
          </Button>
        </div>
        <pre className="overflow-x-auto rounded-lg border border-slate-200 bg-slate-950 p-4 text-xs leading-relaxed text-slate-100">
          <code>{snippet}</code>
        </pre>
      </Card>

      <Card padding className="!p-4">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Details</h4>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Registered domain</dt>
            <dd className="font-medium text-slate-900">{embed.domain}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">API URL</dt>
            <dd className="font-mono text-xs text-slate-700">{embed.api_url}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Widget script</dt>
            <dd className="truncate font-mono text-xs text-slate-700">{embed.widget_url}</dd>
          </div>
        </dl>
        <p className="mt-4 text-xs text-slate-400">
          Requests from browsers must match your registered domain (localhost is allowed in development).
        </p>
      </Card>

      <Card>
        <h3 className="text-sm font-semibold text-slate-900">Optional attributes</h3>
        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-600">
          <li>
            <code className="text-xs">data-page-title</code> — page title sent to AI (defaults to{' '}
            <code className="text-xs">document.title</code>)
          </li>
          <li>
            <code className="text-xs">data-page-url</code> — canonical page URL (defaults to current URL)
          </li>
          <li>
            <code className="text-xs">data-root</code> — container element id (default: commentmind-root)
          </li>
        </ul>
      </Card>
    </div>
  )
}
