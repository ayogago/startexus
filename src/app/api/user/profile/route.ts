import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const updateProfileSchema = z.object({
  name: z.string().max(100).optional(),
  handle: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_-]+$/, 'Handle can only contain letters, numbers, hyphens, and underscores').optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional().or(z.literal('')),
  company: z.string().max(100).optional(),
  location: z.string().max(100).optional(),
  website: z.string().url().optional().or(z.literal('')),
})

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateProfileSchema.parse(body)

    // Check if handle is unique (if provided)
    if (validatedData.handle) {
      const existingUser = await prisma.user.findUnique({
        where: { handle: validatedData.handle },
      })

      if (existingUser && existingUser.id !== session.user.id) {
        return NextResponse.json(
          { error: 'Username is already taken' },
          { status: 409 }
        )
      }
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: validatedData.name || null,
        handle: validatedData.handle || null,
        bio: validatedData.bio || null,
        avatarUrl: validatedData.avatarUrl || null,
        company: validatedData.company || null,
        location: validatedData.location || null,
        website: validatedData.website || null,
      },
      select: {
        id: true,
        name: true,
        handle: true,
        bio: true,
        avatarUrl: true,
        company: true,
        location: true,
        website: true,
        email: true,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Failed to update profile:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        handle: true,
        bio: true,
        avatarUrl: true,
        company: true,
        location: true,
        website: true,
        email: true,
        role: true,
        verified: true,
        createdAt: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Failed to fetch profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}