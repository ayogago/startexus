import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Users, TrendingUp, Globe, Award, Heart } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about StartExus - the trusted marketplace for buying and selling online businesses, SaaS, and digital assets.',
  alternates: { canonical: '/about' },
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              About StartExus
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              The world's leading marketplace for buying and selling online businesses.
              We're building the future of digital commerce, one transaction at a time.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
                <p className="text-lg text-gray-600 mb-6">
                  StartExus was founded with a simple yet powerful vision: to democratize access to
                  online business ownership. We believe that everyone should have the opportunity to
                  buy, sell, and build digital businesses, regardless of their background or experience level.
                </p>
                <p className="text-lg text-gray-600 mb-8">
                  Our platform connects ambitious entrepreneurs with profitable online businesses,
                  creating opportunities for growth, innovation, and financial independence in the digital economy.
                </p>
                <Button asChild className="bg-blue-600 hover:bg-blue-700">
                  <Link href="/browse">Explore Opportunities</Link>
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="text-center pb-4">
                    <Globe className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <CardTitle className="text-2xl">$50M+</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-sm text-gray-600">Transaction Volume</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="text-center pb-4">
                    <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <CardTitle className="text-2xl">10,000+</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-sm text-gray-600">Active Users</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="text-center pb-4">
                    <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <CardTitle className="text-2xl">500+</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-sm text-gray-600">Successful Sales</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="text-center pb-4">
                    <Award className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                    <CardTitle className="text-2xl">75%</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-sm text-gray-600">Success Rate</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Trust & Security</h3>
                <p className="text-gray-600">
                  We prioritize the security of every transaction with end-to-end protection,
                  verified listings, and secure payment processing.
                </p>
              </div>
              <div className="text-center">
                <Users className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Community First</h3>
                <p className="text-gray-600">
                  Our vibrant community of entrepreneurs supports each other through
                  knowledge sharing, mentorship, and collaborative growth.
                </p>
              </div>
              <div className="text-center">
                <Heart className="w-12 h-12 text-red-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Transparency</h3>
                <p className="text-gray-600">
                  We believe in complete transparency throughout the buying and selling process,
                  with verified financials and honest business assessments.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Our Story</h2>
            <p className="text-lg text-gray-600 mb-6">
              Founded in 2020 by a team of serial entrepreneurs and tech veterans, StartExus emerged
              from a simple observation: the digital economy was growing rapidly, but there was no
              centralized, trustworthy platform for trading online businesses.
            </p>
            <p className="text-lg text-gray-600 mb-6">
              What started as a side project to help friends buy and sell their digital ventures
              has evolved into the world's premier marketplace for online business transactions.
              Today, we're proud to serve entrepreneurs from over 50 countries.
            </p>
            <p className="text-lg text-gray-600 mb-8">
              We're not just facilitating transactions – we're building an ecosystem where digital
              entrepreneurship can thrive, where innovative ideas find the right owners, and where
              financial freedom becomes accessible to everyone.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Link href="/sell">List Your Business</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/contact">Get in Touch</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Leadership Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl font-bold">JS</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">John Smith</h3>
                <p className="text-blue-600 mb-3">CEO & Co-Founder</p>
                <p className="text-sm text-gray-600">
                  Former tech executive with 15+ years building and scaling digital marketplaces.
                </p>
              </div>
              <div className="text-center">
                <div className="w-24 h-24 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl font-bold">SD</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Sarah Davis</h3>
                <p className="text-green-600 mb-3">CTO & Co-Founder</p>
                <p className="text-sm text-gray-600">
                  Engineering leader with expertise in fintech and secure transaction platforms.
                </p>
              </div>
              <div className="text-center">
                <div className="w-24 h-24 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl font-bold">MJ</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Mike Johnson</h3>
                <p className="text-purple-600 mb-3">Head of Operations</p>
                <p className="text-sm text-gray-600">
                  Operations expert focused on creating seamless user experiences and trust.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}