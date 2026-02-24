import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Bell, MessageSquare, CheckCircle, XCircle, TrendingUp, Star, Search } from 'lucide-react'
import Link from 'next/link'

const ICON_MAP: Record<string, any> = {
  MESSAGE: MessageSquare,
  LISTING_APPROVED: CheckCircle,
  LISTING_REJECTED: XCircle,
  DEAL_UPDATE: TrendingUp,
  REVIEW: Star,
  SAVED_ALERT: Search,
  VERIFICATION: CheckCircle,
}

const COLOR_MAP: Record<string, string> = {
  MESSAGE: 'text-blue-600 bg-blue-100',
  LISTING_APPROVED: 'text-green-600 bg-green-100',
  LISTING_REJECTED: 'text-red-600 bg-red-100',
  DEAL_UPDATE: 'text-purple-600 bg-purple-100',
  REVIEW: 'text-yellow-600 bg-yellow-100',
  SAVED_ALERT: 'text-indigo-600 bg-indigo-100',
  VERIFICATION: 'text-green-600 bg-green-100',
}

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/auth/signin')

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  // Mark all as read on page visit
  await prisma.notification.updateMany({
    where: { userId: session.user.id, read: false },
    data: { read: true },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Notifications</h1>
        <p className="text-gray-600">Stay updated on your activity</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            All Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No notifications yet</p>
          ) : (
            <div className="space-y-3">
              {notifications.map(notification => {
                const IconComponent = ICON_MAP[notification.type] || Bell
                const colorClass = COLOR_MAP[notification.type] || 'text-gray-600 bg-gray-100'
                return (
                  <div key={notification.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      {notification.link ? (
                        <Link href={notification.link} className="text-sm font-medium text-gray-900 hover:text-blue-600">
                          {notification.title}
                        </Link>
                      ) : (
                        <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                      )}
                      <p className="text-sm text-gray-600 mt-0.5">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notification.createdAt).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
