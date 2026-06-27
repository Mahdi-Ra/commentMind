import { UserPlus, Database, Code2, CheckCircle2 } from 'lucide-react'

const STEPS = [
  {
    icon: UserPlus,
    step: '01',
    title: 'Create an account & add your site',
    description:
      'Sign up for free, add your website domain, and choose your AI reply tone and language. Takes under 2 minutes.',
  },
  {
    icon: Database,
    step: '02',
    title: 'Build your knowledge base',
    description:
      'Paste your FAQs, return policy, product details — or upload a text file. The AI uses this to give accurate answers.',
  },
  {
    icon: Code2,
    step: '03',
    title: 'Embed one script tag',
    description:
      'Copy the generated `<script>` snippet and paste it into your site. Works on WordPress, Webflow, Ghost, or plain HTML.',
  },
  {
    icon: CheckCircle2,
    step: '04',
    title: 'Watch comments get handled automatically',
    description:
      'Every new comment is analyzed, spam is filtered, questions get answered, and your dashboard shows the full audit trail.',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-slate-50/60 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-violet-600">
            How it works
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Live in 5 minutes, not 5 days
          </h2>
          <p className="mt-4 text-lg text-slate-500">
            No complex setup, no developer required. Just four steps and your site
            is running AI comment moderation.
          </p>
        </div>

        {/* Steps */}
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <div key={s.step} className="relative">
              {/* Connector line */}
              {i < STEPS.length - 1 && (
                <div className="absolute left-[calc(50%+28px)] top-6 hidden h-px w-[calc(100%-56px)] bg-slate-200 lg:block" />
              )}
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-lg shadow-violet-600/30">
                  <s.icon className="h-5 w-5" />
                  <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-bold text-violet-700 shadow-sm ring-1 ring-slate-200">
                    {i + 1}
                  </span>
                </div>
                <h3 className="mb-2 text-base font-semibold text-slate-900">{s.title}</h3>
                <p className="text-sm leading-relaxed text-slate-500">{s.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
