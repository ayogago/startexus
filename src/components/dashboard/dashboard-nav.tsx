'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Session } from 'next-auth'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Heart,
  User,
  Shield,
  Plus,
  BookOpen,
  Mail
} from 'lucide-react'

interface DashboardNavProps {
  session: Session
}

export function DashboardNav({ session }: DashboardNavProps) {
  const pathname = usePathname()

  const navItems = [
    {
      href: '/dashboard',
      label: 'Overview',
      icon: LayoutDashboard,
      exact: true,
    },
    {
      href: '/dashboard/listings',
      label: 'My Listings',
      icon: FileText,
      show: session.user.role === 'SELLER' || session.user.role === 'ADMIN',
    },
    {
      href: '/dashboard/messages',
      label: 'Messages',
      icon: MessageSquare,
    },
    {
      href: '/dashboard/saved',
      label: 'Saved',
      icon: Heart,
    },
    {
      href: '/dashboard/profile',
      label: 'Profile',
      icon: User,
    },
  ]

  if (session.user.role === 'ADMIN') {
    navItems.push({
      href: '/dashboard/admin',
      label: 'Admin',
      icon: Shield,
    })
    navItems.push({
      href: '/dashboard/admin/blog',
      label: 'Blog Management',
      icon: BookOpen,
    })
    navItems.push({
      href: '/dashboard/admin/newsletter',
      label: 'Newsletter',
      icon: Mail,
    })
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-2">
          {(session.user.role === 'SELLER' || session.user.role === 'ADMIN') && (
            <Link
              href="/dashboard/listings/new"
              className="flex items-center space-x-2 w-full px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>New Listing</span>
            </Link>
          )}

          {navItems.map((item) => {
            if (item.show === false) return null

            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center space-x-2 w-full px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  isActive
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}