'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/lib/utils'
import { MessageSquare, Send, User, Verified } from 'lucide-react'

interface Thread {
  id: string
  listingId: string
  lastMessageAt: string
  unreadCount: number
  listing: {
    id: string
    title: string
    slug: string
    askingPrice: number | null
    images: { url: string }[]
  }
  participants: Array<{
    userId: string
    roleInThread: string
    user: {
      id: string
      name: string | null
      email: string
      avatarUrl: string | null
      verified: boolean
    }
  }>
  messages: Array<{
    id: string
    body: string
    createdAt: string
    sender: {
      id: string
      name: string | null
      avatarUrl: string | null
    }
  }>
  _count: {
    messages: number
  }
}

interface ThreadDetail extends Thread {
  listing: Thread['listing'] & {
    confidential: boolean
    seller: {
      id: string
      name: string | null
      email: string
      verified: boolean
    }
  }
  messages: Array<Thread['messages'][0] & {
    readBy: string[]
  }>
}

export default function MessagesPage() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const router = useRouter()
  const listingId = searchParams.get('listing')

  const [threads, setThreads] = useState<Thread[]>([])
  const [selectedThread, setSelectedThread] = useState<ThreadDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingThread, setLoadingThread] = useState(false)
  const [messageText, setMessageText] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    fetchThreads()
  }, [])

  useEffect(() => {
    if (listingId && !loading) {
      // Find or create thread for the listing
      const existingThread = threads.find(t => t.listingId === listingId)
      if (existingThread) {
        selectThread(existingThread.id)
      } else {
        createThreadForListing(listingId)
      }
    }
  }, [listingId, threads, loading])

  const fetchThreads = async () => {
    try {
      const response = await fetch('/api/threads')
      const data = await response.json()
      setThreads(data.threads || [])
    } catch (error) {
      console.error('Failed to fetch threads:', error)
    } finally {
      setLoading(false)
    }
  }

  const createThreadForListing = async (listingId: string) => {
    try {
      const response = await fetch('/api/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId }),
      })

      if (response.ok) {
        const data = await response.json()
        await fetchThreads() // Refresh threads
        selectThread(data.threadId)
      }
    } catch (error) {
      console.error('Failed to create thread:', error)
    }
  }

  const selectThread = async (threadId: string) => {
    setLoadingThread(true)
    try {
      const response = await fetch(`/api/threads/${threadId}`)
      const data = await response.json()
      setSelectedThread(data.thread)

      // Update URL without listing param
      router.replace('/dashboard/messages', { scroll: false })

      // Mark thread as read in the sidebar
      setThreads(threads.map(t =>
        t.id === threadId ? { ...t, unreadCount: 0 } : t
      ))
    } catch (error) {
      console.error('Failed to fetch thread:', error)
    } finally {
      setLoadingThread(false)
    }
  }

  const sendMessage = async () => {
    if (!selectedThread || !messageText.trim() || sending) return

    setSending(true)
    try {
      const response = await fetch(`/api/threads/${selectedThread.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: messageText.trim() }),
      })

      if (response.ok) {
        const data = await response.json()
        setSelectedThread({
          ...selectedThread,
          messages: [...selectedThread.messages, data.message],
        })
        setMessageText('')

        // Update thread in sidebar
        setThreads(threads.map(t =>
          t.id === selectedThread.id
            ? { ...t, lastMessageAt: new Date().toISOString(), messages: [data.message] }
            : t
        ))
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const getOtherParticipant = (thread: Thread | ThreadDetail, currentUserId: string) => {
    return thread.participants.find(p => p.user.id !== currentUserId)?.user
  }

  if (loading || !session) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Messages</h1>
          <p className="text-gray-600">Your conversations with buyers and sellers</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-96">
          <Card className="animate-pulse">
            <CardContent className="p-4">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex space-x-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="lg:col-span-2 animate-pulse">
            <CardContent className="p-4">
              <div className="h-full bg-gray-200 rounded" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Messages</h1>
        <p className="text-gray-600">Your conversations with buyers and sellers</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Thread List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5" />
              <span>Conversations</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {threads.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No conversations yet</p>
                <p className="text-sm">Start by contacting a seller</p>
              </div>
            ) : (
              <div className="space-y-1">
                {threads.map((thread) => {
                  const otherUser = getOtherParticipant(thread, session?.user?.id || '')
                  const lastMessage = thread.messages[0]

                  return (
                    <button
                      key={thread.id}
                      onClick={() => selectThread(thread.id)}
                      className={`w-full p-4 text-left hover:bg-gray-50 border-b ${
                        selectedThread?.id === thread.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                          {otherUser?.avatarUrl ? (
                            <img
                              src={otherUser.avatarUrl}
                              alt={otherUser.name || 'User'}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <User className="w-5 h-5 text-gray-400" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm truncate">
                              {thread.listing.title}
                            </p>
                            {thread.unreadCount > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {thread.unreadCount}
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center space-x-1 mb-1">
                            <span className="text-xs text-gray-600">
                              {otherUser?.name || otherUser?.email || 'Unknown'}
                            </span>
                            {otherUser?.verified && (
                              <Verified className="w-3 h-3 text-blue-500" />
                            )}
                          </div>

                          {lastMessage && (
                            <p className="text-xs text-gray-500 truncate">
                              {lastMessage.body}
                            </p>
                          )}

                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(thread.lastMessageAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="lg:col-span-2 flex flex-col">
          {selectedThread ? (
            <>
              {/* Chat Header */}
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {selectedThread.listing.title}
                    </CardTitle>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span>
                        {selectedThread.listing.askingPrice
                          ? formatCurrency(selectedThread.listing.askingPrice)
                          : 'Open to offers'
                        }
                      </span>
                      {selectedThread.listing.confidential && (
                        <Badge variant="outline" className="text-xs">Confidential</Badge>
                      )}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a href={`/listings/${selectedThread.listing.slug}`} target="_blank">
                      View Listing
                    </a>
                  </Button>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 overflow-y-auto p-4">
                {loadingThread ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedThread.messages.map((message) => {
                      const isOwn = message.sender.id === session?.user?.id

                      return (
                        <div
                          key={message.id}
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
                            <div
                              className={`px-4 py-2 rounded-lg ${
                                isOwn
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-100 text-gray-900'
                              }`}
                            >
                              <p className="whitespace-pre-wrap">{message.body}</p>
                            </div>
                            <p className={`text-xs text-gray-500 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
                              {new Date(message.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>

              {/* Message Input */}
              <div className="border-t p-4">
                <div className="flex space-x-2">
                  <Input
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="flex-1"
                    disabled={sending}
                    maxLength={2000}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!messageText.trim() || sending}
                    size="icon"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {messageText.length}/2000 characters
                </p>
              </div>
            </>
          ) : (
            <CardContent className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
                <p>Choose a conversation from the left to start messaging</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  )
}