import { Star } from 'lucide-react'

const TESTIMONIALS = [
  {
    name: 'Sarah Chen',
    role: 'Founder, TechBlog Pro',
    avatar: 'SC',
    color: 'bg-violet-100 text-violet-700',
    quote:
      "We were spending 2 hours a day moderating comments. CommentMind cut that to zero. The AI replies are so good that readers think it's us.",
    stars: 5,
  },
  {
    name: 'Marcus Weber',
    role: 'E-commerce Manager, StyleHaus',
    avatar: 'MW',
    color: 'bg-emerald-100 text-emerald-700',
    quote:
      'The knowledge base feature is a game-changer. I uploaded our product catalog and now the AI answers detailed questions about specs and shipping automatically.',
    stars: 5,
  },
  {
    name: 'Priya Nair',
    role: 'Content Director, LearnFast',
    avatar: 'PN',
    color: 'bg-amber-100 text-amber-700',
    quote:
      "Spam used to be a constant headache. Now it barely reaches our moderation queue, and the team can focus on real customer conversations.",
    stars: 5,
  },
  {
    name: 'James O\'Brien',
    role: 'Agency Owner, DigitalEdge',
    avatar: 'JO',
    color: 'bg-sky-100 text-sky-700',
    quote:
      "We manage 40+ client sites. The Agency plan pays for itself in the first week. Setup is genuinely 5 minutes per site.",
    stars: 5,
  },
  {
    name: 'Leila Ahmadi',
    role: 'Blogger, FoodieIran',
    avatar: 'LA',
    color: 'bg-rose-100 text-rose-700',
    quote:
      'The AI writes natural replies that match our support tone. Readers get fast answers and our moderation queue finally feels manageable.',
    stars: 5,
  },
  {
    name: 'Tom Nakamura',
    role: 'CTO, NewsHub',
    avatar: 'TN',
    color: 'bg-indigo-100 text-indigo-700',
    quote:
      "The async processing means our widget loads instantly. We handle 10k+ comments a month on the Pro plan without any performance issues.",
    stars: 5,
  },
]

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
      ))}
    </div>
  )
}

export function TestimonialsSection() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-violet-600">
            Testimonials
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Loved by site owners worldwide
          </h2>
          <p className="mt-4 text-lg text-slate-500">
            From solo bloggers to agencies managing dozens of sites.
          </p>
        </div>

        {/* Grid */}
        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="flex flex-col rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
            >
              <Stars count={t.stars} />
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-slate-600">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <div className="mt-5 flex items-center gap-3">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${t.color}`}
                >
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
