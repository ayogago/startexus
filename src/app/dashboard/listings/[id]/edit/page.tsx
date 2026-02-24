import { getServerSession } from 'next-auth'
import { redirect, notFound } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ListingEditor } from '@/components/dashboard/listing-editor'

async function getListing(id: string, userId: string) {
  const listing = await prisma.listing.findFirst({
    where: {
      id,
      sellerId: userId, // Ensure user can only edit their own listings
    },
    include: {
      images: {
        orderBy: { order: 'asc' },
      },
    },
  })

  return listing
}

export default async function EditListingPage({
  params
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session || (session.user.role !== 'SELLER' && session.user.role !== 'ADMIN')) {
    redirect('/dashboard')
  }

  const listing = await getListing(params.id, session.user.id)

  if (!listing) {
    notFound()
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Edit Listing</h1>
        <p className="text-gray-600">
          Update your business listing details
        </p>
      </div>

      <ListingEditor initialData={listing} mode="edit" />
    </div>
  )
}