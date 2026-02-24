import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface RouteContext {
  params: {
    id: string
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const reviewId = params.id
    const body = await request.json()
    const { response } = body

    if (!response || typeof response !== 'string' || response.trim().length === 0) {
      return NextResponse.json(
        { error: 'Response text is required' },
        { status: 400 }
      )
    }

    // Fetch the review to verify the user is the target
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    })

    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      )
    }

    // Only the target user (the person being reviewed) can respond
    if (review.targetId !== session.user.id) {
      return NextResponse.json(
        { error: 'Only the reviewed user can respond to this review' },
        { status: 403 }
      )
    }

    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        response: response.trim(),
        respondedAt: new Date(),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            handle: true,
          },
        },
        target: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json(updatedReview)
  } catch (error) {
    console.error('Failed to respond to review:', error)
    return NextResponse.json(
      { error: 'Failed to respond to review' },
      { status: 500 }
    )
  }
}
