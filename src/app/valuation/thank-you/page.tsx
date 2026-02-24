'use client'

import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle, Clock, Mail, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'

function ThankYouContent() {
  const searchParams = useSearchParams()
  const businessName = searchParams.get('businessName') || 'your business'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Thank you for submitting your valuation request!
            </h1>
            <p className="text-lg text-gray-600">
              We've received your information for <span className="font-semibold text-gray-900">{businessName}</span> and our expert team is already working on your comprehensive valuation report. You should receive a confirmation email shortly with all the details.
            </p>
          </div>

          {/* What Happens Next */}
          <Card className="mb-8">
            <CardContent className="p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-blue-600" />
                What happens next?
              </h2>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Initial Review (2-4 hours)</h3>
                    <p className="text-gray-600 text-sm">Our valuation specialists will review your business information and conduct preliminary market research.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Detailed Analysis (12-24 hours)</h3>
                    <p className="text-gray-600 text-sm">We'll prepare a comprehensive valuation report including market comparisons, growth potential, and recommended pricing strategies.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Personal Consultation (Within 24 hours)</h3>
                    <p className="text-gray-600 text-sm">One of our senior business brokers will contact you to discuss the valuation results and answer any questions.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="mb-8">
            <CardContent className="p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Need immediate assistance?
              </h2>

              <div className="flex justify-center">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Email Us</p>
                    <p className="text-gray-600">info@startexus.com</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Value Proposition */}
          <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Why choose StartExus for your business sale?
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Average 30% higher sale prices</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-sm text-gray-700">95% customer satisfaction rate</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Expert guidance throughout process</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Access to qualified buyer network</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="text-center space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Link href="/browse">
                  Explore Current Listings
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>

              <Button asChild size="lg" variant="outline" className="border-gray-300">
                <Link href="/">
                  Return to Homepage
                </Link>
              </Button>
            </div>

            <p className="text-sm text-gray-500 mt-6">
              Questions about the valuation process?{' '}
              <Link href="/faq" className="text-blue-600 hover:text-blue-500 underline">
                Visit our FAQ page
              </Link>
            </p>
          </div>

          {/* Testimonial */}
          <Card className="mt-12 bg-gray-50">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="text-lg text-gray-600 mb-4 italic">
                  "StartExus helped me understand the true value of my SaaS business. Their detailed analysis and expert guidance resulted in a sale price 40% higher than I initially expected."
                </div>
                <div className="font-medium text-gray-900">Sarah Chen</div>
                <div className="text-sm text-gray-500">Founder, TechFlow Solutions - Sold for $2.3M</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function ValuationThankYouPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ThankYouContent />
    </Suspense>
  )
}