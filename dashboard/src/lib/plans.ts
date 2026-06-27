export interface Plan {
  id: 'free' | 'starter' | 'pro' | 'agency'
  name: string
  monthlyPrice: number   // USD/month billed monthly
  annualPrice: number    // USD/month billed annually (≈20% off)
  description: string
  maxSites: number       // -1 = unlimited
  maxComments: number    // -1 = unlimited
  features: string[]
  notIncluded?: string[]
  badge?: string
  cta: string
  ctaVariant: 'primary' | 'outline'
}

export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    monthlyPrice: 0,
    annualPrice: 0,
    description: 'Perfect for trying it out on a personal site.',
    maxSites: 1,
    maxComments: 100,
    features: [
      '1 website',
      '100 AI-moderated comments / mo',
      'Spam detection',
      'Auto-reply (EN & FA)',
      'Manual knowledge base',
      'JS widget embed',
    ],
    notIncluded: [
      'File upload knowledge base',
      'Semantic vector search',
      'Async processing',
    ],
    cta: 'Get started free',
    ctaVariant: 'outline',
  },
  {
    id: 'starter',
    name: 'Starter',
    monthlyPrice: 9,
    annualPrice: 7,
    description: 'For bloggers and small business owners.',
    maxSites: 3,
    maxComments: 2000,
    features: [
      '3 websites',
      '2,000 AI-moderated comments / mo',
      'Everything in Free',
      'File upload (.txt / .md)',
      'Custom reply tone & instructions',
      'Email support',
    ],
    notIncluded: [
      'Semantic vector search',
      'Async processing',
    ],
    cta: 'Start 7-day trial',
    ctaVariant: 'outline',
  },
  {
    id: 'pro',
    name: 'Pro',
    monthlyPrice: 29,
    annualPrice: 23,
    description: 'For growing e-commerce stores and content teams.',
    maxSites: 10,
    maxComments: 15000,
    features: [
      '10 websites',
      '15,000 AI-moderated comments / mo',
      'Everything in Starter',
      'Semantic vector search',
      'Async background processing',
      'Priority support',
    ],
    badge: 'Most popular',
    cta: 'Start 7-day trial',
    ctaVariant: 'primary',
  },
  {
    id: 'agency',
    name: 'Agency',
    monthlyPrice: 79,
    annualPrice: 63,
    description: 'For agencies managing multiple client sites.',
    maxSites: -1,
    maxComments: -1,
    features: [
      'Unlimited websites',
      'Unlimited comments',
      'Everything in Pro',
      'Dedicated onboarding call',
      'SLA & uptime guarantee',
      'Custom integrations',
    ],
    cta: 'Contact sales',
    ctaVariant: 'outline',
  },
]

export function getPlanById(id: string): Plan {
  return PLANS.find((p) => p.id === id) ?? PLANS[0]
}

export function formatLimit(n: number): string {
  if (n === -1) return 'Unlimited'
  return n.toLocaleString()
}
