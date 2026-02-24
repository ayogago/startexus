import { Suspense } from 'react'
import { BrowseContent } from './browse-content'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Browse Online Businesses for Sale - SaaS, eCommerce & More',
  description: 'Browse thousands of online businesses for sale. Find profitable SaaS, ecommerce stores, content websites, mobile apps, and digital assets. Verified listings with detailed financials.',
  keywords: [
    'businesses for sale',
    'online businesses for sale',
    'SaaS for sale',
    'ecommerce stores for sale',
    'profitable websites for sale',
    'digital businesses',
    'website marketplace',
    'online business listings',
    'investment opportunities',
    'business acquisition'
  ],
  openGraph: {
    title: 'Browse Online Businesses for Sale - SaaS, eCommerce & More',
    description: 'Browse thousands of online businesses for sale. Find profitable SaaS, ecommerce stores, content websites, mobile apps, and digital assets.',
    url: 'https://startexus.com/browse',
    type: 'website',
  },
  twitter: {
    title: 'Browse Online Businesses for Sale - SaaS, eCommerce & More',
    description: 'Browse thousands of online businesses for sale. Find profitable SaaS, ecommerce stores, content websites, mobile apps, and digital assets.',
  },
  alternates: {
    canonical: 'https://startexus.com/browse',
  },
}

export default function BrowsePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Browse Businesses</h1>
        <p className="text-gray-600">
          Find your next investment opportunity from thousands of online businesses.
        </p>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <BrowseContent />
      </Suspense>
    </div>
  )
}