import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AdminListingEditor } from '@/components/admin/admin-listing-editor'

interface PageProps {
  params: {
    id: string
  }
}

export default async function AdminEditListingPage({ params }: PageProps) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Edit Listing</h1>
        <p className="text-gray-600">
          As an admin, you can edit all aspects of this listing
        </p>
      </div>
      <AdminListingEditor listingId={params.id} />
    </div>
  )
}