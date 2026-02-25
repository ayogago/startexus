import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const verifications = await prisma.userVerification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ verifications })
  } catch (error) {
    console.error('Failed to fetch verifications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch verifications' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, documentUrl, notes } = body

    // Validate type
    const validTypes = ['IDENTITY', 'BUSINESS', 'FUNDS']
    if (!type || !validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid verification type. Must be one of: IDENTITY, BUSINESS, FUNDS' },
        { status: 400 }
      )
    }

    if (!documentUrl || typeof documentUrl !== 'string' || documentUrl.trim().length === 0) {
      return NextResponse.json(
        { error: 'Document URL is required' },
        { status: 400 }
      )
    }

    // Check if there's already a pending verification of this type
    const existingPending = await prisma.userVerification.findFirst({
      where: {
        userId: session.user.id,
        type,
        status: 'PENDING',
      },
    })

    if (existingPending) {
      return NextResponse.json(
        { error: `You already have a pending ${type} verification request` },
        { status: 409 }
      )
    }

    const verification = await prisma.userVerification.create({
      data: {
        userId: session.user.id,
        type,
        documentUrl: documentUrl.trim(),
        notes: notes?.trim() || null,
      },
    })

    return NextResponse.json(verification, { status: 201 })
  } catch (error) {
    console.error('Failed to create verification request:', error)
    return NextResponse.json(
      { error: 'Failed to create verification request' },
      { status: 500 }
    )
  }
}
