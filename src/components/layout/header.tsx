'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSession, signIn, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, User, Plus, MessageSquare, Heart, Settings, ChevronDown, DollarSign, Menu, X } from 'lucide-react'
import { NotificationBell } from '@/components/notifications/notification-bell'

export function Header() {
  const { data: session, status } = useSession()
  const [searchQuery, setSearchQuery] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/browse?q=${encodeURIComponent(searchQuery)}`
    }
  }

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0">
            <Image
              src="/startexus-light.png"
              alt="StartExus Logo"
              width={420}
              height={112}
              priority
            />
          </Link>

          {/* Navigation Menu */}
          <nav className="hidden lg:flex items-center space-x-8 mx-8">
            <div className="relative group">
              <button className="flex items-center space-x-1 text-gray-700 hover:text-gray-900 py-2">
                <span>Browse</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-2">
                    <Link href="/browse?type=SAAS" className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded">SaaS</Link>
                    <Link href="/browse?type=ECOMMERCE" className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded">eCommerce</Link>
                    <Link href="/browse?type=CONTENT" className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded">Content</Link>
                    <Link href="/browse?type=MOBILE_APP" className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded">Apps</Link>
                    <Link href="/browse?type=SERVICES" className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded">Services</Link>
                    <Link href="/browse?type=MARKETPLACE" className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded">Marketplaces</Link>
                  </div>
                  <hr className="my-2" />
                  <Link href="/browse" className="block px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded">
                    View all listings →
                  </Link>
                </div>
              </div>
            </div>

            <Link href="/sell" className="text-gray-700 hover:text-gray-900">
              Sell
            </Link>

            <Link href="/browse?collection=featured" className="text-gray-700 hover:text-gray-900">
              Featured
            </Link>

            <Link href="/blog" className="text-gray-700 hover:text-gray-900">
              Blog
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-gray-600 hover:text-gray-900"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Search - Hidden on Mobile, Shown in Mobile Menu */}
          <div className="hidden md:flex flex-1 max-w-sm mx-4">
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search businesses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </form>
          </div>

          {/* Right Navigation - Hidden on Mobile */}
          <div className="hidden lg:flex items-center space-x-3">
            {status === 'loading' ? (
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
            ) : session ? (
              <>
                {session.user.role === 'SELLER' || session.user.role === 'ADMIN' ? (
                  <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <Link href="/dashboard/listings/new">
                      <Plus className="w-4 h-4 mr-1" />
                      <span className="hidden sm:inline">List Business</span>
                    </Link>
                  </Button>
                ) : (
                  <Button asChild size="sm" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                    <Link href="/valuation">
                      <DollarSign className="w-4 h-4 mr-1" />
                      <span className="hidden sm:inline">Get Valuation</span>
                    </Link>
                  </Button>
                )}

                <div className="flex items-center space-x-2">
                  <Link href="/dashboard/messages" className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                    <MessageSquare className="w-5 h-5" />
                  </Link>

                  <NotificationBell />

                  <Link href="/dashboard/saved" className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                    <Heart className="w-5 h-5" />
                  </Link>

                  <div className="relative group">
                    <button className="flex items-center space-x-2 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                      <User className="w-5 h-5" />
                      <span className="hidden sm:inline text-sm font-medium">{session.user.name?.split(' ')[0] || 'Account'}</span>
                      <ChevronDown className="w-3 h-3" />
                    </button>

                    <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      <div className="p-2">
                        <Link href="/dashboard" className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded">Dashboard</Link>
                        <Link href="/dashboard/listings" className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded">My Listings</Link>
                        <Link href="/dashboard/saved" className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded">Saved</Link>
                        <hr className="my-2" />
                        <button
                          onClick={() => signOut()}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900" onClick={() => signIn()}>
                  Sign In
                </Button>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700" asChild>
                  <Link href="/auth/signup">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t bg-white">
            <div className="px-4 py-4 space-y-4">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search businesses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </form>

              {/* Mobile Navigation */}
              <nav className="space-y-3">
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-900">Browse</h3>
                  <div className="pl-4 space-y-2">
                    <Link href="/browse?type=SAAS" className="block text-sm text-gray-700 hover:text-gray-900">SaaS</Link>
                    <Link href="/browse?type=ECOMMERCE" className="block text-sm text-gray-700 hover:text-gray-900">eCommerce</Link>
                    <Link href="/browse?type=CONTENT" className="block text-sm text-gray-700 hover:text-gray-900">Content</Link>
                    <Link href="/browse?type=MOBILE_APP" className="block text-sm text-gray-700 hover:text-gray-900">Apps</Link>
                    <Link href="/browse" className="block text-sm font-medium text-blue-600 hover:text-blue-700">View all listings →</Link>
                  </div>
                </div>

                <Link href="/sell" className="block py-2 text-gray-700 hover:text-gray-900 border-b border-gray-100">Sell</Link>
                <Link href="/browse?collection=featured" className="block py-2 text-gray-700 hover:text-gray-900 border-b border-gray-100">Featured</Link>
                <Link href="/blog" className="block py-2 text-gray-700 hover:text-gray-900 border-b border-gray-100">Blog</Link>
              </nav>

              {/* Mobile Auth Section */}
              <div className="pt-4 border-t">
                {status === 'loading' ? (
                  <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
                ) : session ? (
                  <div className="space-y-3">
                    {session.user.role === 'SELLER' || session.user.role === 'ADMIN' ? (
                      <Button asChild size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                        <Link href="/dashboard/listings/new">
                          <Plus className="w-4 h-4 mr-2" />
                          List Business
                        </Link>
                      </Button>
                    ) : (
                      <Button asChild size="sm" variant="outline" className="w-full border-blue-600 text-blue-600 hover:bg-blue-50">
                        <Link href="/valuation">
                          <DollarSign className="w-4 h-4 mr-2" />
                          Get Valuation
                        </Link>
                      </Button>
                    )}

                    <div className="flex justify-around pt-2">
                      <Link href="/dashboard/messages" className="flex flex-col items-center p-2 text-gray-600 hover:text-gray-900">
                        <MessageSquare className="w-5 h-5 mb-1" />
                        <span className="text-xs">Messages</span>
                      </Link>
                      <Link href="/dashboard/saved" className="flex flex-col items-center p-2 text-gray-600 hover:text-gray-900">
                        <Heart className="w-5 h-5 mb-1" />
                        <span className="text-xs">Saved</span>
                      </Link>
                      <Link href="/dashboard" className="flex flex-col items-center p-2 text-gray-600 hover:text-gray-900">
                        <User className="w-5 h-5 mb-1" />
                        <span className="text-xs">Account</span>
                      </Link>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => signOut()}
                      className="w-full text-gray-600 hover:text-gray-900"
                    >
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Button variant="ghost" size="sm" className="w-full text-gray-600 hover:text-gray-900" onClick={() => signIn()}>
                      Sign In
                    </Button>
                    <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700" asChild>
                      <Link href="/auth/signup">Sign Up</Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}