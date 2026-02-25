'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import {
  Save,
  Eye,
  Upload,
  X,
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
  Heading3,
  ArrowLeft,
  FileText,
  Loader2,
  Sparkles
} from 'lucide-react'

interface BlogPostData {
  title: string
  slug: string
  content: string
  featuredImage: string
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
}

export function BlogPostEditor({ initialData, postId }: { initialData?: Partial<BlogPostData & { excerpt?: string; tags?: string[]; categories?: string[]; metaTitle?: string; metaDescription?: string; featured?: boolean }>; postId?: string }) {
  const router = useRouter()
  const contentRef = useRef<HTMLTextAreaElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showNewsletterDialog, setShowNewsletterDialog] = useState(false)
  const [pendingPublishData, setPendingPublishData] = useState<any>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [activeToolbar, setActiveToolbar] = useState<string | null>(null)

  const [formData, setFormData] = useState<BlogPostData>({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    content: initialData?.content || '',
    featuredImage: initialData?.featuredImage || '',
    status: initialData?.status || 'DRAFT',
  })

  const [wordCount, setWordCount] = useState(() => {
    const text = (initialData?.content || '').replace(/<[^>]*>/g, '')
    return text.trim() ? text.trim().split(/\s+/).length : 0
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
      slug: generateSlug(title),
    }))
  }

  const handleContentChange = (content: string) => {
    setFormData(prev => ({ ...prev, content }))
    const text = content.replace(/<[^>]*>/g, '')
    setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0)
  }

  const wrapSelection = useCallback((before: string, after: string) => {
    const textarea = contentRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = formData.content.slice(start, end)
    const newContent = formData.content.slice(0, start) + before + selected + after + formData.content.slice(end)

    setFormData(prev => ({ ...prev, content: newContent }))
    handleContentChange(newContent)

    setTimeout(() => {
      textarea.focus()
      if (selected) {
        textarea.setSelectionRange(start + before.length, end + before.length)
      } else {
        textarea.setSelectionRange(start + before.length, start + before.length)
      }
    }, 0)
  }, [formData.content])

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB')
      return
    }

    setIsUploading(true)
    try {
      const uploadData = new FormData()
      uploadData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadData,
      })

      if (response.ok) {
        const result = await response.json()
        setFormData(prev => ({ ...prev, featuredImage: result.url }))
      } else {
        const error = await response.json()
        alert(`Failed to upload image: ${error.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Image upload failed:', error)
      alert('Failed to upload image. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) handleImageUpload(file)
    event.target.value = ''
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleImageUpload(file)
  }, [])

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

  const toolbarButtons = [
    { icon: Heading1, action: () => wrapSelection('<h1>', '</h1>'), label: 'Heading 1', group: 'heading' },
    { icon: Heading2, action: () => wrapSelection('<h2>', '</h2>'), label: 'Heading 2', group: 'heading' },
    { icon: Heading3, action: () => wrapSelection('<h3>', '</h3>'), label: 'Heading 3', group: 'heading' },
    { icon: null, action: () => {}, label: 'divider', group: 'div1' },
    { icon: Bold, action: () => wrapSelection('<strong>', '</strong>'), label: 'Bold', group: 'format' },
    { icon: Italic, action: () => wrapSelection('<em>', '</em>'), label: 'Italic', group: 'format' },
    { icon: Underline, action: () => wrapSelection('<u>', '</u>'), label: 'Underline', group: 'format' },
    { icon: null, action: () => {}, label: 'divider', group: 'div2' },
    { icon: List, action: () => wrapSelection('<ul>\n  <li>', '</li>\n</ul>'), label: 'Bullet List', group: 'block' },
    { icon: Quote, action: () => wrapSelection('<blockquote>', '</blockquote>'), label: 'Quote', group: 'block' },
    { icon: Code, action: () => wrapSelection('<code>', '</code>'), label: 'Code', group: 'block' },
    { icon: null, action: () => {}, label: 'divider', group: 'div3' },
    { icon: Link, action: () => wrapSelection('<a href="">', '</a>'), label: 'Link', group: 'insert' },
    { icon: ImageIcon, action: () => wrapSelection('<img src="', '" alt="" />'), label: 'Image', group: 'insert' },
  ]

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-sm text-gray-400">
            <FileText className="w-3.5 h-3.5" />
            <span>{wordCount} words</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSubmit('DRAFT')}
            disabled={isSubmitting}
            className="border-gray-200 hover:bg-gray-50"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {postId ? 'Update Draft' : 'Save Draft'}
          </Button>

          <Button
            size="sm"
            onClick={() => handleSubmit('PUBLISHED')}
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Eye className="w-4 h-4 mr-2" />
            )}
            {postId ? 'Update & Publish' : 'Publish'}
          </Button>
        </div>
      </div>

      {/* Title */}
      <div>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Post title..."
          className="w-full text-4xl font-bold text-gray-900 placeholder-gray-300 border-0 outline-none bg-transparent focus:ring-0 p-0"
        />
        {formData.slug && (
          <p className="mt-2 text-sm text-gray-400">
            startexus.com/blog/<span className="text-gray-500">{formData.slug}</span>
          </p>
        )}
      </div>

      {/* Featured Image */}
      <div>
        {formData.featuredImage ? (
          <div className="relative group rounded-xl overflow-hidden">
            <img
              src={formData.featuredImage}
              alt="Featured"
              className="w-full h-72 object-cover"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center">
              <Button
                variant="secondary"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/90 hover:bg-white text-gray-700"
                onClick={() => setFormData(prev => ({ ...prev, featuredImage: '' }))}
              >
                <X className="w-4 h-4 mr-1.5" />
                Remove Image
              </Button>
            </div>
          </div>
        ) : (
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`relative rounded-xl border-2 border-dashed transition-all duration-200 ${
              isDragging
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 bg-gray-50/50'
            }`}
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
              id="featured-image"
            />
            <label htmlFor="featured-image" className="flex flex-col items-center justify-center py-12 cursor-pointer">
              {isUploading ? (
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <Upload className="w-5 h-5 text-gray-400" />
                </div>
              )}
              <p className="text-sm font-medium text-gray-600">
                {isUploading ? 'Uploading...' : 'Drop an image here or click to upload'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Recommended: 1200 x 630px, max 5MB
              </p>
            </label>
          </div>
        )}
      </div>

      {/* Content Editor */}
      <div className="rounded-xl border border-gray-200 overflow-hidden bg-white shadow-sm">
        {/* Toolbar */}
        <div className="flex items-center gap-0.5 px-3 py-2 border-b border-gray-100 bg-gray-50/80">
          {toolbarButtons.map((btn, i) => {
            if (!btn.icon) {
              return <div key={`div-${i}`} className="w-px h-5 bg-gray-200 mx-1" />
            }
            const Icon = btn.icon
            return (
              <button
                key={btn.label}
                type="button"
                onClick={() => {
                  btn.action()
                  setActiveToolbar(btn.label)
                  setTimeout(() => setActiveToolbar(null), 200)
                }}
                title={btn.label}
                className={`p-1.5 rounded-md transition-all duration-150 ${
                  activeToolbar === btn.label
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
              </button>
            )
          })}
        </div>

        {/* Textarea */}
        <Textarea
          ref={contentRef}
          value={formData.content}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder="Start writing your story..."
          rows={24}
          className="border-0 resize-none focus:ring-0 focus-visible:ring-0 font-mono text-sm leading-relaxed p-4"
        />
      </div>

      {/* Bottom hint */}
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Categories, tags, and SEO metadata will be auto-generated when you save.</span>
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
