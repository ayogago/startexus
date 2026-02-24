import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'FAQ - Frequently Asked Questions',
  description: 'Find answers to common questions about buying and selling online businesses on StartExus. Learn about our marketplace, transactions, and security.',
  openGraph: {
    title: 'FAQ - Frequently Asked Questions | StartExus',
    description: 'Find answers about buying and selling businesses on StartExus.',
    url: 'https://startexus.com/faq',
  },
  alternates: { canonical: 'https://startexus.com/faq' },
}

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
