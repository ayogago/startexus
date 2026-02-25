'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Bookmark, X, Loader2, Check } from 'lucide-react'

export function SaveSearchButton() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const handleOpenModal = () => {
    if (!session) {
      router.push('/auth/signin')
      return
    }
    setShowModal(true)
    setSaved(false)
    setError('')
    setName('')
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setSaving(true)
    setError('')

    try {
      // Build filters from current search params
      const filters: Record<string, string> = {}
      const filterKeys = [
        'q', 'type', 'minPrice', 'maxPrice', 'minMRR',
        'minRevenue', 'maxRevenue', 'minTraffic', 'isAiRelated',
        'workload', 'sort',
      ]

      filterKeys.forEach((key) => {
        const value = searchParams.get(key)
        if (value) {
          filters[key] = value
        }
      })

      const res = await fetch('/api/saved-searches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          filters,
          emailAlert: true,
        }),
      })

      if (res.ok) {
        setSaved(true)
        setTimeout(() => {
          setShowModal(false)
          setSaved(false)
        }, 1500)
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to save search')
      }
    } catch {
      setError('Failed to save search. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // Check if any filters are active
  const hasFilters = ['q', 'type', 'minPrice', 'maxPrice', 'minMRR', 'minRevenue', 'maxRevenue', 'minTraffic', 'isAiRelated', 'workload']
    .some(key => searchParams.get(key))

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleOpenModal}
        className="hover:border-blue-400 hover:text-blue-600"
        title={hasFilters ? 'Save current search filters' : 'Save this search'}
      >
        <Bookmark className="w-4 h-4 mr-1" />
        Save Search
      </Button>

      {/* Modal overlay */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowModal(false)}
          />
          <div className="relative bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4 z-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Save Search</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {saved ? (
              <div className="text-center py-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Check className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-green-700 font-medium">Search saved successfully!</p>
                <p className="text-sm text-gray-500 mt-1">
                  You can manage your saved searches in your dashboard.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSave}>
                <p className="text-sm text-gray-600 mb-4">
                  Give your search a name to save the current filters. You will receive email alerts when new listings match.
                </p>

                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Affordable SaaS under $50K"
                  required
                  autoFocus
                  className="mb-3"
                />

                {/* Show active filters */}
                {hasFilters && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs font-medium text-gray-500 mb-2">Active Filters:</p>
                    <div className="flex flex-wrap gap-1">
                      {['q', 'type', 'minPrice', 'maxPrice', 'minMRR', 'minRevenue', 'maxRevenue', 'minTraffic', 'isAiRelated', 'workload'].map(key => {
                        const value = searchParams.get(key)
                        if (!value) return null
                        return (
                          <span
                            key={key}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-700"
                          >
                            {key}: {value}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                )}

                {error && (
                  <p className="text-sm text-red-600 mb-3">{error}</p>
                )}

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={saving || !name.trim()}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Bookmark className="w-4 h-4 mr-1" />
                        Save Search
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
