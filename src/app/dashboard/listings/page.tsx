import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Edit, Eye, Heart, Calendar, Plus, Star, DollarSign } from 'lucide-react'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { ListingImage } from '@/components/ui/listing-image'
import { getPlaceholderImage } from '@/lib/placeholder-images'

async function getUserListings(userId: string) {
  const listings = await prisma.listing.findMany({
    where: { sellerId: userId },
    orderBy: { createdAt: 'desc' },
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
  })

  return listings
}


export default async function MyListingsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return <div>Loading...</div>
  }

  if (session.user.role !== 'SELLER' && session.user.role !== 'ADMIN') {
    return (
      <div className="text-center py-8">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p>You need to be a seller to view this page.</p>
      </div>
    )
  }

  const listings = await getUserListings(session.user.id)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-green-100 text-green-800'
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800'
      case 'PENDING_REVIEW':
        return 'bg-yellow-100 text-yellow-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      case 'SOLD':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">My Listings</h1>
          <p className="text-gray-600">Manage your business listings</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/listings/new">
            <Plus className="w-4 h-4 mr-2" />
            Create New Listing
          </Link>
        </Button>
      </div>

      {listings.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Eye className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No listings yet</h3>
            <p className="text-gray-600 mb-6">Get started by creating your first business listing.</p>
            <Button asChild>
              <Link href="/dashboard/listings/new">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Listing
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {listings.map((listing) => (
            <Card key={listing.id} className={`hover:shadow-lg transition-shadow ${listing.featured ? 'ring-2 ring-yellow-400' : ''}`}>
              {listing.featured && (
                <div className="absolute top-2 right-2 z-10">
                  <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white shadow-md">
                    <Star className="w-3 h-3 mr-1 fill-current" />
                    Featured
                  </Badge>
                </div>
              )}

              <CardHeader className="pb-4">
                <div className="w-full h-48 bg-gray-200 rounded-lg mb-4 overflow-hidden">
                  <ListingImage
                    src={listing.images[0]?.url || getPlaceholderImage(listing.businessType)}
                    alt={listing.images[0]?.alt || `${listing.businessType} Business Placeholder`}
                    className="w-full h-full object-cover"
                    businessType={listing.businessType}
                  />
                </div>

                <div className="flex justify-between items-start mb-2">
                  <Badge className={getStatusColor(listing.status)}>
                    {listing.status.replace('_', ' ')}
                  </Badge>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Eye className="w-4 h-4" />
                      <span>{listing.views}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Heart className="w-4 h-4" />
                      <span>{listing._count.savedListings}</span>
                    </div>
                  </div>
                </div>

                <CardTitle className="text-lg line-clamp-2">{listing.title}</CardTitle>
                <CardDescription className="text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>Created {new Date(listing.createdAt).toLocaleDateString()}</span>
                  </div>
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Asking Price</span>
                    <span className="font-semibold">
                      {listing.askingPrice ? formatCurrency(listing.askingPrice) : 'Open to offers'}
                    </span>
                  </div>
                  {listing.mrr && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">MRR</span>
                      <span className="font-semibold">{formatCurrency(listing.mrr)}</span>
                    </div>
                  )}
                  {listing.revenueTtm && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Annual Revenue</span>
                      <span className="font-semibold">{formatCurrency(listing.revenueTtm)}</span>
                    </div>
                  )}
                </div>

                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" asChild className="flex-1">
                    <Link href={`/listings/${listing.slug}`}>
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild className="flex-1">
                    <Link href={`/dashboard/listings/${listing.id}/edit`}>
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}