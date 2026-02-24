import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const subscribers = await prisma.newsletterSubscriber.findMany({
      include: {
        emailsSent: {
          orderBy: { sentAt: 'desc' },
          take: 5,
        },
        _count: {
          select: {
            emailsSent: true,
          },
        },
      },
      orderBy: { subscribedAt: 'desc' },
    })

    const stats = {
      totalSubscribers: await prisma.newsletterSubscriber.count({
        where: { status: 'ACTIVE' },
      }),
      totalUnsubscribed: await prisma.newsletterSubscriber.count({
        where: { status: 'UNSUBSCRIBED' },
      }),
      totalEmailsSent: await prisma.newsletterEmail.count(),
      totalOpened: await prisma.newsletterEmail.count({
        where: { openedAt: { not: null } },
      }),
      totalClicked: await prisma.newsletterEmail.count({
        where: { clickedAt: { not: null } },
      }),
    }

    return NextResponse.json({ subscribers, stats })
  } catch (error) {
    console.error('Failed to fetch newsletter data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch newsletter data' },
      { status: 500 }
    )
  }
}
