#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function reindexSlugs() {
  try {
    console.log('🔄 Starting slug reindexing...')

    const listings = await prisma.listing.findMany({
      select: { id: true, title: true, slug: true },
    })

    console.log(`Found ${listings.length} listings to process`)

    for (const listing of listings) {
      const newSlug = slugify(listing.title)

      if (newSlug !== listing.slug) {
        // Check if the new slug already exists
        const existingListing = await prisma.listing.findUnique({
          where: { slug: newSlug },
        })

        let finalSlug = newSlug
        if (existingListing && existingListing.id !== listing.id) {
          // Generate unique slug by appending timestamp
          finalSlug = `${newSlug}-${Date.now()}`
        }

        await prisma.listing.update({
          where: { id: listing.id },
          data: { slug: finalSlug },
        })

        console.log(`✓ Updated "${listing.title}": ${listing.slug} → ${finalSlug}`)
      } else {
        console.log(`- Skipped "${listing.title}": slug already correct`)
      }
    }

    console.log('\n✅ Slug reindexing completed successfully!')

  } catch (error) {
    console.error('❌ Failed to reindex slugs:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

reindexSlugs()