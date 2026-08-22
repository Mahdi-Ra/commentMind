import type { Metadata } from 'next'
import { PlatformLanding, faqSchema } from '@/components/landing/platform-landing'

const faqs = [
  { question: 'Do I need a developer to install this?', answer: 'No. It uses a standard embed block, so most users can add it in Webflow Designer.' },
  { question: 'Can I style the comment widget to match my brand?', answer: 'Yes. Colors, fonts, and layout can be customized to fit your site.' },
  { question: 'Does it work with Webflow CMS collection pages?', answer: 'Yes. It works on both static and CMS-driven pages.' },
]

export const metadata: Metadata = { title: { absolute: 'AI Comment Widget for Webflow Sites | CommentMind' }, description: 'Add an AI-moderated comment section to your Webflow site. CommentMind filters spam and replies to visitors automatically — no code required.' }

export default function WebflowLanding() { return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }} /><PlatformLanding eyebrow="Webflow integration" title="Add AI-Moderated Comments to Your Webflow Site" description="Webflow doesn't ship with a native comment system — most sites either skip comments entirely or bolt on a generic third-party widget. CommentMind gives you a comment section built for Webflow's design flexibility, with AI moderation and auto-replies included from day one." features={[{ title: 'Drop-in embed, no custom code', description: 'Add one embed block in Webflow Designer without integration work.' }, { title: "Matches your site's design system", description: 'The embed is designed to respect your fonts, colors, and spacing instead of feeling bolted on.' }, { title: 'Moderation from the first comment', description: 'Spam filtering and AI replies are active immediately, with no separate moderation tool.' }, { title: 'Built for content and portfolio sites', description: 'Ideal for blogs, case studies, and article-driven sites where reader engagement matters.' }]} steps={['Copy the CommentMind embed code into your Webflow project.', 'Connect your CommentMind account and set your reply knowledge base.', 'Publish — comments are live, moderated, and answered automatically.']} faqs={faqs} cta={{ label: 'Add CommentMind to your Webflow site', href: '/auth' }} /></> }
