import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface RouteContext {
  params: {
    id: string
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const verificationId = params.id
    const body = await request.json()
    const { status, notes } = body

    // Validate status
    if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        { error: 'Status must be APPROVED or REJECTED' },
        { status: 400 }
      )
    }

    // Fetch the verification request
    const verification = await prisma.userVerification.findUnique({
      where: { id: verificationId },
    })

    if (!verification) {
      return NextResponse.json(
        { error: 'Verification request not found' },
        { status: 404 }
      )
    }

    if (verification.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'This verification request has already been reviewed' },
        { status: 400 }
      )
    }

    // Update verification request
    const updatedVerification = await prisma.userVerification.update({
      where: { id: verificationId },
      data: {
        status,
        reviewedBy: session.user.id,
        reviewedAt: new Date(),
        notes: notes?.trim() || verification.notes,
      },
    })

    // If approved and type is IDENTITY, set user.verified = true
    if (status === 'APPROVED' && verification.type === 'IDENTITY') {
      await prisma.user.update({
        where: { id: verification.userId },
        data: { verified: true },
      })
    }

    // Create notification for the user
    try {
      const statusText = status === 'APPROVED' ? 'approved' : 'rejected'
      await prisma.notification.create({
        data: {
          userId: verification.userId,
          type: 'VERIFICATION',
          title: `Verification ${statusText}`,
          message: `Your ${verification.type.toLowerCase()} verification has been ${statusText}.`,
          link: '/dashboard/verification',
        },
      })
    } catch {
      // Don't fail the update if notification fails
    }

    return NextResponse.json(updatedVerification)
  } catch (error) {
    console.error('Failed to review verification:', error)
    return NextResponse.json(
      { error: 'Failed to review verification' },
      { status: 500 }
    )
  }
}
