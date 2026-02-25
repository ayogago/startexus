import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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
    const { status } = body

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      )
    }

    const validStatuses = ['CONFIRMED', 'COMPLETED', 'CANCELLED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Allowed: ${validStatuses.join(', ')}` },
        { status: 400 }
      )
    }

    // Fetch existing call
    const call = await prisma.scheduledCall.findUnique({
      where: { id },
    })

    if (!call) {
      return NextResponse.json({ error: 'Call not found' }, { status: 404 })
    }

    // Only scheduler or receiver can update
    if (call.schedulerId !== session.user.id && call.receiverId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Validate status transitions
    if (call.status === 'COMPLETED' || call.status === 'CANCELLED') {
      return NextResponse.json(
        { error: `Cannot update a call that is already ${call.status.toLowerCase()}` },
        { status: 400 }
      )
    }

    const updatedCall = await prisma.scheduledCall.update({
      where: { id },
      data: { status },
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

    return NextResponse.json({ call: updatedCall })
  } catch (error) {
    console.error('Failed to update call:', error)
    return NextResponse.json(
      { error: 'Failed to update call' },
      { status: 500 }
    )
  }
}
