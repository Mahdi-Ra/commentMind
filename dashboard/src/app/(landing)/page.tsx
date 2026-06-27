import { LandingNav } from '@/components/landing/nav'
import { HeroSection } from '@/components/landing/hero'
import { LogoBar } from '@/components/landing/logo-bar'
import { FeaturesSection } from '@/components/landing/features'
import { HowItWorks } from '@/components/landing/how-it-works'
import { ReplyPreviewDemo } from '@/components/landing/reply-preview-demo'
import { PricingSection } from '@/components/landing/pricing'
import { TestimonialsSection } from '@/components/landing/testimonials'
import { FaqSection } from '@/components/landing/faq'
import { CtaSection } from '@/components/landing/cta'
import { LandingFooter } from '@/components/landing/footer'

export const metadata = {
  title: 'CommentMind AI — AI-powered comment moderation for your website',
  description:
    'Automatically reply to, approve, and filter comments on your website using AI trained on your own knowledge base. Works with WordPress, any JS site, and more.',
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <LandingNav />
      <main>
        <HeroSection />
        <LogoBar />
        <FeaturesSection />
        <HowItWorks />
        <ReplyPreviewDemo />
        <TestimonialsSection />
        <PricingSection />
        <FaqSection />
        <CtaSection />
      </main>
      <LandingFooter />
    </div>
  )
}
