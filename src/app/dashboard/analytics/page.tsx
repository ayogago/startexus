'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Eye, MessageSquare, Heart, Star, TrendingUp, BarChart3 } from 'lucide-react'

interface ListingStat {
  id: string
  title: string
  slug: string
  status: string
  views: number
  saves: number
  messages: number
  viewEvents: number
}

interface ViewDay {
  date: string
  count: number
}

interface TopListing {
  id: string
  title: string
  slug: string
  views: number
}

interface AnalyticsData {
  totalViews: number
  totalMessages: number
  totalSaves: number
  averageRating: number
  totalReviews: number
  viewsOverTime: ViewDay[]
  topListing: TopListing | null
  listings: ListingStat[]
}

function ViewsChart({ data }: { data: ViewDay[] }) {
  const maxCount = Math.max(...data.map((d) => d.count), 1)

  return (
    <div className="w-full">
      <div className="flex items-end gap-1 h-48 px-2">
        {data.map((day, index) => {
          const heightPercent = maxCount > 0 ? (day.count / maxCount) * 100 : 0
          const date = new Date(day.date + 'T00:00:00')
          const isLabelDay = index % 5 === 0 || index === data.length - 1

          return (
            <div key={day.date} className="flex-1 flex flex-col items-center group relative">
              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 hidden group-hover:block z-10">
                <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                  {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}: {day.count} view{day.count !== 1 ? 's' : ''}
                </div>
              </div>
              {/* Bar */}
              <div
                className="w-full bg-blue-500 hover:bg-blue-600 rounded-t transition-colors cursor-pointer min-h-[2px]"
                style={{ height: `${Math.max(heightPercent, 1)}%` }}
              />
            </div>
          )
        })}
      </div>
      {/* X-axis labels */}
      <div className="flex gap-1 px-2 mt-1">
        {data.map((day, index) => {
          const date = new Date(day.date + 'T00:00:00')
          const isLabelDay = index % 5 === 0 || index === data.length - 1

          return (
            <div key={day.date} className="flex-1 text-center">
              {isLabelDay && (
                <span className="text-xs text-gray-500">
                  {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function getStatusColor(status: string) {
  switch (status) {
    case 'PUBLISHED':
      return 'bg-green-100 text-green-800'
    case 'DRAFT':
      return 'bg-gray-100 text-gray-800'
    case 'PENDING_REVIEW':
      return 'bg-yellow-100 text-yellow-800'
    case 'SOLD':
      return 'bg-blue-100 text-blue-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/analytics')
      if (!res.ok) {
        if (res.status === 401) {
          setError('Please sign in to view analytics')
        } else if (res.status === 403) {
          setError('Analytics are only available for sellers')
        } else {
          setError('Failed to load analytics')
        }
        return
      }
      const data = await res.json()
      setAnalytics(data)
    } catch {
      setError('Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-gray-600">Track your listing performance</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-5 bg-gray-200 rounded w-1/4" />
          </CardHeader>
          <CardContent>
            <div className="h-48 bg-gray-200 rounded" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!analytics) return null

  const totalViewsLast30 = analytics.viewsOverTime.reduce((sum, d) => sum + d.count, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-gray-600">Track your listing performance and engagement</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {totalViewsLast30} in last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalMessages.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">From potential buyers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saves</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalSaves.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Listings saved by users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">
                {analytics.averageRating > 0 ? analytics.averageRating : '--'}
              </span>
              {analytics.averageRating > 0 && (
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.totalReviews} review{analytics.totalReviews !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Listing */}
      {analytics.topListing && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-lg">Top Performing Listing</CardTitle>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{analytics.topListing.title}</p>
                <p className="text-sm text-gray-500">/listings/{analytics.topListing.slug}</p>
              </div>
              <div className="flex items-center gap-1 text-gray-600">
                <Eye className="w-4 h-4" />
                <span className="font-medium">{analytics.topListing.views.toLocaleString()} views</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Views Over Time Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Views Over Time</CardTitle>
            <Badge variant="outline" className="font-normal">
              Last 30 Days
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {analytics.viewsOverTime.length > 0 ? (
            <ViewsChart data={analytics.viewsOverTime} />
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-500">
              <p>No view data available yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Listings Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Listing Performance</CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.listings.length === 0 ? (
            <div className="text-center py-8">
              <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No listings yet. Create a listing to start tracking analytics.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Listing</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Status</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-gray-500">
                      <div className="flex items-center justify-end gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        Views
                      </div>
                    </th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-gray-500">
                      <div className="flex items-center justify-end gap-1">
                        <Heart className="w-3.5 h-3.5" />
                        Saves
                      </div>
                    </th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-gray-500">
                      <div className="flex items-center justify-end gap-1">
                        <MessageSquare className="w-3.5 h-3.5" />
                        Threads
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.listings.map((listing) => (
                    <tr key={listing.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-2">
                        <p className="font-medium text-sm line-clamp-1">{listing.title}</p>
                        <p className="text-xs text-gray-500">/listings/{listing.slug}</p>
                      </td>
                      <td className="py-3 px-2">
                        <Badge className={getStatusColor(listing.status)}>
                          {listing.status.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 text-right font-medium text-sm">
                        {listing.views.toLocaleString()}
                      </td>
                      <td className="py-3 px-2 text-right font-medium text-sm">
                        {listing.saves.toLocaleString()}
                      </td>
                      <td className="py-3 px-2 text-right font-medium text-sm">
                        {listing.messages.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
