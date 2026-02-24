import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Free Business Valuation',
  description: 'Get a free, expert valuation of your online business. Find out what your SaaS, eCommerce, or digital business is worth.',
  alternates: { canonical: '/valuation' },
}

export default function ValuationLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
