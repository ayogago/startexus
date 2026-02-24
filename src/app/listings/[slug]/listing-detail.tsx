'use client'

import { useState } from 'react'
import { Session } from 'next-auth'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatNumber } from '@/lib/utils'
import {
  Heart,
  MessageSquare,
  Calendar,
  TrendingUp,
  Users,
  Clock,
  Globe,
  Shield,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  BarChart3,
  Target,
  AlertTriangle,
  Package,
  Sparkles,
  MapPin,
  Link as LinkIcon,
  Building,
  Zap,
  Star,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react'
import { ListingImage } from '@/components/ui/listing-image'
import { getPlaceholderImage } from '@/lib/placeholder-images'

interface ListingDetailProps {
  listing: any
  session: Session | null
  isSaved: boolean
}

export function ListingDetail({ listing, session, isSaved }: ListingDetailProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [saved, setSaved] = useState(isSaved)
  const [savesCount, setSavesCount] = useState(listing._count.savedListings)
  const [activeTab, setActiveTab] = useState('overview')

  const getDisplayImages = () => {
    if (listing.images && listing.images.length > 0) {
      return listing.images
    }
    return [{
      url: getPlaceholderImage(listing.businessType),
      alt: `${listing.businessType} Business Placeholder`
    }]
  }

  const displayImages = getDisplayImages()

  const handleSave = async () => {
    if (!session) {
      window.location.href = '/auth/signin'
      return
    }

    try {
      const response = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: listing.id }),
      })

      if (response.ok) {
        setSaved(!saved)
        setSavesCount((prev: number) => saved ? prev - 1 : prev + 1)
      }
    } catch (error) {
      console.error('Failed to save listing:', error)
    }
  }

  const handleContactSeller = () => {
    if (!session) {
      window.location.href = '/auth/signin'
      return
    }
    window.location.href = `/dashboard/messages?listing=${listing.id}`
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === displayImages.length - 1 ? 0 : prev + 1
    )
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? displayImages.length - 1 : prev - 1
    )
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Info },
    { id: 'financials', label: 'Financials', icon: DollarSign },
    { id: 'technical', label: 'Technical', icon: Zap },
    { id: 'details', label: 'Details', icon: Building }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Image Gallery */}
            <div className="relative h-96 lg:h-[500px]">
              <ListingImage
                src={displayImages[currentImageIndex].url}
                alt={displayImages[currentImageIndex].alt || listing.title}
                className="w-full h-full object-cover"
                businessType={listing.businessType}
              />
              {displayImages.length > 1 && (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white"
                    onClick={nextImage}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {displayImages.map((_: any, index: number) => (
                      <button
                        key={index}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentImageIndex ? 'bg-white scale-125' : 'bg-white/60'
                        }`}
                        onClick={() => setCurrentImageIndex(index)}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Featured Badge */}
              {listing.featured && (
                <div className="absolute top-4 left-4">
                  <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg">
                    <Star className="w-3 h-3 mr-1 fill-current" />
                    Featured
                  </Badge>
                </div>
              )}

              {/* AI Badge */}
              {listing.isAiRelated && (
                <div className="absolute top-4 right-4">
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg">
                    <Sparkles className="w-3 h-3 mr-1" />
                    AI-Powered
                  </Badge>
                </div>
              )}
            </div>

            {/* Hero Content */}
            <div className="p-8 lg:p-12 flex flex-col justify-center">
              <div className="flex items-center justify-between mb-4">
                <Badge variant="outline" className="text-lg px-3 py-1">
                  {listing.businessType}
                </Badge>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Heart className="w-4 h-4" />
                    <span>{savesCount} saves</span>
                  </div>
                </div>
              </div>

              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                {listing.title}
              </h1>

              {listing.confidential && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-4 mb-6">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-5 h-5 text-yellow-600" />
                    <span className="font-medium text-yellow-800">Confidential Listing</span>
                  </div>
                  <p className="text-yellow-700 text-sm mt-1">
                    Some details are hidden to protect business identity. Contact seller for full information.
                  </p>
                </div>
              )}

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                  <div className="text-sm text-green-600 mb-1 font-medium">Asking Price</div>
                  <div className="text-2xl font-bold text-green-800">
                    {listing.askingPrice ? formatCurrency(listing.askingPrice) : 'Open to offers'}
                  </div>
                </div>
                {listing.mrr && (
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-200">
                    <div className="text-sm text-blue-600 mb-1 font-medium">Monthly Revenue</div>
                    <div className="text-2xl font-bold text-blue-800">{formatCurrency(listing.mrr)}</div>
                  </div>
                )}
              </div>

              {/* Website URL */}
              {listing.siteUrl && !listing.confidential && (
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                  <div className="flex items-center space-x-3">
                    <LinkIcon className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="text-sm text-blue-600 font-medium">Visit Website</div>
                      <a
                        href={listing.siteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-800 hover:text-blue-900 font-semibold underline text-lg"
                      >
                        {listing.siteUrl}
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleContactSeller}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-lg py-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
                  size="lg"
                >
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Contact Seller
                </Button>
                <Button
                  onClick={handleSave}
                  variant="outline"
                  className="flex-1 border-2 hover:bg-gray-50 py-6 rounded-xl transition-all"
                  size="lg"
                >
                  <Heart className={`w-5 h-5 mr-2 ${saved ? 'fill-current text-red-500' : ''}`} />
                  {saved ? 'Saved' : 'Save Listing'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-lg p-2 mb-8">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const IconComponent = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            {activeTab === 'overview' && (
              <>
                {/* Key Highlights */}
                {listing.highlights.length > 0 && (
                  <Card className="shadow-lg border-0 bg-white">
                    <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-xl">
                      <CardTitle className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span>Key Highlights</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid gap-3">
                        {listing.highlights.map((highlight: string, index: number) => (
                          <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                            <span className="text-gray-700">{highlight}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Description */}
                <Card className="shadow-lg border-0 bg-white">
                  <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-xl">
                    <CardTitle className="flex items-center space-x-2">
                      <Building className="w-5 h-5 text-blue-600" />
                      <span>Business Description</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="prose max-w-none text-gray-700 leading-relaxed">
                      <p className="whitespace-pre-line">{listing.description}</p>
                    </div>
                  </CardContent>
                </Card>

              </>
            )}

            {activeTab === 'financials' && (
              <>
                {/* Financial Metrics */}
                <Card className="shadow-lg border-0 bg-white">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-xl">
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="w-5 h-5 text-green-600" />
                      <span>Financial Performance</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                        <div className="text-sm text-green-600 mb-1 font-medium">Asking Price</div>
                        <div className="text-2xl font-bold text-green-800">
                          {listing.askingPrice ? formatCurrency(listing.askingPrice) : 'Open to offers'}
                        </div>
                        {listing.priceType === 'OPEN_TO_OFFERS' && (
                          <div className="text-xs text-green-600 mt-1">Seller open to negotiations</div>
                        )}
                      </div>

                      {listing.revenueTtm && (
                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-200">
                          <div className="text-sm text-blue-600 mb-1 font-medium">Annual Revenue (TTM)</div>
                          <div className="text-2xl font-bold text-blue-800">{formatCurrency(listing.revenueTtm)}</div>
                        </div>
                      )}

                      {listing.mrr && (
                        <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-4 rounded-xl border border-purple-200">
                          <div className="text-sm text-purple-600 mb-1 font-medium">Monthly Recurring Revenue</div>
                          <div className="text-2xl font-bold text-purple-800">{formatCurrency(listing.mrr)}</div>
                        </div>
                      )}

                      {listing.profitTtm && (
                        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-xl border border-yellow-200">
                          <div className="text-sm text-yellow-600 mb-1 font-medium">Annual Profit (TTM)</div>
                          <div className="text-2xl font-bold text-yellow-800">{formatCurrency(listing.profitTtm)}</div>
                        </div>
                      )}

                      {listing.trafficTtm && (
                        <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-4 rounded-xl border border-pink-200">
                          <div className="text-sm text-pink-600 mb-1 font-medium">Monthly Traffic</div>
                          <div className="text-2xl font-bold text-pink-800">{formatNumber(listing.trafficTtm / 12)}</div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Monetization */}
                {listing.monetization.length > 0 && (
                  <Card className="shadow-lg border-0 bg-white">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-t-xl">
                      <CardTitle className="flex items-center space-x-2">
                        <DollarSign className="w-5 h-5 text-blue-600" />
                        <span>Revenue Streams</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="flex flex-wrap gap-2">
                        {listing.monetization.map((method: string, index: number) => (
                          <Badge key={index} variant="secondary" className="px-3 py-1 bg-blue-100 text-blue-800 border border-blue-200">
                            {method}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {activeTab === 'technical' && (
              <>
                {/* Tech Stack */}
                {listing.techStack.length > 0 && (
                  <Card className="shadow-lg border-0 bg-white">
                    <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-t-xl">
                      <CardTitle className="flex items-center space-x-2">
                        <Zap className="w-5 h-5 text-purple-600" />
                        <span>Technology Stack</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="flex flex-wrap gap-2">
                        {listing.techStack.map((tech: string, index: number) => (
                          <Badge key={index} variant="secondary" className="px-3 py-1 bg-purple-100 text-purple-800 border border-purple-200">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Platform */}
                {listing.platform.length > 0 && (
                  <Card className="shadow-lg border-0 bg-white">
                    <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-t-xl">
                      <CardTitle className="flex items-center space-x-2">
                        <Globe className="w-5 h-5 text-indigo-600" />
                        <span>Platforms</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="flex flex-wrap gap-2">
                        {listing.platform.map((platform: string, index: number) => (
                          <Badge key={index} variant="secondary" className="px-3 py-1 bg-indigo-100 text-indigo-800 border border-indigo-200">
                            {platform}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* AI Technologies */}
                {listing.isAiRelated && listing.aiTechnologies.length > 0 && (
                  <Card className="shadow-lg border-0 bg-white">
                    <CardHeader className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-t-xl">
                      <CardTitle className="flex items-center space-x-2">
                        <Sparkles className="w-5 h-5 text-pink-600" />
                        <span>AI Technologies</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="flex flex-wrap gap-2">
                        {listing.aiTechnologies.map((tech: string, index: number) => (
                          <Badge key={index} variant="secondary" className="px-3 py-1 bg-pink-100 text-pink-800 border border-pink-200">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}


            {activeTab === 'details' && (
              <>
                {/* Business Details */}
                <Card className="shadow-lg border-0 bg-white">
                  <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-t-xl">
                    <CardTitle className="flex items-center space-x-2">
                      <Building className="w-5 h-5 text-gray-600" />
                      <span>Business Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {listing.establishedAt && (
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <Calendar className="w-5 h-5 text-gray-600" />
                          <div>
                            <div className="text-sm text-gray-600">Established</div>
                            <div className="font-medium">{new Date(listing.establishedAt).getFullYear()}</div>
                          </div>
                        </div>
                      )}

                      {listing.workloadHrsPerWk && (
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <Clock className="w-5 h-5 text-gray-600" />
                          <div>
                            <div className="text-sm text-gray-600">Owner Workload</div>
                            <div className="font-medium">{listing.workloadHrsPerWk} hours/week</div>
                          </div>
                        </div>
                      )}

                      {listing.teamSize && (
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <Users className="w-5 h-5 text-gray-600" />
                          <div>
                            <div className="text-sm text-gray-600">Team Size</div>
                            <div className="font-medium">{listing.teamSize} {listing.teamSize === 1 ? 'person' : 'people'}</div>
                          </div>
                        </div>
                      )}

                      {listing.location && (
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <MapPin className="w-5 h-5 text-gray-600" />
                          <div>
                            <div className="text-sm text-gray-600">Location</div>
                            <div className="font-medium">{listing.location}</div>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <Shield className="w-5 h-5 text-gray-600" />
                        <div>
                          <div className="text-sm text-gray-600">Confidential</div>
                          <div className="font-medium flex items-center space-x-1">
                            {listing.confidential ? (
                              <>
                                <CheckCircle className="w-4 h-4 text-yellow-500" />
                                <span>Yes</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-4 h-4 text-green-500" />
                                <span>No</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <Shield className="w-5 h-5 text-gray-600" />
                        <div>
                          <div className="text-sm text-gray-600">NDA Required</div>
                          <div className="font-medium flex items-center space-x-1">
                            {listing.ndaRequired ? (
                              <>
                                <CheckCircle className="w-4 h-4 text-yellow-500" />
                                <span>Yes</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-4 h-4 text-green-500" />
                                <span>No</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Assets Included */}
                {listing.assetsIncluded.length > 0 && (
                  <Card className="shadow-lg border-0 bg-white">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl">
                      <CardTitle className="flex items-center space-x-2">
                        <Package className="w-5 h-5 text-blue-600" />
                        <span>What's Included in Sale</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid gap-3">
                        {listing.assetsIncluded.map((asset: string, index: number) => (
                          <div key={index} className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
                            <span className="text-gray-700">{asset}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>

          {/* Sticky Sidebar */}
          <div className="lg:sticky lg:top-8 lg:h-fit space-y-6">
            {/* Quick Actions */}
            <Card className="shadow-lg border-0 bg-white">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold mb-2 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {listing.askingPrice ? formatCurrency(listing.askingPrice) : 'Open to offers'}
                  </div>
                  {listing.priceType === 'OPEN_TO_OFFERS' && (
                    <p className="text-sm text-gray-600">Seller is open to offers</p>
                  )}
                </div>

                <div className="space-y-3">
                  <Button onClick={handleContactSeller} className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all" size="lg">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Contact Seller
                  </Button>
                  <Button onClick={handleSave} variant="outline" className="w-full border-2 hover:bg-gray-50 transition-all">
                    <Heart className={`w-4 h-4 mr-2 ${saved ? 'fill-current text-red-500' : ''}`} />
                    {saved ? 'Saved' : 'Save Listing'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="shadow-lg border-0 bg-gradient-to-br from-gray-50 to-slate-50">
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {listing.mrr && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600">MRR</span>
                    <span className="font-semibold text-blue-600">{formatCurrency(listing.mrr)}</span>
                  </div>
                )}
                {listing.revenueTtm && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600">Annual Revenue</span>
                    <span className="font-semibold text-green-600">{formatCurrency(listing.revenueTtm)}</span>
                  </div>
                )}
                {listing.trafficTtm && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600">Monthly Visitors</span>
                    <span className="font-semibold text-purple-600">{formatNumber(listing.trafficTtm / 12)}</span>
                  </div>
                )}
                {listing.workloadHrsPerWk && (
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Hours/Week</span>
                    <span className="font-semibold text-gray-800">{listing.workloadHrsPerWk}h</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}