import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { listingId } = await request.json()

    if (!listingId) {
      return NextResponse.json({ error: 'Listing ID is required' }, { status: 400 })
    }

    // Check if the listing exists and is published
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: { seller: true },
    })

    if (!listing || listing.status !== 'PUBLISHED') {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    // Prevent seller from messaging themselves
    if (listing.sellerId === session.user.id) {
      return NextResponse.json({ error: 'Cannot message yourself' }, { status: 400 })
    }

    // Check if a thread already exists between this buyer and seller for this listing
    let thread = await prisma.thread.findFirst({
      where: {
        listingId,
        participants: {
          every: {
            userId: {
              in: [session.user.id, listing.sellerId],
            },
          },
        },
      },
      include: {
        participants: true,
      },
    })

    if (!thread) {
      // Create new thread
      thread = await prisma.thread.create({
        data: {
          listingId,
          participants: {
            create: [
              {
                userId: session.user.id,
                roleInThread: 'BUYER',
              },
              {
                userId: listing.sellerId,
                roleInThread: 'SELLER',
              },
            ],
          },
        },
        include: {
          participants: true,
        },
      })
    }

    return NextResponse.json({ threadId: thread.id })
  } catch (error) {
    console.error('Failed to create/find thread:', error)
    return NextResponse.json(
      { error: 'Failed to create thread' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const threads = await prisma.thread.findMany({
      where: {
        participants: {
          some: {
            userId: session.user.id,
          },
        },
      },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            slug: true,
            askingPrice: true,
            images: {
              take: 1,
              orderBy: { order: 'asc' },
            },
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
                verified: true,
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
      orderBy: {
        lastMessageAt: 'desc',
      },
    })

    // Get unread counts in a single batch query instead of N+1
    const threadIds = threads.map(t => t.id)
    const allUnreadMessages = threadIds.length > 0
      ? await prisma.message.findMany({
          where: {
            threadId: { in: threadIds },
            senderId: { not: session.user.id },
          },
          select: { threadId: true, readBy: true },
        })
      : []

    const unreadCounts = new Map<string, number>()
    for (const msg of allUnreadMessages) {
      const readBy = JSON.parse(msg.readBy || '[]')
      if (!readBy.includes(session.user.id)) {
        unreadCounts.set(msg.threadId, (unreadCounts.get(msg.threadId) || 0) + 1)
      }
    }

    const threadsWithUnread = threads.map(thread => ({
      ...thread,
      unreadCount: unreadCounts.get(thread.id) || 0,
    }))

    return NextResponse.json({ threads: threadsWithUnread })
  } catch (error) {
    console.error('Failed to fetch threads:', error)
    return NextResponse.json(
      { error: 'Failed to fetch threads' },
      { status: 500 }
    )
  }
}