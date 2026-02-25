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

    const calls = await prisma.scheduledCall.findMany({
      where: {
        OR: [
          { schedulerId: session.user.id },
          { receiverId: session.user.id },
        ],
      },
      include: {
        scheduler: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        deal: {
          select: {
            id: true,
            stage: true,
            listing: {
              select: {
                id: true,
                title: true,
                slug: true,
              },
            },
          },
        },
      },
      orderBy: { scheduledAt: 'asc' },
    })

    return NextResponse.json({ calls })
  } catch (error) {
    console.error('Failed to fetch calls:', error)
    return NextResponse.json(
      { error: 'Failed to fetch calls' },
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
    const { receiverId, scheduledAt, title, dealId, duration, notes, meetingLink } = body

    if (!receiverId || !scheduledAt || !title) {
      return NextResponse.json(
        { error: 'receiverId, scheduledAt, and title are required' },
        { status: 400 }
      )
    }

    // Prevent scheduling a call with yourself
    if (receiverId === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot schedule a call with yourself' },
        { status: 400 }
      )
    }

    // Verify receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
      select: { id: true },
    })

    if (!receiver) {
      return NextResponse.json(
        { error: 'Receiver not found' },
        { status: 404 }
      )
    }

    // If dealId is provided, verify user is a participant
    if (dealId) {
      const deal = await prisma.deal.findUnique({
        where: { id: dealId },
        select: { buyerId: true, sellerId: true },
      })

      if (!deal) {
        return NextResponse.json(
          { error: 'Deal not found' },
          { status: 404 }
        )
      }

      if (deal.buyerId !== session.user.id && deal.sellerId !== session.user.id) {
        return NextResponse.json(
          { error: 'You are not a participant in this deal' },
          { status: 403 }
        )
      }
    }

    const parsedDate = new Date(scheduledAt)
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid scheduledAt date' },
        { status: 400 }
      )
    }

    const call = await prisma.scheduledCall.create({
      data: {
        schedulerId: session.user.id,
        receiverId,
        scheduledAt: parsedDate,
        title,
        dealId: dealId || null,
        duration: duration ? Math.round(duration) : 30,
        notes: notes || null,
        meetingLink: meetingLink || null,
        status: 'PENDING',
      },
      include: {
        scheduler: {
          select: { id: true, name: true, email: true },
        },
        receiver: {
          select: { id: true, name: true, email: true },
        },
        deal: {
          select: {
            id: true,
            stage: true,
            listing: {
              select: { id: true, title: true, slug: true },
            },
          },
        },
      },
    })

    // If associated with a deal, create a deal event
    if (dealId) {
      await prisma.dealEvent.create({
        data: {
          dealId,
          type: 'CALL_SCHEDULED',
          title: 'Call scheduled',
          details: `"${title}" scheduled for ${parsedDate.toLocaleDateString()} at ${parsedDate.toLocaleTimeString()}`,
          actorId: session.user.id,
        },
      })
    }

    return NextResponse.json({ call }, { status: 201 })
  } catch (error) {
    console.error('Failed to create call:', error)
    return NextResponse.json(
      { error: 'Failed to create call' },
      { status: 500 }
    )
  }
}
