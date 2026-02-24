import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logAuditEvent } from '@/lib/audit'

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

    const { action } = await request.json()
    const userId = params.id

    if (!['disable', 'enable', 'verify'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // Prevent admin from disabling themselves
    if (userId === session.user.id && action === 'disable') {
      return NextResponse.json({ error: 'Cannot disable yourself' }, { status: 400 })
    }

    const updateData: any = {}

    if (action === 'disable') {
      updateData.disabled = true
    } else if (action === 'enable') {
      updateData.disabled = false
    } else if (action === 'verify') {
      updateData.verified = true
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    })

    // Audit logging for admin user actions
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') || undefined

    const actionMap: Record<string, string> = {
      disable: 'USER_DISABLED',
      enable: 'USER_ENABLED',
      verify: 'USER_VERIFIED',
    }

    await logAuditEvent({
      userId: session.user.id,
      action: actionMap[action] || 'USER_UPDATED',
      targetType: 'USER',
      targetId: userId,
      details: `User "${user.name || user.email}" ${action}d by admin`,
      ipAddress: ip,
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Failed to update user:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = params.id

    // Prevent admin from deleting themselves
    if (userId === session.user.id) {
      return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 })
    }

    // Delete related records first
    await prisma.savedListing.deleteMany({
      where: { userId }
    })

    await prisma.listing.deleteMany({
      where: { sellerId: userId }
    })

    await prisma.report.deleteMany({
      where: { reporterId: userId }
    })

    // Delete the user
    await prisma.user.delete({
      where: { id: userId }
    })

    // Audit logging for user deletion
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') || undefined

    await logAuditEvent({
      userId: session.user.id,
      action: 'USER_DELETED',
      targetType: 'USER',
      targetId: userId,
      details: `User deleted by admin`,
      ipAddress: ip,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}