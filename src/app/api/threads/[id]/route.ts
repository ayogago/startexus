import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface RouteContext {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const threadId = params.id

    // Check if user is a participant in this thread
    const thread = await prisma.thread.findFirst({
      where: {
        id: threadId,
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
            confidential: true,
            seller: {
              select: {
                id: true,
                name: true,
                email: true,
                verified: true,
              },
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
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    })

    if (!thread) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 })
    }

    // Mark messages as read by this user
    const unreadMessages = await prisma.message.findMany({
      where: {
        threadId,
        senderId: { not: session.user.id },
      },
    })

    for (const message of unreadMessages) {
      const readBy = JSON.parse(message.readBy || '[]')
      if (!readBy.includes(session.user.id)) {
        readBy.push(session.user.id)
        await prisma.message.update({
          where: { id: message.id },
          data: { readBy: JSON.stringify(readBy) },
        })
      }
    }

    return NextResponse.json({ thread })
  } catch (error) {
    console.error('Failed to fetch thread:', error)
    return NextResponse.json(
      { error: 'Failed to fetch thread' },
      { status: 500 }
    )
  }
}