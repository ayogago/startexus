import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const messageSchema = z.object({
  body: z.string().min(1, 'Message cannot be empty').max(2000, 'Message too long'),
})

interface RouteContext {
  params: {
    id: string
  }
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const threadId = params.id

    // Verify user is a participant in this thread
    const thread = await prisma.thread.findFirst({
      where: {
        id: threadId,
        participants: {
          some: {
            userId: session.user.id,
          },
        },
      },
    })

    if (!thread) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 })
    }

    const body = await request.json()
    const { body: messageBody } = messageSchema.parse(body)

    // Create the message
    const message = await prisma.message.create({
      data: {
        threadId,
        senderId: session.user.id,
        body: messageBody,
        readBy: JSON.stringify([session.user.id]), // Sender automatically reads their own message
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    })

    // Update thread's lastMessageAt
    await prisma.thread.update({
      where: { id: threadId },
      data: { lastMessageAt: new Date() },
    })

    return NextResponse.json({ message })
  } catch (error) {
    console.error('Failed to create message:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create message' },
      { status: 500 }
    )
  }
}