'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { Heart, Eye, MessageSquare } from 'lucide-react'

interface SavedListing {
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
  _count: { savedListings: number }
  views: number
}

export default function SavedListingsPage() {
  const [listings, setListings] = useState<SavedListing[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSavedListings()
  }, [])

  const fetchSavedListings = async () => {
    try {
      const response = await fetch('/api/save')
      const data = await response.json()
      setListings(data.savedListings || [])
    } catch (error) {
      console.error('Failed to fetch saved listings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUnsave = async (listingId: string) => {
    try {
      const response = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId }),
      })

      if (response.ok) {
        setListings(listings.filter(listing => listing.id !== listingId))
      }
    } catch (error) {
      console.error('Failed to unsave listing:', error)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Saved Listings</h1>
          <p className="text-gray-600">Businesses you've saved for later</p>
        </div>

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
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Saved Listings</h1>
        <p className="text-gray-600">Businesses you've saved for later</p>
      </div>

      {listings.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No saved listings yet</h3>
            <p className="text-gray-600 mb-6">
              Start exploring businesses and save the ones that interest you.
            </p>
            <Button asChild>
              <Link href="/browse">Browse Businesses</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <p className="text-gray-600">{listings.length} saved listing{listings.length !== 1 ? 's' : ''}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <Card key={listing.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="w-full h-48 bg-gray-200 rounded-lg mb-4 overflow-hidden">
                    {listing.images[0] ? (
                      <img
                        src={listing.images[0].url}
                        alt={listing.images[0].alt || listing.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <div className="text-center">
                          <div className="text-3xl mb-2">🏢</div>
                          <p className="text-sm">{listing.businessType}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between items-start">
                    <Badge variant="outline">{listing.businessType}</Badge>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <Eye className="w-4 h-4" />
                        <span>{listing.views}</span>
                      </div>
                      <button
                        onClick={() => handleUnsave(listing.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Heart className="w-4 h-4 fill-current" />
                      </button>
                    </div>
                  </div>
                  <CardTitle className="text-lg line-clamp-2">{listing.title}</CardTitle>
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

                  <div className="flex space-x-2">
                    <Button asChild className="flex-1">
                      <Link href={`/listings/${listing.slug}`}>View Details</Link>
                    </Button>
                    <Button variant="outline" size="icon" asChild>
                      <Link href={`/dashboard/messages?listing=${listing.id}`}>
                        <MessageSquare className="w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}