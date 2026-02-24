'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatCurrency } from '@/lib/utils'
import {
  Shield,
  FileText,
  Users,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Ban,
  UserCheck,
  Star,
  Search,
  Trash2
} from 'lucide-react'

interface PendingListing {
  id: string
  title: string
  businessType: string
  askingPrice: number | null
  createdAt: string
  seller: {
    id: string
    name: string | null
    email: string
    verified: boolean
  }
}

interface FlaggedListing {
  id: string
  title: string
  slug: string
  businessType: string
  flagged: boolean
  seller: {
    id: string
    name: string | null
    email: string
  }
}

interface AllListing {
  id: string
  title: string
  slug: string
  businessType: string
  status: string
  flagged: boolean
  featured: boolean
  askingPrice: number | null
  createdAt: string
  seller: {
    id: string
    name: string | null
    email: string
    verified: boolean
  }
}

interface ReportData {
  id: string
  targetType: string
  targetId: string
  reason: string
  status: string
  createdAt: string
  reporter: {
    id: string
    name: string | null
    email: string
  }
}

interface UserData {
  id: string
  name: string | null
  email: string
  role: string
  verified: boolean
  disabled: boolean
  createdAt: string
  _count: {
    listings: number
    reports: number
  }
}

export function AdminDashboard() {
  const [pendingListings, setPendingListings] = useState<PendingListing[]>([])
  const [flaggedListings, setFlaggedListings] = useState<FlaggedListing[]>([])
  const [allListings, setAllListings] = useState<AllListing[]>([])
  const [reports, setReports] = useState<ReportData[]>([])
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [userSearchQuery, setUserSearchQuery] = useState('')

  useEffect(() => {
    fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    try {
      const [pendingRes, flaggedRes, allRes, reportsRes, usersRes] = await Promise.all([
        fetch('/api/admin/listings?status=PENDING_REVIEW'),
        fetch('/api/admin/listings?flagged=true'),
        fetch('/api/admin/listings'),
        fetch('/api/admin/reports'),
        fetch('/api/admin/users'),
      ])

      const [pending, flagged, all, reportsData, usersData] = await Promise.all([
        pendingRes.json(),
        flaggedRes.json(),
        allRes.json(),
        reportsRes.json(),
        usersRes.json(),
      ])

      setPendingListings(pending.listings || [])
      setFlaggedListings(flagged.listings || [])
      setAllListings(all.listings || [])
      setReports(reportsData.reports || [])
      setUsers(usersData.users || [])
    } catch {
      // Failed to fetch admin data
    } finally {
      setLoading(false)
    }
  }

  const moderateListing = async (listingId: string, action: 'PUBLISHED' | 'REJECTED' | 'PENDING_REVIEW') => {
    try {
      const response = await fetch(`/api/admin/listings/${listingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action }),
      })

      if (response.ok) {
        // Refresh all data to reflect changes
        fetchAdminData()
      }
    } catch {
      // Failed to moderate listing
    }
  }

  const toggleListingFlag = async (listingId: string, flagged: boolean) => {
    try {
      const response = await fetch(`/api/admin/listings/${listingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flagged: !flagged }),
      })

      if (response.ok) {
        fetchAdminData()
      }
    } catch {
      // Failed to toggle listing flag
    }
  }

  const toggleListingFeatured = async (listingId: string, featured: boolean) => {
    try {
      const response = await fetch(`/api/admin/listings/${listingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: !featured }),
      })

      if (response.ok) {
        fetchAdminData()
      }
    } catch {
      // Failed to toggle listing featured status
    }
  }

  const toggleUserStatus = async (userId: string, action: 'disable' | 'enable' | 'verify') => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })

      if (response.ok) {
        setUsers(users.map(user =>
          user.id === userId
            ? {
                ...user,
                disabled: action === 'disable' ? true : action === 'enable' ? false : user.disabled,
                verified: action === 'verify' ? true : user.verified,
              }
            : user
        ))
      }
    } catch {
      // Failed to update user
    }
  }

  const resolveReport = async (reportId: string) => {
    try {
      const response = await fetch(`/api/admin/reports/${reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CLOSED' }),
      })

      if (response.ok) {
        setReports(reports.map(r => r.id === reportId ? { ...r, status: 'CLOSED' } : r))
      }
    } catch {
      // Failed to resolve report
    }
  }

  const deleteListing = async (listingId: string) => {
    if (!confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/listings/${listingId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Remove listing from all states
        setAllListings(allListings.filter(l => l.id !== listingId))
        setPendingListings(pendingListings.filter(l => l.id !== listingId))
        setFlaggedListings(flaggedListings.filter(l => l.id !== listingId))
      }
    } catch {
      // Failed to delete listing
    }
  }

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This will also delete all their listings and cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setUsers(users.filter(u => u.id !== userId))
      }
    } catch {
      // Failed to delete user
    }
  }

  // Filter functions for search
  const filteredAllListings = allListings.filter(listing =>
    listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    listing.businessType.toLowerCase().includes(searchQuery.toLowerCase()) ||
    listing.seller.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    listing.seller.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(userSearchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center space-x-2">
            <Shield className="w-8 h-8" />
            <span>Admin Dashboard</span>
          </h1>
          <p className="text-gray-600">Manage listings, users, and reports</p>
        </div>
        <div className="animate-pulse">
          <div className="h-96 bg-gray-200 rounded-lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center space-x-2">
          <Shield className="w-8 h-8" />
          <span>StartExus Admin Dashboard</span>
        </h1>
        <p className="text-gray-600">Manage listings, users, and reports</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingListings.length}</div>
            <p className="text-xs text-muted-foreground">Listings awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flagged Content</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{flaggedListings.length}</div>
            <p className="text-xs text-muted-foreground">Flagged listings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Reports</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reports.filter(r => r.status === 'OPEN').length}
            </div>
            <p className="text-xs text-muted-foreground">Unresolved reports</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">
            All Listings ({allListings.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({pendingListings.length})
          </TabsTrigger>
          <TabsTrigger value="flagged">
            Flagged ({flaggedListings.length})
          </TabsTrigger>
          <TabsTrigger value="reports">
            Reports ({reports.filter(r => r.status === 'OPEN').length})
          </TabsTrigger>
          <TabsTrigger value="users">
            Users ({users.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Listings</CardTitle>
              <CardDescription>
                Manage all listings - published, pending, and rejected
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search listings by title, type, seller..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              {filteredAllListings.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  {searchQuery ? 'No listings found matching your search' : 'No listings found'}
                </p>
              ) : (
                <div className="space-y-4">
                  {filteredAllListings.map((listing) => (
                    <div key={listing.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-medium">{listing.title}</h3>
                            <Badge variant={listing.status === 'PUBLISHED' ? 'default' : listing.status === 'PENDING_REVIEW' ? 'secondary' : 'destructive'}>
                              {listing.status}
                            </Badge>
                            {listing.flagged && (
                              <Badge variant="destructive">Flagged</Badge>
                            )}
                            {listing.featured && (
                              <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600">
                                <Star className="w-3 h-3 mr-1" />
                                Featured
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                            <Badge variant="outline">{listing.businessType}</Badge>
                            <span>
                              {listing.askingPrice
                                ? formatCurrency(listing.askingPrice)
                                : 'Open to offers'
                              }
                            </span>
                            <span>by {listing.seller.name || listing.seller.email}</span>
                            <span>{new Date(listing.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" asChild>
                            <a href={`/listings/${listing.slug}`} target="_blank">
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </a>
                          </Button>
                          <Button size="sm" variant="outline" asChild>
                            <a href={`/dashboard/admin/listings/${listing.id}/edit`}>
                              <FileText className="w-4 h-4 mr-1" />
                              Edit
                            </a>
                          </Button>

                          {listing.status === 'PUBLISHED' && (
                            <>
                              <Button
                                size="sm"
                                variant={listing.featured ? "default" : "outline"}
                                onClick={() => toggleListingFeatured(listing.id, listing.featured)}
                                className={listing.featured ? "bg-yellow-500 hover:bg-yellow-600" : ""}
                              >
                                <Star className="w-4 h-4 mr-1" />
                                {listing.featured ? 'Unfeature' : 'Feature'}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => moderateListing(listing.id, 'PENDING_REVIEW')}
                              >
                                Unpublish
                              </Button>
                              <Button
                                size="sm"
                                variant={listing.flagged ? "outline" : "destructive"}
                                onClick={() => toggleListingFlag(listing.id, listing.flagged)}
                              >
                                <AlertTriangle className="w-4 h-4 mr-1" />
                                {listing.flagged ? 'Unflag' : 'Flag'}
                              </Button>
                            </>
                          )}

                          {listing.status === 'PENDING_REVIEW' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => moderateListing(listing.id, 'PUBLISHED')}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => moderateListing(listing.id, 'REJECTED')}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}

                          {listing.status === 'REJECTED' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => moderateListing(listing.id, 'PENDING_REVIEW')}
                            >
                              Review Again
                            </Button>
                          )}

                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteListing(listing.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Listings</CardTitle>
              <CardDescription>
                Listings waiting for approval to be published
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingListings.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No pending listings</p>
              ) : (
                <div className="space-y-4">
                  {pendingListings.map((listing) => (
                    <div key={listing.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-medium">{listing.title}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                            <Badge variant="outline">{listing.businessType}</Badge>
                            <span>
                              {listing.askingPrice
                                ? formatCurrency(listing.askingPrice)
                                : 'Open to offers'
                              }
                            </span>
                            <span>by {listing.seller.name || listing.seller.email}</span>
                            <span>{new Date(listing.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(`/api/admin/listings/${listing.id}/preview`, '_blank')}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Preview
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => moderateListing(listing.id, 'PUBLISHED')}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => moderateListing(listing.id, 'REJECTED')}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteListing(listing.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="flagged" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Flagged Listings</CardTitle>
              <CardDescription>
                Listings that have been flagged for review
              </CardDescription>
            </CardHeader>
            <CardContent>
              {flaggedListings.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No flagged listings</p>
              ) : (
                <div className="space-y-4">
                  {flaggedListings.map((listing) => (
                    <div key={listing.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-medium">{listing.title}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                            <Badge variant="outline">{listing.businessType}</Badge>
                            <span>by {listing.seller.name || listing.seller.email}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" asChild>
                            <a href={`/listings/${listing.slug}`} target="_blank">
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </a>
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteListing(listing.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Reports</CardTitle>
              <CardDescription>
                Reports submitted by users about content or behavior
              </CardDescription>
            </CardHeader>
            <CardContent>
              {reports.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No reports</p>
              ) : (
                <div className="space-y-4">
                  {reports.map((report) => (
                    <div key={report.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant="outline">{report.targetType}</Badge>
                            <Badge variant={report.status === 'OPEN' ? 'destructive' : 'secondary'}>
                              {report.status}
                            </Badge>
                          </div>
                          <p className="font-medium">{report.reason}</p>
                          <div className="text-sm text-gray-600 mt-1">
                            Reported by {report.reporter.name || report.reporter.email} on{' '}
                            {new Date(report.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        {report.status === 'OPEN' && (
                          <Button
                            size="sm"
                            onClick={() => resolveReport(report.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Resolve
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage user accounts and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users by name, email, role..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-medium">
                            {user.name || user.email}
                          </h3>
                          <Badge variant="outline">{user.role}</Badge>
                          {user.verified && (
                            <Badge variant="secondary">Verified</Badge>
                          )}
                          {user.disabled && (
                            <Badge variant="destructive">Disabled</Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          {user.email} • {user._count.listings} listings • {user._count.reports} reports
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Joined {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {!user.verified && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleUserStatus(user.id, 'verify')}
                          >
                            <UserCheck className="w-4 h-4 mr-1" />
                            Verify
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant={user.disabled ? 'outline' : 'destructive'}
                          onClick={() => toggleUserStatus(user.id, user.disabled ? 'enable' : 'disable')}
                        >
                          <Ban className="w-4 h-4 mr-1" />
                          {user.disabled ? 'Enable' : 'Disable'}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteUser(user.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}