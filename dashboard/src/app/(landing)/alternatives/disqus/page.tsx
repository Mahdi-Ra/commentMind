import type { Metadata } from 'next'
import { AlternativeLanding, alternativeFaqSchema } from '@/components/landing/alternative-landing'

const faqs = [
  { question: 'Can CommentMind replace Disqus on my Webflow site?', answer: 'Yes. See our Webflow page for setup.' },
  { question: "Does CommentMind show ads like Disqus's free tier?", answer: 'No. There are no ads in CommentMind at any plan level.' },
  { question: 'Can I migrate existing Disqus comments to CommentMind?', answer: 'Check our documentation for current migration support.' },
]

export const metadata: Metadata = {
  title: { absolute: 'CommentMind vs Disqus: AI Moderation vs Comment Hosting | CommentMind' },
  description: 'Disqus gives you a comment widget. CommentMind adds AI moderation and auto-replies grounded in your content. See how they are actually different tools.',
}

export default function DisqusAlternativePage() {
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(alternativeFaqSchema(faqs)) }} /><AlternativeLanding alternative="Disqus" introduction="Disqus and CommentMind are not quite solving the same problem, which is worth saying upfront. Disqus is comment infrastructure: it gives sites without a native comment system, such as Webflow, a place for visitors to leave comments, along with social login and a basic spam filter. CommentMind is a moderation and reply layer. Some sites use it on top of existing comments, while others choose it because they want AI moderation and replies without an ad-supported widget." rows={[{ label: 'What it is', alternative: 'A hosted comment system and widget', commentmind: 'An AI moderation and auto-reply layer' }, { label: 'Works on platforms without native comments', alternative: 'Yes - this is its core use case', commentmind: 'Yes - via embed' }, { label: 'Ads in the free tier', alternative: 'Yes, unless you pay to remove them', commentmind: 'No ads' }, { label: 'AI-generated spam detection', alternative: 'Basic, pattern-based', commentmind: 'Context-aware' }, { label: 'Answers visitor questions automatically', alternative: 'No', commentmind: 'Yes, grounded in your content' }, { label: 'Design control', alternative: 'Limited - widget look is largely fixed', commentmind: 'Matches your site design system' }]} conclusion="If you are on Webflow or another platform with no native comments and just need somewhere for visitors to leave comments, Disqus remains a reasonable default: it is fast to set up and free. CommentMind is the better fit if ads in your comment section are a dealbreaker, if you are tired of moderating AI-generated spam by hand, or if you want the comment section to answer visitor questions instead of simply collecting them." faqs={faqs} cta={{ label: 'See CommentMind for Webflow', href: '/webflow/' }} /></>
}
