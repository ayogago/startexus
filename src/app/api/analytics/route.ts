import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'SELLER' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const userId = session.user.id

    // Get all listings for the seller
    const listings = await prisma.listing.findMany({
      where: { sellerId: userId },
      include: {
        _count: {
          select: {
            savedListings: true,
            threads: true,
            viewEvents: true,
          },
        },
      },
      orderBy: { views: 'desc' },
    })

    // Total views across all listings
    const totalViews = listings.reduce((sum, listing) => sum + listing.views, 0)

    // Total messages received (messages in threads related to seller's listings)
    const totalMessages = await prisma.message.count({
      where: {
        thread: {
          listing: {
            sellerId: userId,
          },
        },
        senderId: {
          not: userId,
        },
      },
    })

    // Total saves by others
    const totalSaves = listings.reduce((sum, listing) => sum + listing._count.savedListings, 0)

    // Average rating from reviews
    const reviews = await prisma.review.findMany({
      where: {
        targetId: userId,
        status: 'PUBLISHED',
      },
      select: { rating: true },
    })

    const averageRating = reviews.length > 0
      ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
      : 0

    // Views over time (last 30 days, grouped by day)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    thirtyDaysAgo.setHours(0, 0, 0, 0)

    const listingIds = listings.map(l => l.id)

    const viewEvents = await prisma.viewEvent.findMany({
      where: {
        listingId: { in: listingIds },
        createdAt: { gte: thirtyDaysAgo },
      },
      select: {
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    })

    // Group view events by day
    const viewsByDay: Record<string, number> = {}
    for (let i = 0; i < 30; i++) {
      const date = new Date()
      date.setDate(date.getDate() - (29 - i))
      const key = date.toISOString().split('T')[0]
      viewsByDay[key] = 0
    }

    for (const event of viewEvents) {
      const key = event.createdAt.toISOString().split('T')[0]
      if (viewsByDay[key] !== undefined) {
        viewsByDay[key]++
      }
    }

    const viewsOverTime = Object.entries(viewsByDay).map(([date, count]) => ({
      date,
      count,
    }))

    // Top performing listing
    const topListing = listings.length > 0 ? listings[0] : null

    // Listing-level stats
    const listingStats = listings.map((listing) => ({
      id: listing.id,
      title: listing.title,
      slug: listing.slug,
      status: listing.status,
      views: listing.views,
      saves: listing._count.savedListings,
      messages: listing._count.threads,
      viewEvents: listing._count.viewEvents,
    }))

    return NextResponse.json({
      totalViews,
      totalMessages,
      totalSaves,
      averageRating,
      totalReviews: reviews.length,
      viewsOverTime,
      topListing: topListing ? {
        id: topListing.id,
        title: topListing.title,
        slug: topListing.slug,
        views: topListing.views,
      } : null,
      listings: listingStats,
    })
  } catch (error) {
    console.error('Failed to fetch analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
