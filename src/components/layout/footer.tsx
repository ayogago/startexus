import Link from 'next/link'
import Image from 'next/image'

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <Image src="/startexus-light.png" alt="StartExus" width={420} height={112} />
            </div>
            <p className="text-gray-600 text-sm">
              The premier marketplace for buying and selling online businesses.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Marketplace</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/browse" className="hover:text-gray-900">Browse Listings</Link></li>
              <li><Link href="/browse?type=SAAS" className="hover:text-gray-900">SaaS</Link></li>
              <li><Link href="/browse?type=ECOMMERCE" className="hover:text-gray-900">eCommerce Stores</Link></li>
              <li><Link href="/browse?type=SERVICES" className="hover:text-gray-900">Services</Link></li>
              <li><Link href="/browse?type=MOBILE_APP" className="hover:text-gray-900">Mobile Apps</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/about" className="hover:text-gray-900">About</Link></li>
              <li><Link href="/faq" className="hover:text-gray-900">FAQ</Link></li>
              <li><Link href="/how-it-works" className="hover:text-gray-900">How It Works</Link></li>
              <li><Link href="/seller-guide" className="hover:text-gray-900">Seller Guide</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/terms" className="hover:text-gray-900">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-gray-900">Privacy Policy</Link></li>
              <li><Link href="/contact" className="hover:text-gray-900">Contact</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-gray-600">
          <p>&copy; 2026 StartExus. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}