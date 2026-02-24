'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { ListingImage } from '@/components/ui/listing-image'
import { getPlaceholderImage } from '@/lib/placeholder-images'
import { Filter, Heart, Search, Star, X, Zap, Clock, DollarSign, TrendingUp, Users, Globe, Sparkles } from 'lucide-react'

interface Listing {
  id: string
  title: string
  slug: string
  businessType: string
  askingPrice: number | null
  mrr: number | null
  revenueTtm: number | null
  trafficTtm: number | null
  highlights: string[]
  images: { url: string; alt: string | null }[]
  featured: boolean
  _count: { savedListings: number }
}

interface FilterState {
  q: string
  type: string
  minPrice: string
  maxPrice: string
  minMRR: string
  minRevenue: string
  maxRevenue: string
  minTraffic: string
  isAiRelated: string
  workload: string
  sort: string
}

export function BrowseContent() {
  const searchParams = useSearchParams()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 51,
    total: 0,
    totalPages: 1
  })

  const [filters, setFilters] = useState<FilterState>({
    q: searchParams.get('q') || '',
    type: searchParams.get('type') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    minMRR: searchParams.get('minMRR') || '',
    minRevenue: searchParams.get('minRevenue') || '',
    maxRevenue: searchParams.get('maxRevenue') || '',
    minTraffic: searchParams.get('minTraffic') || '',
    isAiRelated: searchParams.get('isAiRelated') || '',
    workload: searchParams.get('workload') || '',
    sort: searchParams.get('sort') || 'newest',
  })

  useEffect(() => {
    fetchListings()

    // Update URL to reflect current filters
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value)
    })
    window.history.replaceState({}, '', `/browse?${params}`)
  }, [filters.q, filters.type, filters.minPrice, filters.maxPrice, filters.minMRR, filters.minRevenue, filters.maxRevenue, filters.minTraffic, filters.isAiRelated, filters.workload, filters.sort, pagination.page])

  const fetchListings = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })
      params.append('pageSize', '51')
      params.append('page', pagination.page.toString())

      const response = await fetch(`/api/listings?${params}`)
      const data = await response.json()

      // Process listings to parse JSON fields for SQLite
      const safeJsonParse = (val: unknown, fallback: unknown[] = []) => {
        if (Array.isArray(val)) return val
        if (typeof val === 'string') {
          try { return JSON.parse(val || '[]') } catch { return fallback }
        }
        return fallback
      }

      const processedListings = (data.listings || []).map((listing: any) => ({
        ...listing,
        highlights: safeJsonParse(listing.highlights),
        monetization: safeJsonParse(listing.monetization),
        techStack: safeJsonParse(listing.techStack),
        platform: safeJsonParse(listing.platform),
      }))

      setListings(processedListings)
      setPagination(data.pagination || pagination)
    } catch {
      // Failed to fetch listings
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }


  const getFeaturedImage = (listing: Listing) => {
    if (listing.images && listing.images.length > 0) {
      return {
        url: listing.images[0].url,
        alt: listing.images[0].alt || listing.title
      }
    }
    return {
      url: getPlaceholderImage(listing.businessType),
      alt: `${listing.businessType} Business Placeholder`
    }
  }


  const clearFilters = () => {
    setFilters({
      q: '',
      type: '',
      minPrice: '',
      maxPrice: '',
      minMRR: '',
      minRevenue: '',
      maxRevenue: '',
      minTraffic: '',
      isAiRelated: '',
      workload: '',
      sort: 'newest',
    })
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Modern Filters Sidebar */}
      <div className={`lg:w-80 ${showFilters ? 'block' : 'hidden lg:block'}`}>
        <div className="sticky top-4 space-y-4">
          {/* Filter Header */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-900">Filters</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              </CardTitle>
            </CardHeader>
          </Card>

          {/* Search */}
          <Card>
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search businesses..."
                  value={filters.q}
                  onChange={(e) => handleFilterChange('q', e.target.value)}
                  className="pl-10 border-2 focus:border-blue-500 transition-colors"
                />
              </div>
            </CardContent>
          </Card>

          {/* Business Type */}
          <Card>
            <CardContent className="pt-6">
              <label className="text-sm font-semibold mb-3 block flex items-center gap-2">
                <Globe className="w-4 h-4 text-green-600" />
                Business Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: '', label: 'All', icon: '🌐' },
                  { value: 'SAAS', label: 'SaaS', icon: '💻' },
                  { value: 'ECOMMERCE', label: 'eCommerce', icon: '🛒' },
                  { value: 'AMAZON', label: 'Amazon', icon: '📦' },
                  { value: 'CONTENT', label: 'Content', icon: '📝' },
                  { value: 'MOBILE_APP', label: 'Mobile', icon: '📱' },
                ].map((type) => (
                  <button
                    key={type.value}
                    onClick={() => handleFilterChange('type', type.value)}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 text-center hover:scale-105 ${
                      filters.type === type.value
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    <div className="text-lg mb-1">{type.icon}</div>
                    <div className="text-xs font-medium text-gray-700">{type.label}</div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Filter */}
          <Card>
            <CardContent className="pt-6">
              <label className="text-sm font-semibold mb-3 block flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                AI Technology
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: '', label: 'All', icon: '🤖' },
                  { value: 'true', label: 'AI-Powered', icon: '✨' },
                  { value: 'false', label: 'Traditional', icon: '🏢' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleFilterChange('isAiRelated', option.value)}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 text-center hover:scale-105 ${
                      filters.isAiRelated === option.value
                        ? 'border-purple-500 bg-purple-50 shadow-md'
                        : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                    }`}
                  >
                    <div className="text-lg mb-1">{option.icon}</div>
                    <div className="text-xs font-medium text-gray-700">{option.label}</div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Price Range */}
          <Card>
            <CardContent className="pt-6">
              <label className="text-sm font-semibold mb-3 block flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                Asking Price
              </label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="relative flex-1">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { label: 'Under $50K', min: '', max: '50000' },
                    { label: '$50K - $200K', min: '50000', max: '200000' },
                    { label: '$200K - $500K', min: '200000', max: '500000' },
                    { label: '$500K+', min: '500000', max: '' },
                  ].map((range) => (
                    <button
                      key={range.label}
                      onClick={() => {
                        handleFilterChange('minPrice', range.min)
                        handleFilterChange('maxPrice', range.max)
                      }}
                      className="p-2 text-xs rounded-md border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors"
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Revenue & MRR */}
          <Card>
            <CardContent className="pt-6">
              <label className="text-sm font-semibold mb-3 block flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                Revenue
              </label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min Revenue"
                    value={filters.minRevenue}
                    onChange={(e) => handleFilterChange('minRevenue', e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="Max Revenue"
                    value={filters.maxRevenue}
                    onChange={(e) => handleFilterChange('maxRevenue', e.target.value)}
                  />
                </div>
                <Input
                  type="number"
                  placeholder="Min MRR"
                  value={filters.minMRR}
                  onChange={(e) => handleFilterChange('minMRR', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Traffic & Workload */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold mb-2 block flex items-center gap-2">
                    <Users className="w-4 h-4 text-orange-600" />
                    Min Monthly Traffic
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g. 10000"
                    value={filters.minTraffic}
                    onChange={(e) => handleFilterChange('minTraffic', e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold mb-2 block flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-600" />
                    Owner Workload
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: '', label: 'Any' },
                      { value: 'low', label: '<10h/wk' },
                      { value: 'medium', label: '10-30h' },
                      { value: 'high', label: '30h+' },
                    ].map((level) => (
                      <button
                        key={level.value}
                        onClick={() => handleFilterChange('workload', level.value)}
                        className={`p-2 rounded-md border-2 transition-all text-xs font-medium ${
                          filters.workload === level.value
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {level.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sort */}
          <Card>
            <CardContent className="pt-6">
              <label className="text-sm font-semibold mb-3 block flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-600" />
                Sort By
              </label>
              <select
                className="w-full p-3 border-2 rounded-lg focus:border-blue-500 transition-colors"
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
              >
                <option value="newest">🆕 Newest First</option>
                <option value="price_low">💰 Price: Low to High</option>
                <option value="price_high">💎 Price: High to Low</option>
                <option value="mrr_high">📈 MRR: High to Low</option>
                <option value="revenue_high">🚀 Revenue: High to Low</option>
                <option value="popular">❤️ Most Popular</option>
              </select>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Listings Grid */}
      <div className="flex-1">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-4">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="w-full"
          >
            <Filter className="w-4 h-4 mr-2" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="w-full h-48 bg-gray-200 rounded-lg mb-4" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded" />
                    <div className="h-3 bg-gray-200 rounded w-2/3" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No businesses found</h3>
            <p className="text-gray-600">Try adjusting your filters or search terms.</p>
            <Button onClick={clearFilters} className="mt-4">
              Clear Filters
            </Button>
          </div>
        ) : (
          <>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <Card key={listing.id} className={`relative hover:shadow-lg transition-shadow ${listing.featured ? 'ring-2 ring-yellow-400 bg-gradient-to-br from-yellow-50 to-white' : ''}`}>
                  {listing.featured && (
                    <div className="absolute top-2 right-2 z-10">
                      <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white shadow-md">
                        <Star className="w-3 h-3 mr-1 fill-current" />
                        Featured
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="pb-4">
                    <Link href={`/listings/${listing.slug}`} className="block">
                      <div className="w-full h-48 bg-gray-200 rounded-lg mb-4 overflow-hidden hover:opacity-90 transition-opacity">
                        <ListingImage
                          src={getFeaturedImage(listing).url}
                          alt={getFeaturedImage(listing).alt}
                          className="w-full h-full object-cover"
                          businessType={listing.businessType}
                        />
                      </div>
                    </Link>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{listing.businessType}</Badge>
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <Heart className="w-4 h-4" />
                        <span>{listing._count.savedListings}</span>
                      </div>
                    </div>
                    <CardTitle className="text-lg line-clamp-2">
                      <Link href={`/listings/${listing.slug}`} className="hover:text-blue-600 transition-colors">
                        {listing.title}
                      </Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Asking Price</span>
                        <span className="font-semibold">
                          {listing.askingPrice ? formatCurrency(listing.askingPrice) : 'Open to offers'}
                        </span>
                      </div>
                      {listing.mrr && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">MRR</span>
                          <span className="font-semibold">{formatCurrency(listing.mrr)}</span>
                        </div>
                      )}
                      {listing.trafficTtm && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Monthly Traffic</span>
                          <span className="font-semibold">{formatNumber(listing.trafficTtm / 12)}</span>
                        </div>
                      )}
                    </div>

                    {listing.highlights.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {listing.highlights[0]}
                        </p>
                      </div>
                    )}

                    <Button asChild className="w-full">
                      <Link href={`/listings/${listing.slug}`}>View Details</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="mt-8 flex justify-center items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                  disabled={pagination.page <= 1}
                >
                  Previous
                </Button>

                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const pageNum = i + 1
                    const isActive = pageNum === pagination.page
                    return (
                      <Button
                        key={pageNum}
                        variant={isActive ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                  {pagination.totalPages > 5 && (
                    <>
                      <span className="px-2">...</span>
                      <Button
                        variant={pagination.page === pagination.totalPages ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPagination(prev => ({ ...prev, page: pagination.totalPages }))}
                      >
                        {pagination.totalPages}
                      </Button>
                    </>
                  )}
                </div>

                <Button
                  variant="outline"
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
                  disabled={pagination.page >= pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}