import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Verify deal exists and user is a participant
    const deal = await prisma.deal.findUnique({
      where: { id },
      select: { buyerId: true, sellerId: true },
    })

    if (!deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
    }

    if (deal.buyerId !== session.user.id && deal.sellerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const documents = await prisma.dealDocument.findMany({
      where: { dealId: id },
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
    })

    return NextResponse.json({ documents })
  } catch (error) {
    console.error('Failed to fetch documents:', error)
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { name, fileUrl, fileType, fileSize, category, description } = body

    if (!name || !fileUrl || !fileType || fileSize === undefined) {
      return NextResponse.json(
        { error: 'name, fileUrl, fileType, and fileSize are required' },
        { status: 400 }
      )
    }

    // Verify deal exists and user is a participant
    const deal = await prisma.deal.findUnique({
      where: { id },
      select: { buyerId: true, sellerId: true },
    })

    if (!deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
    }

    if (deal.buyerId !== session.user.id && deal.sellerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Validate category
    const validCategories = ['FINANCIALS', 'LEGAL', 'ANALYTICS', 'CONTRACTS', 'OTHER']
    const docCategory = category && validCategories.includes(category) ? category : 'OTHER'

    // Create document and event in a transaction
    const document = await prisma.$transaction(async (tx) => {
      const doc = await tx.dealDocument.create({
        data: {
          dealId: id,
          uploaderId: session.user.id,
          name,
          fileUrl,
          fileType,
          fileSize: Math.round(fileSize),
          category: docCategory,
          description: description || null,
        },
        include: {
          uploader: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })

      await tx.dealEvent.create({
        data: {
          dealId: id,
          type: 'DOCUMENT_ADDED',
          title: 'Document added',
          details: `"${name}" (${docCategory}) was uploaded`,
          actorId: session.user.id,
        },
      })

      return doc
    })

    return NextResponse.json({ document }, { status: 201 })
  } catch (error) {
    console.error('Failed to add document:', error)
    return NextResponse.json(
      { error: 'Failed to add document' },
      { status: 500 }
    )
  }
}
