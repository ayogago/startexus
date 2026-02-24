import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { FileText, MessageSquare, Heart, Eye, TrendingUp } from 'lucide-react'

async function getDashboardStats(userId: string, userRole: string) {
  const stats = {
    listings: 0,
    messages: 0,
    saved: 0,
    totalViews: 0,
  }

  if (userRole === 'SELLER' || userRole === 'ADMIN') {
    const listings = await prisma.listing.findMany({
      where: { sellerId: userId },
      select: { views: true },
    })
    stats.listings = listings.length
    stats.totalViews = listings.reduce((sum, listing) => sum + listing.views, 0)
  }

  const [messageCount, savedCount] = await Promise.all([
    prisma.threadParticipant.count({
      where: { userId },
    }),
    prisma.savedListing.count({
      where: { userId },
    }),
  ])

  stats.messages = messageCount
  stats.saved = savedCount

  return stats
}

async function getRecentActivity(userId: string, userRole: string) {
  const activities = []

  if (userRole === 'SELLER' || userRole === 'ADMIN') {
    const recentListings = await prisma.listing.findMany({
      where: { sellerId: userId },
      orderBy: { createdAt: 'desc' },
      take: 3,
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        views: true,
      },
    })

    activities.push(...recentListings.map(listing => ({
      type: 'listing',
      title: listing.title,
      status: listing.status,
      createdAt: listing.createdAt,
      views: listing.views,
    })))
  }

  const recentMessages = await prisma.message.findMany({
    where: { senderId: userId },
    orderBy: { createdAt: 'desc' },
    take: 3,
    include: {
      thread: {
        include: {
          listing: {
            select: { title: true },
          },
        },
      },
    },
  })

  activities.push(...recentMessages.map(message => ({
    type: 'message',
    title: `Message about ${message.thread.listing.title}`,
    createdAt: message.createdAt,
  })))

  return activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5)
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return <div>Loading...</div>
  }

  const [stats, recentActivity] = await Promise.all([
    getDashboardStats(session.user.id, session.user.role),
    getRecentActivity(session.user.id, session.user.role),
  ])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {session.user.name || session.user.email}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {(session.user.role === 'SELLER' || session.user.role === 'ADMIN') && (
          <>
            <Link href="/dashboard/listings">
              <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">My Listings</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.listings}</div>
                  <p className="text-xs text-muted-foreground">Active listings</p>
                </CardContent>
              </Card>
            </Link>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalViews}</div>
                <p className="text-xs text-muted-foreground">Across all listings</p>
              </CardContent>
            </Card>
          </>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.messages}</div>
            <p className="text-xs text-muted-foreground">Active conversations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saved</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.saved}</div>
            <p className="text-xs text-muted-foreground">Saved listings</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks to get you started</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {(session.user.role === 'SELLER' || session.user.role === 'ADMIN') && (
              <>
                <Button asChild>
                  <Link href="/dashboard/listings/new">Create New Listing</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/dashboard/listings">View My Listings</Link>
                </Button>
              </>
            )}
            <Button variant="outline" asChild>
              <Link href="/browse">Browse Businesses</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/messages">Check Messages</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/profile">Update Profile</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest actions on the platform</CardDescription>
        </CardHeader>
        <CardContent>
          {recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    {activity.type === 'listing' ? (
                      <FileText className="w-4 h-4 text-blue-600" />
                    ) : (
                      <MessageSquare className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {activity.type === 'listing' && (
                    <div className="text-sm text-gray-500">
                      {(activity as any).views || 0} views
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No recent activity</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}