import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Briefcase, ArrowRight, Calendar, DollarSign, User, Building2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { DealsTabs } from './deals-tabs'

const STAGE_CONFIG: Record<string, { label: string; color: string }> = {
  INQUIRY: { label: 'Inquiry', color: 'bg-blue-100 text-blue-800' },
  OFFER: { label: 'Offer', color: 'bg-purple-100 text-purple-800' },
  NEGOTIATION: { label: 'Negotiation', color: 'bg-yellow-100 text-yellow-800' },
  DUE_DILIGENCE: { label: 'Due Diligence', color: 'bg-orange-100 text-orange-800' },
  CLOSING: { label: 'Closing', color: 'bg-indigo-100 text-indigo-800' },
  COMPLETED: { label: 'Completed', color: 'bg-green-100 text-green-800' },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
}

async function getUserDeals(userId: string) {
  const deals = await prisma.deal.findMany({
    where: {
      OR: [
        { buyerId: userId },
        { sellerId: userId },
      ],
    },
    include: {
      listing: {
        select: {
          id: true,
          title: true,
          slug: true,
          askingPrice: true,
          businessType: true,
          images: {
            orderBy: { order: 'asc' },
            take: 1,
          },
        },
      },
      buyer: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          verified: true,
        },
      },
      seller: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          verified: true,
        },
      },
      timeline: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
    orderBy: { updatedAt: 'desc' },
  })

  return deals
}

export default async function DealsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  const rawDeals = await getUserDeals(session.user.id)
  // Serialize Date objects for client component
  const deals = JSON.parse(JSON.stringify(rawDeals))

  const activeDeals = deals.filter(
    (d: any) => !['COMPLETED', 'CANCELLED'].includes(d.stage)
  )
  const completedDeals = deals.filter((d: any) => d.stage === 'COMPLETED')
  const cancelledDeals = deals.filter((d: any) => d.stage === 'CANCELLED')

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Deal Pipeline</h1>
          <p className="text-gray-600">
            Track and manage your acquisition deals
          </p>
        </div>
      </div>

      {deals.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Briefcase className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No deals yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start by browsing listings and expressing interest in a business.
            </p>
            <Button asChild>
              <Link href="/listings">Browse Listings</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <DealsTabs
          activeDeals={activeDeals}
          completedDeals={completedDeals}
          cancelledDeals={cancelledDeals}
          currentUserId={session.user.id}
          stageConfig={STAGE_CONFIG}
        />
      )}
    </div>
  )
}
