import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { notFound } from 'next/navigation'
import { DealDetailClient } from './deal-detail-client'

async function getDeal(id: string, userId: string) {
  const deal = await prisma.deal.findUnique({
    where: { id },
    include: {
      listing: {
        select: {
          id: true,
          title: true,
          slug: true,
          askingPrice: true,
          businessType: true,
          category: true,
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
          company: true,
        },
      },
      seller: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          verified: true,
          company: true,
        },
      },
      timeline: {
        orderBy: { createdAt: 'desc' },
      },
      documents: {
        include: {
          uploader: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
      calls: {
        include: {
          scheduler: {
            select: { id: true, name: true, email: true },
          },
          receiver: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { scheduledAt: 'asc' },
      },
    },
  })

  if (!deal) return null

  // Only buyer or seller can access
  if (deal.buyerId !== userId && deal.sellerId !== userId) {
    return null
  }

  return deal
}

export default async function DealDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  const { id } = await params
  const deal = await getDeal(id, session.user.id)

  if (!deal) {
    notFound()
  }

  return (
    <DealDetailClient
      deal={JSON.parse(JSON.stringify(deal))}
      currentUserId={session.user.id}
    />
  )
}
