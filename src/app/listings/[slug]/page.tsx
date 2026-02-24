import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ListingDetail } from './listing-detail'
import { Metadata } from 'next'
import { formatCurrency } from '@/lib/utils'
import { BreadcrumbSchema } from '@/components/seo/breadcrumb-schema'

interface PageProps {
  params: {
    slug: string
  }
}

async function getListing(slug: string, userId?: string) {
  const listing = await prisma.listing.findUnique({
    where: { slug },
    include: {
      seller: {
        select: {
          id: true,
          name: true,
          handle: true,
          avatarUrl: true,
          verified: true,
          createdAt: true,
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
    return null
  }

  // Allow listing owner to view their own listing regardless of status
  // Only published listings are visible to other users
  if (listing.status !== 'PUBLISHED' && listing.sellerId !== userId) {
    return null
  }

  // Increment view count
  await prisma.listing.update({
    where: { id: listing.id },
    data: { views: { increment: 1 } },
  })

  // Parse JSON fields for SQLite
  const processedListing = {
    ...listing,
    highlights: typeof listing.highlights === 'string'
      ? JSON.parse(listing.highlights || '[]')
      : listing.highlights || [],
    monetization: typeof listing.monetization === 'string'
      ? JSON.parse(listing.monetization || '[]')
      : listing.monetization || [],
    techStack: typeof listing.techStack === 'string'
      ? JSON.parse(listing.techStack || '[]')
      : listing.techStack || [],
    platform: typeof listing.platform === 'string'
      ? JSON.parse(listing.platform || '[]')
      : listing.platform || [],
    growthOps: typeof listing.growthOps === 'string'
      ? JSON.parse(listing.growthOps || '[]')
      : listing.growthOps || [],
    risks: typeof listing.risks === 'string'
      ? JSON.parse(listing.risks || '[]')
      : listing.risks || [],
    assetsIncluded: typeof listing.assetsIncluded === 'string'
      ? JSON.parse(listing.assetsIncluded || '[]')
      : listing.assetsIncluded || []
  }

  return processedListing
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const listing = await prisma.listing.findUnique({
    where: { slug: params.slug },
    include: {
      images: {
        orderBy: { order: 'asc' },
        take: 1,
      },
    },
  })

  if (!listing) {
    return {
      title: 'Listing Not Found',
      description: 'The listing you are looking for does not exist.',
    }
  }

  // Parse highlights for description
  const highlights = typeof listing.highlights === 'string'
    ? JSON.parse(listing.highlights || '[]')
    : listing.highlights || []

  const description = highlights.length > 0
    ? highlights[0]
    : `${listing.businessType} business for sale. ${listing.description?.substring(0, 150) || ''}`

  const priceText = listing.askingPrice
    ? formatCurrency(listing.askingPrice)
    : 'Open to offers'

  const imageUrl = listing.images[0]?.url || '/og-image.svg'

  return {
    title: `${listing.title} - ${priceText}`,
    description: description,
    keywords: [
      listing.businessType.toLowerCase(),
      'business for sale',
      'online business',
      'buy business',
      listing.mrr ? 'profitable business' : '',
      listing.isAiRelated ? 'AI business' : '',
    ].filter(Boolean),
    openGraph: {
      title: `${listing.title} - ${priceText}`,
      description: description,
      url: `https://startexus.com/listings/${listing.slug}`,
      type: 'website',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: listing.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${listing.title} - ${priceText}`,
      description: description,
      images: [imageUrl],
    },
    alternates: {
      canonical: `https://startexus.com/listings/${listing.slug}`,
    },
  }
}

export default async function ListingPage({ params }: PageProps) {
  const session = await getServerSession(authOptions)
  const processedListing = await getListing(params.slug, session?.user?.id)

  if (!processedListing) {
    notFound()
  }

  // Check if user has saved this listing
  let isSaved = false
  if (session?.user?.id) {
    const savedListing = await prisma.savedListing.findUnique({
      where: {
        userId_listingId: {
          userId: session.user.id,
          listingId: processedListing.id,
        },
      },
    })
    isSaved = !!savedListing
  }

  // Generate Product schema for SEO
  const productSchema: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": processedListing.title,
    "description": processedListing.description,
    "category": processedListing.businessType,
    "brand": {
      "@type": "Brand",
      "name": processedListing.seller.name || "Business Owner"
    },
    "url": `https://startexus.com/listings/${processedListing.slug}`,
    "image": processedListing.images[0]?.url || "/og-image.svg",
    "offers": {
      "@type": "Offer",
      "url": `https://startexus.com/listings/${processedListing.slug}`,
      "priceCurrency": "USD",
      "price": processedListing.askingPrice || 0,
      "priceValidUntil": new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Person",
        "name": processedListing.seller.name || "Business Owner"
      }
    }
  }

  // Add additional properties if available
  if (processedListing.mrr) {
    productSchema["additionalProperty"] = [
      {
        "@type": "PropertyValue",
        "name": "Monthly Recurring Revenue",
        "value": processedListing.mrr
      }
    ]
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productSchema)
        }}
      />
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: 'https://startexus.com' },
          { name: 'Browse', url: 'https://startexus.com/browse' },
          { name: processedListing.businessType, url: `https://startexus.com/browse?type=${processedListing.businessType}` },
          { name: processedListing.title, url: `https://startexus.com/listings/${processedListing.slug}` },
        ]}
      />
      <ListingDetail listing={processedListing} session={session} isSaved={isSaved} />
    </>
  )
}