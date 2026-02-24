import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { sendWelcomeEmail, sendListingCreatedEmail, sendAdminListingNotification } from '@/lib/email'
import { z } from 'zod'

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character'),
  name: z.string().min(1, 'Name is required'),
  role: z.enum(['BUYER', 'SELLER']).optional(),
  pendingListing: z.any().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name, role, pendingListing } = signupSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists with this email' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role || 'BUYER',
        emailVerified: new Date(), // Since we're doing email/password, consider them verified
      },
    })

    // Create listing if pendingListing data is provided and user is a seller
    let listing = null
    if (pendingListing && role === 'SELLER') {
      try {
        // Transform the data to match the API format
        const transformedData = {
          ...pendingListing,
          slug: pendingListing.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
          askingPrice: pendingListing.askingPrice ? parseInt(pendingListing.askingPrice) * 100 : null,
          revenueTtm: pendingListing.revenueTtm ? parseInt(pendingListing.revenueTtm) * 100 : null,
          profitTtm: pendingListing.profitTtm ? parseInt(pendingListing.profitTtm) * 100 : null,
          mrr: pendingListing.mrr ? parseInt(pendingListing.mrr) * 100 : null,
          trafficTtm: pendingListing.trafficTtm ? parseInt(pendingListing.trafficTtm) : null,
          workloadHrsPerWk: pendingListing.workloadHrsPerWk ? parseInt(pendingListing.workloadHrsPerWk) : null,
          teamSize: pendingListing.teamSize ? parseInt(pendingListing.teamSize) : null,
          establishedAt: pendingListing.establishedAt ? new Date(pendingListing.establishedAt) : null,
          highlights: JSON.stringify(pendingListing.highlights?.filter((h: string) => h.trim()) || []),
          growthOps: JSON.stringify(pendingListing.growthOps?.filter((g: string) => g.trim()) || []),
          risks: JSON.stringify(pendingListing.risks?.filter((r: string) => r.trim()) || []),
          assetsIncluded: JSON.stringify(pendingListing.assetsIncluded?.filter((a: string) => a.trim()) || []),
          monetization: JSON.stringify(pendingListing.monetization || []),
          platform: JSON.stringify(pendingListing.platform || []),
          techStack: JSON.stringify(pendingListing.techStack || []),
          aiTechnologies: JSON.stringify(pendingListing.aiTechnologies || []),
          status: 'PENDING_REVIEW',
          sellerId: user.id,
          category: pendingListing.category || 'OTHER',
        }

        // Check if slug is unique
        const existingListing = await prisma.listing.findUnique({
          where: { slug: transformedData.slug },
        })

        if (existingListing) {
          // Generate a unique slug by appending a number
          let counter = 1
          let uniqueSlug = `${transformedData.slug}-${counter}`

          while (await prisma.listing.findUnique({ where: { slug: uniqueSlug } })) {
            counter++
            uniqueSlug = `${transformedData.slug}-${counter}`
          }

          transformedData.slug = uniqueSlug
        }

        listing = await prisma.listing.create({
          data: transformedData,
          include: {
            seller: true,
          },
        })

        // Create image record if featuredImageUrl is provided
        if (pendingListing.featuredImageUrl) {
          await prisma.listingImage.create({
            data: {
              listingId: listing.id,
              url: pendingListing.featuredImageUrl,
              alt: pendingListing.title,
              order: 0,
            },
          })
        }

        // Send listing confirmation email
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
      } catch (listingError) {
        console.error('Failed to create listing during signup:', listingError)
        // Continue with user creation, we'll handle listing creation on signin
      }
    }

    // Send welcome email (don't wait for it to complete)
    sendWelcomeEmail(email, name, role || 'BUYER').catch(error => {
      console.error('Failed to send welcome email:', error)
    })

    return NextResponse.json({
      message: 'User created successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      listing: listing ? {
        id: listing.id,
        title: listing.title,
        status: listing.status,
      } : null,
    })
  } catch (error) {
    console.error('Signup error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    )
  }
}