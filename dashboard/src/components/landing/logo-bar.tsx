export function LogoBar() {
  const platforms = [
    'WordPress',
    'WooCommerce',
    'Shopify',
    'Ghost',
    'Webflow',
    'Custom HTML',
  ]

  return (
    <section className="border-y border-slate-100 bg-slate-50/60 py-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <p className="mb-6 text-center text-xs font-semibold uppercase tracking-widest text-slate-400">
          Works with any platform
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {platforms.map((name) => (
            <span
              key={name}
              className="text-sm font-semibold text-slate-400 transition hover:text-slate-600"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
