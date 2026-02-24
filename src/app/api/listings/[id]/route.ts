import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateListingSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  businessType: z.enum(['SAAS', 'ECOMMERCE', 'CONTENT', 'MOBILE_APP', 'OTHER']),
  category: z.string().optional(),
  askingPrice: z.number().nullable().optional(),
  priceType: z.enum(['ASKING', 'OPEN_TO_OFFERS']).default('ASKING'),
  revenueTtm: z.number().nullable().optional(),
  profitTtm: z.number().nullable().optional(),
  mrr: z.number().nullable().optional(),
  trafficTtm: z.number().nullable().optional(),
  monetization: z.array(z.string()).default([]),
  platform: z.array(z.string()).default([]),
  techStack: z.array(z.string()).default([]),
  establishedAt: z.string().nullable().optional().transform(val => val ? new Date(val) : null),
  workloadHrsPerWk: z.number().nullable().optional(),
  teamSize: z.number().nullable().optional(),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  highlights: z.array(z.string()).default([]),
  growthOps: z.array(z.string()).default([]),
  risks: z.array(z.string()).default([]),
  assetsIncluded: z.array(z.string()).default([]),
  reasonForSale: z.string().optional(),
  location: z.string().optional(),
  siteUrl: z.string().optional(),
  confidential: z.boolean().default(false),
  ndaRequired: z.boolean().default(false),
})

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || (session.user.role !== 'SELLER' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateListingSchema.parse(body)

    // Check if listing exists and user owns it (unless admin)
    const existingListing = await prisma.listing.findFirst({
      where: {
        id: params.id,
        ...(session.user.role !== 'ADMIN' && { sellerId: session.user.id })
      }
    })

    if (!existingListing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    const updatedListing = await prisma.listing.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        monetization: JSON.stringify(validatedData.monetization),
        platform: JSON.stringify(validatedData.platform),
        techStack: JSON.stringify(validatedData.techStack),
        highlights: JSON.stringify(validatedData.highlights),
        growthOps: JSON.stringify(validatedData.growthOps),
        risks: JSON.stringify(validatedData.risks),
        assetsIncluded: JSON.stringify(validatedData.assetsIncluded),
      },
      include: {
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

    return NextResponse.json(updatedListing)

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating listing:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if listing exists and user owns it (unless admin)
    const listing = await prisma.listing.findFirst({
      where: {
        id: params.id,
        ...(session.user.role !== 'ADMIN' && { sellerId: session.user.id })
      },
      include: {
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

    return NextResponse.json(listing)

  } catch (error) {
    console.error('Error fetching listing:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}