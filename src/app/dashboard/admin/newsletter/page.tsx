'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Mail, Users, Eye, MousePointer, UserX, TrendingUp } from 'lucide-react'

interface NewsletterSubscriber {
  id: string
  email: string
  name: string | null
  subscribedAt: string
  status: string
  emailsSent: Array<{
    id: string
    subject: string
    sentAt: string
    openedAt: string | null
    clickedAt: string | null
  }>
  _count: {
    emailsSent: number
  }
}

interface NewsletterStats {
  totalSubscribers: number
  totalUnsubscribed: number
  totalEmailsSent: number
  totalOpened: number
  totalClicked: number
}

export default function NewsletterManagementPage() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([])
  const [stats, setStats] = useState<NewsletterStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const response = await fetch('/api/admin/newsletter')
      if (response.ok) {
        const data = await response.json()
        setSubscribers(data.subscribers)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to fetch newsletter data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  const openRate = stats && stats.totalEmailsSent > 0
    ? ((stats.totalOpened / stats.totalEmailsSent) * 100).toFixed(1)
    : '0'

  const clickRate = stats && stats.totalEmailsSent > 0
    ? ((stats.totalClicked / stats.totalEmailsSent) * 100).toFixed(1)
    : '0'

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Newsletter Management</h1>
        <p className="text-gray-600">
          Manage subscribers and track email performance
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Active Subscribers</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalSubscribers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Mail className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Emails Sent</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalEmailsSent}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Eye className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Open Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{openRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <MousePointer className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Click Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{clickRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-red-100 rounded-lg">
                  <UserX className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Unsubscribed</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUnsubscribed}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Subscribers List */}
      <Card>
        <CardHeader>
          <CardTitle>Subscribers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Subscribed</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Emails Sent</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Last Activity</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map((subscriber) => {
                  const lastEmail = subscriber.emailsSent[0]
                  return (
                    <tr key={subscriber.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-900">{subscriber.email}</td>
                      <td className="py-3 px-4 text-gray-600">{subscriber.name || '-'}</td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={subscriber.status === 'ACTIVE' ? 'default' : 'secondary'}
                        >
                          {subscriber.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {formatDate(subscriber.subscribedAt)}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {subscriber._count.emailsSent}
                      </td>
                      <td className="py-3 px-4">
                        {lastEmail ? (
                          <div className="space-y-1">
                            <div className="text-sm text-gray-900">
                              {lastEmail.subject}
                            </div>
                            <div className="text-xs text-gray-500">
                              Sent: {formatDate(lastEmail.sentAt)}
                            </div>
                            <div className="flex gap-2">
                              {lastEmail.openedAt && (
                                <Badge variant="outline" className="text-xs">
                                  <Eye className="w-3 h-3 mr-1" />
                                  Opened
                                </Badge>
                              )}
                              {lastEmail.clickedAt && (
                                <Badge variant="outline" className="text-xs">
                                  <MousePointer className="w-3 h-3 mr-1" />
                                  Clicked
                                </Badge>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">No emails sent</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {subscribers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No subscribers yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
