'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, X, Save, Eye, Sparkles, TrendingUp, DollarSign, Users } from 'lucide-react'
import { slugify } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'

const BUSINESS_TYPES = [
  { value: 'SAAS', label: 'SaaS' },
  { value: 'SERVICES', label: 'Services Websites/Business' },
  { value: 'ECOMMERCE', label: 'eCommerce Stores' },
  { value: 'AMAZON', label: 'Amazon FBA/FBM Business' },
  { value: 'CONTENT', label: 'Content Blogs' },
  { value: 'AFFILIATE', label: 'Affiliate Media Sites' },
  { value: 'MOBILE_APP', label: 'Apps (Mobile Apps)' },
  { value: 'MARKETPLACE', label: 'Marketplaces' },
  { value: 'DOMAIN', label: 'Domains' },
]

const MONETIZATION_OPTIONS = [
  'Subscriptions', 'Advertising', 'Affiliate', 'Direct Sales', 'Freemium',
  'Marketplace', 'Licensing', 'Consulting', 'E-commerce', 'Membership'
]

const TECH_STACK_OPTIONS = [
  'React', 'Next.js', 'Vue.js', 'Angular', 'Node.js', 'Python', 'Django',
  'Ruby on Rails', 'PHP', 'Laravel', 'WordPress', 'Shopify', 'MySQL',
  'PostgreSQL', 'MongoDB', 'AWS', 'Google Cloud', 'Azure', 'Firebase'
]

const PLATFORM_OPTIONS = [
  'Web App', 'iOS', 'Android', 'Shopify', 'WooCommerce', 'WordPress',
  'Custom', 'Webflow', 'Squarespace', 'Stripe', 'PayPal'
]

interface ListingData {
  title: string
  businessType: string
  category: string
  askingPrice: string
  priceType: 'ASKING' | 'OPEN_TO_OFFERS'
  revenueTtm: string
  profitTtm: string
  mrr: string
  trafficTtm: string
  monetization: string[]
  platform: string[]
  techStack: string[]
  establishedAt: string
  workloadHrsPerWk: string
  teamSize: string
  description: string
  highlights: string[]
  growthOps: string[]
  risks: string[]
  assetsIncluded: string[]
  reasonForSale: string
  location: string
  siteUrl: string
  ndaRequired: boolean
}

const initialData: ListingData = {
  title: '',
  businessType: '',
  category: '',
  askingPrice: '',
  priceType: 'ASKING',
  revenueTtm: '',
  profitTtm: '',
  mrr: '',
  trafficTtm: '',
  monetization: [],
  platform: [],
  techStack: [],
  establishedAt: '',
  workloadHrsPerWk: '',
  teamSize: '',
  description: '',
  highlights: [''],
  growthOps: [''],
  risks: [''],
  assetsIncluded: [''],
  reasonForSale: '',
  location: '',
  siteUrl: '',
  ndaRequired: false,
}

interface ListingEditorProps {
  initialData?: any
  mode?: 'create' | 'edit'
}

export function ListingEditor({ initialData: existingListing, mode = 'create' }: ListingEditorProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)

  // Transform existing listing data to match form structure
  const getInitialData = (): ListingData => {
    if (mode === 'edit' && existingListing) {
      return {
        title: existingListing.title || '',
        businessType: existingListing.businessType || '',
        category: existingListing.category || '',
        askingPrice: existingListing.askingPrice?.toString() || '',
        priceType: existingListing.priceType || 'ASKING',
        revenueTtm: existingListing.revenueTtm?.toString() || '',
        profitTtm: existingListing.profitTtm?.toString() || '',
        mrr: existingListing.mrr?.toString() || '',
        trafficTtm: existingListing.trafficTtm?.toString() || '',
        monetization: Array.isArray(existingListing.monetization) ? existingListing.monetization :
                     typeof existingListing.monetization === 'string' ? JSON.parse(existingListing.monetization || '[]') : [],
        platform: Array.isArray(existingListing.platform) ? existingListing.platform :
                  typeof existingListing.platform === 'string' ? JSON.parse(existingListing.platform || '[]') : [],
        techStack: Array.isArray(existingListing.techStack) ? existingListing.techStack :
                   typeof existingListing.techStack === 'string' ? JSON.parse(existingListing.techStack || '[]') : [],
        establishedAt: existingListing.establishedAt ? new Date(existingListing.establishedAt).toISOString().split('T')[0] : '',
        workloadHrsPerWk: existingListing.workloadHrsPerWk?.toString() || '',
        teamSize: existingListing.teamSize?.toString() || '',
        description: existingListing.description || '',
        highlights: Array.isArray(existingListing.highlights) ? existingListing.highlights :
                   typeof existingListing.highlights === 'string' ? JSON.parse(existingListing.highlights || '[]') : [''],
        growthOps: Array.isArray(existingListing.growthOps) ? existingListing.growthOps :
                   typeof existingListing.growthOps === 'string' ? JSON.parse(existingListing.growthOps || '[]') : [''],
        risks: Array.isArray(existingListing.risks) ? existingListing.risks :
               typeof existingListing.risks === 'string' ? JSON.parse(existingListing.risks || '[]') : [''],
        assetsIncluded: Array.isArray(existingListing.assetsIncluded) ? existingListing.assetsIncluded :
                       typeof existingListing.assetsIncluded === 'string' ? JSON.parse(existingListing.assetsIncluded || '[]') : [''],
        reasonForSale: existingListing.reasonForSale || '',
        location: existingListing.location || '',
        siteUrl: existingListing.siteUrl || '',
        ndaRequired: existingListing.ndaRequired || false,
      }
    }
    return initialData
  }

  const [data, setData] = useState<ListingData>(getInitialData())
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  const steps = [
    { title: 'Basic Information', description: 'Tell us about your business' },
    { title: 'Financial Details', description: 'Revenue, pricing, and metrics' },
    { title: 'Operations & Traffic', description: 'How your business runs' },
    { title: 'Technology & Growth', description: 'Tech stack and opportunities' },
    { title: 'Assets & Review', description: 'Assets and final review' },
  ]

  // Auto-save functionality
  useEffect(() => {
    if (data.title || data.description) {
      const timer = setTimeout(() => {
        autoSave()
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [data])

  const autoSave = async () => {
    setSaving(true)
    try {
      // In a real app, save to draft here
      console.log('Auto-saving...', data)
      setLastSaved(new Date())
    } catch (error) {
      console.error('Auto-save failed:', error)
    } finally {
      setSaving(false)
    }
  }

  const updateData = (updates: Partial<ListingData>) => {
    setData(prev => ({ ...prev, ...updates }))
  }

  const addArrayItem = (field: keyof ListingData, value: string = '') => {
    setData(prev => ({
      ...prev,
      [field]: [...(prev[field] as string[]), value]
    }))
  }

  const removeArrayItem = (field: keyof ListingData, index: number) => {
    setData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index)
    }))
  }

  const updateArrayItem = (field: keyof ListingData, index: number, value: string) => {
    setData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).map((item, i) => i === index ? value : item)
    }))
  }

  const toggleArrayItem = (field: keyof ListingData, value: string) => {
    setData(prev => {
      const currentArray = prev[field] as string[]
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value]
      return { ...prev, [field]: newArray }
    })
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async (status: 'DRAFT' | 'PENDING_REVIEW') => {
    setSaving(true)
    try {
      const listingData = {
        ...data,
        slug: slugify(data.title),
        askingPrice: data.askingPrice ? parseInt(data.askingPrice) * 100 : null,
        revenueTtm: data.revenueTtm ? parseInt(data.revenueTtm) * 100 : null,
        profitTtm: data.profitTtm ? parseInt(data.profitTtm) * 100 : null,
        mrr: data.mrr ? parseInt(data.mrr) * 100 : null,
        trafficTtm: data.trafficTtm ? parseInt(data.trafficTtm) : null,
        workloadHrsPerWk: data.workloadHrsPerWk ? parseInt(data.workloadHrsPerWk) : null,
        teamSize: data.teamSize ? parseInt(data.teamSize) : null,
        establishedAt: data.establishedAt ? new Date(data.establishedAt) : null,
        highlights: data.highlights.filter(h => h.trim()),
        growthOps: data.growthOps.filter(g => g.trim()),
        risks: data.risks.filter(r => r.trim()),
        assetsIncluded: data.assetsIncluded.filter(a => a.trim()),
        status,
      }

      const url = mode === 'edit' ? `/api/listings/${existingListing?.id}` : '/api/listings'
      const method = mode === 'edit' ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(listingData),
      })

      if (response.ok) {
        const listing = await response.json()
        router.push(`/dashboard/listings`)
      } else {
        throw new Error(mode === 'edit' ? 'Failed to update listing' : 'Failed to create listing')
      }
    } catch (error) {
      console.error('Failed to save listing:', error)
      alert('Failed to save listing. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-blue-500" />
                <span>Business Title *</span>
              </label>
              <Input
                value={data.title}
                onChange={(e) => updateData({ title: e.target.value })}
                placeholder="e.g. Profitable SaaS Tool for Small Businesses"
                className="w-full text-lg font-medium focus:ring-2 focus:ring-blue-500 transition-all"
              />
              <div className="text-xs text-gray-500 mt-1">Make it catchy! This is what buyers see first 💫</div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-3 flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span>Business Type *</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {BUSINESS_TYPES.map(type => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => updateData({ businessType: type.value })}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 text-center hover:scale-105 ${
                      data.businessType === type.value
                        ? 'border-green-500 bg-green-50 shadow-md'
                        : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                    }`}
                  >
                    <div className="text-sm font-medium text-gray-900">{type.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <Input
                value={data.category}
                onChange={(e) => updateData({ category: e.target.value })}
                placeholder="e.g. Project Management, E-commerce Tools"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Business Description *</label>
              <div className="relative">
                <textarea
                  value={data.description}
                  onChange={(e) => updateData({ description: e.target.value })}
                  placeholder="Tell your business story! What problem does it solve? Who are your customers? What makes it special? 🎯"
                  className="w-full p-4 border-2 rounded-lg h-32 resize-vertical focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                />
                <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                  {data.description.length}/1000
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-1">💡 Tip: Highlight what makes your business unique and profitable!</div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Location</label>
              <Input
                value={data.location}
                onChange={(e) => updateData({ location: e.target.value })}
                placeholder="e.g. United States, Remote"
              />
            </div>

          </div>
        )

      case 1:
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center space-x-2 mb-4">
                <DollarSign className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-medium text-green-800">Let's talk money! 💰</h3>
              </div>
              <label className="block text-sm font-medium mb-3 text-green-800">How do you want to price your business?</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => updateData({ priceType: 'ASKING' })}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                    data.priceType === 'ASKING'
                      ? 'border-green-500 bg-white shadow-lg scale-105'
                      : 'border-gray-200 hover:border-green-300 hover:bg-white/50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">🎯</div>
                    <div>
                      <div className="font-medium text-gray-900">Fixed asking price</div>
                      <div className="text-sm text-gray-600">I know exactly what I want</div>
                    </div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => updateData({ priceType: 'OPEN_TO_OFFERS' })}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                    data.priceType === 'OPEN_TO_OFFERS'
                      ? 'border-green-500 bg-white shadow-lg scale-105'
                      : 'border-gray-200 hover:border-green-300 hover:bg-white/50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">🤝</div>
                    <div>
                      <div className="font-medium text-gray-900">Open to offers</div>
                      <div className="text-sm text-gray-600">Let buyers make offers</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {data.priceType === 'ASKING' && (
              <div className="bg-white border-2 border-green-300 rounded-lg p-4">
                <label className="block text-sm font-medium mb-2 flex items-center space-x-2">
                  <span>💵</span>
                  <span>Asking Price (USD) *</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg font-medium">$</div>
                  <Input
                    type="number"
                    value={data.askingPrice}
                    onChange={(e) => updateData({ askingPrice: e.target.value })}
                    placeholder="150000"
                    className="pl-8 text-lg font-medium focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  💡 Tip: Research similar businesses to price competitively!
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <label className="block text-sm font-medium mb-2 flex items-center space-x-2">
                  <span>📈</span>
                  <span>Annual Revenue (USD)</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">$</div>
                  <Input
                    type="number"
                    value={data.revenueTtm}
                    onChange={(e) => updateData({ revenueTtm: e.target.value })}
                    placeholder="120000"
                    className="pl-8 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <label className="block text-sm font-medium mb-2 flex items-center space-x-2">
                  <span>💰</span>
                  <span>Annual Profit (USD)</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">$</div>
                  <Input
                    type="number"
                    value={data.profitTtm}
                    onChange={(e) => updateData({ profitTtm: e.target.value })}
                    placeholder="80000"
                    className="pl-8 focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>

            {data.revenueTtm && data.profitTtm && parseFloat(data.revenueTtm) > 0 && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-xl">📈</span>
                  <span className="font-medium text-purple-800">Profit Margin Analysis</span>
                </div>
                <div className="text-2xl font-bold text-purple-600">
                  {((parseFloat(data.profitTtm) / parseFloat(data.revenueTtm)) * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-purple-700">
                  {((parseFloat(data.profitTtm) / parseFloat(data.revenueTtm)) * 100) > 20
                    ? '🚀 Excellent profit margin!'
                    : ((parseFloat(data.profitTtm) / parseFloat(data.revenueTtm)) * 100) > 10
                    ? '💪 Good profit margin'
                    : '🔄 Consider improving profitability'}
                </div>
              </div>
            )}

            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-4">
              <label className="block text-sm font-medium mb-2 flex items-center space-x-2">
                <span>🔁</span>
                <span>Monthly Recurring Revenue (USD)</span>
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">$</div>
                <Input
                  type="number"
                  value={data.mrr}
                  onChange={(e) => updateData({ mrr: e.target.value })}
                  placeholder="8000"
                  className="pl-8 focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div className="text-xs text-orange-700 mt-1">
                💬 Only applicable for subscription-based businesses
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Established Date</label>
              <Input
                type="date"
                value={data.establishedAt}
                onChange={(e) => updateData({ establishedAt: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Reason for Sale</label>
              <textarea
                value={data.reasonForSale}
                onChange={(e) => updateData({ reasonForSale: e.target.value })}
                placeholder="Why are you selling this business?"
                className="w-full p-3 border rounded-md h-24 resize-vertical"
              />
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-lg p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Users className="w-5 h-5 text-cyan-600" />
                <h3 className="text-lg font-medium text-cyan-800">Business Operations 🏢</h3>
              </div>
            </div>

            <div className="bg-white border-2 border-cyan-200 rounded-lg p-4">
              <label className="block text-sm font-medium mb-2 flex items-center space-x-2">
                <span>📈</span>
                <span>Monthly Traffic (Sessions)</span>
              </label>
              <Input
                type="number"
                value={data.trafficTtm}
                onChange={(e) => updateData({ trafficTtm: e.target.value })}
                placeholder="50000"
                className="focus:ring-2 focus:ring-cyan-500"
              />
              <div className="text-xs text-gray-500 mt-1">
                💬 Include all traffic sources (organic, paid, direct, etc.)
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <label className="block text-sm font-medium mb-2 flex items-center space-x-2">
                  <span>⏰</span>
                  <span>Owner Hours per Week</span>
                </label>
                <Input
                  type="number"
                  value={data.workloadHrsPerWk}
                  onChange={(e) => updateData({ workloadHrsPerWk: e.target.value })}
                  placeholder="10"
                  className="focus:ring-2 focus:ring-orange-500"
                />
                <div className="text-xs text-orange-700 mt-1">
                  {data.workloadHrsPerWk && parseFloat(data.workloadHrsPerWk) < 10
                    ? '🎆 Low maintenance - very attractive!'
                    : data.workloadHrsPerWk && parseFloat(data.workloadHrsPerWk) < 20
                    ? '👍 Manageable workload'
                    : data.workloadHrsPerWk && parseFloat(data.workloadHrsPerWk) >= 20
                    ? '⚠️ High time commitment'
                    : '💬 Be honest about time requirements'}
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <label className="block text-sm font-medium mb-2 flex items-center space-x-2">
                  <span>👥</span>
                  <span>Team Size</span>
                </label>
                <Input
                  type="number"
                  value={data.teamSize}
                  onChange={(e) => updateData({ teamSize: e.target.value })}
                  placeholder="3"
                  className="focus:ring-2 focus:ring-purple-500"
                />
                <div className="text-xs text-purple-700 mt-1">
                  💬 Include employees, contractors, and regular freelancers
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Website URL</label>
              <Input
                value={data.siteUrl}
                onChange={(e) => updateData({ siteUrl: e.target.value })}
                placeholder="https://yourbusiness.com"
              />
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <label className="block text-sm font-medium mb-3 flex items-center space-x-2">
                <span>💳</span>
                <span>How does your business make money?</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {MONETIZATION_OPTIONS.map(option => (
                  <label key={option} className="flex items-center space-x-2 p-2 rounded-md hover:bg-white/70 transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={data.monetization.includes(option)}
                      onChange={() => toggleArrayItem('monetization', option)}
                      className="rounded border-green-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm font-medium text-green-800">{option}</span>
                  </label>
                ))}
              </div>
              {data.monetization.length > 0 && (
                <div className="mt-3">
                  <div className="text-sm font-medium text-green-900 mb-2">Revenue Streams:</div>
                  <div className="flex flex-wrap gap-2">
                    {data.monetization.map(method => (
                      <Badge key={method} variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                        {method}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Tech Stack</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                {TECH_STACK_OPTIONS.map(tech => (
                  <label key={tech} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={data.techStack.includes(tech)}
                      onChange={() => toggleArrayItem('techStack', tech)}
                    />
                    <span className="text-sm">{tech}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Platforms</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {PLATFORM_OPTIONS.map(platform => (
                  <label key={platform} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={data.platform.includes(platform)}
                      onChange={() => toggleArrayItem('platform', platform)}
                    />
                    <span className="text-sm">{platform}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <label className="block text-sm font-medium mb-3 flex items-center space-x-2">
                <span>✨</span>
                <span>What makes your business shine?</span>
              </label>
              <div className="space-y-3">
                {data.highlights.map((highlight, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="flex-1 relative">
                      <Input
                        value={highlight}
                        onChange={(e) => updateArrayItem('highlights', index, e.target.value)}
                        placeholder="e.g. 150% YoY growth, Featured in TechCrunch, 95% customer satisfaction"
                        className="focus:ring-2 focus:ring-yellow-500 pr-10"
                      />
                      {highlight && (
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-green-500">
                          ✓
                        </div>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeArrayItem('highlights', index)}
                      className="hover:bg-red-50 hover:border-red-200"
                    >
                      <X className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => addArrayItem('highlights')}
                className="mt-3 w-full border-dashed border-2 border-yellow-300 hover:border-yellow-400 hover:bg-yellow-50"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Another Highlight 🌟
              </Button>
              <div className="text-xs text-yellow-700 mt-2">
                💡 Pro tip: Mention growth rates, awards, media coverage, or unique achievements!
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <label className="block text-sm font-medium mb-2 flex items-center space-x-2">
                <span>🚀</span>
                <span>Growth Opportunities</span>
              </label>
              {data.growthOps.map((growth, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <Input
                    value={growth}
                    onChange={(e) => updateArrayItem('growthOps', index, e.target.value)}
                    placeholder="e.g. Expand to mobile app, Add new features, Enter new markets"
                    className="flex-1 focus:ring-2 focus:ring-blue-500"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeArrayItem('growthOps', index)}
                    className="hover:bg-red-50 hover:border-red-200"
                  >
                    <X className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => addArrayItem('growthOps')}
                className="border-dashed border-2 border-blue-300 hover:border-blue-400 hover:bg-blue-50"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Growth Opportunity
              </Button>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Assets Included</label>
              {data.assetsIncluded.map((asset, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <Input
                    value={asset}
                    onChange={(e) => updateArrayItem('assetsIncluded', index, e.target.value)}
                    placeholder="e.g. Domain name, source code, customer database"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeArrayItem('assetsIncluded', index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => addArrayItem('assetsIncluded')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Asset
              </Button>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Known Risks</label>
              {data.risks.map((risk, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <Input
                    value={risk}
                    onChange={(e) => updateArrayItem('risks', index, e.target.value)}
                    placeholder="e.g. Dependency on single traffic source"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeArrayItem('risks', index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => addArrayItem('risks')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Risk
              </Button>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4">Review Your Listing</h3>
              <div className="space-y-4">
                <div>
                  <strong>Title:</strong> {data.title}
                </div>
                <div>
                  <strong>Type:</strong> {data.businessType}
                </div>
                <div>
                  <strong>Price:</strong> {data.priceType === 'ASKING' ? `$${data.askingPrice}` : 'Open to offers'}
                </div>
                {data.mrr && (
                  <div>
                    <strong>MRR:</strong> ${data.mrr}
                  </div>
                )}
                <div>
                  <strong>Description:</strong> {data.description.substring(0, 200)}...
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={data.ndaRequired}
                onChange={(e) => updateData({ ndaRequired: e.target.checked })}
                className="rounded"
              />
              <label className="text-sm">Require NDA before sharing details</label>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                Your listing will be reviewed by our team before going live. This usually takes 24-48 hours.
              </p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Create New Listing</h2>
            <div className="text-sm text-gray-600">
              Step {currentStep + 1} of {steps.length}
            </div>
          </div>
          <Progress value={(currentStep + 1) / steps.length * 100} className="mb-4" />
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                    index <= currentStep
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-110'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {index < currentStep ? '✓' : index + 1}
                </div>
                <div className="ml-3 hidden lg:block">
                  <div className={`text-sm font-medium transition-colors ${
                    index <= currentStep ? 'text-gray-900' : 'text-gray-500'
                  }`}>{step.title}</div>
                  <div className="text-xs text-gray-500">{step.description}</div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 rounded-full mx-4 transition-colors ${
                    index < currentStep ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Auto-save indicator */}
      <div className="mb-4 text-right">
        {saving ? (
          <span className="text-sm text-blue-600">Saving...</span>
        ) : lastSaved ? (
          <span className="text-sm text-gray-500">
            Last saved: {lastSaved.toLocaleTimeString()}
          </span>
        ) : null}
      </div>

      {/* Form Content */}
      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep].title}</CardTitle>
          <CardDescription>{steps[currentStep].description}</CardDescription>
        </CardHeader>
        <CardContent>
          {renderStep()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={currentStep === 0}
        >
          Previous
        </Button>

        <div className="flex space-x-2">
          {currentStep === steps.length - 1 ? (
            <>
              <Button
                variant="outline"
                onClick={() => handleSubmit('DRAFT')}
                disabled={saving}
                className="border-2 border-blue-300 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200"
              >
                <Save className="w-4 h-4 mr-2" />
                Save as Draft
              </Button>
              <Button
                onClick={() => handleSubmit('PENDING_REVIEW')}
                disabled={saving || !data.title || !data.businessType || !data.description}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-lg px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3" />
                    Creating listing...
                  </>
                ) : (
                  <>
                    <span className="mr-3">🚀</span>
                    Submit for Review
                    <Eye className="w-5 h-5 ml-3" />
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button
              onClick={handleNext}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              Continue →
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}