'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle2, Copy, Send, Sparkles, WalletCards } from 'lucide-react'
import { toast } from 'sonner'
import { billingApi } from '@/lib/api'
import { getPlanById } from '@/lib/plans'
import { PageHeader } from '@/components/layout/page-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input, Label, Select, Textarea } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { useAuthStore } from '@/store/auth'

interface Payment {
  id: string
  plan: string
  billing_cycle: string
  currency: string
  network: string
  amount: number
  address: string
  status: string
  tx_hash?: string
  expires_at?: string
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<Spinner label="Loading checkout..." />}>
      <CheckoutContent />
    </Suspense>
  )
}

function CheckoutContent() {
  const searchParams = useSearchParams()
  const planId = searchParams.get('plan') || 'starter'
  const billing = (searchParams.get('billing') === 'annual' ? 'annual' : 'monthly') as
    | 'monthly'
    | 'annual'
  const wantsTrial = searchParams.get('trial') === '1'
  const plan = useMemo(() => getPlanById(planId), [planId])
  const { fetchMe } = useAuthStore()
  const [currency, setCurrency] = useState<'USDT' | 'TRX'>('USDT')
  const [payment, setPayment] = useState<Payment | null>(null)
  const [instructions, setInstructions] = useState<string[]>([])
  const [txHash, setTxHash] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [trialLoading, setTrialLoading] = useState(false)
  const [trialActive, setTrialActive] = useState(false)

  useEffect(() => {
    if (wantsTrial) {
      setLoading(false)
      return
    }
    createCheckout()
  }, [plan.id, billing, currency, wantsTrial])

  const createCheckout = async () => {
    setLoading(true)
    try {
      const res = await billingApi.checkout({
        plan: plan.id,
        billing_cycle: billing,
        currency,
        network: 'TRC20',
      })
      setPayment(res.data.payment)
      setInstructions(res.data.instructions || [])
    } catch (err: unknown) {
      const detail =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
          : undefined
      toast.error(typeof detail === 'string' ? detail : 'Could not create checkout')
    } finally {
      setLoading(false)
    }
  }

  const copy = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text)
    toast.success(`${label} copied`)
  }

  const submitTx = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!payment) return
    setSubmitting(true)
    try {
      const res = await billingApi.submitTx(payment.id, { tx_hash: txHash, note })
      setPayment(res.data)
      toast.success('Transaction submitted for verification')
    } catch {
      toast.error('Could not submit transaction')
    } finally {
      setSubmitting(false)
    }
  }

  const startTrial = async () => {
    setTrialLoading(true)
    try {
      await billingApi.startTrial(plan.id)
      await fetchMe()
      setTrialActive(true)
      toast.success('Your 7-day free trial is active')
    } catch (err: unknown) {
      const detail =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
          : undefined
      toast.error(typeof detail === 'string' ? detail : 'Could not start trial')
    } finally {
      setTrialLoading(false)
    }
  }

  return (
    <>
      <PageHeader
        title={wantsTrial ? 'Start your free trial' : 'Crypto checkout'}
        description={
          wantsTrial
            ? `Try ${plan.name} for 7 days before paying.`
            : `Upgrade to ${plan.name} with TRON network payment.`
        }
        backHref="/pricing"
        backLabel="Pricing"
      />

      <div className="mx-auto grid max-w-5xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
        <Card>
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
              {wantsTrial ? <Sparkles className="h-5 w-5" /> : <WalletCards className="h-5 w-5" />}
            </span>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                {wantsTrial ? 'Trial access' : 'Payment details'}
              </h2>
              <p className="text-sm text-slate-500">
                {wantsTrial
                  ? 'No payment required today. Your plan unlocks immediately.'
                  : 'USDT/TRX on TRC20. Verification is manual for now.'}
              </p>
            </div>
          </div>

          {wantsTrial ? (
            <div className="space-y-5">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
                  <div>
                    <p className="font-semibold text-emerald-900">7 days of {plan.name}, free</p>
                    <p className="mt-1 text-sm text-emerald-700">
                      Use the full paid limits, test replies on real comments, and add your knowledge base before deciding.
                    </p>
                  </div>
                </div>
              </div>
              <Button onClick={startTrial} loading={trialLoading} size="lg" disabled={trialActive}>
                <Sparkles className="h-4 w-4" />
                {trialActive ? 'Trial active' : 'Start 7-day free trial'}
              </Button>
            </div>
          ) : (
            <>
          <div className="mb-5 max-w-xs">
            <Label htmlFor="currency">Currency</Label>
            <Select
              id="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value as 'USDT' | 'TRX')}
            >
              <option value="USDT">USDT - TRC20</option>
              <option value="TRX">TRX - TRON</option>
            </Select>
          </div>

          {loading ? (
            <Spinner label="Creating checkout..." />
          ) : payment ? (
            <div className="space-y-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <Info label="Amount" value={`${payment.amount} ${payment.currency}`} />
                <Info label="Network" value={payment.network} />
              </div>
              <div>
                <Label>Destination address</Label>
                <div className="mt-1 flex gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2">
                  <code className="min-w-0 flex-1 break-all px-1 py-1 text-sm text-slate-800">
                    {payment.address}
                  </code>
                  <Button type="button" variant="secondary" size="sm" onClick={() => copy(payment.address, 'Address')}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <form onSubmit={submitTx} className="space-y-4 border-t border-slate-100 pt-5">
                <div>
                  <Label htmlFor="tx">Transaction hash</Label>
                  <Input
                    id="tx"
                    value={txHash}
                    onChange={(e) => setTxHash(e.target.value)}
                    placeholder="Paste TRON transaction hash"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="note">Note (optional)</Label>
                  <Textarea id="note" value={note} onChange={(e) => setNote(e.target.value)} rows={3} />
                </div>
                <Button type="submit" loading={submitting}>
                  <Send className="h-4 w-4" />
                  Submit for verification
                </Button>
              </form>
            </div>
          ) : (
            <p className="text-sm text-slate-500">Checkout is not available.</p>
          )}
            </>
          )}
        </Card>

        <aside className="space-y-5">
          <Card>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">{plan.name}</h3>
              {payment && <Badge variant={payment.status === 'submitted' ? 'warning' : 'neutral'}>{payment.status}</Badge>}
            </div>
            <p className="mt-2 text-sm text-slate-500">{plan.description}</p>
            <div className="mt-4 text-3xl font-semibold text-slate-900">
              {wantsTrial ? '$0' : `$${billing === 'annual' ? plan.annualPrice * 12 : plan.monthlyPrice}`}
            </div>
            <p className="mt-1 text-xs text-slate-400">
              {wantsTrial ? '7-day trial, then upgrade when ready' : billing === 'annual' ? 'Billed annually' : 'Billed monthly'}
            </p>
          </Card>

          <Card>
            <h3 className="text-sm font-semibold text-slate-900">Instructions</h3>
            <ol className="mt-3 space-y-2 text-sm text-slate-600">
              {instructions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </Card>
        </aside>
      </div>
    </>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 font-semibold text-slate-900">{value}</p>
    </div>
  )
}
