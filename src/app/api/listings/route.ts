import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendListingCreatedEmail, sendAdminListingNotification } from '@/lib/email'
import { z } from 'zod'

const createListingSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  businessType: z.enum(['SAAS', 'ECOMMERCE', 'AMAZON', 'CONTENT', 'MOBILE_APP', 'OTHER']),
  isAiRelated: z.boolean().default(false),
  aiTechnologies: z.array(z.string()).default([]),
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
  status: z.enum(['DRAFT', 'PENDING_REVIEW']).default('PENDING_REVIEW'),
  slug: z.string().min(1, 'Slug is required'),
  featuredImageUrl: z.string().nullable().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const q = searchParams.get('q')
    const type = searchParams.get('type')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const minMRR = searchParams.get('minMRR')
    const isAiRelated = searchParams.get('isAiRelated')
    const minRevenue = searchParams.get('minRevenue')
    const maxRevenue = searchParams.get('maxRevenue')
    const minTraffic = searchParams.get('minTraffic')
    const workload = searchParams.get('workload')
    const sort = searchParams.get('sort') || 'newest'
    const page = Math.max(1, parseInt(searchParams.get('page') || '1') || 1)
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '51') || 51))

    const where: any = {
      status: 'PUBLISHED',
    }

    // Text search (SQLite case-insensitive search)
    if (q) {
      where.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
      ]
    }

    // Business type filter
    if (type) {
      where.businessType = type
    }

    // Price filters
    if (minPrice || maxPrice) {
      where.askingPrice = {}
      if (minPrice) where.askingPrice.gte = (parseInt(minPrice) || 0) * 100
      if (maxPrice) where.askingPrice.lte = (parseInt(maxPrice) || 0) * 100
    }

    // MRR filter
    if (minMRR) {
      where.mrr = { gte: (parseInt(minMRR) || 0) * 100 }
    }

    // AI filter
    if (isAiRelated === 'true') {
      where.isAiRelated = true
    } else if (isAiRelated === 'false') {
      where.isAiRelated = false
    }

    // Revenue filters
    if (minRevenue || maxRevenue) {
      where.revenueTtm = {}
      if (minRevenue) where.revenueTtm.gte = (parseInt(minRevenue) || 0) * 100
      if (maxRevenue) where.revenueTtm.lte = (parseInt(maxRevenue) || 0) * 100
    }

    // Traffic filter
    if (minTraffic) {
      where.trafficTtm = { gte: parseInt(minTraffic) || 0 }
    }

    // Workload filter
    if (workload) {
      switch (workload) {
        case 'low':
          where.workloadHrsPerWk = { lte: 10 }
          break
        case 'medium':
          where.workloadHrsPerWk = { gte: 11, lte: 30 }
          break
        case 'high':
          where.workloadHrsPerWk = { gte: 31 }
          break
      }
    }

    // Sorting with featured listings always first
    let orderBy: any = [
      { featured: 'desc' }, // Featured listings first
      { publishedAt: 'desc' } // Then by date
    ]

    switch (sort) {
      case 'price_low':
        orderBy = [
          { featured: 'desc' },
          { askingPrice: 'asc' }
        ]
        break
      case 'price_high':
        orderBy = [
          { featured: 'desc' },
          { askingPrice: 'desc' }
        ]
        break
      case 'mrr_high':
        orderBy = [
          { featured: 'desc' },
          { mrr: 'desc' }
        ]
        break
      case 'revenue_high':
        orderBy = [
          { featured: 'desc' },
          { revenueTtm: 'desc' }
        ]
        break
      case 'popular':
        orderBy = [
          { featured: 'desc' },
          { favorites: 'desc' }
        ]
        break
      default:
        orderBy = [
          { featured: 'desc' },
          { publishedAt: 'desc' }
        ]
    }

    const listings = await prisma.listing.findMany({
      where,
      include: {
        images: {
          orderBy: { order: 'asc' },
          take: 1,
        },
        _count: {
          select: {
            savedListings: true,
          },
        },
      },
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    })

    const total = await prisma.listing.count({ where })

    return NextResponse.json({
      listings,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    })
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch listings' },
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

    if (session.user.role !== 'SELLER' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = createListingSchema.parse(body)

    // Check if slug is unique
    const existingListing = await prisma.listing.findUnique({
      where: { slug: validatedData.slug },
    })

    if (existingListing) {
      // Generate a unique slug by appending a number
      let counter = 1
      let uniqueSlug = `${validatedData.slug}-${counter}`

      while (await prisma.listing.findUnique({ where: { slug: uniqueSlug } })) {
        counter++
        uniqueSlug = `${validatedData.slug}-${counter}`
      }

      validatedData.slug = uniqueSlug
    }

    // Auto-approve listings created by admins
    const isAdmin = session.user.role === 'ADMIN'
    const listingStatus = isAdmin ? 'PUBLISHED' : validatedData.status
    const publishedAt = isAdmin ? new Date() : null

    const listing = await prisma.listing.create({
      data: {
        ...validatedData,
        status: listingStatus,
        category: validatedData.category || 'OTHER',
        monetization: JSON.stringify(validatedData.monetization || []),
        platform: JSON.stringify(validatedData.platform || []),
        techStack: JSON.stringify(validatedData.techStack || []),
        highlights: JSON.stringify(validatedData.highlights || []),
        growthOps: JSON.stringify(validatedData.growthOps || []),
        risks: JSON.stringify(validatedData.risks || []),
        assetsIncluded: JSON.stringify(validatedData.assetsIncluded || []),
        aiTechnologies: JSON.stringify(validatedData.aiTechnologies || []),
        sellerId: session.user.id,
        publishedAt: publishedAt,
      },
      include: {
        seller: true,
      },
    })

    // Create image record if featuredImageUrl is provided
    if (validatedData.featuredImageUrl) {
      await prisma.listingImage.create({
        data: {
          listingId: listing.id,
          url: validatedData.featuredImageUrl,
          alt: validatedData.title,
          order: 0,
        },
      })
    }

    // Send confirmation email to the seller
    if (listing.seller?.email && listing.seller?.name) {
      sendListingCreatedEmail(
        listing.seller.email,
        listing.seller.name,
        listing.title,
        listing.status
      ).catch(error => {
        console.error('Failed to send listing confirmation email:', error)
      })
    }

    // Send admin notification for review
    if (listing.status === 'PENDING_REVIEW') {
      sendAdminListingNotification({
        id: listing.id,
        title: listing.title,
        businessType: listing.businessType,
        askingPrice: listing.askingPrice,
        sellerName: listing.seller?.name || 'Unknown',
        sellerEmail: listing.seller?.email || 'Unknown'
      }).catch(error => {
        console.error('Failed to send admin notification:', error)
      })
    }

    return NextResponse.json(listing)
  } catch (error) {
    console.error('Failed to create listing:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create listing' },
      { status: 500 }
    )
  }
}