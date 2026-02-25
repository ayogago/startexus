'use client'

import { useState, useEffect, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

function SignInContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'
  const message = searchParams.get('message')
  const intent = searchParams.get('intent')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSellerSignin, setIsSellerSignin] = useState(false)

  useEffect(() => {
    if (intent === 'sell') {
      setIsSellerSignin(true)
    }
  }, [intent])

  const handlePendingListing = async () => {
    try {
      const pendingListingData = sessionStorage.getItem('pendingListing')
      if (pendingListingData) {
        const listingData = JSON.parse(pendingListingData)

        // Transform the data to match the API format
        const transformedData = {
          ...listingData,
          slug: listingData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
          askingPrice: listingData.askingPrice ? parseInt(listingData.askingPrice) * 100 : null,
          revenueTtm: listingData.revenueTtm ? parseInt(listingData.revenueTtm) * 100 : null,
          profitTtm: listingData.profitTtm ? parseInt(listingData.profitTtm) * 100 : null,
          mrr: listingData.mrr ? parseInt(listingData.mrr) * 100 : null,
          trafficTtm: listingData.trafficTtm ? parseInt(listingData.trafficTtm) : null,
          workloadHrsPerWk: listingData.workloadHrsPerWk ? parseInt(listingData.workloadHrsPerWk) : null,
          teamSize: listingData.teamSize ? parseInt(listingData.teamSize) : null,
          establishedAt: listingData.establishedAt ? listingData.establishedAt : null,
          highlights: listingData.highlights.filter((h: string) => h.trim()),
          growthOps: listingData.growthOps.filter((g: string) => g.trim()),
          risks: listingData.risks.filter((r: string) => r.trim()),
          assetsIncluded: listingData.assetsIncluded.filter((a: string) => a.trim()),
          status: 'PENDING_REVIEW',
        }

        // Create the listing
        const response = await fetch('/api/listings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(transformedData),
        })

        const responseData = await response.text()

        if (response.ok) {
          // Clear the pending listing data
          sessionStorage.removeItem('pendingListing')
          // Redirect to dashboard with success message
          router.push('/dashboard?message=Listing created successfully and is pending review! You should receive a confirmation email shortly with next steps.')
        } else {
          throw new Error(`Failed to create listing: ${response.status} - ${responseData}`)
        }
      } else {
        // No pending listing, just go to dashboard
        router.push(callbackUrl)
      }
    } catch (error) {
      // Still redirect to dashboard but with an error message
      router.push('/dashboard?error=Failed to create listing. Please try creating it manually.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl,
      })

      if (result?.error) {
        setError('Invalid email or password. Please try again.')
      } else if (result?.ok) {
        // If this is a seller signin after listing creation, handle the pending listing
        if (isSellerSignin) {
          await handlePendingListing()
        } else {
          router.push(callbackUrl)
        }
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
          <CardTitle>Sign in to your account</CardTitle>
          <CardDescription>
            {isSellerSignin
              ? 'Sign in to complete your business listing.'
              : 'Enter your email and password to sign in to your account.'
            }
          </CardDescription>
          {message && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
              <p className="text-sm text-green-800">{message}</p>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
                  placeholder="Enter your password"
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
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !email || !password}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account? <Link href="/auth/signup" className="text-blue-600 hover:text-blue-500">Sign up here</Link>
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

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SignInContent />
    </Suspense>
  )
}