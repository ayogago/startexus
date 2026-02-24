import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { Calendar, Clock, Star, Search, User, ArrowRight } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { NewsletterSignup } from '@/components/blog/newsletter-signup'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Insights, tips, and stories about buying and selling online businesses, SaaS acquisitions, and digital entrepreneurship.',
  alternates: { canonical: '/blog' },
}

async function getFeaturedPosts() {
  const posts = await prisma.blogPost.findMany({
    where: {
      status: 'PUBLISHED',
      featured: true,
    },
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
    orderBy: { publishedAt: 'desc' },
    take: 3,
  })

  return posts.map(post => {
    let tags: string[] = []
    let categories: string[] = []
    try { tags = JSON.parse(post.tags || '[]') } catch {}
    try { categories = JSON.parse(post.categories || '[]') } catch {}
    return { ...post, tags, categories }
  })
}

async function getRecentPosts() {
  const posts = await prisma.blogPost.findMany({
    where: {
      status: 'PUBLISHED',
    },
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
    orderBy: { publishedAt: 'desc' },
    take: 6,
  })

  return posts.map(post => {
    let tags: string[] = []
    let categories: string[] = []
    try { tags = JSON.parse(post.tags || '[]') } catch {}
    try { categories = JSON.parse(post.categories || '[]') } catch {}
    return { ...post, tags, categories }
  })
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

export default async function BlogPage() {
  const [featuredPosts, recentPosts] = await Promise.all([
    getFeaturedPosts(),
    getRecentPosts(),
  ])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">StartExus Blog</h1>
            <p className="text-xl mb-8 text-blue-100">
              Insights, tips, and stories from the world of online business acquisition and growth
            </p>
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search blog posts..."
                className="pl-10 py-3 text-gray-900 bg-white border-0 rounded-xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-12">
            {/* Featured Posts */}
            {featuredPosts.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-bold text-gray-900">Featured Posts</h2>
                  <Star className="w-6 h-6 text-yellow-500" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredPosts.map((post) => (
                    <Card key={post.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg overflow-hidden">
                      {post.featuredImage && (
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={post.featuredImage}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-4 left-4">
                            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg">
                              <Star className="w-3 h-3 mr-1 fill-current" />
                              Featured
                            </Badge>
                          </div>
                        </div>
                      )}
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-4 mb-3 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <User className="w-4 h-4" />
                            <span>{post.author.name}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(post.publishedAt!)}</span>
                          </div>
                        </div>

                        <h3 className="text-xl font-semibold mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                          {post.title}
                        </h3>

                        {post.excerpt && (
                          <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{getReadingTime(post.content)} min read</span>
                            </div>
                          </div>
                          <Link href={`/blog/${post.slug}`}>
                            <Button variant="ghost" size="sm" className="group-hover:bg-blue-50 group-hover:text-blue-600">
                              Read More
                              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Recent Posts */}
            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Latest Posts</h2>

              <div className="space-y-6">
                {recentPosts.map((post) => (
                  <Card key={post.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
                      {post.featuredImage && (
                        <div className="relative h-48 md:h-auto overflow-hidden">
                          <img
                            src={post.featuredImage}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {post.featured && (
                            <div className="absolute top-4 left-4">
                              <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg">
                                <Star className="w-3 h-3 mr-1 fill-current" />
                                Featured
                              </Badge>
                            </div>
                          )}
                        </div>
                      )}
                      <div className={`${post.featuredImage ? 'md:col-span-2' : 'md:col-span-3'} p-6 flex flex-col justify-center`}>
                        <div className="flex items-center space-x-4 mb-3 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <User className="w-4 h-4" />
                            <span>{post.author.name}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(post.publishedAt!)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{getReadingTime(post.content)} min read</span>
                          </div>
                        </div>

                        <h3 className="text-2xl font-semibold mb-3 group-hover:text-blue-600 transition-colors">
                          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                        </h3>

                        {post.excerpt && (
                          <p className="text-gray-600 mb-4 line-clamp-2">{post.excerpt}</p>
                        )}

                        <div className="flex flex-wrap gap-2">
                          {post.tags.slice(0, 3).map((tag: string) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {recentPosts.length >= 6 && (
                <div className="text-center mt-8">
                  <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <Link href="/blog/all">
                      View All Posts
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Newsletter Signup */}
            <NewsletterSignup />

            {/* Recent Business Listings */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-green-600" />
                  <span>Recent Listings</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Discover profitable online businesses for sale
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/browse">
                    Browse Businesses
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