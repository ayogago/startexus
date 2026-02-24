'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Save,
  Eye,
  Upload,
  X,
  Plus,
  Image as ImageIcon,
  Bold,
  Italic,
  Underline,
  List,
  Link,
  Code,
  Quote,
  Heading1,
  Heading2,
  Heading3
} from 'lucide-react'

interface BlogPostData {
  title: string
  slug: string
  excerpt: string
  content: string
  featuredImage: string
  tags: string[]
  categories: string[]
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  metaTitle: string
  metaDescription: string
  featured: boolean
}

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
  'Success Stories'
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
  'exit strategy'
]

export function BlogPostEditor({ initialData, postId }: { initialData?: Partial<BlogPostData>; postId?: string }) {
  const router = useRouter()
  const contentRef = useRef<HTMLTextAreaElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newTag, setNewTag] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [showNewsletterDialog, setShowNewsletterDialog] = useState(false)
  const [pendingPublishData, setPendingPublishData] = useState<any>(null)

  const [formData, setFormData] = useState<BlogPostData>({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    excerpt: initialData?.excerpt || '',
    content: initialData?.content || '',
    featuredImage: initialData?.featuredImage || '',
    tags: initialData?.tags || [],
    categories: initialData?.categories || [],
    status: initialData?.status || 'DRAFT',
    metaTitle: initialData?.metaTitle || '',
    metaDescription: initialData?.metaDescription || '',
    featured: initialData?.featured || false,
  })

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title),
      metaTitle: prev.metaTitle || title
    }))
  }

  const addTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }))
    }
    setNewTag('')
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const addCategory = (category: string) => {
    if (category && !formData.categories.includes(category)) {
      setFormData(prev => ({
        ...prev,
        categories: [...prev.categories, category]
      }))
    }
    setNewCategory('')
  }

  const removeCategory = (categoryToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.filter(cat => cat !== categoryToRemove)
    }))
  }

  const insertTextAtCursor = (text: string) => {
    const textarea = contentRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const currentContent = formData.content
    const newContent = currentContent.slice(0, start) + text + currentContent.slice(end)

    setFormData(prev => ({ ...prev, content: newContent }))

    // Set cursor position after the inserted text
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + text.length, start + text.length)
    }, 0)
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      event.target.value = ''
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB')
      event.target.value = ''
      return
    }

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()
        setFormData(prev => ({ ...prev, featuredImage: result.url }))
        console.log('Image uploaded successfully:', result.url)
      } else {
        const error = await response.json()
        console.error('Upload failed:', error)
        alert(`Failed to upload image: ${error.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Image upload failed:', error)
      alert('Failed to upload image. Please try again.')
    }

    // Reset file input
    event.target.value = ''
  }

  const handleSubmit = async (status: 'DRAFT' | 'PUBLISHED') => {
    if (!formData.title || !formData.content) {
      alert('Please fill in title and content')
      return
    }

    setIsSubmitting(true)
    try {
      const url = postId ? `/api/blog/${postId}` : '/api/blog'
      const method = postId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          status
        }),
      })

      if (response.ok) {
        const data = await response.json()

        // Show newsletter dialog if publishing (new or updated post)
        if (status === 'PUBLISHED') {
          setPendingPublishData(data)
          setShowNewsletterDialog(true)
        } else {
          router.push('/dashboard/admin/blog')
        }
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to save blog post')
        setIsSubmitting(false)
      }
    } catch (error) {
      console.error('Failed to save blog post:', error)
      alert('Failed to save blog post')
      setIsSubmitting(false)
    }
  }

  const handleSendNewsletter = async () => {
    setShowNewsletterDialog(false)

    try {
      const newsletterResponse = await fetch('/api/newsletter/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blogPostId: pendingPublishData.id }),
      })

      if (newsletterResponse.ok) {
        const newsletterData = await newsletterResponse.json()
        alert(`Newsletter sent to ${newsletterData.sent} subscribers!`)
      } else {
        const newsletterError = await newsletterResponse.json()
        alert(`Blog post published, but newsletter failed: ${newsletterError.error}`)
      }
    } catch (newsletterError) {
      console.error('Newsletter send failed:', newsletterError)
      alert('Blog post published, but failed to send newsletter')
    } finally {
      setIsSubmitting(false)
      router.push('/dashboard/admin/blog')
    }
  }

  const handleSkipNewsletter = () => {
    setShowNewsletterDialog(false)
    setIsSubmitting(false)
    router.push('/dashboard/admin/blog')
  }

  return (
    <div className="space-y-8">
      {/* Main Content Form */}
      <Card>
        <CardHeader>
          <CardTitle>Blog Post Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Enter blog post title"
              className="text-lg"
            />
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <Label htmlFor="slug">URL Slug *</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              placeholder="url-friendly-slug"
            />
            <p className="text-sm text-gray-500">
              URL: /blog/{formData.slug}
            </p>
          </div>

          {/* Excerpt */}
          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              value={formData.excerpt}
              onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
              placeholder="Brief description of the post (optional)"
              rows={3}
            />
          </div>

          {/* Featured Image */}
          <div className="space-y-2">
            <Label>Featured Image</Label>
            {formData.featuredImage ? (
              <div className="space-y-2">
                <div className="relative w-full max-w-2xl rounded-lg overflow-hidden border-2 border-gray-200">
                  <img
                    src={formData.featuredImage}
                    alt="Featured"
                    className="w-full h-auto max-h-96 object-contain bg-gray-50"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => setFormData(prev => ({ ...prev, featuredImage: '' }))}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Remove
                  </Button>
                </div>
                <p className="text-sm text-gray-500">
                  Image URL: {formData.featuredImage}
                </p>
              </div>
            ) : (
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="featured-image"
                />
                <label htmlFor="featured-image">
                  <Button variant="outline" className="cursor-pointer" asChild>
                    <span>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Featured Image
                    </span>
                  </Button>
                </label>
                <p className="text-sm text-gray-500 mt-2">
                  Upload an image (max 5MB). Recommended size: 1200x630px
                </p>
              </div>
            )}
          </div>

          {/* Rich Text Editor Toolbar */}
          <div className="space-y-2">
            <Label>Content *</Label>
            <div className="border rounded-md">
              {/* Toolbar */}
              <div className="flex items-center space-x-1 p-2 border-b bg-gray-50">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => insertTextAtCursor('<h1></h1>')}
                  title="Heading 1"
                >
                  <Heading1 className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => insertTextAtCursor('<h2></h2>')}
                  title="Heading 2"
                >
                  <Heading2 className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => insertTextAtCursor('<h3></h3>')}
                  title="Heading 3"
                >
                  <Heading3 className="w-4 h-4" />
                </Button>
                <div className="w-px h-6 bg-gray-300" />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => insertTextAtCursor('<strong></strong>')}
                  title="Bold"
                >
                  <Bold className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => insertTextAtCursor('<em></em>')}
                  title="Italic"
                >
                  <Italic className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => insertTextAtCursor('<u></u>')}
                  title="Underline"
                >
                  <Underline className="w-4 h-4" />
                </Button>
                <div className="w-px h-6 bg-gray-300" />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => insertTextAtCursor('<ul><li></li></ul>')}
                  title="Bullet List"
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => insertTextAtCursor('<a href=""></a>')}
                  title="Link"
                >
                  <Link className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => insertTextAtCursor('<img src="" alt="" />')}
                  title="Image"
                >
                  <ImageIcon className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => insertTextAtCursor('<code></code>')}
                  title="Inline Code"
                >
                  <Code className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => insertTextAtCursor('<blockquote></blockquote>')}
                  title="Quote"
                >
                  <Quote className="w-4 h-4" />
                </Button>
              </div>

              {/* Content Textarea */}
              <Textarea
                ref={contentRef}
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Write your blog post content here. You can use HTML tags for formatting."
                rows={20}
                className="border-0 resize-none focus:ring-0 font-mono text-sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sidebar Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Categories & Tags */}
        <Card>
          <CardHeader>
            <CardTitle>Categories & Tags</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Categories */}
            <div className="space-y-2">
              <Label>Categories</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.categories.map((category) => (
                  <Badge key={category} variant="secondary" className="flex items-center gap-1">
                    {category}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => removeCategory(category)}
                    />
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Add category"
                  onKeyPress={(e) => e.key === 'Enter' && addCategory(newCategory)}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addCategory(newCategory)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {PREDEFINED_CATEGORIES.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => addCategory(category)}
                    className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add tag"
                  onKeyPress={(e) => e.key === 'Enter' && addTag(newTag)}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addTag(newTag)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {PREDEFINED_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => addTag(tag)}
                    className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SEO & Settings */}
        <Card>
          <CardHeader>
            <CardTitle>SEO & Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Featured Toggle */}
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.featured}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))}
              />
              <Label>Featured Post</Label>
            </div>

            {/* Meta Title */}
            <div className="space-y-2">
              <Label htmlFor="metaTitle">Meta Title</Label>
              <Input
                id="metaTitle"
                value={formData.metaTitle}
                onChange={(e) => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
                placeholder="SEO title (optional)"
              />
            </div>

            {/* Meta Description */}
            <div className="space-y-2">
              <Label htmlFor="metaDescription">Meta Description</Label>
              <Textarea
                id="metaDescription"
                value={formData.metaDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                placeholder="SEO description (optional)"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>

        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => handleSubmit('DRAFT')}
            disabled={isSubmitting}
          >
            <Save className="w-4 h-4 mr-2" />
            {postId ? 'Update Draft' : 'Save Draft'}
          </Button>
          <Button
            onClick={() => handleSubmit('PUBLISHED')}
            disabled={isSubmitting}
            className="bg-green-600 hover:bg-green-700"
          >
            <Eye className="w-4 h-4 mr-2" />
            {postId ? 'Update & Publish' : 'Publish'}
          </Button>
        </div>
      </div>

      {/* Newsletter Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showNewsletterDialog}
        title="Send Newsletter"
        message="Do you want to send a newsletter to all subscribers about this blog post?"
        onConfirm={handleSendNewsletter}
        onCancel={handleSkipNewsletter}
        confirmText="Yes"
        cancelText="No"
      />
    </div>
  )
}