import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    const post = await prisma.blogPost.findUnique({
      where: {
        slug,
        status: 'PUBLISHED' // Only return published posts for public access
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        comments: {
          where: { status: 'APPROVED' },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
            replies: {
              where: { status: 'APPROVED' },
              include: {
                author: {
                  select: {
                    id: true,
                    name: true,
                    avatarUrl: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Increment views
    await prisma.blogPost.update({
      where: { slug },
      data: { views: { increment: 1 } },
    })

    // Parse JSON fields
    const processedPost = {
      ...post,
      tags: JSON.parse(post.tags || '[]'),
      categories: JSON.parse(post.categories || '[]'),
    }

    return NextResponse.json(processedPost)
  } catch (error) {
    console.error('Failed to fetch blog post:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blog post' },
      { status: 500 }
    )
  }
}