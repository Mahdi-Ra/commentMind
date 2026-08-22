import type { Metadata } from 'next'
import { PlatformLanding, faqSchema } from '@/components/landing/platform-landing'

const faqs = [
  { question: 'Which review apps does CommentMind work with?', answer: 'It is designed for the most common Shopify review and comment apps. Check our documentation for the current integration list before connecting a store.' },
  { question: 'Can it recommend other products in replies?', answer: 'Yes. This can be enabled to suggest relevant related or alternative products when appropriate.' },
  { question: 'Does it work across multiple storefronts?', answer: 'Yes. One CommentMind account can manage multiple Shopify stores.' },
  { question: "What happens with a question it can't answer?", answer: 'It is flagged for manual reply instead of guessing.' },
]

export const metadata: Metadata = { title: { absolute: 'AI Comment & Review Reply App for Shopify | CommentMind' }, description: 'Auto-reply to product review comments and Q&A on your Shopify store with AI. Reduce support tickets and keep buyers engaged — install from the Shopify App Store.' }

export default function ShopifyLanding() { return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }} /><PlatformLanding eyebrow="Shopify integration" title="AI-Powered Comment & Review Replies for Shopify Stores" description="Every product page comment or review question is a buying signal — or a lost sale if it's ignored. CommentMind answers customer questions on product pages instantly, using your product descriptions, policies, and FAQ as its source of truth, while filtering out spam and fake reviews before they go live." features={[{ title: 'Answers real product questions', description: 'CommentMind answers sizing, availability, and product questions using your actual product data.' }, { title: 'Filters fake reviews and comment spam', description: 'Suspicious bot-generated review patterns are flagged before they reach your storefront.' }, { title: 'Reduces support ticket volume', description: 'Publicly answered questions reduce repeat tickets and create useful social proof for future buyers.' }, { title: 'Native Shopify integration', description: 'Works with your existing reviews app and theme without custom development.' }]} steps={['Install CommentMind from the Shopify App Store.', 'Sync your product catalog, policies, and FAQ.', 'CommentMind moderates and replies to comments and review questions in real time.']} faqs={faqs} cta={{ label: 'Add CommentMind to your Shopify store', href: '/auth' }} /></> }
