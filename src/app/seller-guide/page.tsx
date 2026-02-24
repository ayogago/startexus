import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  CheckCircle,
  AlertTriangle,
  DollarSign,
  FileText,
  TrendingUp,
  Users,
  Shield,
  Calendar,
  ArrowRight,
  Lightbulb,
  Target,
  BarChart
} from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Seller Guide',
  description: 'Complete guide to selling your online business on StartExus. Tips for pricing, listing, and closing deals.',
  alternates: { canonical: '/seller-guide' },
}

export default function SellerGuidePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              The Complete Seller's Guide
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Everything you need to know to successfully sell your online business on StartExus.
              From preparation to closing, we'll help you maximize your business value.
            </p>
            <Button asChild size="lg" variant="secondary">
              <Link href="/sell">Start Selling Now</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Preparation Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <Badge className="bg-blue-100 text-blue-800 mb-4">Step 1</Badge>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Prepare Your Business for Sale
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                The key to a successful sale is proper preparation. Here's what you need
                to do before listing your business.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <FileText className="w-8 h-8 text-blue-600 mb-2" />
                  <CardTitle>Financial Documentation</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-1 mr-2 flex-shrink-0" />
                      Last 12-24 months of revenue records
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-1 mr-2 flex-shrink-0" />
                      Bank statements and payment processor records
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-1 mr-2 flex-shrink-0" />
                      Profit and loss statements
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-1 mr-2 flex-shrink-0" />
                      Tax returns (if applicable)
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-1 mr-2 flex-shrink-0" />
                      Expense breakdowns and recurring costs
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <BarChart className="w-8 h-8 text-green-600 mb-2" />
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-1 mr-2 flex-shrink-0" />
                      Google Analytics data and traffic reports
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-1 mr-2 flex-shrink-0" />
                      Customer acquisition costs and metrics
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-1 mr-2 flex-shrink-0" />
                      Conversion rates and sales funnels
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-1 mr-2 flex-shrink-0" />
                      Customer retention and churn rates
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-1 mr-2 flex-shrink-0" />
                      SEO rankings and keyword performance
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Valuation Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <Badge className="bg-green-100 text-green-800 mb-4">Step 2</Badge>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Value Your Business
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Understanding your business value is crucial for setting the right price
                and attracting serious buyers.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                  Common Valuation Methods
                </h3>

                <div className="space-y-6">
                  <div className="flex items-start">
                    <DollarSign className="w-6 h-6 text-blue-600 mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Revenue Multiple</h4>
                      <p className="text-gray-600 text-sm">
                        Typically 1-5x annual revenue, depending on growth, profitability, and business model.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <TrendingUp className="w-6 h-6 text-green-600 mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Profit Multiple</h4>
                      <p className="text-gray-600 text-sm">
                        Usually 2-4x annual profit (SDE), higher for SaaS businesses with recurring revenue.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Target className="w-6 h-6 text-purple-600 mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Asset-Based</h4>
                      <p className="text-gray-600 text-sm">
                        Value based on tangible and intangible assets including domain, inventory, and IP.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <Button asChild variant="outline">
                    <Link href="/sell">Get Free Valuation</Link>
                  </Button>
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Factors That Increase Value</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span className="text-sm">Consistent revenue growth</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span className="text-sm">Recurring revenue model</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span className="text-sm">Diversified traffic sources</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span className="text-sm">Strong brand and domain authority</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span className="text-sm">Documented processes and systems</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span className="text-sm">Low owner dependence</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Listing Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <Badge className="bg-purple-100 text-purple-800 mb-4">Step 3</Badge>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Create Your Listing
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                A compelling listing attracts more qualified buyers and leads to faster sales
                at better prices.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <Lightbulb className="w-8 h-8 text-yellow-600 mb-2" />
                  <CardTitle>Compelling Title</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-4">
                    Create a clear, descriptive title that highlights your business's key strength.
                  </p>
                  <div className="bg-gray-50 p-3 rounded text-xs">
                    <p className="font-medium text-gray-900 mb-1">Good:</p>
                    <p>"Profitable SaaS Tool - $15K MRR, 200% YoY Growth"</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <FileText className="w-8 h-8 text-blue-600 mb-2" />
                  <CardTitle>Detailed Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-gray-600 text-sm">
                    <li>• Business model and revenue streams</li>
                    <li>• Target market and customers</li>
                    <li>• Key features and competitive advantages</li>
                    <li>• Growth opportunities</li>
                    <li>• Why you're selling</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Shield className="w-8 h-8 text-green-600 mb-2" />
                  <CardTitle>Trust Signals</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-gray-600 text-sm">
                    <li>• Verified financial data</li>
                    <li>• Professional business photos</li>
                    <li>• Detailed asset inventory</li>
                    <li>• Transparent about challenges</li>
                    <li>• Responsive to buyer questions</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Best Practices */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Best Practices for Success
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-green-600 mb-4 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Do's
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-1 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">Be transparent about all aspects of your business</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-1 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">Respond quickly to buyer inquiries</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-1 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">Keep detailed records and documentation</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-1 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">Price competitively based on market data</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-1 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">Provide comprehensive handover documentation</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-red-600 mb-4 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Don'ts
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <AlertTriangle className="w-4 h-4 text-red-500 mt-1 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">Hide important business information</span>
                  </li>
                  <li className="flex items-start">
                    <AlertTriangle className="w-4 h-4 text-red-500 mt-1 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">Overprice based on emotional attachment</span>
                  </li>
                  <li className="flex items-start">
                    <AlertTriangle className="w-4 h-4 text-red-500 mt-1 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">Neglect the business during the sale process</span>
                  </li>
                  <li className="flex items-start">
                    <AlertTriangle className="w-4 h-4 text-red-500 mt-1 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">Rush through due diligence questions</span>
                  </li>
                  <li className="flex items-start">
                    <AlertTriangle className="w-4 h-4 text-red-500 mt-1 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">Ignore buyer feedback or concerns</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Typical Sale Timeline
            </h2>

            <div className="space-y-8">
              <div className="flex items-start">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-4 flex-shrink-0">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Preparation (1-2 weeks)</h3>
                  <p className="text-gray-600 text-sm">Gather documentation, create listing, get verified</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-4 flex-shrink-0">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Marketing (2-6 weeks)</h3>
                  <p className="text-gray-600 text-sm">Listing goes live, receive inquiries, answer questions</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-4 flex-shrink-0">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Negotiation (1-2 weeks)</h3>
                  <p className="text-gray-600 text-sm">Receive offers, negotiate terms, agree on final price</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-4 flex-shrink-0">
                  4
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Transfer (1-2 weeks)</h3>
                  <p className="text-gray-600 text-sm">Complete escrow, transfer assets, provide handover support</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Sell Your Business?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of successful sellers who have used StartExus to maximize
              their business value and achieve a smooth, secure sale.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary">
                <Link href="/sell">
                  Start Your Listing
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                <Link href="/contact">Get Expert Help</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}