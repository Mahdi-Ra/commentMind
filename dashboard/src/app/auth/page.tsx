'use client'

import { Suspense, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { authApi } from '@/lib/api'
import { toast } from 'sonner'
import { Logo } from '@/components/brand/logo'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Eye, EyeOff, Sparkles, Shield, Zap } from 'lucide-react'
import { cn } from '@/lib/cn'

export default function AuthPage() {
  return (
    <Suspense fallback={null}>
      <AuthContent />
    </Suspense>
  )
}

function AuthContent() {
  const searchParams = useSearchParams()
  const resetToken = searchParams.get('reset_token')
  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'reset'>(
    resetToken ? 'reset' : 'login',
  )
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, register } = useAuthStore()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (mode === 'forgot') {
        await authApi.forgotPassword(email)
        toast.success('If an account exists, a reset link has been sent.')
        setMode('login')
        return
      }
      if (mode === 'reset') {
        if (!resetToken) throw new Error('Missing reset token')
        if (password.length < 8) {
          toast.error('Password must be at least 8 characters')
          return
        }
        if (password !== confirmPassword) {
          toast.error('Passwords do not match')
          return
        }
        await authApi.resetPassword(resetToken, password)
        toast.success('Password reset successfully. You can sign in now.')
        setPassword('')
        setConfirmPassword('')
        setMode('login')
        router.replace('/auth')
        return
      }
      if (mode === 'login') {
        await login(email, password)
      } else {
        await register(email, password, name)
      }
      const next = searchParams.get('next')
      router.push(next?.startsWith('/') ? next : '/dashboard')
    } catch (err: unknown) {
      const detail =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
          : undefined
      toast.error(detail || 'Authentication failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Brand panel */}
      <div className="relative hidden w-[45%] overflow-hidden bg-slate-950 lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(139,92,246,0.35),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_100%_100%,rgba(109,40,217,0.2),transparent)]" />
        <div className="relative z-10 p-10">
          <Logo href="/auth" className="[&_span]:text-white [&_span_span]:text-violet-300" />
        </div>
        <div className="relative z-10 px-10 pb-16">
          <h2 className="text-3xl font-semibold leading-tight tracking-tight text-white">
            Moderate comments at scale with AI
          </h2>
          <p className="mt-4 max-w-md text-slate-400 leading-relaxed">
            Approve, filter spam, and reply automatically — trained on your site&apos;s knowledge base.
          </p>
          <ul className="mt-10 space-y-4">
            {[
              { icon: Sparkles, text: 'Context-aware replies in your brand voice' },
              { icon: Shield, text: 'Spam detection with configurable thresholds' },
              { icon: Zap, text: 'WordPress plugin & API — live in minutes' },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm text-slate-300">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                  <Icon className="h-4 w-4 text-violet-300" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-8">
        <div className="mb-8 lg:hidden">
          <Logo href="/auth" />
        </div>

        <div className="w-full max-w-md animate-slide-up">
          <div className="mb-8 text-center lg:text-left">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              {mode === 'login' && 'Welcome back'}
              {mode === 'register' && 'Create your account'}
              {mode === 'forgot' && 'Reset your password'}
              {mode === 'reset' && 'Choose a new password'}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              {mode === 'login' && 'Sign in to manage your sites and comments.'}
              {mode === 'register' && 'Start automating comment moderation today.'}
              {mode === 'forgot' && 'Enter your email and we will send reset instructions.'}
              {mode === 'reset' && 'Use a strong password with at least 8 characters.'}
            </p>
          </div>

          <Card>
            {mode !== 'forgot' && mode !== 'reset' && (
              <div className="mb-6 flex rounded-lg border border-slate-200 bg-slate-50 p-1">
              {(['login', 'register'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setMode(m)
                    setPassword('')
                    setConfirmPassword('')
                  }}
                  className={cn(
                    'flex-1 rounded-md py-2 text-sm font-medium transition',
                    mode === m
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700',
                  )}
                >
                  {m === 'login' ? 'Sign in' : 'Sign up'}
                </button>
              ))}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <Label htmlFor="name">Full name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Smith"
                    autoComplete="name"
                  />
                </div>
              )}
              {(mode === 'login' || mode === 'register' || mode === 'forgot') && (
                <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@company.com"
                  autoComplete="email"
                />
              </div>
              )}
              {mode !== 'forgot' && (
                <PasswordField
                  id="password"
                  label={mode === 'reset' ? 'New password' : 'Password'}
                  value={password}
                  onChange={setPassword}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
              )}
              {mode === 'reset' && (
                <PasswordField
                  id="confirmPassword"
                  label="Confirm new password"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  autoComplete="new-password"
                />
              )}
              <Button type="submit" loading={loading} className="w-full mt-2" size="lg">
                {mode === 'login' && 'Sign in'}
                {mode === 'register' && 'Create account'}
                {mode === 'forgot' && 'Send reset link'}
                {mode === 'reset' && 'Reset password'}
              </Button>
            </form>
            {mode === 'login' && (
              <button
                type="button"
                onClick={() => setMode('forgot')}
                className="mt-4 w-full text-center text-sm font-medium text-violet-600 hover:text-violet-700"
              >
                Forgot your password?
              </button>
            )}
            {(mode === 'forgot' || mode === 'reset') && (
              <button
                type="button"
                onClick={() => {
                  setMode('login')
                  router.replace('/auth')
                }}
                className="mt-4 w-full text-center text-sm font-medium text-slate-500 hover:text-slate-700"
              >
                Back to sign in
              </button>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  autoComplete: string
}) {
  const [visible, setVisible] = useState(false)

  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          placeholder="••••••••"
          autoComplete={autoComplete}
          className="pr-11"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-400 transition hover:text-slate-600"
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )
}
