import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateBlogPostSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  slug: z.string().min(1, 'Slug is required').optional(),
  content: z.string().min(1, 'Content is required').optional(),
  featuredImage: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
})

const PREDEFINED_TAGS = [
  'online business',
  'acquisition',
  'investment',
  'due diligence',
  'valuation',
  'saas',
  'ecommerce',
  'ai',
  'passive income',
  'entrepreneurship',
  'digital assets',
  'roi',
  'growth',
  'startup',
  'exit strategy',
]

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function generateExcerpt(content: string): string {
  const plainText = stripHtml(content)
  if (plainText.length <= 160) return plainText
  return plainText.slice(0, 157).replace(/\s+\S*$/, '') + '...'
}

function generateMetaDescription(title: string, content: string): string {
  const plainText = stripHtml(content)
  const desc = plainText.slice(0, 155).replace(/\s+\S*$/, '')
  return desc.length < plainText.length ? desc + '...' : desc
}

function generateCategories(title: string, content: string): string[] {
  const text = (title + ' ' + stripHtml(content)).toLowerCase()
  const matched: string[] = []

  const categoryKeywords: Record<string, string[]> = {
    'Business Acquisition': ['acquisition', 'acquire', 'buying a business', 'purchase', 'buy a business', 'deal'],
    'Due Diligence': ['due diligence', 'audit', 'investigation', 'verify', 'assessment', 'risk analysis'],
    'Valuation': ['valuation', 'value', 'worth', 'pricing', 'appraisal', 'multiple', 'revenue multiple'],
    'SaaS': ['saas', 'software as a service', 'subscription', 'mrr', 'arr', 'recurring revenue', 'churn'],
    'E-commerce': ['ecommerce', 'e-commerce', 'online store', 'shopify', 'amazon', 'dropshipping', 'retail'],
    'AI & Technology': ['ai', 'artificial intelligence', 'machine learning', 'technology', 'automation', 'tech', 'gpt', 'llm'],
    'Investment Tips': ['invest', 'investment', 'tips', 'strategy', 'portfolio', 'returns', 'roi', 'profit'],
    'Case Studies': ['case study', 'case studies', 'example', 'real-world', 'success story', 'how we', 'lessons learned'],
    'Market Analysis': ['market', 'analysis', 'trend', 'industry', 'forecast', 'report', 'data', 'statistics'],
    'Success Stories': ['success', 'story', 'journey', 'achieved', 'grew', 'scaled', 'milestone', 'transformation'],
  }

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(kw => text.includes(kw))) {
      matched.push(category)
    }
  }

  if (matched.length === 0) {
    matched.push('Investment Tips')
  }

  return matched.slice(0, 3)
}

function generateTags(title: string, content: string): string[] {
  const text = (title + ' ' + stripHtml(content)).toLowerCase()
  const matched: string[] = []

  for (const tag of PREDEFINED_TAGS) {
    if (text.includes(tag)) {
      matched.push(tag)
    }
  }

  const extraMappings: Record<string, string> = {
    'saas': 'saas',
    'e-commerce': 'ecommerce',
    'ecommerce': 'ecommerce',
    'artificial intelligence': 'ai',
    'machine learning': 'ai',
    'invest': 'investment',
    'acquire': 'acquisition',
    'startup': 'startup',
    'entrepreneur': 'entrepreneurship',
    'passive income': 'passive income',
    'digital': 'digital assets',
    'growth': 'growth',
    'roi': 'roi',
    'exit': 'exit strategy',
    'due diligence': 'due diligence',
    'valuation': 'valuation',
  }

  for (const [keyword, tag] of Object.entries(extraMappings)) {
    if (text.includes(keyword) && !matched.includes(tag)) {
      matched.push(tag)
    }
  }

  if (matched.length === 0) {
    matched.push('online business')
  }

  return Array.from(new Set(matched)).slice(0, 6)
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const post = await prisma.blogPost.findUnique({
      where: { id },
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
      where: { id },
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = params
    const body = await request.json()
    const validatedData = updateBlogPostSchema.parse(body)

    // Check if post exists
    const existingPost = await prisma.blogPost.findUnique({
      where: { id },
    })

    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // If slug is being updated, check uniqueness
    if (validatedData.slug && validatedData.slug !== existingPost.slug) {
      const slugExists = await prisma.blogPost.findUnique({
        where: { slug: validatedData.slug },
      })

      if (slugExists) {
        return NextResponse.json(
          { error: 'Slug already exists' },
          { status: 400 }
        )
      }
    }

    // Update published date if status changes to published
    let publishedAt = existingPost.publishedAt
    if (validatedData.status === 'PUBLISHED' && existingPost.status !== 'PUBLISHED') {
      publishedAt = new Date()
    }

    // Auto-regenerate metadata from updated content
    const title = validatedData.title || existingPost.title
    const content = validatedData.content || existingPost.content

    const updateData: any = {
      ...validatedData,
      publishedAt,
      excerpt: generateExcerpt(content),
      metaTitle: title,
      metaDescription: generateMetaDescription(title, content),
      tags: JSON.stringify(generateTags(title, content)),
      categories: JSON.stringify(generateCategories(title, content)),
    }

    const updatedPost = await prisma.blogPost.update({
      where: { id },
      data: updateData,
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
      ...updatedPost,
      tags: JSON.parse(updatedPost.tags || '[]'),
      categories: JSON.parse(updatedPost.categories || '[]'),
    }

    return NextResponse.json(processedPost)
  } catch (error) {
    console.error('Failed to update blog post:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update blog post' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = params

    // Check if post exists
    const existingPost = await prisma.blogPost.findUnique({
      where: { id },
    })

    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    await prisma.blogPost.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete blog post:', error)
    return NextResponse.json(
      { error: 'Failed to delete blog post' },
      { status: 500 }
    )
  }
}
