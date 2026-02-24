'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import {
  Phone,
  Calendar,
  Clock,
  User,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Video,
} from 'lucide-react'

interface ScheduledCall {
  id: string
  createdAt: string
  scheduledAt: string
  duration: number
  title: string
  notes: string | null
  meetingLink: string | null
  status: string
  scheduler: {
    id: string
    name: string | null
    email: string
    avatarUrl: string | null
  }
  receiver: {
    id: string
    name: string | null
    email: string
    avatarUrl: string | null
  }
  deal: {
    id: string
    stage: string
    listing: {
      id: string
      title: string
      slug: string
    }
  } | null
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
}

export default function CallsPage() {
  const { data: session } = useSession()
  const [calls, setCalls] = useState<ScheduledCall[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming')

  useEffect(() => {
    fetchCalls()
  }, [])

  const fetchCalls = async () => {
    try {
      const res = await fetch('/api/calls')
      if (res.ok) {
        const data = await res.json()
        setCalls(data.calls || [])
      }
    } catch (error) {
      console.error('Failed to fetch calls:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateCallStatus = async (callId: string, status: string) => {
    try {
      const res = await fetch(`/api/calls/${callId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      if (res.ok) {
        await fetchCalls()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to update call')
      }
    } catch (error) {
      console.error('Failed to update call:', error)
    }
  }

  const now = new Date()
  const upcomingCalls = calls.filter(
    (c) =>
      new Date(c.scheduledAt) >= now &&
      c.status !== 'COMPLETED' &&
      c.status !== 'CANCELLED'
  )
  const pastCalls = calls.filter(
    (c) =>
      new Date(c.scheduledAt) < now ||
      c.status === 'COMPLETED' ||
      c.status === 'CANCELLED'
  )

  const displayedCalls = activeTab === 'upcoming' ? upcomingCalls : pastCalls

  if (loading || !session) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Scheduled Calls</h1>
          <p className="text-gray-600">Manage your scheduled calls</p>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-1/3" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
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
        <h1 className="text-3xl font-bold">Scheduled Calls</h1>
        <p className="text-gray-600">Manage your scheduled calls and meetings</p>
      </div>

      {/* Tab buttons */}
      <div className="flex gap-2">
        <Button
          variant={activeTab === 'upcoming' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('upcoming')}
        >
          Upcoming ({upcomingCalls.length})
        </Button>
        <Button
          variant={activeTab === 'past' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('past')}
        >
          Past ({pastCalls.length})
        </Button>
      </div>

      {calls.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Phone className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No scheduled calls
            </h3>
            <p className="text-gray-600 mb-6">
              Schedule calls from your deal pages to discuss acquisitions.
            </p>
            <Button asChild variant="outline">
              <Link href="/dashboard/deals">View Your Deals</Link>
            </Button>
          </CardContent>
        </Card>
      ) : displayedCalls.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">
              {activeTab === 'upcoming'
                ? 'No upcoming calls scheduled'
                : 'No past calls'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {displayedCalls.map((call) => {
            const isScheduler = call.scheduler.id === session?.user?.id
            const otherPerson = isScheduler ? call.receiver : call.scheduler
            const canUpdateStatus =
              call.status !== 'COMPLETED' && call.status !== 'CANCELLED'
            const callDate = new Date(call.scheduledAt)
            const isToday = callDate.toDateString() === now.toDateString()
            const isPast = callDate < now

            return (
              <Card
                key={call.id}
                className={`${
                  isToday && canUpdateStatus
                    ? 'ring-2 ring-blue-200 bg-blue-50/30'
                    : ''
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    {/* Call info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Video className="w-5 h-5 text-gray-400" />
                        <h3 className="font-semibold text-lg">{call.title}</h3>
                        <Badge
                          className={
                            STATUS_COLORS[call.status] ||
                            'bg-gray-100 text-gray-800'
                          }
                        >
                          {call.status}
                        </Badge>
                        {isToday && canUpdateStatus && (
                          <Badge className="bg-blue-500 text-white">
                            Today
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-2">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {callDate.toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {callDate.toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}{' '}
                          ({call.duration} min)
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <User className="w-4 h-4" />
                          with{' '}
                          <span className="font-medium">
                            {otherPerson.name || otherPerson.email}
                          </span>
                        </span>
                      </div>

                      {call.deal && (
                        <div className="text-sm text-gray-500 mb-2">
                          Deal:{' '}
                          <Link
                            href={`/dashboard/deals/${call.deal.id}`}
                            className="text-blue-600 hover:underline"
                          >
                            {call.deal.listing.title}
                          </Link>
                        </div>
                      )}

                      {call.notes && (
                        <p className="text-sm text-gray-500 mt-1 p-2 bg-gray-50 rounded">
                          {call.notes}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                      {call.meetingLink && (
                        <Button size="sm" asChild>
                          <a
                            href={call.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Video className="w-4 h-4 mr-1" />
                            Join Call
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </a>
                        </Button>
                      )}

                      {canUpdateStatus && (
                        <>
                          {call.status === 'PENDING' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                updateCallStatus(call.id, 'CONFIRMED')
                              }
                            >
                              <CheckCircle2 className="w-4 h-4 mr-1" />
                              Confirm
                            </Button>
                          )}
                          {(call.status === 'PENDING' ||
                            call.status === 'CONFIRMED') && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  updateCallStatus(call.id, 'COMPLETED')
                                }
                              >
                                <CheckCircle2 className="w-4 h-4 mr-1" />
                                Mark Complete
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  updateCallStatus(call.id, 'CANCELLED')
                                }
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Cancel
                              </Button>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
