import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Valid stage transitions
const STAGE_TRANSITIONS: Record<string, string[]> = {
  INQUIRY: ['OFFER', 'CANCELLED'],
  OFFER: ['NEGOTIATION', 'CANCELLED'],
  NEGOTIATION: ['DUE_DILIGENCE', 'CANCELLED'],
  DUE_DILIGENCE: ['CLOSING', 'CANCELLED'],
  CLOSING: ['COMPLETED', 'CANCELLED'],
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const deal = await prisma.deal.findUnique({
      where: { id },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            slug: true,
            askingPrice: true,
            businessType: true,
            category: true,
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
            company: true,
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            verified: true,
            company: true,
          },
        },
        timeline: {
          orderBy: { createdAt: 'desc' },
        },
        documents: {
          include: {
            uploader: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        calls: {
          include: {
            scheduler: {
              select: { id: true, name: true, email: true },
            },
            receiver: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { scheduledAt: 'asc' },
        },
      },
    })

    if (!deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
    }

    // Only buyer or seller can access
    if (deal.buyerId !== session.user.id && deal.sellerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ deal })
  } catch (error) {
    console.error('Failed to fetch deal:', error)
    return NextResponse.json(
      { error: 'Failed to fetch deal' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { stage, offerAmount, notes } = body

    if (!stage) {
      return NextResponse.json(
        { error: 'Stage is required' },
        { status: 400 }
      )
    }

    // Fetch the existing deal
    const deal = await prisma.deal.findUnique({
      where: { id },
      include: {
        listing: {
          select: { title: true },
        },
      },
    })

    if (!deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
    }

    // Only buyer or seller can update
    if (deal.buyerId !== session.user.id && deal.sellerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Validate stage transition
    const allowedTransitions = STAGE_TRANSITIONS[deal.stage]
    if (!allowedTransitions || !allowedTransitions.includes(stage)) {
      return NextResponse.json(
        {
          error: `Invalid stage transition from ${deal.stage} to ${stage}. Allowed: ${allowedTransitions?.join(', ') || 'none'}`,
        },
        { status: 400 }
      )
    }

    // Update deal and create event in a transaction
    const updatedDeal = await prisma.$transaction(async (tx) => {
      const updateData: any = { stage }
      if (offerAmount !== undefined) {
        updateData.offerAmount = offerAmount ? Math.round(offerAmount) : null
      }
      if (notes !== undefined) {
        updateData.notes = notes
      }

      const updated = await tx.deal.update({
        where: { id },
        data: updateData,
      })

      // Create stage change event
      const stageLabel = stage.replace(/_/g, ' ')
      const previousLabel = deal.stage.replace(/_/g, ' ')
      await tx.dealEvent.create({
        data: {
          dealId: id,
          type: 'STAGE_CHANGE',
          title: `Stage changed to ${stageLabel}`,
          details: notes
            ? `Moved from ${previousLabel} to ${stageLabel}. Notes: ${notes}`
            : `Moved from ${previousLabel} to ${stageLabel}`,
          actorId: session.user.id,
        },
      })

      // Create offer event if offer amount changed
      if (offerAmount && offerAmount !== deal.offerAmount) {
        await tx.dealEvent.create({
          data: {
            dealId: id,
            type: 'OFFER_MADE',
            title: 'Offer amount updated',
            details: `Offer amount set to $${offerAmount.toLocaleString()}`,
            actorId: session.user.id,
          },
        })
      }

      return updated
    })

    // Fetch the complete updated deal
    const completeDeal = await prisma.deal.findUnique({
      where: { id },
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

    return NextResponse.json({ deal: completeDeal })
  } catch (error) {
    console.error('Failed to update deal:', error)
    return NextResponse.json(
      { error: 'Failed to update deal' },
      { status: 500 }
    )
  }
}
