import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckCircle, FileText, Mail, Phone } from 'lucide-react'

export default function InstantSellThankYouPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          {/* Success Icon */}
          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-green-100 rounded-full mb-6">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Thank You for Your Interest!
            </h1>
            <p className="text-xl text-gray-600">
              We've received your instant sell request and will be in touch shortly.
            </p>
          </div>

          {/* Main Message Card */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              What Happens Next?
            </h2>

            <div className="space-y-4 mb-6">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">1</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Our team will review your submission</h3>
                  <p className="text-sm text-gray-600">We'll carefully evaluate all the information you provided about your business.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">2</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">We'll contact you within 24-48 hours</h3>
                  <p className="text-sm text-gray-600">A member of our acquisition team will reach out via email or phone to discuss next steps.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">3</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Due diligence and verification</h3>
                  <p className="text-sm text-gray-600">We'll need to verify the information and complete our due diligence process.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">4</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Complete the transaction</h3>
                  <p className="text-sm text-gray-600">Once everything checks out, we'll finalize the deal and transfer payment.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Important Information Card */}
          <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6 mb-6">
            <div className="flex items-start space-x-3">
              <FileText className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-orange-900 mb-2">
                  Please Have the Following Ready
                </h3>
                <p className="text-sm text-orange-800 mb-3">
                  To expedite the process, please prepare documentation to verify all information provided:
                </p>
                <ul className="space-y-2 text-sm text-orange-800">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span><strong>Revenue proof:</strong> Bank statements, Stripe/PayPal reports, or accounting records showing monthly revenue</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span><strong>Traffic analytics:</strong> Google Analytics screenshots or access to verify visitor numbers</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span><strong>Customer data:</strong> Proof of active users/customers (anonymized if necessary)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span><strong>Asset documentation:</strong> List of included assets, domains, social media accounts, etc.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span><strong>Business registration:</strong> Any relevant business licenses or registration documents</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span><strong>Proof of ownership:</strong> Domain registrar access, hosting account details, or similar documentation</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
            <h3 className="font-semibold text-blue-900 mb-3">Have Questions?</h3>
            <p className="text-sm text-blue-800 mb-4">
              Feel free to reach out to us anytime:
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-blue-800">
                <Mail className="w-4 h-4" />
                <a href="mailto:info@startexus.com" className="hover:underline">
                  info@startexus.com
                </a>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Link href="/">
                Return to Homepage
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/browse">
                Browse Other Businesses
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}