import type { Metadata } from 'next'
import { AlternativeLanding, alternativeFaqSchema } from '@/components/landing/alternative-landing'

const faqs = [
  { question: 'Does CommentMind moderate social media comments too?', answer: 'No. CommentMind is focused on comments on your own website, not social platforms.' },
  { question: 'Which platforms does CommentMind support?', answer: 'CommentMind supports WordPress, WooCommerce, Shopify, and Webflow.' },
]

export const metadata: Metadata = {
  title: { absolute: 'CommentMind vs CommentGuard: Website Comments vs Social Media | CommentMind' },
  description: 'CommentGuard moderates comments on Facebook and Instagram. CommentMind moderates and replies to comments on your own website. Here is the actual difference.',
}

export default function CommentGuardAlternativePage() {
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(alternativeFaqSchema(faqs)) }} /><AlternativeLanding alternative="CommentGuard" introduction="This comparison comes up often, but the two tools solve different problems. CommentGuard moderates comments on social media posts, including Facebook and Instagram. CommentMind moderates and replies to comments on your own website: blog posts, product pages, and articles. If you searched for one while meaning the other, this should sort that out quickly." rows={[{ label: 'Where it moderates', alternative: 'Facebook and Instagram posts', commentmind: 'Your own website: WordPress, WooCommerce, Shopify, and Webflow' }, { label: 'Auto-replies using your content', alternative: 'No - moderation-focused', commentmind: 'Yes - answers using your site content or product data' }, { label: 'Needed if you only care about social comments', alternative: 'Yes', commentmind: 'No' }, { label: 'Needed if you have a blog, shop, or content site with a comment section', alternative: 'No', commentmind: 'Yes' }]} conclusion="These are not competing products so much as different tools for different surfaces. If your comment problem is on Instagram or Facebook, CommentGuard or a similar social moderation tool is what you need. If your comment problem is on your own website - a blog, WooCommerce or Shopify store, or Webflow site - that is what CommentMind is built for. Many businesses use both, one for each surface." faqs={faqs} cta={{ label: 'See CommentMind for your platform', href: '/#features' }} /></>
}
