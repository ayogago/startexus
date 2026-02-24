import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { ListingEditor } from '@/components/dashboard/listing-editor'

export default async function NewListingPage() {
  const session = await getServerSession(authOptions)

  if (!session || (session.user.role !== 'SELLER' && session.user.role !== 'ADMIN')) {
    redirect('/dashboard')
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create New Listing</h1>
        <p className="text-gray-600">
          List your business for sale on our marketplace
        </p>
      </div>

      <ListingEditor />
    </div>
  )
}