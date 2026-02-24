import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const deals = await prisma.deal.findMany({
      where: {
        OR: [
          { buyerId: session.user.id },
          { sellerId: session.user.id },
        ],
      },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            slug: true,
            askingPrice: true,
            businessType: true,
            images: {
              orderBy: { order: 'asc' },
              take: 1,
            },
          },
        },
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            verified: true,
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            verified: true,
          },
        },
        timeline: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json({ deals })
  } catch (error) {
    console.error('Failed to fetch deals:', error)
    return NextResponse.json(
      { error: 'Failed to fetch deals' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { listingId, offerAmount, notes } = body

    if (!listingId) {
      return NextResponse.json(
        { error: 'Listing ID is required' },
        { status: 400 }
      )
    }

    // Fetch the listing to get the seller
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { id: true, sellerId: true, title: true, status: true },
    })

    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      )
    }

    if (listing.status !== 'PUBLISHED') {
      return NextResponse.json(
        { error: 'Listing is not available' },
        { status: 400 }
      )
    }

    // Prevent seller from creating a deal on their own listing
    if (listing.sellerId === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot create a deal on your own listing' },
        { status: 400 }
      )
    }

    // Check for existing active deal between this buyer and listing
    const existingDeal = await prisma.deal.findFirst({
      where: {
        listingId,
        buyerId: session.user.id,
        stage: { notIn: ['COMPLETED', 'CANCELLED'] },
      },
    })

    if (existingDeal) {
      return NextResponse.json(
        { error: 'You already have an active deal for this listing', dealId: existingDeal.id },
        { status: 409 }
      )
    }

    // Create the deal and the initial event in a transaction
    const deal = await prisma.$transaction(async (tx) => {
      const newDeal = await tx.deal.create({
        data: {
          listingId,
          buyerId: session.user.id,
          sellerId: listing.sellerId,
          stage: 'INQUIRY',
          offerAmount: offerAmount ? Math.round(offerAmount) : null,
          notes: notes || null,
        },
      })

      await tx.dealEvent.create({
        data: {
          dealId: newDeal.id,
          type: 'STAGE_CHANGE',
          title: 'Deal created',
          details: notes
            ? `Inquiry started for "${listing.title}". Notes: ${notes}`
            : `Inquiry started for "${listing.title}"`,
          actorId: session.user.id,
        },
      })

      if (offerAmount) {
        await tx.dealEvent.create({
          data: {
            dealId: newDeal.id,
            type: 'OFFER_MADE',
            title: 'Initial offer included',
            details: `Offer amount: $${offerAmount.toLocaleString()}`,
            actorId: session.user.id,
          },
        })
      }

      return newDeal
    })

    // Fetch the complete deal to return
    const completeDeal = await prisma.deal.findUnique({
      where: { id: deal.id },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            slug: true,
            askingPrice: true,
            businessType: true,
          },
        },
        buyer: {
          select: { id: true, name: true, email: true },
        },
        seller: {
          select: { id: true, name: true, email: true },
        },
        timeline: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    return NextResponse.json({ deal: completeDeal }, { status: 201 })
  } catch (error) {
    console.error('Failed to create deal:', error)
    return NextResponse.json(
      { error: 'Failed to create deal' },
      { status: 500 }
    )
  }
}
