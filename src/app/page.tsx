import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, TrendingUp, Shield, Users, ArrowRight, Star, Globe, DollarSign } from 'lucide-react'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { prisma } from '@/lib/prisma'
import HeroSection from '@/components/home/hero-section'
import { ListingImage } from '@/components/ui/listing-image'
import { getPlaceholderImage } from '@/lib/placeholder-images'
import { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Buy & Sell Online Businesses - StartExus Marketplace',
  description: 'Discover profitable online businesses for sale on StartExus. Buy SaaS, ecommerce stores, content sites, and digital assets. Sell your business to qualified buyers worldwide.',
  keywords: [
    'buy online business',
    'sell online business',
    'business marketplace',
    'SaaS for sale',
    'ecommerce business',
    'profitable websites',
    'digital business broker',
    'online business investment',
    'website flipping',
    'business acquisition'
  ],
  openGraph: {
    title: 'Buy & Sell Online Businesses - StartExus Marketplace',
    description: 'Discover profitable online businesses for sale on StartExus. Buy SaaS, ecommerce stores, content sites, and digital assets.',
    url: 'https://startexus.com',
    type: 'website',
  },
  twitter: {
    title: 'Buy & Sell Online Businesses - StartExus Marketplace',
    description: 'Discover profitable online businesses for sale on StartExus. Buy SaaS, ecommerce stores, content sites, and digital assets.',
  },
  alternates: {
    canonical: 'https://startexus.com',
  },
}

async function getFeaturedListings() {
  const listings = await prisma.listing.findMany({
    where: {
      status: 'PUBLISHED',
    },
    include: {
      images: {
        orderBy: { order: 'asc' },
        take: 1,
      },
      _count: {
        select: {
          savedListings: true,
        },
      },
    },
    orderBy: [
      { featured: 'desc' },
      { featuredAt: 'desc' },
      { publishedAt: 'desc' },
    ],
    take: 6,
  })

  // Parse JSON fields
  return listings.map(listing => ({
    ...listing,
    highlights: JSON.parse(listing.highlights || '[]'),
    monetization: JSON.parse(listing.monetization || '[]'),
    platform: JSON.parse(listing.platform || '[]'),
    techStack: JSON.parse(listing.techStack || '[]'),
    growthOps: JSON.parse(listing.growthOps || '[]'),
    risks: JSON.parse(listing.risks || '[]'),
    assetsIncluded: JSON.parse(listing.assetsIncluded || '[]'),
  }))
}

export default async function HomePage() {
  const featuredListings = await getFeaturedListings()

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Buy & Sell Online Businesses - StartExus Marketplace",
            "description": "Discover profitable online businesses for sale on StartExus. Buy SaaS, ecommerce stores, content sites, and digital assets.",
            "url": "https://startexus.com",
            "mainEntity": {
              "@type": "ItemList",
              "name": "Featured Online Businesses for Sale",
              "description": "Latest online business opportunities available on StartExus marketplace",
              "itemListElement": featuredListings.slice(0, 3).map((listing, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "item": {
                  "@type": "Product",
                  "name": listing.title,
                  "description": listing.highlights?.[0] || "Online business for sale",
                  "url": `https://startexus.com/listings/${listing.slug}`,
                  "category": listing.businessType,
                  "offers": {
                    "@type": "Offer",
                    "price": listing.askingPrice || 0,
                    "priceCurrency": "USD",
                    "availability": "https://schema.org/InStock"
                  }
                }
              }))
            }
          })
        }}
      />
      <HeroSection />

      {/* Categories - Flippa Style Grid */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8">Browse categories</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 mobile-grid-2">
              {[
                { type: 'SAAS', label: 'SaaS', icon: '💻', color: 'bg-blue-50 hover:bg-blue-100' },
                { type: 'SERVICES', label: 'Services', icon: '🛠️', color: 'bg-green-50 hover:bg-green-100' },
                { type: 'ECOMMERCE', label: 'eCommerce', icon: '🛒', color: 'bg-purple-50 hover:bg-purple-100' },
                { type: 'AMAZON', label: 'Amazon FBA', icon: '📦', color: 'bg-orange-50 hover:bg-orange-100' },
                { type: 'CONTENT', label: 'Content Blogs', icon: '📝', color: 'bg-amber-50 hover:bg-amber-100' },
                { type: 'AFFILIATE', label: 'Affiliate Sites', icon: '💰', color: 'bg-yellow-50 hover:bg-yellow-100' },
                { type: 'MOBILE_APP', label: 'Mobile Apps', icon: '📱', color: 'bg-red-50 hover:bg-red-100' },
                { type: 'MARKETPLACE', label: 'Marketplaces', icon: '🏪', color: 'bg-indigo-50 hover:bg-indigo-100' },
                { type: 'DOMAIN', label: 'Domains', icon: '🌐', color: 'bg-teal-50 hover:bg-teal-100' },
              ].map((category) => (
                <Link
                  key={category.type}
                  href={`/browse?type=${category.type}`}
                  className={`${category.color} rounded-lg sm:rounded-xl p-3 sm:p-6 transition-all duration-200 group min-h-[100px] sm:min-h-[120px] flex items-center justify-center mobile-p-3 mobile-rounded`}
                >
                  <div className="text-center w-full">
                    <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">{category.icon}</div>
                    <h3 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base mobile-text-sm">{category.label}</h3>
                    <ArrowRight className="w-4 h-4 mx-auto text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>

            {/* Featured Collections */}
            <div className="mt-12">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Featured collections</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                <div className="bg-white rounded-lg p-4 sm:p-6 border hover:shadow-md transition-shadow min-h-[100px]">
                  <Star className="w-8 h-8 text-yellow-500 mb-3" />
                  <h4 className="font-semibold text-gray-900 mb-2">Profitable Businesses</h4>
                  <p className="text-sm text-gray-600 mb-4">Businesses with proven revenue streams</p>
                  <Link href="/browse?profitable=true" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    View collection →
                  </Link>
                </div>
                <div className="bg-white rounded-lg p-4 sm:p-6 border hover:shadow-md transition-shadow min-h-[100px]">
                  <Globe className="w-8 h-8 text-green-500 mb-3" />
                  <h4 className="font-semibold text-gray-900 mb-2">Built for Beginners</h4>
                  <p className="text-sm text-gray-600 mb-4">Perfect first acquisitions for new buyers</p>
                  <Link href="/browse?beginner=true" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    View collection →
                  </Link>
                </div>
                <div className="bg-white rounded-lg p-4 sm:p-6 border hover:shadow-md transition-shadow min-h-[100px]">
                  <TrendingUp className="w-8 h-8 text-blue-500 mb-3" />
                  <h4 className="font-semibold text-gray-900 mb-2">High Growth</h4>
                  <p className="text-sm text-gray-600 mb-4">Businesses with strong growth potential</p>
                  <Link href="/browse?growth=true" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    View collection →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Listings - Flippa Style */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 gap-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Latest opportunities</h2>
              <Button asChild variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 w-full sm:w-auto">
                <Link href="/browse" className="flex items-center justify-center">
                  <span className="sm:hidden">View All</span>
                  <span className="hidden sm:inline">View all listings</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {featuredListings.map((listing) => (
                <div key={listing.id} className="bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-all duration-200 group">
                  <div className="w-full h-48 bg-gray-100 rounded-t-lg overflow-hidden">
                    <ListingImage
                      src={listing.images[0]?.url || getPlaceholderImage(listing.businessType)}
                      alt={listing.images[0]?.alt || listing.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      businessType={listing.businessType}
                    />
                  </div>

                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <Badge
                        variant="secondary"
                        className="bg-blue-50 text-blue-700 hover:bg-blue-100"
                      >
                        {listing.businessType}
                      </Badge>
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="w-3 h-3 mr-1" />
                        {listing._count.savedListings}
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {listing.title}
                    </h3>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">Asking Price</span>
                        <span className="text-lg font-bold text-gray-900">
                          {listing.askingPrice ? formatCurrency(listing.askingPrice) : 'Make Offer'}
                        </span>
                      </div>

                      {listing.mrr && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Monthly Revenue</span>
                          <span className="font-semibold text-green-600">{formatCurrency(listing.mrr)}</span>
                        </div>
                      )}

                      {listing.trafficTtm && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Monthly Visitors</span>
                          <span className="font-medium text-gray-800">{formatNumber(listing.trafficTtm / 12)}</span>
                        </div>
                      )}
                    </div>

                    {listing.highlights && listing.highlights.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {listing.highlights[0]}
                        </p>
                      </div>
                    )}

                    <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                      <Link href={`/listings/${listing.slug}`}>
                        View Details
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats & Trust - Flippa Style */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Trusted by entrepreneurs worldwide</h2>
              <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
                The leading marketplace for buying and selling online businesses, trusted by thousands of entrepreneurs globally.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 text-center">
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">$10M+</div>
                <p className="text-xs sm:text-sm text-gray-600">Transaction Volume</p>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">5,000+</div>
                <p className="text-xs sm:text-sm text-gray-600">Active Users</p>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">100+</div>
                <p className="text-xs sm:text-sm text-gray-600">Businesses Sold</p>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">75%</div>
                <p className="text-xs sm:text-sm text-gray-600">Success Rate</p>
              </div>
            </div>

            {/* Trust indicators */}
            <div className="mt-16 bg-white rounded-xl p-8 border">
              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Why choose StartExus?</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
                <div className="text-center">
                  <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h4 className="font-semibold text-gray-900 mb-2">Secure Transactions</h4>
                  <p className="text-xs sm:text-sm text-gray-600">End-to-end protection for buyers and sellers</p>
                </div>
                <div className="text-center">
                  <Users className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <h4 className="font-semibold text-gray-900 mb-2">Expert Support</h4>
                  <p className="text-xs sm:text-sm text-gray-600">Dedicated team to guide you through every step</p>
                </div>
                <div className="text-center">
                  <TrendingUp className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                  <h4 className="font-semibold text-gray-900 mb-2">Proven Results</h4>
                  <p className="text-xs sm:text-sm text-gray-600">Track record of successful business transfers</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}