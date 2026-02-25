'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import { ArrowRight, Calendar, DollarSign, User, Building2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface DealForList {
  id: string
  createdAt: string
  updatedAt: string
  stage: string
  offerAmount: number | null
  notes: string | null
  listing: {
    id: string
    title: string
    slug: string
    askingPrice: number | null
    businessType: string
    images: { url: string }[]
  }
  buyer: {
    id: string
    name: string | null
    email: string
    avatarUrl: string | null
    verified: boolean
  }
  seller: {
    id: string
    name: string | null
    email: string
    avatarUrl: string | null
    verified: boolean
  }
  timeline: {
    id: string
    createdAt: string
    type: string
    title: string
    details: string | null
  }[]
}

interface DealsTabsProps {
  activeDeals: DealForList[]
  completedDeals: DealForList[]
  cancelledDeals: DealForList[]
  currentUserId: string
  stageConfig: Record<string, { label: string; color: string }>
}

function DealCard({
  deal,
  currentUserId,
  stageConfig,
}: {
  deal: DealForList
  currentUserId: string
  stageConfig: Record<string, { label: string; color: string }>
}) {
  const isBuyer = deal.buyer.id === currentUserId
  const counterparty = isBuyer ? deal.seller : deal.buyer
  const role = isBuyer ? 'Buyer' : 'Seller'
  const stageInfo = stageConfig[deal.stage] || {
    label: deal.stage,
    color: 'bg-gray-100 text-gray-800',
  }
  const lastEvent = deal.timeline[0]

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg line-clamp-1">
              {deal.listing.title}
            </CardTitle>
            <CardDescription className="mt-1">
              <span className="inline-flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                {deal.listing.businessType}
              </span>
            </CardDescription>
          </div>
          <Badge className={stageInfo.color}>{stageInfo.label}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <User className="w-4 h-4" />
              <span>
                {counterparty.name || counterparty.email}
              </span>
              <Badge variant="outline" className="text-xs">
                {isBuyer ? 'Seller' : 'Buyer'}
              </Badge>
            </div>
            <Badge variant="outline" className="text-xs">
              You are {role}
            </Badge>
          </div>

          <div className="flex items-center justify-between text-sm">
            {deal.listing.askingPrice ? (
              <div className="flex items-center gap-1 text-gray-600">
                <DollarSign className="w-4 h-4" />
                <span>Asking: {formatCurrency(deal.listing.askingPrice)}</span>
              </div>
            ) : (
              <div className="text-gray-500 text-sm">Open to offers</div>
            )}
            {deal.offerAmount && (
              <div className="font-semibold text-green-700">
                Offer: {formatCurrency(deal.offerAmount)}
              </div>
            )}
          </div>

          {lastEvent && (
            <div className="text-xs text-gray-500 border-t pt-2">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>
                  {lastEvent.title} &mdash;{' '}
                  {new Date(lastEvent.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          )}

          <Button asChild variant="outline" size="sm" className="w-full">
            <Link href={`/dashboard/deals/${deal.id}`}>
              View Deal
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function DealsTabs({
  activeDeals,
  completedDeals,
  cancelledDeals,
  currentUserId,
  stageConfig,
}: DealsTabsProps) {
  return (
    <Tabs defaultValue="active" className="space-y-6">
      <TabsList>
        <TabsTrigger value="active">
          Active ({activeDeals.length})
        </TabsTrigger>
        <TabsTrigger value="completed">
          Completed ({completedDeals.length})
        </TabsTrigger>
        <TabsTrigger value="cancelled">
          Cancelled ({cancelledDeals.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="active">
        {activeDeals.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">No active deals</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {activeDeals.map((deal) => (
              <DealCard
                key={deal.id}
                deal={deal}
                currentUserId={currentUserId}
                stageConfig={stageConfig}
              />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="completed">
        {completedDeals.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">No completed deals</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {completedDeals.map((deal) => (
              <DealCard
                key={deal.id}
                deal={deal}
                currentUserId={currentUserId}
                stageConfig={stageConfig}
              />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="cancelled">
        {cancelledDeals.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">No cancelled deals</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {cancelledDeals.map((deal) => (
              <DealCard
                key={deal.id}
                deal={deal}
                currentUserId={currentUserId}
                stageConfig={stageConfig}
              />
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  )
}
