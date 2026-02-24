import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createBlogPostSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  excerpt: z.string().optional(),
  content: z.string().min(1, 'Content is required'),
  featuredImage: z.string().optional(),
  tags: z.array(z.string()).default([]),
  categories: z.array(z.string()).default([]),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  featured: z.boolean().default(false),
})

// Generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim()
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const status = searchParams.get('status')
    const featured = searchParams.get('featured')
    const tag = searchParams.get('tag')
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    const where: any = {}

    // Check if this is an admin request
    const session = await getServerSession(authOptions)
    const isAdmin = session?.user?.role === 'ADMIN'

    // Filter by status (default to published for public access, all for admin)
    if (status) {
      where.status = status
    } else if (!isAdmin) {
      where.status = 'PUBLISHED'
    }
    // If admin and no status filter, show all posts

    // Filter by featured
    if (featured === 'true') {
      where.featured = true
    }

    // Search in title and content
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
        { excerpt: { contains: search } },
      ]
    }

    // Filter by tag or category (JSON contains)
    if (tag) {
      where.tags = { contains: `"${tag}"` }
    }
    if (category) {
      where.categories = { contains: `"${category}"` }
    }

    const posts = await prisma.blogPost.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
      orderBy: [
        { featured: 'desc' },
        { publishedAt: 'desc' },
        { createdAt: 'desc' },
      ],
      skip: (page - 1) * pageSize,
      take: pageSize,
    })

    const total = await prisma.blogPost.count({ where })

    // Parse JSON fields
    const processedPosts = posts.map(post => ({
      ...post,
      tags: JSON.parse(post.tags || '[]'),
      categories: JSON.parse(post.categories || '[]'),
    }))

    return NextResponse.json({
      posts: processedPosts,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    })
  } catch (error) {
    console.error('Failed to fetch blog posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
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

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Verify the user exists in the database to avoid foreign key constraint
    const userExists = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!userExists) {
      // Fallback to the known admin user if session user doesn't exist
      const adminUser = await prisma.user.findFirst({
        where: {
          email: 'info@startexus.com',
          role: 'ADMIN'
        }
      })

      if (!adminUser) {
        return NextResponse.json({
          error: 'No admin user found. Please contact support.'
        }, { status: 500 })
      }

      // Use the admin user's ID for blog post creation
      session.user.id = adminUser.id
    }

    const body = await request.json()
    const validatedData = createBlogPostSchema.parse(body)

    // Generate slug if not provided
    if (!validatedData.slug) {
      validatedData.slug = generateSlug(validatedData.title)
    }

    // Check if slug is unique
    const existingPost = await prisma.blogPost.findUnique({
      where: { slug: validatedData.slug },
    })

    if (existingPost) {
      // Generate a unique slug by appending a number
      let counter = 1
      let uniqueSlug = `${validatedData.slug}-${counter}`

      while (await prisma.blogPost.findUnique({ where: { slug: uniqueSlug } })) {
        counter++
        uniqueSlug = `${validatedData.slug}-${counter}`
      }

      validatedData.slug = uniqueSlug
    }

    const publishedAt = validatedData.status === 'PUBLISHED' ? new Date() : null

    const post = await prisma.blogPost.create({
      data: {
        ...validatedData,
        tags: JSON.stringify(validatedData.tags || []),
        categories: JSON.stringify(validatedData.categories || []),
        authorId: session.user.id,
        publishedAt,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    })

    // Parse JSON fields for response
    const processedPost = {
      ...post,
      tags: JSON.parse(post.tags || '[]'),
      categories: JSON.parse(post.categories || '[]'),
    }

    return NextResponse.json(processedPost)
  } catch (error) {
    console.error('Failed to create blog post:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create blog post' },
      { status: 500 }
    )
  }
}