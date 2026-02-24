'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Star, MessageSquare } from 'lucide-react'

interface ReviewAuthor {
  id: string
  name: string | null
  avatarUrl: string | null
  handle: string | null
}

interface ReviewTarget {
  id: string
  name: string | null
  avatarUrl: string | null
}

interface ReviewListing {
  id: string
  title: string
  slug: string
}

interface Review {
  id: string
  createdAt: string
  rating: number
  title: string
  content: string
  response: string | null
  respondedAt: string | null
  status: string
  author: ReviewAuthor
  target: ReviewTarget
  listing: ReviewListing | null
}

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) {
  const sizeClass = size === 'lg' ? 'w-6 h-6' : 'w-4 h-4'
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClass} ${
            star <= rating
              ? 'text-yellow-400 fill-yellow-400'
              : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  )
}

function ReviewCard({
  review,
  isReceived,
  onRespond,
}: {
  review: Review
  isReceived: boolean
  onRespond?: (reviewId: string, response: string) => Promise<void>
}) {
  const [showResponseForm, setShowResponseForm] = useState(false)
  const [responseText, setResponseText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmitResponse = async () => {
    if (!responseText.trim() || !onRespond) return
    setSubmitting(true)
    try {
      await onRespond(review.id, responseText.trim())
      setShowResponseForm(false)
      setResponseText('')
    } catch {
      // Error handled in parent
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              {review.author.avatarUrl ? (
                <img
                  src={review.author.avatarUrl}
                  alt={review.author.name || 'User'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-sm font-medium text-gray-600">
                  {(review.author.name || 'U').charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <p className="font-medium text-sm">
                {isReceived ? review.author.name || 'Anonymous' : `To: ${review.target.name || 'User'}`}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(review.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
          <StarRating rating={review.rating} />
        </div>

        {review.listing && (
          <Badge variant="outline" className="mb-2 text-xs">
            {review.listing.title}
          </Badge>
        )}

        <h4 className="font-semibold mb-1">{review.title}</h4>
        <p className="text-gray-700 text-sm mb-4">{review.content}</p>

        {/* Seller Response */}
        {review.response && (
          <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">Seller Response</span>
              {review.respondedAt && (
                <span className="text-xs text-gray-500">
                  {new Date(review.respondedAt).toLocaleDateString()}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-700">{review.response}</p>
          </div>
        )}

        {/* Response Form (only for received reviews without a response) */}
        {isReceived && !review.response && onRespond && (
          <div className="mt-4">
            {!showResponseForm ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowResponseForm(true)}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Respond to Review
              </Button>
            ) : (
              <div className="space-y-3">
                <Textarea
                  placeholder="Write your response to this review..."
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleSubmitResponse}
                    disabled={submitting || !responseText.trim()}
                  >
                    {submitting ? 'Submitting...' : 'Submit Response'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowResponseForm(false)
                      setResponseText('')
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function ReviewsPage() {
  const [receivedReviews, setReceivedReviews] = useState<Review[]>([])
  const [writtenReviews, setWrittenReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'received' | 'written'>('received')
  const [averageRating, setAverageRating] = useState(0)
  const [totalReceived, setTotalReceived] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch current user info first to get userId
      const sessionRes = await fetch('/api/user/profile')
      if (!sessionRes.ok) {
        setError('Please sign in to view reviews')
        setLoading(false)
        return
      }
      const sessionData = await sessionRes.json()
      const userId = sessionData.user?.id || sessionData.id

      if (!userId) {
        setError('Please sign in to view reviews')
        setLoading(false)
        return
      }

      // Fetch received reviews
      const receivedRes = await fetch(`/api/reviews?targetId=${userId}`)
      const receivedData = await receivedRes.json()

      setReceivedReviews(receivedData.reviews || [])
      setAverageRating(receivedData.averageRating || 0)
      setTotalReceived(receivedData.totalReviews || 0)

      // We need to fetch written reviews differently - get all reviews and filter
      // Since we don't have a separate endpoint, we'll use the reviews list
      // Actually, we can look at the received reviews author data to determine written ones
      // For written reviews, we need all reviews where the author is the current user
      // The API doesn't support authorId filter directly, so let's get all reviews
      // and the client already has userId from the session

      // Workaround: Fetch reviews where we might be the author
      // Since we don't have a ?authorId param, let's add logic here
      // We'll fetch all reviews and filter client-side from the received data
      // Actually, the received reviews already filtered by targetId
      // We need a separate approach for written reviews

      // For now we'll just set the ones we've written from the data available
      // A better approach is to modify the API, but let's fetch and filter
      const allRes = await fetch('/api/reviews')
      const allData = await allRes.json()
      const written = (allData.reviews || []).filter(
        (r: Review) => r.author.id === userId
      )
      setWrittenReviews(written)
    } catch {
      setError('Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }

  const handleRespond = async (reviewId: string, response: string) => {
    const res = await fetch(`/api/reviews/${reviewId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ response }),
    })

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'Failed to submit response')
    }

    // Update the review in state
    const updatedReview = await res.json()
    setReceivedReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, ...updatedReview } : r))
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Reviews</h1>
          <p className="text-gray-600">Manage your reviews</p>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Reviews</h1>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentReviews = activeTab === 'received' ? receivedReviews : writtenReviews

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reviews</h1>
        <p className="text-gray-600">Manage your reviews and ratings</p>
      </div>

      {/* Average Rating Summary */}
      {totalReceived > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900">{averageRating}</div>
                <StarRating rating={Math.round(averageRating)} size="lg" />
                <p className="text-sm text-gray-500 mt-1">
                  {totalReceived} review{totalReceived !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="flex-1">
                {/* Rating distribution */}
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = receivedReviews.filter((r) => r.rating === star).length
                  const percentage = totalReceived > 0 ? (count / totalReceived) * 100 : 0
                  return (
                    <div key={star} className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-gray-600 w-4">{star}</span>
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-400 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-8">{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('received')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'received'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Reviews Received ({receivedReviews.length})
        </button>
        <button
          onClick={() => setActiveTab('written')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'written'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Reviews Written ({writtenReviews.length})
        </button>
      </div>

      {/* Reviews List */}
      {currentReviews.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {activeTab === 'received' ? 'No reviews received yet' : 'No reviews written yet'}
            </h3>
            <p className="text-gray-600">
              {activeTab === 'received'
                ? 'Reviews from buyers will appear here after completed deals.'
                : 'After completing a deal, you can leave a review for the seller.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {currentReviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              isReceived={activeTab === 'received'}
              onRespond={activeTab === 'received' ? handleRespond : undefined}
            />
          ))}
        </div>
      )}
    </div>
  )
}
