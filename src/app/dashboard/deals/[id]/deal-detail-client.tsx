'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  XCircle,
  CheckCircle2,
  Clock,
  FileText,
  Phone,
  Calendar,
  DollarSign,
  User,
  Building2,
  ExternalLink,
  Plus,
  Upload,
  MessageSquare,
  Verified,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

const STAGES = ['INQUIRY', 'OFFER', 'NEGOTIATION', 'DUE_DILIGENCE', 'CLOSING', 'COMPLETED']

const STAGE_LABELS: Record<string, string> = {
  INQUIRY: 'Inquiry',
  OFFER: 'Offer',
  NEGOTIATION: 'Negotiation',
  DUE_DILIGENCE: 'Due Diligence',
  CLOSING: 'Closing',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
}

const STAGE_TRANSITIONS: Record<string, string[]> = {
  INQUIRY: ['OFFER', 'CANCELLED'],
  OFFER: ['NEGOTIATION', 'CANCELLED'],
  NEGOTIATION: ['DUE_DILIGENCE', 'CANCELLED'],
  DUE_DILIGENCE: ['CLOSING', 'CANCELLED'],
  CLOSING: ['COMPLETED', 'CANCELLED'],
}

const EVENT_ICONS: Record<string, string> = {
  STAGE_CHANGE: 'stage',
  NOTE: 'note',
  DOCUMENT_ADDED: 'document',
  OFFER_MADE: 'offer',
  CALL_SCHEDULED: 'call',
}

const DOC_CATEGORY_LABELS: Record<string, string> = {
  FINANCIALS: 'Financials',
  LEGAL: 'Legal',
  ANALYTICS: 'Analytics',
  CONTRACTS: 'Contracts',
  OTHER: 'Other',
}

const DOC_CATEGORY_COLORS: Record<string, string> = {
  FINANCIALS: 'bg-green-100 text-green-800',
  LEGAL: 'bg-purple-100 text-purple-800',
  ANALYTICS: 'bg-blue-100 text-blue-800',
  CONTRACTS: 'bg-orange-100 text-orange-800',
  OTHER: 'bg-gray-100 text-gray-800',
}

const CALL_STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
}

interface DealDetail {
  id: string
  createdAt: string
  updatedAt: string
  stage: string
  offerAmount: number | null
  notes: string | null
  buyerId: string
  sellerId: string
  listing: {
    id: string
    title: string
    slug: string
    askingPrice: number | null
    businessType: string
    category: string
    images: { url: string }[]
  }
  buyer: {
    id: string
    name: string | null
    email: string
    avatarUrl: string | null
    verified: boolean
    company: string | null
  }
  seller: {
    id: string
    name: string | null
    email: string
    avatarUrl: string | null
    verified: boolean
    company: string | null
  }
  timeline: {
    id: string
    createdAt: string
    type: string
    title: string
    details: string | null
    actorId: string | null
  }[]
  documents: {
    id: string
    createdAt: string
    name: string
    fileUrl: string
    fileType: string
    fileSize: number
    category: string
    description: string | null
    uploader: {
      id: string
      name: string | null
      email: string
    }
  }[]
  calls: {
    id: string
    createdAt: string
    scheduledAt: string
    duration: number
    title: string
    notes: string | null
    meetingLink: string | null
    status: string
    scheduler: {
      id: string
      name: string | null
      email: string
    }
    receiver: {
      id: string
      name: string | null
      email: string
    }
  }[]
}

function StageProgressBar({ currentStage }: { currentStage: string }) {
  const currentIndex = STAGES.indexOf(currentStage)
  const isCancelled = currentStage === 'CANCELLED'

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between relative">
        {STAGES.map((stage, index) => {
          const isCompleted = !isCancelled && currentIndex >= index
          const isCurrent = !isCancelled && currentIndex === index
          const isPast = !isCancelled && currentIndex > index

          return (
            <div key={stage} className="flex flex-col items-center relative z-10 flex-1">
              {/* Connecting line */}
              {index > 0 && (
                <div
                  className={`absolute top-4 right-1/2 w-full h-0.5 -z-10 ${
                    isPast || isCompleted && index <= currentIndex
                      ? 'bg-blue-500'
                      : 'bg-gray-200'
                  }`}
                  style={{ transform: 'translateX(-50%)' }}
                />
              )}

              {/* Stage dot */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  isCurrent
                    ? 'bg-blue-600 text-white ring-4 ring-blue-100 scale-110'
                    : isPast
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {isPast ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  index + 1
                )}
              </div>

              {/* Stage label */}
              <span
                className={`mt-2 text-xs text-center leading-tight ${
                  isCurrent
                    ? 'font-bold text-blue-700'
                    : isPast
                    ? 'font-medium text-blue-600'
                    : 'text-gray-400'
                }`}
              >
                {STAGE_LABELS[stage]}
              </span>
            </div>
          )
        })}
      </div>

      {isCancelled && (
        <div className="mt-4 flex items-center justify-center">
          <Badge className="bg-red-100 text-red-800 text-sm px-4 py-1">
            <XCircle className="w-4 h-4 mr-1" />
            Deal Cancelled
          </Badge>
        </div>
      )}
    </div>
  )
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

export function DealDetailClient({
  deal: initialDeal,
  currentUserId,
}: {
  deal: DealDetail
  currentUserId: string
}) {
  const router = useRouter()
  const [deal, setDeal] = useState<DealDetail>(initialDeal)
  const [updating, setUpdating] = useState(false)
  const [stageNotes, setStageNotes] = useState('')
  const [stageOfferAmount, setStageOfferAmount] = useState('')

  // Document form state
  const [showDocForm, setShowDocForm] = useState(false)
  const [docName, setDocName] = useState('')
  const [docUrl, setDocUrl] = useState('')
  const [docType, setDocType] = useState('')
  const [docSize, setDocSize] = useState('')
  const [docCategory, setDocCategory] = useState('OTHER')
  const [docDescription, setDocDescription] = useState('')
  const [addingDoc, setAddingDoc] = useState(false)

  // Call form state
  const [showCallForm, setShowCallForm] = useState(false)
  const [callTitle, setCallTitle] = useState('')
  const [callDate, setCallDate] = useState('')
  const [callDuration, setCallDuration] = useState('30')
  const [callNotes, setCallNotes] = useState('')
  const [callMeetingLink, setCallMeetingLink] = useState('')
  const [schedulingCall, setSchedulingCall] = useState(false)

  const isBuyer = deal.buyerId === currentUserId
  const counterparty = isBuyer ? deal.seller : deal.buyer
  const allowedTransitions = STAGE_TRANSITIONS[deal.stage] || []
  const nextStage = allowedTransitions.find((s) => s !== 'CANCELLED')
  const canAdvance = allowedTransitions.length > 0

  async function advanceStage(targetStage: string) {
    setUpdating(true)
    try {
      const body: any = { stage: targetStage }
      if (stageNotes) body.notes = stageNotes
      if (stageOfferAmount) body.offerAmount = parseInt(stageOfferAmount)

      const res = await fetch(`/api/deals/${deal.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        setStageNotes('')
        setStageOfferAmount('')
        router.refresh()
        // Refetch deal data
        const detailRes = await fetch(`/api/deals/${deal.id}`)
        if (detailRes.ok) {
          const data = await detailRes.json()
          setDeal(data.deal)
        }
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to update deal')
      }
    } catch (error) {
      console.error('Failed to update deal:', error)
      alert('Failed to update deal')
    } finally {
      setUpdating(false)
    }
  }

  async function addDocument() {
    if (!docName || !docUrl || !docType || !docSize) {
      alert('Please fill in all required fields')
      return
    }
    setAddingDoc(true)
    try {
      const res = await fetch(`/api/deals/${deal.id}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: docName,
          fileUrl: docUrl,
          fileType: docType,
          fileSize: parseInt(docSize),
          category: docCategory,
          description: docDescription || undefined,
        }),
      })

      if (res.ok) {
        setDocName('')
        setDocUrl('')
        setDocType('')
        setDocSize('')
        setDocCategory('OTHER')
        setDocDescription('')
        setShowDocForm(false)
        // Refetch deal
        const detailRes = await fetch(`/api/deals/${deal.id}`)
        if (detailRes.ok) {
          const data = await detailRes.json()
          setDeal(data.deal)
        }
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to add document')
      }
    } catch (error) {
      console.error('Failed to add document:', error)
      alert('Failed to add document')
    } finally {
      setAddingDoc(false)
    }
  }

  async function scheduleCall() {
    if (!callTitle || !callDate) {
      alert('Please fill in title and date')
      return
    }
    setSchedulingCall(true)
    try {
      const receiverId = isBuyer ? deal.sellerId : deal.buyerId
      const res = await fetch('/api/calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId,
          scheduledAt: callDate,
          title: callTitle,
          dealId: deal.id,
          duration: parseInt(callDuration) || 30,
          notes: callNotes || undefined,
          meetingLink: callMeetingLink || undefined,
        }),
      })

      if (res.ok) {
        setCallTitle('')
        setCallDate('')
        setCallDuration('30')
        setCallNotes('')
        setCallMeetingLink('')
        setShowCallForm(false)
        // Refetch deal
        const detailRes = await fetch(`/api/deals/${deal.id}`)
        if (detailRes.ok) {
          const data = await detailRes.json()
          setDeal(data.deal)
        }
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to schedule call')
      }
    } catch (error) {
      console.error('Failed to schedule call:', error)
      alert('Failed to schedule call')
    } finally {
      setSchedulingCall(false)
    }
  }

  async function updateCallStatus(callId: string, status: string) {
    try {
      const res = await fetch(`/api/calls/${callId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      if (res.ok) {
        const detailRes = await fetch(`/api/deals/${deal.id}`)
        if (detailRes.ok) {
          const data = await detailRes.json()
          setDeal(data.deal)
        }
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to update call')
      }
    } catch (error) {
      console.error('Failed to update call:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Button variant="ghost" size="sm" asChild>
        <Link href="/dashboard/deals">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Deals
        </Link>
      </Button>

      {/* Deal Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">{deal.listing.title}</CardTitle>
              <CardDescription className="mt-1 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1">
                  <Building2 className="w-4 h-4" />
                  {deal.listing.businessType}
                </span>
                {deal.listing.askingPrice && (
                  <span className="inline-flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    Asking: {formatCurrency(deal.listing.askingPrice)}
                  </span>
                )}
                {deal.offerAmount && (
                  <span className="inline-flex items-center gap-1 font-semibold text-green-700">
                    <DollarSign className="w-4 h-4" />
                    Offer: {formatCurrency(deal.offerAmount)}
                  </span>
                )}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/listings/${deal.listing.slug}`} target="_blank">
                  View Listing
                  <ExternalLink className="w-3 h-3 ml-1" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Counterparty info */}
          <div className="mt-4 flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
              {counterparty.avatarUrl ? (
                <img
                  src={counterparty.avatarUrl}
                  alt={counterparty.name || 'User'}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <User className="w-5 h-5 text-gray-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {counterparty.name || counterparty.email}
                </span>
                {counterparty.verified && (
                  <Verified className="w-4 h-4 text-blue-500" />
                )}
                <Badge variant="outline" className="text-xs">
                  {isBuyer ? 'Seller' : 'Buyer'}
                </Badge>
              </div>
              {counterparty.company && (
                <p className="text-sm text-gray-500">{counterparty.company}</p>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stage Progress Bar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Deal Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <StageProgressBar currentStage={deal.stage} />

          {/* Stage advance controls */}
          {canAdvance && (
            <div className="mt-6 border-t pt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (optional)
                  </label>
                  <Textarea
                    value={stageNotes}
                    onChange={(e) => setStageNotes(e.target.value)}
                    placeholder="Add notes for this stage change..."
                    rows={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Offer Amount (optional)
                  </label>
                  <Input
                    type="number"
                    value={stageOfferAmount}
                    onChange={(e) => setStageOfferAmount(e.target.value)}
                    placeholder="e.g. 50000"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {nextStage && (
                  <Button
                    onClick={() => advanceStage(nextStage)}
                    disabled={updating}
                  >
                    {updating ? 'Updating...' : `Advance to ${STAGE_LABELS[nextStage]}`}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
                {allowedTransitions.includes('CANCELLED') && (
                  <Button
                    variant="destructive"
                    onClick={() => {
                      if (confirm('Are you sure you want to cancel this deal?')) {
                        advanceStage('CANCELLED')
                      }
                    }}
                    disabled={updating}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Cancel Deal
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            {deal.timeline.length === 0 ? (
              <p className="text-gray-500 text-sm">No events yet</p>
            ) : (
              <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

                <div className="space-y-6">
                  {deal.timeline.map((event) => {
                    let iconColor = 'bg-gray-400'
                    let IconComponent = Clock
                    if (event.type === 'STAGE_CHANGE') {
                      iconColor = 'bg-blue-500'
                      IconComponent = ArrowRight
                    } else if (event.type === 'DOCUMENT_ADDED') {
                      iconColor = 'bg-green-500'
                      IconComponent = FileText
                    } else if (event.type === 'OFFER_MADE') {
                      iconColor = 'bg-purple-500'
                      IconComponent = DollarSign
                    } else if (event.type === 'CALL_SCHEDULED') {
                      iconColor = 'bg-orange-500'
                      IconComponent = Phone
                    } else if (event.type === 'NOTE') {
                      iconColor = 'bg-gray-500'
                      IconComponent = MessageSquare
                    }

                    return (
                      <div key={event.id} className="relative flex gap-4">
                        <div
                          className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${iconColor}`}
                        >
                          <IconComponent className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0 pb-2">
                          <p className="text-sm font-medium text-gray-900">
                            {event.title}
                          </p>
                          {event.details && (
                            <p className="text-sm text-gray-600 mt-0.5">
                              {event.details}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(event.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Documents */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Documents
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDocForm(!showDocForm)}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Document
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Add document form */}
            {showDocForm && (
              <div className="mb-6 p-4 border rounded-lg bg-gray-50 space-y-3">
                <h4 className="font-medium text-sm">Add Document (External URL)</h4>
                <Input
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  placeholder="Document name *"
                />
                <Input
                  value={docUrl}
                  onChange={(e) => setDocUrl(e.target.value)}
                  placeholder="File URL (e.g. Google Drive link) *"
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    placeholder="File type (e.g. pdf) *"
                  />
                  <Input
                    type="number"
                    value={docSize}
                    onChange={(e) => setDocSize(e.target.value)}
                    placeholder="File size in bytes *"
                  />
                </div>
                <select
                  value={docCategory}
                  onChange={(e) => setDocCategory(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
                >
                  <option value="OTHER">Other</option>
                  <option value="FINANCIALS">Financials</option>
                  <option value="LEGAL">Legal</option>
                  <option value="ANALYTICS">Analytics</option>
                  <option value="CONTRACTS">Contracts</option>
                </select>
                <Textarea
                  value={docDescription}
                  onChange={(e) => setDocDescription(e.target.value)}
                  placeholder="Description (optional)"
                  rows={2}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={addDocument}
                    disabled={addingDoc}
                  >
                    {addingDoc ? 'Adding...' : 'Add Document'}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowDocForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {deal.documents.length === 0 && !showDocForm ? (
              <div className="text-center py-6">
                <Upload className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                <p className="text-gray-500 text-sm">No documents yet</p>
                <p className="text-gray-400 text-xs">
                  Share financials, legal docs, and more
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {deal.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <FileText className="w-8 h-8 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-sm text-blue-600 hover:underline truncate"
                        >
                          {doc.name}
                        </a>
                        <Badge
                          className={
                            DOC_CATEGORY_COLORS[doc.category] ||
                            'bg-gray-100 text-gray-800'
                          }
                        >
                          {DOC_CATEGORY_LABELS[doc.category] || doc.category}
                        </Badge>
                      </div>
                      {doc.description && (
                        <p className="text-xs text-gray-600 mt-0.5">
                          {doc.description}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {doc.uploader.name || doc.uploader.email} &middot;{' '}
                        {formatFileSize(doc.fileSize)} &middot;{' '}
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="w-4 h-4 text-gray-400 hover:text-blue-600" />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Scheduled Calls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Scheduled Calls
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCallForm(!showCallForm)}
            >
              <Plus className="w-4 h-4 mr-1" />
              Schedule Call
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Schedule call form */}
          {showCallForm && (
            <div className="mb-6 p-4 border rounded-lg bg-gray-50 space-y-3">
              <h4 className="font-medium text-sm">
                Schedule a call with {counterparty.name || counterparty.email}
              </h4>
              <Input
                value={callTitle}
                onChange={(e) => setCallTitle(e.target.value)}
                placeholder="Call title (e.g. Initial Discussion) *"
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Date & Time *</label>
                  <Input
                    type="datetime-local"
                    value={callDate}
                    onChange={(e) => setCallDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Duration (minutes)</label>
                  <Input
                    type="number"
                    value={callDuration}
                    onChange={(e) => setCallDuration(e.target.value)}
                    placeholder="30"
                  />
                </div>
              </div>
              <Input
                value={callMeetingLink}
                onChange={(e) => setCallMeetingLink(e.target.value)}
                placeholder="Meeting link (e.g. Zoom URL) - optional"
              />
              <Textarea
                value={callNotes}
                onChange={(e) => setCallNotes(e.target.value)}
                placeholder="Call notes / agenda (optional)"
                rows={2}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={scheduleCall}
                  disabled={schedulingCall}
                >
                  {schedulingCall ? 'Scheduling...' : 'Schedule Call'}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowCallForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {deal.calls.length === 0 && !showCallForm ? (
            <div className="text-center py-6">
              <Phone className="w-10 h-10 mx-auto text-gray-300 mb-2" />
              <p className="text-gray-500 text-sm">No calls scheduled</p>
              <p className="text-gray-400 text-xs">
                Schedule a call to discuss the deal
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {deal.calls.map((call) => {
                const isScheduler = call.scheduler.id === currentUserId
                const otherPerson = isScheduler ? call.receiver : call.scheduler
                const canUpdateStatus =
                  call.status !== 'COMPLETED' && call.status !== 'CANCELLED'

                return (
                  <div
                    key={call.id}
                    className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 border rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {call.title}
                        </span>
                        <Badge
                          className={
                            CALL_STATUS_COLORS[call.status] ||
                            'bg-gray-100 text-gray-800'
                          }
                        >
                          {call.status}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(call.scheduledAt).toLocaleString()}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {call.duration} min
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <User className="w-3 h-3" />
                          with {otherPerson.name || otherPerson.email}
                        </span>
                      </div>
                      {call.notes && (
                        <p className="text-xs text-gray-500 mt-1">
                          {call.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {call.meetingLink && (
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={call.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Join Call
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </a>
                        </Button>
                      )}
                      {canUpdateStatus && (
                        <>
                          {call.status === 'PENDING' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                updateCallStatus(call.id, 'CONFIRMED')
                              }
                            >
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Confirm
                            </Button>
                          )}
                          {(call.status === 'PENDING' ||
                            call.status === 'CONFIRMED') && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  updateCallStatus(call.id, 'COMPLETED')
                                }
                              >
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Complete
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  updateCallStatus(call.id, 'CANCELLED')
                                }
                                className="text-red-600 hover:text-red-700"
                              >
                                <XCircle className="w-3 h-3 mr-1" />
                                Cancel
                              </Button>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes Section */}
      {deal.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Deal Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {deal.notes}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
