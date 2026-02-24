import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  FileText,
  MessageSquare,
  CreditCard,
  Shield,
  CheckCircle,
  ArrowRight,
  Upload,
  Eye,
  Users,
  TrendingUp
} from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'How It Works',
  description: 'Learn how to buy or sell an online business on StartExus. Simple steps from listing to closing the deal.',
  alternates: { canonical: '/how-it-works' },
}

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              How StartExus Works
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              A simple, secure process for buying and selling online businesses.
              From discovery to transfer, we guide you every step of the way.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary">
                <Link href="/browse">Start Browsing</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-800">
                <Link href="/sell">List Your Business</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* For Buyers */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <Badge className="bg-green-100 text-green-800 mb-4">For Buyers</Badge>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Find Your Perfect Business
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Discover profitable online businesses ready for acquisition. Our streamlined process
                makes it easy to find, evaluate, and purchase your next venture.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">1. Browse & Search</h3>
                <p className="text-gray-600 text-sm">
                  Use our advanced filters to find businesses by category, price, revenue,
                  and growth metrics that match your criteria.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">2. Due Diligence</h3>
                <p className="text-gray-600 text-sm">
                  Review detailed financials, traffic data, and business metrics.
                  Request additional documentation and ask questions.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">3. Make an Offer</h3>
                <p className="text-gray-600 text-sm">
                  Submit your offer and negotiate terms directly with the seller
                  through our secure messaging platform.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">4. Secure Transfer</h3>
                <p className="text-gray-600 text-sm">
                  Complete the purchase through our secure escrow system with
                  full transfer support and 30-day seller assistance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Sellers */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <Badge className="bg-blue-100 text-blue-800 mb-4">For Sellers</Badge>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Sell Your Business with Confidence
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                List your online business and connect with qualified buyers. Our platform
                maximizes your business value while ensuring a smooth, secure transaction.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">1. Create Listing</h3>
                <p className="text-gray-600 text-sm">
                  Fill out our comprehensive form with business details, financials,
                  and supporting documents. No upfront fees required.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Eye className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">2. Get Verified</h3>
                <p className="text-gray-600 text-sm">
                  Our team reviews and verifies your listing to ensure quality
                  and accuracy, building trust with potential buyers.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">3. Connect with Buyers</h3>
                <p className="text-gray-600 text-sm">
                  Receive inquiries from qualified buyers. Negotiate terms and
                  answer questions through our secure platform.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">4. Close the Deal</h3>
                <p className="text-gray-600 text-sm">
                  Complete the sale through our escrow system with legal support
                  and transfer assistance. Get paid securely.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Trust */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Your Security is Our Priority
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                We've built multiple layers of protection to ensure every transaction
                is secure, transparent, and successful for both buyers and sellers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card>
                <CardHeader className="text-center">
                  <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <CardTitle>Secure Escrow</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600 text-sm">
                    All payments are held in secure escrow until transfer conditions
                    are met, protecting both parties throughout the transaction.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="text-center">
                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <CardTitle>Verified Listings</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600 text-sm">
                    Every business listing is thoroughly reviewed and verified
                    by our team to ensure accuracy and legitimacy.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="text-center">
                  <Users className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                  <CardTitle>Expert Support</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600 text-sm">
                    Our experienced team provides guidance throughout the process,
                    from valuation to transfer completion.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stats */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Proven Track Record
              </h2>
              <p className="text-lg text-gray-600">
                Join thousands of successful entrepreneurs who have bought and sold businesses on StartExus
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-2">$50M+</div>
                <p className="text-gray-600">Transaction Volume</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600 mb-2">500+</div>
                <p className="text-gray-600">Successful Sales</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600 mb-2">99.9%</div>
                <p className="text-gray-600">Success Rate</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-orange-600 mb-2">30 days</div>
                <p className="text-gray-600">Average Sale Time</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Whether you're looking to buy your first online business or sell your current venture,
              StartExus makes the process simple and secure.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Link href="/browse">
                  Browse Businesses
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/sell">
                  List Your Business
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}