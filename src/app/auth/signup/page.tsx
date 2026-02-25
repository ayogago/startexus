'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { PasswordStrength } from '@/components/password-strength'

function SignUpContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSellerSignup, setIsSellerSignup] = useState(false)

  useEffect(() => {
    // Check if this is a signup from the selling flow
    const intent = searchParams.get('intent')
    const emailParam = searchParams.get('email')
    const nameParam = searchParams.get('name')

    if (intent === 'sell') {
      setIsSellerSignup(true)
      if (emailParam) setEmail(decodeURIComponent(emailParam))
      if (nameParam) setName(decodeURIComponent(nameParam))
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long')
      setLoading(false)
      return
    }

    try {
      // Get pending listing data if this is a seller signup
      let pendingListing = null
      if (isSellerSignup) {
        const pendingListingData = sessionStorage.getItem('pendingListing')
        if (pendingListingData) {
          try {
            pendingListing = JSON.parse(pendingListingData)
          } catch (e) {
            console.error('Failed to parse pending listing data:', e)
          }
        }
      }

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          name,
          role: isSellerSignup ? 'SELLER' : 'BUYER',
          pendingListing,
        }),
      })

      if (response.ok) {
        const data = await response.json()

        if (isSellerSignup) {
          // Clear the pending listing data since it's been processed
          sessionStorage.removeItem('pendingListing')

          if (data.listing) {
            // Listing was created successfully during signup
            router.push(`/auth/signin?message=Welcome to StartExus! Your seller account and business listing have been created successfully. You will receive welcome and listing confirmation emails shortly. Please sign in to get started.`)
          } else {
            // Listing creation failed, will try again on signin
            router.push(`/auth/signin?message=Welcome to StartExus! Your seller account has been created and you will receive a welcome email shortly. Please sign in to complete your business listing.&intent=sell`)
          }
        } else {
          router.push('/auth/signin?message=Welcome to StartExus! Your account has been created successfully and you will receive a welcome email shortly. Please sign in to get started.')
        }
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to create account')
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="flex items-center justify-center mb-6">
            <Image src="/startexus-light.png" alt="StartExus Logo" width={420} height={112} priority />
          </Link>
          <CardTitle>Create your account</CardTitle>
          <CardDescription>
            {isSellerSignup
              ? 'Create your seller account to list your business for sale.'
              : 'Join thousands of entrepreneurs buying and selling businesses.'
            }
          </CardDescription>
          {isSellerSignup && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <p className="text-sm text-blue-800">
                We've pre-filled your information from your business listing. Create your account to continue.
              </p>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Full Name
              </label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email address
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Choose a strong password"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="mt-2">
                <PasswordStrength password={password} />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !email || !password || !confirmPassword || !name}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account? <Link href="/auth/signin" className="text-blue-600 hover:text-blue-500">Sign in here</Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link href="/" className="text-sm text-blue-600 hover:text-blue-500">
              ← Back to home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SignUpContent />
    </Suspense>
  )
}