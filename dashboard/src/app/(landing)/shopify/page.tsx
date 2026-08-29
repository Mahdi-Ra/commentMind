import type { Metadata } from 'next'
import { PlatformLanding, faqSchema } from '@/components/landing/platform-landing'

const faqs = [
  { question: 'Is this a Q&A app, a moderation app, or both?', answer: 'Both. CommentMind answers shopper questions on product pages using your product data, and moderates comment and review threads for spam in one app.' },
  { question: 'Which review apps does CommentMind work with?', answer: 'It integrates with the most common Shopify review and comment apps. Check our documentation for the current list before connecting your store.' },
  { question: 'Can it recommend other products in replies?', answer: 'Yes. You can enable relevant related or alternative product suggestions when they help answer the shopper\'s question.' },
  { question: "What happens when it can't answer a question confidently?", answer: 'It is flagged for manual reply instead of guessing. Accuracy on product questions matters more than speed.' },
  { question: 'Does it work across multiple storefronts?', answer: 'Yes. One CommentMind account can manage multiple Shopify stores.' },
]

export const metadata: Metadata = {
  title: { absolute: 'AI Product Q&A & Comment Moderation for Shopify | CommentMind' },
  description: 'Answer product questions and moderate review comments on your Shopify store with AI - grounded in your real product data. Reduce support tickets, block spam, and keep buyers engaged.',
}

export default function ShopifyLanding() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }} />
      <PlatformLanding
        eyebrow="Shopify integration"
        title="AI Product Q&A & Comment Moderation for Shopify Stores"
        description="Every question a shopper leaves on a product page is either a sale you close now, or one you lose to silence. CommentMind answers product questions and review comments using your actual product data - pricing, variants, stock, and policies - while filtering out spam and fake reviews before they touch your storefront. One tool for both jobs, instead of a Q&A app and a moderation app running separately."
        features={[
          { title: 'Answers real product questions, grounded in your catalog', description: 'CommentMind answers questions such as "Does this run true to size?" and "Is this back in stock?" from your actual product data instead of leaving shoppers waiting, guessing, or abandoning the cart.' },
          { title: 'Moderates review comments and community threads too', description: 'Most AI Q&A tools stop at product questions. CommentMind also moderates comment threads on reviews and blog content, so you get one dashboard instead of separate Q&A and moderation apps.' },
          { title: 'Filters fake reviews and spam before they go live', description: 'Bot-generated fake reviews and comment spam are a growing problem on Shopify stores. CommentMind flags suspicious patterns before a shopper ever sees them.' },
          { title: 'Public answers double as social proof and SEO content', description: 'A visible Q&A thread does more selling than a private chat reply. The next fifty shoppers can read the answer, and the useful content remains indexable.' },
          { title: 'Native Shopify integration, no theme rebuild', description: 'Works with your existing reviews app and theme through a standard app block, with no custom development needed.' },
        ]}
        steps={[
          'Install CommentMind from the Shopify App Store.',
          'Sync your product catalog, policies, and FAQ.',
          'CommentMind answers product questions and moderates comment and review threads in real time. Choose full-auto, review-before-publish, or manual mode.',
        ]}
        faqs={faqs}
        cta={{ label: 'Add CommentMind to your Shopify store', href: '/auth' }}
      />
    </>
  )
}
