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
    })

    if (!listing || listing.status !== 'PUBLISHED') {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    // Check if already saved
    const existingSave = await prisma.savedListing.findUnique({
      where: {
        userId_listingId: {
          userId: session.user.id,
          listingId,
        },
      },
    })

    if (existingSave) {
      // Remove from saved
      await prisma.$transaction([
        prisma.savedListing.delete({
          where: {
            userId_listingId: {
              userId: session.user.id,
              listingId,
            },
          },
        }),
        prisma.listing.update({
          where: { id: listingId },
          data: { favorites: { decrement: 1 } },
        }),
      ])

      return NextResponse.json({ saved: false })
    } else {
      // Add to saved
      await prisma.$transaction([
        prisma.savedListing.create({
          data: {
            userId: session.user.id,
            listingId,
          },
        }),
        prisma.listing.update({
          where: { id: listingId },
          data: { favorites: { increment: 1 } },
        }),
      ])

      return NextResponse.json({ saved: true })
    }
  } catch (error) {
    console.error('Failed to save/unsave listing:', error)
    return NextResponse.json(
      { error: 'Failed to save listing' },
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

    const savedListings = await prisma.savedListing.findMany({
      where: { userId: session.user.id },
      include: {
        listing: {
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
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      savedListings: savedListings.map(save => ({
        ...save.listing,
        highlights: typeof save.listing.highlights === 'string'
          ? JSON.parse(save.listing.highlights || '[]')
          : save.listing.highlights || [],
        monetization: typeof save.listing.monetization === 'string'
          ? JSON.parse(save.listing.monetization || '[]')
          : save.listing.monetization || [],
        techStack: typeof save.listing.techStack === 'string'
          ? JSON.parse(save.listing.techStack || '[]')
          : save.listing.techStack || [],
        platform: typeof save.listing.platform === 'string'
          ? JSON.parse(save.listing.platform || '[]')
          : save.listing.platform || [],
        growthOps: typeof save.listing.growthOps === 'string'
          ? JSON.parse(save.listing.growthOps || '[]')
          : save.listing.growthOps || [],
        risks: typeof save.listing.risks === 'string'
          ? JSON.parse(save.listing.risks || '[]')
          : save.listing.risks || [],
        assetsIncluded: typeof save.listing.assetsIncluded === 'string'
          ? JSON.parse(save.listing.assetsIncluded || '[]')
          : save.listing.assetsIncluded || []
      })),
    })
  } catch (error) {
    console.error('Failed to fetch saved listings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch saved listings' },
      { status: 500 }
    )
  }
}