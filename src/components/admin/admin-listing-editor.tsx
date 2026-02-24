'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Save, ArrowLeft, Loader2 } from 'lucide-react'

interface AdminListingEditorProps {
  listingId: string
}

interface ListingData {
  id: string
  title: string
  slug: string
  businessType: string
  category: string
  description: string
  location: string | null
  siteUrl: string | null
  reasonForSale: string | null
  askingPrice: number | null
  priceType: string
  revenueTtm: number | null
  profitTtm: number | null
  mrr: number | null
  aov: number | null
  trafficTtm: number | null
  establishedAt: string | null
  workloadHrsPerWk: number | null
  teamSize: number | null
  monetization: string
  platform: string
  techStack: string
  highlights: string
  growthOps: string
  risks: string
  assetsIncluded: string
  aiTechnologies: string
  isAiRelated: boolean
  confidential: boolean
  ndaRequired: boolean
  flagged: boolean
  featured: boolean
  status: string
  analyticsProofUrl: string | null
  revenueProofUrl: string | null
  seller: {
    id: string
    name: string | null
    email: string
    verified: boolean
  }
  images: Array<{
    id: string
    url: string
    alt: string | null
    order: number
  }>
}

const businessTypes = [
  { value: 'SAAS', label: 'SaaS' },
  { value: 'ECOMMERCE', label: 'eCommerce' },
  { value: 'AMAZON', label: 'Amazon FBA/FBM' },
  { value: 'CONTENT', label: 'Content/Blog' },
  { value: 'MOBILE_APP', label: 'Mobile App' },
  { value: 'OTHER', label: 'Other' },
]

const priceTypes = [
  { value: 'ASKING', label: 'Fixed Asking Price' },
  { value: 'OPEN_TO_OFFERS', label: 'Open to Offers' },
]

const statuses = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PENDING_REVIEW', label: 'Pending Review' },
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'REJECTED', label: 'Rejected' },
]

export function AdminListingEditor({ listingId }: AdminListingEditorProps) {
  const router = useRouter()
  const [listing, setListing] = useState<ListingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<Partial<ListingData>>({})

  useEffect(() => {
    fetchListing()
  }, [listingId])

  const fetchListing = async () => {
    try {
      const response = await fetch(`/api/admin/listings/${listingId}`)
      if (response.ok) {
        const data = await response.json()
        setListing(data.listing)

        // Parse JSON strings back to arrays for editing
        const listingData = {
          ...data.listing,
          monetization: JSON.parse(data.listing.monetization || '[]'),
          platform: JSON.parse(data.listing.platform || '[]'),
          techStack: JSON.parse(data.listing.techStack || '[]'),
          highlights: JSON.parse(data.listing.highlights || '[]'),
          growthOps: JSON.parse(data.listing.growthOps || '[]'),
          risks: JSON.parse(data.listing.risks || '[]'),
          assetsIncluded: JSON.parse(data.listing.assetsIncluded || '[]'),
          aiTechnologies: JSON.parse(data.listing.aiTechnologies || '[]'),
          establishedAt: data.listing.establishedAt ? new Date(data.listing.establishedAt).toISOString().split('T')[0] : null,
          // Convert cents to dollars for display
          askingPrice: data.listing.askingPrice ? data.listing.askingPrice / 100 : null,
          revenueTtm: data.listing.revenueTtm ? data.listing.revenueTtm / 100 : null,
          profitTtm: data.listing.profitTtm ? data.listing.profitTtm / 100 : null,
          mrr: data.listing.mrr ? data.listing.mrr / 100 : null,
          aov: data.listing.aov ? data.listing.aov / 100 : null,
        }
        setFormData(listingData)
      }
    } catch (error) {
      console.error('Failed to fetch listing:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleArrayChange = (field: string, value: string, index: number) => {
    setFormData(prev => {
      const currentValue = prev[field as keyof typeof prev]
      // Only handle string arrays, not object arrays like images
      const array = Array.isArray(currentValue) &&
        (currentValue.length === 0 || typeof currentValue[0] === 'string')
        ? [...(currentValue as unknown as string[])]
        : [] as string[]
      array[index] = value
      return { ...prev, [field]: array }
    })
  }

  const addArrayItem = (field: string) => {
    setFormData(prev => {
      const currentValue = prev[field as keyof typeof prev]
      const array = Array.isArray(currentValue) &&
        (currentValue.length === 0 || typeof currentValue[0] === 'string')
        ? [...(currentValue as unknown as string[])]
        : [] as string[]
      array.push('')
      return { ...prev, [field]: array }
    })
  }

  const removeArrayItem = (field: string, index: number) => {
    setFormData(prev => {
      const currentValue = prev[field as keyof typeof prev]
      const array = Array.isArray(currentValue) &&
        (currentValue.length === 0 || typeof currentValue[0] === 'string')
        ? [...(currentValue as unknown as string[])]
        : [] as string[]
      array.splice(index, 1)
      return { ...prev, [field]: array }
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // Convert arrays back to JSON strings and dollars to cents
      const updateData = {
        ...formData,
        monetization: formData.monetization,
        platform: formData.platform,
        techStack: formData.techStack,
        highlights: formData.highlights,
        growthOps: formData.growthOps,
        risks: formData.risks,
        assetsIncluded: formData.assetsIncluded,
        aiTechnologies: formData.aiTechnologies,
        // Convert dollars to cents
        askingPrice: formData.askingPrice ? Math.round(formData.askingPrice * 100) : null,
        revenueTtm: formData.revenueTtm ? Math.round(formData.revenueTtm * 100) : null,
        profitTtm: formData.profitTtm ? Math.round(formData.profitTtm * 100) : null,
        mrr: formData.mrr ? Math.round(formData.mrr * 100) : null,
        aov: formData.aov ? Math.round(formData.aov * 100) : null,
      }

      const response = await fetch(`/api/admin/listings/${listingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      })

      if (response.ok) {
        router.push('/dashboard/admin')
      } else {
        alert('Failed to save listing')
      }
    } catch (error) {
      console.error('Failed to save listing:', error)
      alert('Failed to save listing')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Listing not found</p>
      </div>
    )
  }

  const ArrayEditor = ({
    field,
    label,
    placeholder
  }: {
    field: string
    label: string
    placeholder: string
  }) => (
    <div>
      <Label className="text-sm font-medium">{label}</Label>
      <div className="space-y-2 mt-2">
        {((formData[field as keyof typeof formData] as unknown as string[]) || []).map((item, index) => (
          <div key={index} className="flex gap-2">
            <Input
              value={item}
              onChange={(e) => handleArrayChange(field, e.target.value, index)}
              placeholder={placeholder}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => removeArrayItem(field, index)}
            >
              Remove
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addArrayItem(field)}
        >
          Add {label.slice(0, -1)}
        </Button>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="flex items-center space-x-2">
          <Badge variant={listing.status === 'PUBLISHED' ? 'default' : 'secondary'}>
            {listing.status}
          </Badge>
          {listing.flagged && <Badge variant="destructive">Flagged</Badge>}
          {listing.featured && <Badge variant="default">Featured</Badge>}
        </div>
      </div>

      <Progress value={100} className="mb-6" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title || ''}
                onChange={(e) => handleInputChange('title', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={formData.slug || ''}
                onChange={(e) => handleInputChange('slug', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="businessType">Business Type</Label>
              <Select
                value={formData.businessType}
                onValueChange={(value) => handleInputChange('businessType', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {businessTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category || ''}
                onChange={(e) => handleInputChange('category', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location || ''}
                onChange={(e) => handleInputChange('location', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="siteUrl">Site URL</Label>
              <Input
                id="siteUrl"
                value={formData.siteUrl || ''}
                onChange={(e) => handleInputChange('siteUrl', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Financial Information */}
        <Card>
          <CardHeader>
            <CardTitle>Financial Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="priceType">Price Type</Label>
              <Select
                value={formData.priceType}
                onValueChange={(value) => handleInputChange('priceType', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priceTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="askingPrice">Asking Price ($)</Label>
              <Input
                id="askingPrice"
                type="number"
                value={formData.askingPrice || ''}
                onChange={(e) => handleInputChange('askingPrice', parseFloat(e.target.value) || null)}
              />
            </div>

            <div>
              <Label htmlFor="revenueTtm">Annual Revenue ($)</Label>
              <Input
                id="revenueTtm"
                type="number"
                value={formData.revenueTtm || ''}
                onChange={(e) => handleInputChange('revenueTtm', parseFloat(e.target.value) || null)}
              />
            </div>

            <div>
              <Label htmlFor="profitTtm">Annual Profit ($)</Label>
              <Input
                id="profitTtm"
                type="number"
                value={formData.profitTtm || ''}
                onChange={(e) => handleInputChange('profitTtm', parseFloat(e.target.value) || null)}
              />
            </div>

            <div>
              <Label htmlFor="mrr">Monthly Recurring Revenue ($)</Label>
              <Input
                id="mrr"
                type="number"
                value={formData.mrr || ''}
                onChange={(e) => handleInputChange('mrr', parseFloat(e.target.value) || null)}
              />
            </div>

            <div>
              <Label htmlFor="aov">Average Order Value ($)</Label>
              <Input
                id="aov"
                type="number"
                value={formData.aov || ''}
                onChange={(e) => handleInputChange('aov', parseFloat(e.target.value) || null)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Operational Information */}
        <Card>
          <CardHeader>
            <CardTitle>Operational Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="establishedAt">Established Date</Label>
              <Input
                id="establishedAt"
                type="date"
                value={formData.establishedAt || ''}
                onChange={(e) => handleInputChange('establishedAt', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="workloadHrsPerWk">Workload (hours/week)</Label>
              <Input
                id="workloadHrsPerWk"
                type="number"
                value={formData.workloadHrsPerWk || ''}
                onChange={(e) => handleInputChange('workloadHrsPerWk', parseInt(e.target.value) || null)}
              />
            </div>

            <div>
              <Label htmlFor="teamSize">Team Size</Label>
              <Input
                id="teamSize"
                type="number"
                value={formData.teamSize || ''}
                onChange={(e) => handleInputChange('teamSize', parseInt(e.target.value) || null)}
              />
            </div>

            <div>
              <Label htmlFor="trafficTtm">Annual Traffic</Label>
              <Input
                id="trafficTtm"
                type="number"
                value={formData.trafficTtm || ''}
                onChange={(e) => handleInputChange('trafficTtm', parseInt(e.target.value) || null)}
              />
            </div>

            <div>
              <Label htmlFor="analyticsProofUrl">Analytics Proof URL</Label>
              <Input
                id="analyticsProofUrl"
                value={formData.analyticsProofUrl || ''}
                onChange={(e) => handleInputChange('analyticsProofUrl', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="revenueProofUrl">Revenue Proof URL</Label>
              <Input
                id="revenueProofUrl"
                value={formData.revenueProofUrl || ''}
                onChange={(e) => handleInputChange('revenueProofUrl', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Admin Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Admin Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="featured"
                checked={formData.featured || false}
                onCheckedChange={(checked) => handleInputChange('featured', checked)}
              />
              <Label htmlFor="featured">Featured Listing</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="flagged"
                checked={formData.flagged || false}
                onCheckedChange={(checked) => handleInputChange('flagged', checked)}
              />
              <Label htmlFor="flagged">Flagged</Label>
            </div>


            <div className="flex items-center space-x-2">
              <Switch
                id="ndaRequired"
                checked={formData.ndaRequired || false}
                onCheckedChange={(checked) => handleInputChange('ndaRequired', checked)}
              />
              <Label htmlFor="ndaRequired">NDA Required</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isAiRelated"
                checked={formData.isAiRelated || false}
                onCheckedChange={(checked) => handleInputChange('isAiRelated', checked)}
              />
              <Label htmlFor="isAiRelated">AI Related</Label>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={formData.description || ''}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={6}
            placeholder="Business description..."
          />
        </CardContent>
      </Card>

      {/* Reason for Sale */}
      <Card>
        <CardHeader>
          <CardTitle>Reason for Sale</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={formData.reasonForSale || ''}
            onChange={(e) => handleInputChange('reasonForSale', e.target.value)}
            rows={3}
            placeholder="Why are you selling this business?"
          />
        </CardContent>
      </Card>

      {/* Array Fields */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Business Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <ArrayEditor field="monetization" label="Monetization Methods" placeholder="e.g., Subscriptions" />
            <ArrayEditor field="platform" label="Platforms" placeholder="e.g., Web App" />
            <ArrayEditor field="techStack" label="Tech Stack" placeholder="e.g., React" />
            <ArrayEditor field="aiTechnologies" label="AI Technologies" placeholder="e.g., GPT-4" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Business Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <ArrayEditor field="highlights" label="Highlights" placeholder="Key selling point" />
            <ArrayEditor field="growthOps" label="Growth Opportunities" placeholder="Growth opportunity" />
            <ArrayEditor field="risks" label="Risks" placeholder="Potential risk" />
            <ArrayEditor field="assetsIncluded" label="Assets Included" placeholder="Included asset" />
          </CardContent>
        </Card>
      </div>

      {/* Seller Information */}
      <Card>
        <CardHeader>
          <CardTitle>Seller Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Name</Label>
              <p className="text-sm text-gray-600">{listing.seller.name || 'N/A'}</p>
            </div>
            <div>
              <Label>Email</Label>
              <p className="text-sm text-gray-600">{listing.seller.email}</p>
            </div>
            <div>
              <Label>Verified</Label>
              <Badge variant={listing.seller.verified ? 'default' : 'secondary'}>
                {listing.seller.verified ? 'Verified' : 'Unverified'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end space-x-4">
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  )
}