import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    // Verify ownership
    const savedSearch = await prisma.savedSearch.findUnique({
      where: { id },
    })

    if (!savedSearch) {
      return NextResponse.json({ error: 'Saved search not found' }, { status: 404 })
    }

    if (savedSearch.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.savedSearch.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete saved search:', error)
    return NextResponse.json(
      { error: 'Failed to delete saved search' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()
    const { emailAlert } = body

    if (typeof emailAlert !== 'boolean') {
      return NextResponse.json(
        { error: 'emailAlert must be a boolean' },
        { status: 400 }
      )
    }

    // Verify ownership
    const savedSearch = await prisma.savedSearch.findUnique({
      where: { id },
    })

    if (!savedSearch) {
      return NextResponse.json({ error: 'Saved search not found' }, { status: 404 })
    }

    if (savedSearch.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const updated = await prisma.savedSearch.update({
      where: { id },
      data: { emailAlert },
    })

    return NextResponse.json({
      savedSearch: {
        ...updated,
        filters: (() => {
          try {
            return typeof updated.filters === 'string'
              ? JSON.parse(updated.filters)
              : updated.filters
          } catch {
            return {}
          }
        })(),
      },
    })
  } catch (error) {
    console.error('Failed to update saved search:', error)
    return NextResponse.json(
      { error: 'Failed to update saved search' },
      { status: 500 }
    )
  }
}
