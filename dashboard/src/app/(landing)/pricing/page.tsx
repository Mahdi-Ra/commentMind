import { LandingNav } from '@/components/landing/nav'
import { PricingSection } from '@/components/landing/pricing'
import { FaqSection } from '@/components/landing/faq'
import { CtaSection } from '@/components/landing/cta'
import { LandingFooter } from '@/components/landing/footer'

export const metadata = {
  title: 'Pricing — CommentMind AI',
  description:
    'Simple, transparent pricing. Start free, upgrade when you need more. No hidden fees.',
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      <LandingNav />
      <main className="pt-16">
        <PricingSection />
        <FaqSection />
        <CtaSection />
      </main>
      <LandingFooter />
    </div>
  )
}
