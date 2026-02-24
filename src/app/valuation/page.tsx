'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowRight, DollarSign, CheckCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

const BUSINESS_TYPES = [
  { value: 'SAAS', label: 'SaaS', icon: '💻' },
  { value: 'SERVICES', label: 'Services/Business', icon: '🏢' },
  { value: 'ECOMMERCE', label: 'eCommerce Store', icon: '🛒' },
  { value: 'AMAZON', label: 'Amazon Business', icon: '📦' },
  { value: 'CONTENT', label: 'Content Blog', icon: '📝' },
  { value: 'AFFILIATE', label: 'Affiliate Site', icon: '🔗' },
  { value: 'MOBILE_APP', label: 'Mobile App', icon: '📱' },
  { value: 'MARKETPLACE', label: 'Marketplace', icon: '🏪' },
  { value: 'DOMAIN', label: 'Domain', icon: '🌐' },
]

interface ValuationData {
  businessName: string
  businessType: string
  websiteUrl: string
  monthlyRevenue: string
  yearlyRevenue: string
  profitMargin: string
  monthsEstablished: string
  monthlyTraffic: number
  growthRate: string
  customerCount: number
  assets: number
  liabilities: number
  primaryTrafficSource: string
  isAiRelated: boolean | undefined
  sellTimeframe: string
  ownerInvolvement: string
  fullName: string
  email: string
  phone: string
  additionalInfo: string
}

const initialData: ValuationData = {
  businessName: '',
  businessType: '',
  websiteUrl: '',
  monthlyRevenue: '',
  yearlyRevenue: '',
  profitMargin: '',
  monthsEstablished: '',
  monthlyTraffic: 0,
  growthRate: '',
  customerCount: 0,
  assets: 0,
  liabilities: 0,
  primaryTrafficSource: '',
  isAiRelated: undefined,
  sellTimeframe: '',
  ownerInvolvement: '',
  fullName: '',
  email: '',
  phone: '',
  additionalInfo: '',
}

export default function ValuationPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [data, setData] = useState<ValuationData>(initialData)
  const [submitting, setSubmitting] = useState(false)
  const [calculatedValuation, setCalculatedValuation] = useState<number | null>(null)
  const [showContactModal, setShowContactModal] = useState(false)
  const [contactData, setContactData] = useState({ fullName: '', email: '', phone: '', additionalInfo: '' })
  const [modalType, setModalType] = useState<'instant' | 'full'>('full')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const steps = [
    { title: 'Business Details', description: 'Tell us about your business' },
    { title: 'Financial Metrics', description: 'Revenue and profit details' },
    { title: 'Traffic & Customers', description: 'Growth and engagement data' },
    { title: 'Assets & Operations', description: 'Business assets and operations' },
    { title: 'Your Valuation', description: 'See your estimated value' },
  ]

  const updateData = (updates: Partial<ValuationData>) => {
    setData(prev => ({ ...prev, ...updates }))
  }

  const calculateValuation = () => {
    const monthlyRevenue = parseFloat(data.monthlyRevenue) || 0
    const profitMargin = parseFloat(data.profitMargin) || 30

    // Step 1: Calculate Annual Revenue
    const annualRevenue = monthlyRevenue * 12

    // Step 2: Calculate Annual Profit
    const annualProfit = annualRevenue * (profitMargin / 100)

    // For very small businesses (under $10k annual revenue), use simple multiples
    if (annualRevenue < 10000) {
      const months = parseInt(data.monthsEstablished) || 0
      const monthlyProfit = annualProfit / 12

      // For micro businesses (<$200/month profit and <1 year old), use 6-7 month calculation
      if (monthlyProfit < 200 && months < 12) {
        let monthMultiple = 6.0 // Base 6 months

        // Adjust based on age
        if (months >= 6) monthMultiple = 7.0

        // Slight bonus for growth
        if (data.growthRate === 'explosive' || data.growthRate === 'high') monthMultiple += 1.0

        let valuation = monthlyProfit * monthMultiple

        // Add net assets
        const netAssets = data.assets - data.liabilities
        valuation += netAssets

        return Math.round(valuation)
      }

      // For other small businesses, use annual profit multiples
      let simpleMultiple = 2.0 // Base 2x for new/small businesses

      // Slight adjustments for small businesses
      if (months >= 12) simpleMultiple = 2.5
      if (months >= 24) simpleMultiple = 3.0
      if (data.growthRate === 'explosive' || data.growthRate === 'high') simpleMultiple += 0.5

      let valuation = annualProfit * simpleMultiple

      // Add net assets
      const netAssets = data.assets - data.liabilities
      valuation += netAssets

      return Math.round(valuation)
    }

    // For established businesses (over $10k annual revenue), use full multiple-based approach
    const typeMultiples: { [key: string]: { revLow: number, revHigh: number, profitLow: number, profitHigh: number } } = {
      'SAAS': { revLow: 3.0, revHigh: 6.0, profitLow: 4.0, profitHigh: 8.0 },
      'MOBILE_APP': { revLow: 2.5, revHigh: 5.0, profitLow: 3.5, profitHigh: 7.0 },
      'ECOMMERCE': { revLow: 1.5, revHigh: 3.0, profitLow: 2.5, profitHigh: 5.0 },
      'MARKETPLACE': { revLow: 2.0, revHigh: 4.5, profitLow: 3.0, profitHigh: 6.5 },
      'CONTENT': { revLow: 1.8, revHigh: 3.5, profitLow: 2.8, profitHigh: 5.5 },
      'AFFILIATE': { revLow: 1.5, revHigh: 2.8, profitLow: 2.0, profitHigh: 4.5 },
      'SERVICES': { revLow: 1.2, revHigh: 2.5, profitLow: 2.0, profitHigh: 4.0 },
      'AMAZON': { revLow: 1.5, revHigh: 3.0, profitLow: 2.5, profitHigh: 5.0 },
      'DOMAIN': { revLow: 1.0, revHigh: 2.0, profitLow: 1.5, profitHigh: 3.0 },
    }

    const multiples = typeMultiples[data.businessType] || { revLow: 2.0, revHigh: 4.0, profitLow: 3.0, profitHigh: 6.0 }

    // Calculate adjustment factor based on various metrics (0 to 1, where 1 is best)
    let adjustmentFactor = 0.5 // Start at middle

    // Age bonus (up to +0.15)
    const months = parseInt(data.monthsEstablished) || 0
    if (months >= 36) adjustmentFactor += 0.15
    else if (months >= 24) adjustmentFactor += 0.10
    else if (months >= 12) adjustmentFactor += 0.05

    // Growth rate adjustment (up to +0.20 or -0.15)
    if (data.growthRate === 'explosive') adjustmentFactor += 0.20
    else if (data.growthRate === 'high') adjustmentFactor += 0.15
    else if (data.growthRate === 'moderate') adjustmentFactor += 0.08
    else if (data.growthRate === 'stable') adjustmentFactor += 0.0
    else if (data.growthRate === 'declining') adjustmentFactor -= 0.15

    // Traffic source quality (up to +0.12)
    const trafficBonus: { [key: string]: number } = {
      'organic': 0.12,
      'direct': 0.10,
      'email': 0.08,
      'referral': 0.06,
      'social': 0.02,
      'paid': -0.05,
    }
    adjustmentFactor += trafficBonus[data.primaryTrafficSource] || 0


    // AI bonus (up to +0.15)
    if (data.isAiRelated) adjustmentFactor += 0.15

    // Owner involvement (up to +0.10)
    const involvementBonus: { [key: string]: number } = {
      'none': 0.10,
      'minimal': 0.08,
      'part-time': 0.04,
      'full-time': 0.0,
      'intensive': -0.05,
    }
    adjustmentFactor += involvementBonus[data.ownerInvolvement] || 0

    // Ensure factor stays between 0 and 1
    adjustmentFactor = Math.max(0, Math.min(1, adjustmentFactor))

    // Calculate multiples based on adjustment factor
    const revenueMultiple = multiples.revLow + (multiples.revHigh - multiples.revLow) * adjustmentFactor
    const profitMultiple = multiples.profitLow + (multiples.profitHigh - multiples.profitLow) * adjustmentFactor

    // Calculate valuations using both methods
    const revenueValuation = annualRevenue * revenueMultiple
    const profitValuation = annualProfit * profitMultiple

    // Use weighted average (70% profit-based, 30% revenue-based)
    let valuation = (profitValuation * 0.7) + (revenueValuation * 0.3)

    // Add net assets
    const netAssets = data.assets - data.liabilities
    valuation += netAssets

    // Ensure minimum valuation
    const minValuation = annualRevenue * 0.5
    valuation = Math.max(valuation, minValuation)

    // Round to nearest $1,000 only if above $100k
    if (valuation >= 100000) {
      return Math.round(valuation / 1000) * 1000
    }

    return Math.round(valuation)
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      if (currentStep === steps.length - 2) {
        const valuation = calculateValuation()
        setCalculatedValuation(valuation)
      }
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    // Open contact modal for full report
    setModalType('full')
    setShowContactModal(true)
  }

  const handleFullReportSubmit = async () => {
    const trimmedName = contactData.fullName.trim()
    const trimmedEmail = contactData.email.trim()

    if (!trimmedName || !trimmedEmail) {
      setErrorMessage('Please provide your name and email')
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        businessName: data.businessName,
        businessType: data.businessType,
        websiteUrl: normalizeUrl(data.websiteUrl),
        monthlyRevenue: data.monthlyRevenue,
        yearlyRevenue: data.yearlyRevenue,
        profitMargin: data.profitMargin,
        monthsEstablished: data.monthsEstablished,
        primaryTrafficSource: data.primaryTrafficSource,
        isAiRelated: data.isAiRelated,
        sellTimeframe: data.sellTimeframe,
        ownerInvolvement: data.ownerInvolvement,
        monthlyTraffic: data.monthlyTraffic,
        customerCount: data.customerCount,
        growthRate: data.growthRate,
        assets: data.assets,
        liabilities: data.liabilities,
        fullName: trimmedName,
        email: trimmedEmail,
        phone: contactData.phone,
        additionalInfo: contactData.additionalInfo,
        instantSell: false,
        valuationAmount: calculatedValuation,
      }

      const response = await fetch('/api/valuation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const responseData = await response.json()

      if (response.ok) {
        router.push('/valuation/thank-you')
      } else {
        setErrorMessage(responseData.error || 'Failed to submit')
      }
    } catch (error) {
      setErrorMessage('An error occurred. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleInstantSell = () => {
    setModalType('instant')
    setShowContactModal(true)
  }

  const handleInstantSellSubmit = async () => {
    const trimmedName = contactData.fullName.trim()
    const trimmedEmail = contactData.email.trim()

    if (!trimmedName || !trimmedEmail) {
      setErrorMessage('Please provide your name and email')
      return
    }

    setSubmitting(true)
    try {
      // Submit valuation with instant sell flag and contact data
      const payload = {
        businessName: data.businessName,
        businessType: data.businessType,
        websiteUrl: normalizeUrl(data.websiteUrl),
        monthlyRevenue: data.monthlyRevenue,
        yearlyRevenue: data.yearlyRevenue,
        profitMargin: data.profitMargin,
        monthsEstablished: data.monthsEstablished,
        primaryTrafficSource: data.primaryTrafficSource,
        isAiRelated: data.isAiRelated,
        sellTimeframe: data.sellTimeframe,
        ownerInvolvement: data.ownerInvolvement,
        monthlyTraffic: data.monthlyTraffic,
        customerCount: data.customerCount,
        growthRate: data.growthRate,
        assets: data.assets,
        liabilities: data.liabilities,
        fullName: trimmedName,
        email: trimmedEmail,
        phone: contactData.phone,
        additionalInfo: contactData.additionalInfo,
        instantSell: true,
        valuationAmount: calculatedValuation,
      }

      const response = await fetch('/api/valuation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const responseData = await response.json()

      if (response.ok) {
        router.push('/valuation/instant-sell-thank-you')
      } else {
        setErrorMessage(responseData.error || 'Failed to submit')
      }
    } catch (error) {
      setErrorMessage('An error occurred. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const normalizeUrl = (url: string) => {
    if (!url) return url
    // If URL doesn't start with http:// or https://, add https://
    if (!url.match(/^https?:\/\//i)) {
      return `https://${url}`
    }
    return url
  }

  const isValidUrl = (url: string) => {
    if (!url) return false
    try {
      // Try to validate with the normalized URL
      new URL(normalizeUrl(url))
      return true
    } catch {
      return false
    }
  }

  const canProceedToNext = () => {
    switch (currentStep) {
      case 0:
        return data.businessName && data.businessType && data.websiteUrl && isValidUrl(data.websiteUrl) && data.isAiRelated !== undefined
      case 1:
        return data.monthlyRevenue && data.profitMargin && data.monthsEstablished
      case 2:
        return data.monthlyTraffic >= 0 && data.growthRate && data.primaryTrafficSource
      case 3:
        return data.ownerInvolvement
      case 4:
        return true
      default:
        return true
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0: // Business Details
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center space-x-2">
                <span>💼</span>
                <span>Business Name *</span>
              </label>
              <Input
                value={data.businessName}
                onChange={(e) => updateData({ businessName: e.target.value })}
                placeholder="e.g. Acme SaaS Tool"
                className="focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-3 flex items-center space-x-2">
                <span>🎯</span>
                <span>Business Type *</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {BUSINESS_TYPES.map(type => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => updateData({ businessType: type.value })}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 text-center hover:scale-105 ${
                      data.businessType === type.value
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    <div className="text-2xl mb-1">{type.icon}</div>
                    <div className="text-xs font-medium text-gray-900">{type.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 flex items-center space-x-2">
                <span>🌐</span>
                <span>Website URL *</span>
              </label>
              <Input
                type="url"
                value={data.websiteUrl}
                onChange={(e) => updateData({ websiteUrl: e.target.value })}
                placeholder="yourbusiness.com or https://yourbusiness.com"
                className={`focus:ring-2 ${data.websiteUrl && !isValidUrl(data.websiteUrl) ? 'border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'}`}
              />
              {data.websiteUrl && !isValidUrl(data.websiteUrl) && (
                <p className="text-sm text-red-600 mt-1">Please enter a valid domain (e.g., example.com or https://example.com)</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-3">Is your business AI-related? 🤖 *</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => updateData({ isAiRelated: true })}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                    data.isAiRelated === true
                      ? 'border-purple-500 bg-purple-50 shadow-md'
                      : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">🚀</div>
                    <div>
                      <div className="font-medium text-gray-900">Yes, AI-powered!</div>
                      <div className="text-sm text-gray-600">Uses AI/ML technology</div>
                    </div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => updateData({ isAiRelated: false })}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                    data.isAiRelated === false
                      ? 'border-purple-500 bg-purple-50 shadow-md'
                      : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">🏢</div>
                    <div>
                      <div className="font-medium text-gray-900">Traditional business</div>
                      <div className="text-sm text-gray-600">No AI technology used</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )

      case 1: // Financial Metrics
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center space-x-2 mb-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-medium text-green-800">Financial Performance 💰</h3>
              </div>
              <p className="text-sm text-gray-600">Help us understand your business finances</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Monthly Revenue (USD) *</label>
              <Input
                type="number"
                value={data.monthlyRevenue}
                onChange={(e) => updateData({ monthlyRevenue: e.target.value })}
                placeholder="e.g. 15000"
                min="0"
                className="focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Enter your average monthly revenue (for $3.5M annual, enter 291667)</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Profit Margin (%) *</label>
              <Input
                type="number"
                value={data.profitMargin}
                onChange={(e) => updateData({ profitMargin: e.target.value })}
                placeholder="e.g. 30"
                min="0"
                max="100"
                className="focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Typical range: 10-50%</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">How long has your business been operating? *</label>
              <select
                value={data.monthsEstablished}
                onChange={(e) => updateData({ monthsEstablished: e.target.value })}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select timeframe</option>
                <option value="3">0-6 months</option>
                <option value="9">6-12 months</option>
                <option value="18">1-2 years</option>
                <option value="30">2-3 years</option>
                <option value="48">3-5 years</option>
                <option value="72">5+ years</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">When do you want to sell?</label>
              <select
                value={data.sellTimeframe}
                onChange={(e) => updateData({ sellTimeframe: e.target.value })}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select timeframe</option>
                <option value="asap">As soon as possible</option>
                <option value="1-3months">1-3 months</option>
                <option value="3-6months">3-6 months</option>
                <option value="6-12months">6-12 months</option>
                <option value="exploring">Just exploring options</option>
              </select>
            </div>
          </div>
        )

      case 2: // Traffic & Customers
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Monthly Visitors/Traffic</label>
              <Input
                type="number"
                value={data.monthlyTraffic}
                onChange={(e) => updateData({ monthlyTraffic: parseInt(e.target.value) || 0 })}
                placeholder="e.g. 10000"
                min="0"
                className="focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Monthly Customers/Users</label>
              <Input
                type="number"
                value={data.customerCount}
                onChange={(e) => updateData({ customerCount: parseInt(e.target.value) || 0 })}
                placeholder="e.g. 500"
                min="0"
                className="focus:ring-2 focus:ring-blue-500"
              />
            </div>


            <div>
              <label className="block text-sm font-medium mb-2">Primary Traffic Source *</label>
              <select
                value={data.primaryTrafficSource}
                onChange={(e) => updateData({ primaryTrafficSource: e.target.value })}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select primary source</option>
                <option value="organic">Organic Search (SEO)</option>
                <option value="paid">Paid Advertising</option>
                <option value="social">Social Media</option>
                <option value="direct">Direct Traffic</option>
                <option value="referral">Referrals</option>
                <option value="email">Email Marketing</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Growth Rate *</label>
              <select
                value={data.growthRate}
                onChange={(e) => updateData({ growthRate: e.target.value })}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select growth rate</option>
                <option value="explosive">Explosive (50%+ monthly)</option>
                <option value="high">High (20-50% monthly)</option>
                <option value="moderate">Moderate (5-20% monthly)</option>
                <option value="stable">Stable (0-5% monthly)</option>
                <option value="declining">Declining</option>
              </select>
            </div>
          </div>
        )

      case 3: // Assets & Operations
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-purple-800 mb-2">Assets & Liabilities 💼</h3>
              <p className="text-sm text-gray-600">Help us understand your business assets</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Total Assets (USD)</label>
                <Input
                  type="number"
                  value={data.assets}
                  onChange={(e) => updateData({ assets: parseInt(e.target.value) || 0 })}
                  placeholder="e.g. 50000"
                  min="0"
                  className="focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Domain, inventory, equipment, cash, etc.</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Total Liabilities (USD)</label>
                <Input
                  type="number"
                  value={data.liabilities}
                  onChange={(e) => updateData({ liabilities: parseInt(e.target.value) || 0 })}
                  placeholder="e.g. 10000"
                  min="0"
                  className="focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Debts, loans, obligations, etc.</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Owner Time Involvement *</label>
              <select
                value={data.ownerInvolvement}
                onChange={(e) => updateData({ ownerInvolvement: e.target.value })}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select involvement level</option>
                <option value="none">Fully automated (0 hours/week)</option>
                <option value="minimal">Minimal (&lt;5 hours/week)</option>
                <option value="part-time">Part-time (5-20 hours/week)</option>
                <option value="full-time">Full-time (20-40 hours/week)</option>
                <option value="intensive">Intensive (&gt;40 hours/week)</option>
              </select>
            </div>

          </div>
        )

      case 4: // Valuation Results
        return (
          <div className="space-y-6">
            <div className="text-center bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-8">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Your Estimated Valuation</h3>
              <div className="text-5xl font-bold text-green-600 mb-4">
                {calculatedValuation ? formatCurrency(calculatedValuation) : '$0'}
              </div>
              <p className="text-gray-600">Based on the information you provided</p>
            </div>

            {calculatedValuation && calculatedValuation <= 50000 && (
              <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300 rounded-2xl p-6">
                <div className="flex items-start space-x-4">
                  <div className="text-4xl">⚡</div>
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-gray-900 mb-3">Sell to Us Instantly!</h4>
                    <p className="text-gray-700 mb-4">
                      We're interested in buying your business right now. Get cash immediately with our instant buyout offer:
                    </p>
                    <div className="bg-white rounded-lg p-4 border-2 border-orange-400 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-gray-700">Instant Buyout Price:</span>
                        <span className="text-3xl font-bold text-orange-600">
                          {formatCurrency(calculatedValuation * 0.8)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        Immediate cash payment - no waiting, no hassle
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Button
                        onClick={handleInstantSell}
                        className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white text-lg py-6"
                      >
                        💰 Sell Now for {formatCurrency(calculatedValuation * 0.8)}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleNext}
                        className="border-2 border-orange-500 text-orange-600 hover:bg-orange-50 text-lg py-6"
                      >
                        List at Full Price
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h4 className="font-semibold text-blue-900 mb-3 flex items-center space-x-2">
                <CheckCircle className="w-5 h-5" />
                <span>What happens next?</span>
              </h4>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start space-x-2">
                  <span>✓</span>
                  <span>Our team will review your submission within 24 hours</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span>✓</span>
                  <span>You'll receive a detailed valuation report via email</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span>✓</span>
                  <span>We'll schedule a free consultation call to discuss your options</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span>✓</span>
                  <span>No obligations - you're in complete control</span>
                </li>
              </ul>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">💎</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Get Your Free Business Valuation
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our experts will analyze your business and provide a detailed valuation report within 24 hours.
              Completely free, no obligations.
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Valuation Request</h2>
                <div className="text-sm text-gray-600">
                  Step {currentStep + 1} of {steps.length}
                </div>
              </div>
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
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-lg px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <span className="mr-3">🚀</span>
                      Submit for Full Report
                      <ArrowRight className="w-5 h-5 ml-3" />
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={!canProceedToNext()}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8"
                >
                  Next Step
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">📞</div>
              <h2 className="text-2xl font-bold mb-2">How can we reach you?</h2>
              <p className="text-gray-600">
                {modalType === 'instant'
                  ? "We'll contact you to complete the sale"
                  : "We'll send you a detailed valuation report"}
              </p>
            </div>

            <div className="space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-lg bg-red-50 text-red-800 border border-red-200 text-sm">
                  {errorMessage}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-2">Full Name *</label>
                <Input
                  value={contactData.fullName}
                  onChange={(e) => setContactData({ ...contactData, fullName: e.target.value })}
                  placeholder="John Doe"
                  className="focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email Address *</label>
                <Input
                  type="email"
                  value={contactData.email}
                  onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                  placeholder="john@example.com"
                  className="focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Phone Number (Optional)</label>
                <Input
                  value={contactData.phone}
                  onChange={(e) => setContactData({ ...contactData, phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                  className="focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Additional Details (Optional)</label>
                <textarea
                  value={contactData.additionalInfo}
                  onChange={(e) => setContactData({ ...contactData, additionalInfo: e.target.value })}
                  placeholder="Any additional information..."
                  className="w-full p-3 border-2 rounded-lg h-20 resize-vertical focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowContactModal(false)}
                className="flex-1"
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                onClick={modalType === 'instant' ? handleInstantSellSubmit : handleFullReportSubmit}
                disabled={submitting || !contactData.fullName.trim() || !contactData.email.trim()}
                className={modalType === 'instant'
                  ? "flex-1 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                  : "flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                }
              >
                {submitting ? 'Submitting...' : 'Submit'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}