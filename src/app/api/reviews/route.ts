import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const targetId = searchParams.get('targetId')
    const listingId = searchParams.get('listingId')

    const where: any = {
      status: 'PUBLISHED',
    }

    if (targetId) {
      where.targetId = targetId
    }

    if (listingId) {
      where.listingId = listingId
    }

    const reviews = await prisma.review.findMany({
      where,
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
            avatarUrl: true,
          },
        },
        listing: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0

    return NextResponse.json({
      reviews,
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: reviews.length,
    })
  } catch (error) {
    console.error('Failed to fetch reviews:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
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
    const { targetId, rating, title, content, listingId, dealId } = body

    // Validate required fields
    if (!targetId || !rating || !title || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: targetId, rating, title, content' },
        { status: 400 }
      )
    }

    // Validate rating range
    if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return NextResponse.json(
        { error: 'Rating must be an integer between 1 and 5' },
        { status: 400 }
      )
    }

    // Prevent self-reviews
    if (targetId === session.user.id) {
      return NextResponse.json(
        { error: 'You cannot review yourself' },
        { status: 400 }
      )
    }

    // Check target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: targetId },
    })

    if (!targetUser) {
      return NextResponse.json(
        { error: 'Target user not found' },
        { status: 404 }
      )
    }

    // If dealId is provided, check for duplicate review (@@unique([authorId, dealId]))
    if (dealId) {
      const existingReview = await prisma.review.findUnique({
        where: {
          authorId_dealId: {
            authorId: session.user.id,
            dealId: dealId,
          },
        },
      })

      if (existingReview) {
        return NextResponse.json(
          { error: 'You have already reviewed this deal' },
          { status: 409 }
        )
      }
    }

    const review = await prisma.review.create({
      data: {
        authorId: session.user.id,
        targetId,
        rating,
        title,
        content,
        listingId: listingId || null,
        dealId: dealId || null,
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

    // Create notification for the target user
    try {
      await prisma.notification.create({
        data: {
          userId: targetId,
          type: 'REVIEW',
          title: 'New Review Received',
          message: `${session.user.name || 'A user'} left you a ${rating}-star review: "${title}"`,
          link: '/dashboard/reviews',
        },
      })
    } catch {
      // Don't fail the review creation if notification fails
    }

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error('Failed to create review:', error)
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    )
  }
}
