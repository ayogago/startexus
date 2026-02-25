function sanitizeHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*"[^"]*"/gi, '')
    .replace(/on\w+\s*=\s*'[^']*'/gi, '')
    .replace(/on\w+\s*=\s*[^\s>]*/gi, '')
    .replace(/javascript\s*:/gi, 'blocked:')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^>]*>/gi, '')
}

import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, MessageSquare, User, ArrowLeft, ArrowRight, Tag } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { NewsletterSignup } from '@/components/blog/newsletter-signup'
import { ShareButton } from '@/components/blog/share-button'
import { BreadcrumbSchema } from '@/components/seo/breadcrumb-schema'

async function getBlogPost(slug: string) {
  const post = await prisma.blogPost.findUnique({
    where: {
      slug,
      status: 'PUBLISHED'
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          bio: true,
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
            orderBy: { createdAt: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!post) return null

  // Increment views
  await prisma.blogPost.update({
    where: { slug },
    data: { views: { increment: 1 } },
  })

  return {
    ...post,
    tags: JSON.parse(post.tags || '[]'),
    categories: JSON.parse(post.categories || '[]'),
  }
}

async function getRelatedPosts(currentPostId: string, tags: string[]) {
  if (tags.length === 0) return []

  const posts = await prisma.blogPost.findMany({
    where: {
      status: 'PUBLISHED',
      id: { not: currentPostId },
      OR: tags.map(tag => ({
        tags: { contains: `"${tag}"` }
      }))
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
    orderBy: { publishedAt: 'desc' },
    take: 3,
  })

  return posts.map(post => ({
    ...post,
    tags: JSON.parse(post.tags || '[]'),
    categories: JSON.parse(post.categories || '[]'),
  }))
}

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function getReadingTime(content: string) {
  const wordsPerMinute = 200
  const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length
  return Math.ceil(words / wordsPerMinute)
}

// Force dynamic rendering to avoid stale static data
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = await getBlogPost(params.slug)

  if (!post) {
    return {
      title: 'Post Not Found',
    }
  }

  const imageUrl = post.featuredImage || '/og-image.svg'

  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt,
    keywords: post.tags,
    authors: post.author.name ? [{ name: post.author.name }] : [],
    openGraph: {
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt || '',
      url: `https://startexus.com/blog/${post.slug}`,
      type: 'article',
      publishedTime: post.publishedAt?.toISOString(),
      authors: post.author.name ? [post.author.name] : [],
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt || '',
      images: [imageUrl],
    },
    alternates: {
      canonical: `https://startexus.com/blog/${post.slug}`,
    },
  }
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getBlogPost(params.slug)

  if (!post) {
    notFound()
  }

  const relatedPosts = await getRelatedPosts(post.id, post.tags)

  // Generate Article schema for SEO
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.excerpt || post.metaDescription,
    "image": post.featuredImage || "/og-image.svg",
    "datePublished": post.publishedAt?.toISOString(),
    "dateModified": post.updatedAt.toISOString(),
    "author": {
      "@type": "Person",
      "name": post.author.name || "StartExus Team",
      "url": `https://startexus.com/blog`,
    },
    "publisher": {
      "@type": "Organization",
      "name": "StartExus",
      "logo": {
        "@type": "ImageObject",
        "url": "https://startexus.com/startexus-light.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://startexus.com/blog/${post.slug}`
    },
    "wordCount": post.content.replace(/<[^>]*>/g, '').split(/\s+/).length,
    "keywords": post.tags.join(', '),
    "articleSection": post.categories,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleSchema)
        }}
      />
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: 'https://startexus.com' },
          { name: 'Blog', url: 'https://startexus.com/blog' },
          { name: post.title, url: `https://startexus.com/blog/${post.slug}` },
        ]}
      />
      {/* Hero Section */}
      <section className="relative bg-white shadow-lg">
        {post.featuredImage && (
          <div className="absolute inset-0 z-0">
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-full h-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/50 to-transparent" />
          </div>
        )}

        <div className="relative z-10 container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <Link href="/blog">
                <Button variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Blog
                </Button>
              </Link>
            </div>

            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                {post.categories.map((category: string) => (
                  <Badge key={category} variant="secondary" className="bg-blue-100 text-blue-800">
                    {category}
                  </Badge>
                ))}
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                {post.title}
              </h1>

              {post.excerpt && (
                <p className="text-xl text-gray-600 leading-relaxed">
                  {post.excerpt}
                </p>
              )}

              <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-3">
                    {post.author.avatarUrl && (
                      <img
                        src={post.author.avatarUrl}
                        alt={post.author.name || 'Author'}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <div className="font-semibold text-gray-900">{post.author.name}</div>
                      <div className="text-sm text-gray-500">Author</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(post.publishedAt!)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{getReadingTime(post.content)} min read</span>
                    </div>
                  </div>
                </div>

                <ShareButton
                  title={post.title}
                  url={`https://startexus.com/blog/${post.slug}`}
                  text={post.excerpt || post.title}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <article className="lg:col-span-3">
            <Card className="shadow-lg border-0 mb-8">
              <CardContent className="p-8">
                <div
                  className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-a:text-blue-600 prose-img:rounded-lg prose-img:shadow-md prose-img:my-8 prose-img:w-full prose-img:h-auto prose-code:text-pink-600 prose-code:bg-pink-50 prose-pre:bg-gray-900"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }}
                />
              </CardContent>
            </Card>

            {/* Tags */}
            {post.tags.length > 0 && (
              <Card className="shadow-lg border-0 mb-8">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Tag className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold">Tags</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag: string) => (
                      <Link key={tag} href={`/blog/tag/${encodeURIComponent(tag)}`}>
                        <Badge
                          variant="secondary"
                          className="hover:bg-blue-100 hover:text-blue-800 transition-colors cursor-pointer"
                        >
                          {tag}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Author Bio */}
            <Card className="shadow-lg border-0 mb-8">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  {post.author.avatarUrl && (
                    <img
                      src={post.author.avatarUrl}
                      alt={post.author.name || 'Author'}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">About {post.author.name}</h3>
                    {post.author.bio ? (
                      <p className="text-gray-600">{post.author.bio}</p>
                    ) : (
                      <p className="text-gray-600">Passionate about online business and entrepreneurship.</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Comments Section */}
            {post.comments.length > 0 && (
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                    <span>Comments ({post.comments.length})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {post.comments.map((comment) => (
                      <div key={comment.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                        <div className="flex items-start space-x-4">
                          {comment.author?.avatarUrl && (
                            <img
                              src={comment.author.avatarUrl}
                              alt={comment.author.name || 'Commenter'}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          )}
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="font-semibold">{comment.author?.name || 'Anonymous'}</span>
                              <span className="text-sm text-gray-500">
                                {formatDate(comment.createdAt)}
                              </span>
                            </div>
                            <p className="text-gray-700 mb-3">{comment.content}</p>

                            {comment.replies.length > 0 && (
                              <div className="ml-6 space-y-4 border-l-2 border-gray-100 pl-4">
                                {comment.replies.map((reply) => (
                                  <div key={reply.id} className="flex items-start space-x-3">
                                    {reply.author?.avatarUrl && (
                                      <img
                                        src={reply.author.avatarUrl}
                                        alt={reply.author.name || 'Commenter'}
                                        className="w-8 h-8 rounded-full object-cover"
                                      />
                                    )}
                                    <div className="flex-1">
                                      <div className="flex items-center space-x-2 mb-1">
                                        <span className="font-medium text-sm">{reply.author?.name || 'Anonymous'}</span>
                                        <span className="text-xs text-gray-500">
                                          {formatDate(reply.createdAt)}
                                        </span>
                                      </div>
                                      <p className="text-sm text-gray-700">{reply.content}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </article>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Newsletter Signup */}
            <NewsletterSignup />

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle>Related Posts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {relatedPosts.map((relatedPost) => (
                      <Link key={relatedPost.id} href={`/blog/${relatedPost.slug}`}>
                        <div className="group border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <h4 className="font-medium text-sm group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                            {relatedPost.title}
                          </h4>
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <span>{formatDate(relatedPost.publishedAt!)}</span>
                            <span>•</span>
                            <span>{getReadingTime(relatedPost.content)} min read</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Browse Businesses CTA */}
            <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-purple-50">
              <CardContent className="p-6 text-center">
                <h3 className="font-semibold text-blue-900 mb-2">Ready to Buy a Business?</h3>
                <p className="text-blue-700 text-sm mb-4">
                  Browse profitable online businesses for sale
                </p>
                <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Link href="/browse">
                    Browse Listings
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}