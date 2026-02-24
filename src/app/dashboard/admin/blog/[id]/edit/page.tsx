import { getServerSession } from 'next-auth'
import { redirect, notFound } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { BlogPostEditor } from '@/components/admin/blog-post-editor'

interface EditBlogPostPageProps {
  params: {
    id: string
  }
}

async function getBlogPost(id: string) {
  const post = await prisma.blogPost.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })

  if (!post) {
    return null
  }

  // Parse JSON fields
  return {
    ...post,
    tags: JSON.parse(post.tags || '[]'),
    categories: JSON.parse(post.categories || '[]'),
  }
}

export default async function EditBlogPostPage({ params }: EditBlogPostPageProps) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  const post = await getBlogPost(params.id)

  if (!post) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Edit Blog Post</h1>
          <p className="text-gray-600">Update your blog post content and settings</p>
        </div>

        <BlogPostEditor
          initialData={{
            ...post,
            excerpt: post.excerpt || undefined,
            featuredImage: post.featuredImage || undefined,
            metaTitle: post.metaTitle || undefined,
            metaDescription: post.metaDescription || undefined,
            status: post.status as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED',
          }}
          postId={params.id}
        />
      </div>
    </div>
  )
}