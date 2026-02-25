import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logAuditEvent } from '@/lib/audit'

interface RouteContext {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const listingId = params.id

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            verified: true,
          },
        },
        images: {
          orderBy: { order: 'asc' },
        },
        _count: {
          select: {
            savedListings: true,
          },
        },
      },
    })

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    return NextResponse.json({ listing })
  } catch (error) {
    console.error('Failed to fetch listing:', error)
    return NextResponse.json(
      { error: 'Failed to fetch listing' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const listingId = params.id

    // Admin can update any field
    const updateData: any = {}

    // Basic information
    if (body.title !== undefined) updateData.title = body.title
    if (body.slug !== undefined) updateData.slug = body.slug
    if (body.businessType !== undefined) updateData.businessType = body.businessType
    if (body.category !== undefined) updateData.category = body.category
    if (body.description !== undefined) updateData.description = body.description
    if (body.location !== undefined) updateData.location = body.location
    if (body.siteUrl !== undefined) updateData.siteUrl = body.siteUrl
    if (body.reasonForSale !== undefined) updateData.reasonForSale = body.reasonForSale

    // Financial data
    if (body.askingPrice !== undefined) updateData.askingPrice = body.askingPrice
    if (body.priceType !== undefined) updateData.priceType = body.priceType
    if (body.revenueTtm !== undefined) updateData.revenueTtm = body.revenueTtm
    if (body.profitTtm !== undefined) updateData.profitTtm = body.profitTtm
    if (body.mrr !== undefined) updateData.mrr = body.mrr
    if (body.aov !== undefined) updateData.aov = body.aov
    if (body.trafficTtm !== undefined) updateData.trafficTtm = body.trafficTtm

    // Operational data
    if (body.establishedAt !== undefined) {
      updateData.establishedAt = body.establishedAt ? new Date(body.establishedAt) : null
    }
    if (body.workloadHrsPerWk !== undefined) updateData.workloadHrsPerWk = body.workloadHrsPerWk
    if (body.teamSize !== undefined) updateData.teamSize = body.teamSize

    // Arrays (stored as JSON strings)
    if (body.monetization !== undefined) updateData.monetization = JSON.stringify(body.monetization || [])
    if (body.platform !== undefined) updateData.platform = JSON.stringify(body.platform || [])
    if (body.techStack !== undefined) updateData.techStack = JSON.stringify(body.techStack || [])
    if (body.highlights !== undefined) updateData.highlights = JSON.stringify(body.highlights || [])
    if (body.growthOps !== undefined) updateData.growthOps = JSON.stringify(body.growthOps || [])
    if (body.risks !== undefined) updateData.risks = JSON.stringify(body.risks || [])
    if (body.assetsIncluded !== undefined) updateData.assetsIncluded = JSON.stringify(body.assetsIncluded || [])
    if (body.aiTechnologies !== undefined) updateData.aiTechnologies = JSON.stringify(body.aiTechnologies || [])

    // Boolean flags
    if (body.isAiRelated !== undefined) updateData.isAiRelated = body.isAiRelated
    if (body.confidential !== undefined) updateData.confidential = body.confidential
    if (body.ndaRequired !== undefined) updateData.ndaRequired = body.ndaRequired
    if (body.flagged !== undefined) updateData.flagged = body.flagged

    // Status and publishing
    if (body.status) {
      if (!['PUBLISHED', 'REJECTED', 'PENDING_REVIEW', 'DRAFT'].includes(body.status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
      }
      updateData.status = body.status
      updateData.publishedAt = body.status === 'PUBLISHED' ? new Date() : null

      // Clear flagged status when approving/publishing
      if (body.status === 'PUBLISHED') {
        updateData.flagged = false
      }
    }

    if (body.hasOwnProperty('featured')) {
      updateData.featured = body.featured
      updateData.featuredAt = body.featured ? new Date() : null
    }

    // URLs
    if (body.analyticsProofUrl !== undefined) updateData.analyticsProofUrl = body.analyticsProofUrl
    if (body.revenueProofUrl !== undefined) updateData.revenueProofUrl = body.revenueProofUrl

    const listing = await prisma.listing.update({
      where: { id: listingId },
      data: updateData,
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            verified: true,
          },
        },
        images: true,
      },
    })

    // Audit logging for admin actions
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') || undefined

    if (body.status === 'PUBLISHED') {
      await logAuditEvent({
        userId: session.user.id,
        action: 'LISTING_APPROVED',
        targetType: 'LISTING',
        targetId: listingId,
        details: `Listing "${listing.title}" approved and published`,
        ipAddress: ip,
      })
    } else if (body.status === 'REJECTED') {
      await logAuditEvent({
        userId: session.user.id,
        action: 'LISTING_REJECTED',
        targetType: 'LISTING',
        targetId: listingId,
        details: `Listing "${listing.title}" rejected`,
        ipAddress: ip,
      })
    } else if (body.hasOwnProperty('featured')) {
      await logAuditEvent({
        userId: session.user.id,
        action: body.featured ? 'LISTING_FEATURED' : 'LISTING_UNFEATURED',
        targetType: 'LISTING',
        targetId: listingId,
        details: `Listing "${listing.title}" ${body.featured ? 'featured' : 'unfeatured'}`,
        ipAddress: ip,
      })
    } else {
      await logAuditEvent({
        userId: session.user.id,
        action: 'LISTING_UPDATED',
        targetType: 'LISTING',
        targetId: listingId,
        details: `Listing "${listing.title}" updated by admin`,
        ipAddress: ip,
      })
    }

    return NextResponse.json({ listing })
  } catch (error) {
    console.error('Failed to update listing:', error)
    return NextResponse.json(
      { error: 'Failed to update listing' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const listingId = params.id

    // Delete related records first
    await prisma.savedListing.deleteMany({
      where: { listingId }
    })

    await prisma.listingImage.deleteMany({
      where: { listingId }
    })

    // Delete the listing
    await prisma.listing.delete({
      where: { id: listingId }
    })

    // Audit logging for listing deletion
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') || undefined

    await logAuditEvent({
      userId: session.user.id,
      action: 'LISTING_DELETED',
      targetType: 'LISTING',
      targetId: listingId,
      details: `Listing deleted by admin`,
      ipAddress: ip,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete listing:', error)
    return NextResponse.json(
      { error: 'Failed to delete listing' },
      { status: 500 }
    )
  }
}