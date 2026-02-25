import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface RouteContext {
  params: {
    id: string
  }
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const listingId = params.id

    // Get IP and referrer from request headers
    const visitorIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      null
    const referrer = request.headers.get('referer') || request.headers.get('referrer') || null

    // Verify listing exists
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { id: true },
    })

    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      )
    }

    // Create view event and increment view counter in parallel
    await Promise.all([
      prisma.viewEvent.create({
        data: {
          listingId,
          visitorIp,
          referrer,
        },
      }),
      prisma.listing.update({
        where: { id: listingId },
        data: {
          views: { increment: 1 },
        },
      }),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to record view:', error)
    return NextResponse.json(
      { error: 'Failed to record view' },
      { status: 500 }
    )
  }
}
