import { SellBusinessForm } from '@/components/sell/sell-business-form'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sell Your Online Business - List on StartExus Marketplace',
  description: 'Sell your online business on StartExus and reach thousands of qualified buyers. Get maximum value for your SaaS, ecommerce store, or digital business. Free listing, secure transactions.',
  keywords: [
    'sell my business online',
    'business broker',
    'sell SaaS business',
    'sell ecommerce store',
    'business valuation',
    'online business sale',
    'digital asset sale',
    'business listing',
    'sell website',
    'exit strategy'
  ],
  openGraph: {
    title: 'Sell Your Online Business - List on StartExus Marketplace',
    description: 'Sell your online business on StartExus and reach thousands of qualified buyers. Get maximum value for your digital business.',
    url: 'https://startexus.com/sell',
    type: 'website',
  },
  twitter: {
    title: 'Sell Your Online Business - List on StartExus Marketplace',
    description: 'Sell your online business on StartExus and reach thousands of qualified buyers. Get maximum value for your digital business.',
  },
  alternates: {
    canonical: 'https://startexus.com/sell',
  },
}

export default function SellPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">List Your Business for Sale</h1>
          <p className="text-xl text-gray-600 mb-2">
            Get your business in front of thousands of qualified buyers
          </p>
          <p className="text-gray-500">
            Fill out the details below and we'll help you create an account to complete the listing
          </p>
        </div>

        <SellBusinessForm />
      </div>
    </div>
  )
}