'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  Search,
  Trash2,
  Bell,
  BellOff,
  Plus,
  Filter,
  ExternalLink,
  Loader2,
  X,
} from 'lucide-react'

interface SavedSearchFilters {
  q?: string
  type?: string
  minPrice?: string
  maxPrice?: string
  minMRR?: string
  minRevenue?: string
  maxRevenue?: string
  minTraffic?: string
  isAiRelated?: string
  workload?: string
  sort?: string
}

interface SavedSearch {
  id: string
  name: string
  filters: SavedSearchFilters
  emailAlert: boolean
  createdAt: string
  lastNotifiedAt: string | null
}

const BUSINESS_TYPES: Record<string, string> = {
  SAAS: 'SaaS',
  ECOMMERCE: 'eCommerce',
  AMAZON: 'Amazon',
  CONTENT: 'Content',
  MOBILE_APP: 'Mobile App',
  MARKETPLACE: 'Marketplace',
  SERVICE: 'Service',
  DOMAIN: 'Domain',
}

function formatFilterValue(key: string, value: string): string {
  if (key === 'type' && BUSINESS_TYPES[value]) return BUSINESS_TYPES[value]
  if (key === 'isAiRelated') return value === 'true' ? 'AI-Powered' : 'Traditional'
  if (key === 'workload') {
    if (value === 'low') return '<10h/wk'
    if (value === 'medium') return '10-30h/wk'
    if (value === 'high') return '30h+/wk'
  }
  if (['minPrice', 'maxPrice', 'minMRR', 'minRevenue', 'maxRevenue'].includes(key)) {
    const num = parseInt(value)
    if (!isNaN(num)) return `$${num.toLocaleString()}`
  }
  if (key === 'minTraffic') {
    const num = parseInt(value)
    if (!isNaN(num)) return `${num.toLocaleString()} visits`
  }
  return value
}

function filterLabel(key: string): string {
  const labels: Record<string, string> = {
    q: 'Search',
    type: 'Type',
    minPrice: 'Min Price',
    maxPrice: 'Max Price',
    minMRR: 'Min MRR',
    minRevenue: 'Min Revenue',
    maxRevenue: 'Max Revenue',
    minTraffic: 'Min Traffic',
    isAiRelated: 'AI Filter',
    workload: 'Workload',
    sort: 'Sort',
  }
  return labels[key] || key
}

export default function SavedSearchesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [searches, setSearches] = useState<SavedSearch[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  // New search form
  const [newName, setNewName] = useState('')
  const [newFilters, setNewFilters] = useState<SavedSearchFilters>({})
  const [newEmailAlert, setNewEmailAlert] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }
    if (status === 'authenticated') {
      fetchSearches()
    }
  }, [status])

  const fetchSearches = async () => {
    try {
      const res = await fetch('/api/saved-searches')
      const data = await res.json()
      if (data.savedSearches) {
        setSearches(data.savedSearches)
      }
    } catch (error) {
      console.error('Failed to fetch saved searches:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return

    setSaving(true)
    try {
      // Remove empty filter values
      const cleanFilters: SavedSearchFilters = {}
      Object.entries(newFilters).forEach(([key, value]) => {
        if (value && value.trim()) {
          (cleanFilters as Record<string, string>)[key] = value
        }
      })

      const res = await fetch('/api/saved-searches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim(),
          filters: cleanFilters,
          emailAlert: newEmailAlert,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setSearches((prev) => [data.savedSearch, ...prev])
        setNewName('')
        setNewFilters({})
        setNewEmailAlert(true)
        setShowForm(false)
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to create saved search')
      }
    } catch (error) {
      console.error('Failed to create saved search:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this saved search?')) return

    setDeleting(id)
    try {
      const res = await fetch(`/api/saved-searches/${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setSearches((prev) => prev.filter((s) => s.id !== id))
      }
    } catch (error) {
      console.error('Failed to delete saved search:', error)
    } finally {
      setDeleting(null)
    }
  }

  const handleToggleAlert = async (id: string, currentValue: boolean) => {
    try {
      const res = await fetch(`/api/saved-searches/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailAlert: !currentValue }),
      })

      if (res.ok) {
        setSearches((prev) =>
          prev.map((s) =>
            s.id === id ? { ...s, emailAlert: !currentValue } : s
          )
        )
      }
    } catch (error) {
      console.error('Failed to toggle email alert:', error)
    }
  }

  const buildBrowseUrl = (filters: SavedSearchFilters): string => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value)
    })
    return `/browse?${params.toString()}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Saved Searches</h1>
          <p className="text-gray-600 mt-1">
            Save your search criteria and get alerted when new listings match.
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {showForm ? (
            <>
              <X className="w-4 h-4 mr-1" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-1" />
              New Search
            </>
          )}
        </Button>
      </div>

      {/* Create Form */}
      {showForm && (
        <Card className="mb-6 border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="text-lg">Create Saved Search</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Search Name *
                </label>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g., Affordable SaaS businesses"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Business Type
                  </label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={newFilters.type || ''}
                    onChange={(e) =>
                      setNewFilters((prev) => ({ ...prev, type: e.target.value }))
                    }
                  >
                    <option value="">All Types</option>
                    {Object.entries(BUSINESS_TYPES).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    AI Filter
                  </label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={newFilters.isAiRelated || ''}
                    onChange={(e) =>
                      setNewFilters((prev) => ({ ...prev, isAiRelated: e.target.value }))
                    }
                  >
                    <option value="">Any</option>
                    <option value="true">AI-Powered</option>
                    <option value="false">Traditional</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Min Price
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g., 10000"
                    value={newFilters.minPrice || ''}
                    onChange={(e) =>
                      setNewFilters((prev) => ({ ...prev, minPrice: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Max Price
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g., 100000"
                    value={newFilters.maxPrice || ''}
                    onChange={(e) =>
                      setNewFilters((prev) => ({ ...prev, maxPrice: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Min MRR
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g., 1000"
                    value={newFilters.minMRR || ''}
                    onChange={(e) =>
                      setNewFilters((prev) => ({ ...prev, minMRR: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Min Traffic
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g., 10000"
                    value={newFilters.minTraffic || ''}
                    onChange={(e) =>
                      setNewFilters((prev) => ({ ...prev, minTraffic: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Switch
                  checked={newEmailAlert}
                  onCheckedChange={setNewEmailAlert}
                />
                <label className="text-sm text-gray-700">
                  Email me when new listings match this search
                </label>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-1" />
                      Save Search
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Saved Searches List */}
      {searches.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Saved Searches Yet
            </h3>
            <p className="text-gray-600 mb-4">
              Save your favorite search criteria to quickly access them later and receive email alerts for new matches.
            </p>
            <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-1" />
              Create Your First Saved Search
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {searches.map((search) => (
            <Card key={search.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900">{search.name}</h3>
                      {search.emailAlert ? (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                          <Bell className="w-3 h-3 mr-1" />
                          Alerts On
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-gray-500">
                          <BellOff className="w-3 h-3 mr-1" />
                          Alerts Off
                        </Badge>
                      )}
                    </div>

                    {/* Filter badges */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {Object.entries(search.filters).map(([key, value]) => {
                        if (!value || key === 'sort') return null
                        return (
                          <Badge
                            key={key}
                            variant="outline"
                            className="text-xs"
                          >
                            <Filter className="w-3 h-3 mr-1" />
                            {filterLabel(key)}: {formatFilterValue(key, value)}
                          </Badge>
                        )
                      })}
                      {Object.keys(search.filters).filter(
                        (k) => search.filters[k as keyof SavedSearchFilters] && k !== 'sort'
                      ).length === 0 && (
                        <span className="text-sm text-gray-400">No filters (all listings)</span>
                      )}
                    </div>

                    <p className="text-xs text-gray-500">
                      Created {new Date(search.createdAt).toLocaleDateString()}
                      {search.lastNotifiedAt &&
                        ` | Last alert: ${new Date(search.lastNotifiedAt).toLocaleDateString()}`}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={search.emailAlert}
                        onCheckedChange={() =>
                          handleToggleAlert(search.id, search.emailAlert)
                        }
                      />
                    </div>

                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                    >
                      <a href={buildBrowseUrl(search.filters)}>
                        <ExternalLink className="w-4 h-4 mr-1" />
                        View
                      </a>
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(search.id)}
                      disabled={deleting === search.id}
                      className="text-red-600 hover:bg-red-50 hover:border-red-300"
                    >
                      {deleting === search.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
