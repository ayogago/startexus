'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Shield, CheckCircle, Star } from 'lucide-react'

interface Verification {
  id: string
  createdAt: string
  updatedAt: string
  type: string
  status: string
  documentUrl: string | null
  notes: string | null
  reviewedBy: string | null
  reviewedAt: string | null
}

const VERIFICATION_TYPES = [
  {
    type: 'IDENTITY',
    label: 'Identity Verification',
    description: 'Verify your identity with a government-issued ID. This earns you the verified badge on your profile.',
    icon: Shield,
    badgeColor: 'bg-blue-100 text-blue-800',
  },
  {
    type: 'BUSINESS',
    label: 'Business Verification',
    description: 'Verify your business registration and ownership. Required for listing businesses above $100K.',
    icon: CheckCircle,
    badgeColor: 'bg-green-100 text-green-800',
  },
  {
    type: 'FUNDS',
    label: 'Proof of Funds',
    description: 'Verify your ability to purchase businesses. Shows sellers you are a serious buyer.',
    icon: Star,
    badgeColor: 'bg-purple-100 text-purple-800',
  },
]

function getStatusBadge(status: string) {
  switch (status) {
    case 'PENDING':
      return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
    case 'APPROVED':
      return <Badge className="bg-green-100 text-green-800">Approved</Badge>
    case 'REJECTED':
      return <Badge className="bg-red-100 text-red-800">Rejected</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export default function VerificationPage() {
  const [verifications, setVerifications] = useState<Verification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formType, setFormType] = useState('IDENTITY')
  const [formDocUrl, setFormDocUrl] = useState('')
  const [formNotes, setFormNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  useEffect(() => {
    fetchVerifications()
  }, [])

  const fetchVerifications = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/verification')
      if (!res.ok) {
        setError('Failed to load verification status')
        return
      }
      const data = await res.json()
      setVerifications(data.verifications || [])
    } catch {
      setError('Failed to load verification status')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError(null)
    setSubmitSuccess(false)

    try {
      const res = await fetch('/api/verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: formType,
          documentUrl: formDocUrl,
          notes: formNotes || undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setSubmitError(data.error || 'Failed to submit verification request')
        return
      }

      setSubmitSuccess(true)
      setFormDocUrl('')
      setFormNotes('')
      setShowForm(false)
      fetchVerifications()
    } catch {
      setSubmitError('Failed to submit verification request')
    } finally {
      setSubmitting(false)
    }
  }

  // Get the latest verification for each type
  const getVerificationForType = (type: string): Verification | null => {
    const typeVerifications = verifications.filter((v) => v.type === type)
    if (typeVerifications.length === 0) return null
    return typeVerifications[0] // Already sorted by createdAt desc from API
  }

  // Determine which badges the user has earned
  const approvedTypes = verifications
    .filter((v) => v.status === 'APPROVED')
    .map((v) => v.type)

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Verification</h1>
          <p className="text-gray-600">Manage your verification status</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-5 bg-gray-200 rounded w-3/4" />
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Verification</h1>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Verification</h1>
        <p className="text-gray-600">Verify your identity and credentials to build trust</p>
      </div>

      {/* Earned Badges */}
      {approvedTypes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Verification Badges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {approvedTypes.includes('IDENTITY') && (
                <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full">
                  <Shield className="w-5 h-5" />
                  <span className="font-medium text-sm">Identity Verified</span>
                </div>
              )}
              {approvedTypes.includes('BUSINESS') && (
                <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium text-sm">Business Verified</span>
                </div>
              )}
              {approvedTypes.includes('FUNDS') && (
                <div className="flex items-center gap-2 bg-purple-50 text-purple-700 px-4 py-2 rounded-full">
                  <Star className="w-5 h-5" />
                  <span className="font-medium text-sm">Proof of Funds</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Verification Type Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {VERIFICATION_TYPES.map((vType) => {
          const verification = getVerificationForType(vType.type)
          const IconComponent = vType.icon

          return (
            <Card key={vType.type} className={`relative ${
              verification?.status === 'APPROVED' ? 'ring-2 ring-green-500' : ''
            }`}>
              {verification?.status === 'APPROVED' && (
                <div className="absolute top-3 right-3">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                </div>
              )}
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${vType.badgeColor}`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <CardTitle className="text-base">{vType.label}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">{vType.description}</p>

                {verification ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Status</span>
                      {getStatusBadge(verification.status)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Submitted</span>
                      <span className="text-sm">
                        {new Date(verification.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {verification.reviewedAt && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Reviewed</span>
                        <span className="text-sm">
                          {new Date(verification.reviewedAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {verification.notes && verification.status === 'REJECTED' && (
                      <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-700">
                        {verification.notes}
                      </div>
                    )}
                    {verification.status === 'REJECTED' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-2"
                        onClick={() => {
                          setFormType(vType.type)
                          setShowForm(true)
                          setSubmitSuccess(false)
                          setSubmitError(null)
                        }}
                      >
                        Resubmit
                      </Button>
                    )}
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setFormType(vType.type)
                      setShowForm(true)
                      setSubmitSuccess(false)
                      setSubmitError(null)
                    }}
                  >
                    Start Verification
                  </Button>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Submit Verification Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Submit {VERIFICATION_TYPES.find((t) => t.type === formType)?.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Verification Type
                </label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                >
                  {VERIFICATION_TYPES.map((t) => (
                    <option key={t.type} value={t.type}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Document URL
                </label>
                <Input
                  type="url"
                  placeholder="https://drive.google.com/... or link to your uploaded document"
                  value={formDocUrl}
                  onChange={(e) => setFormDocUrl(e.target.value)}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Upload your document to a cloud storage service and paste the link here.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Notes (optional)
                </label>
                <Textarea
                  placeholder="Any additional information about your verification..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  rows={3}
                />
              </div>

              {submitError && (
                <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md">
                  {submitError}
                </div>
              )}

              {submitSuccess && (
                <div className="p-3 bg-green-50 text-green-700 text-sm rounded-md">
                  Verification request submitted successfully! We will review it shortly.
                </div>
              )}

              <div className="flex gap-2">
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Verification'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setSubmitError(null)
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* All Verification History */}
      {verifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Verification History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-gray-200">
              {verifications.map((v) => (
                <div key={v.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{v.type} Verification</p>
                    <p className="text-xs text-gray-500">
                      Submitted {new Date(v.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {getStatusBadge(v.status)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
