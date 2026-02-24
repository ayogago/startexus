import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { AdminBlogDashboard } from '@/components/admin/admin-blog-dashboard'

export default async function AdminBlogPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  return <AdminBlogDashboard />
}