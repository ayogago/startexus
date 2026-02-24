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

    const savedSearches = await prisma.savedSearch.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    })

    // Parse filters JSON for each search
    const parsed = savedSearches.map((search) => ({
      ...search,
      filters: (() => {
        try {
          return typeof search.filters === 'string'
            ? JSON.parse(search.filters)
            : search.filters
        } catch {
          return {}
        }
      })(),
    }))

    return NextResponse.json({ savedSearches: parsed })
  } catch (error) {
    console.error('Failed to fetch saved searches:', error)
    return NextResponse.json(
      { error: 'Failed to fetch saved searches' },
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
    const { name, filters, emailAlert } = body

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    if (!filters || typeof filters !== 'object') {
      return NextResponse.json(
        { error: 'Filters are required' },
        { status: 400 }
      )
    }

    // Limit to 20 saved searches per user
    const count = await prisma.savedSearch.count({
      where: { userId: session.user.id },
    })

    if (count >= 20) {
      return NextResponse.json(
        { error: 'Maximum of 20 saved searches reached. Please delete some before adding more.' },
        { status: 400 }
      )
    }

    const savedSearch = await prisma.savedSearch.create({
      data: {
        userId: session.user.id,
        name: name.trim(),
        filters: JSON.stringify(filters),
        emailAlert: emailAlert !== false,
      },
    })

    return NextResponse.json({
      savedSearch: {
        ...savedSearch,
        filters,
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Failed to create saved search:', error)
    return NextResponse.json(
      { error: 'Failed to create saved search' },
      { status: 500 }
    )
  }
}
