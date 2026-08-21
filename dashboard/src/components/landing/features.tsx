import {
  Bot,
  ShieldAlert,
  BookOpen,
  Sliders,
  Globe,
  Zap,
} from 'lucide-react'

const FEATURES = [
  {
    icon: Bot,
    title: 'AI-generated replies',
    description:
      'CommentMind reads each comment and writes a contextual reply in your brand voice — using your knowledge base as the source of truth.',
    color: 'bg-violet-50 text-violet-600',
  },
  {
    icon: ShieldAlert,
    title: 'Spam & toxicity filter',
    description:
      'Every comment gets a spam score from 0 to 1. Set your own threshold and let the AI silently discard junk before it reaches your site.',
    color: 'bg-red-50 text-red-500',
  },
  {
    icon: BookOpen,
    title: 'Knowledge base',
    description:
      'Paste your FAQs, policies, and product info — or upload a .txt / .md file. The AI uses it to give accurate, on-brand answers.',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    icon: Sliders,
    title: 'Full control',
    description:
      'Choose auto-reply, auto-approve, or manual review per site. Adjust spam thresholds, reply tone (friendly / formal / professional), and language.',
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    icon: Globe,
    title: 'Universal embed',
    description:
      'One `<script>` tag drops a full comment section onto any page. Shadow DOM keeps your styles intact and setup stays lightweight.',
    color: 'bg-sky-50 text-sky-600',
  },
  {
    icon: Zap,
    title: 'Async processing',
    description:
      'Comments are saved instantly and processed in the background — your visitors never wait for the AI. Powered by Celery + Redis.',
    color: 'bg-indigo-50 text-indigo-600',
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-violet-600">
            Features
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Everything you need to automate comment moderation
          </h2>
          <p className="mt-4 text-lg text-slate-500">
            From spam filtering to AI replies — CommentMind handles the full lifecycle
            of every comment on your site.
          </p>
        </div>

        {/* Grid */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:border-slate-200 hover:shadow-md hover:shadow-slate-900/[0.05]"
            >
              <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${f.color}`}>
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mb-2 text-base font-semibold text-slate-900">{f.title}</h3>
              <p className="text-sm leading-relaxed text-slate-500">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
