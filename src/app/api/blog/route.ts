import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createBlogPostSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  content: z.string().min(1, 'Content is required'),
  featuredImage: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
})

const PREDEFINED_CATEGORIES = [
  'Business Acquisition',
  'Due Diligence',
  'Valuation',
  'SaaS',
  'E-commerce',
  'AI & Technology',
  'Investment Tips',
  'Case Studies',
  'Market Analysis',
  'Success Stories',
]

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

  // Also check partial matches for common terms
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

  return [...new Set(matched)].slice(0, 6)
}

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

    // Auto-generate metadata from content
    const excerpt = generateExcerpt(validatedData.content)
    const metaTitle = validatedData.title
    const metaDescription = generateMetaDescription(validatedData.title, validatedData.content)
    const categories = generateCategories(validatedData.title, validatedData.content)
    const tags = generateTags(validatedData.title, validatedData.content)

    const publishedAt = validatedData.status === 'PUBLISHED' ? new Date() : null

    const post = await prisma.blogPost.create({
      data: {
        title: validatedData.title,
        slug: validatedData.slug,
        content: validatedData.content,
        featuredImage: validatedData.featuredImage,
        status: validatedData.status,
        excerpt,
        metaTitle,
        metaDescription,
        tags: JSON.stringify(tags),
        categories: JSON.stringify(categories),
        featured: false,
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
