import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MailX } from 'lucide-react'

export default function UnsubscribedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gray-100 rounded-full">
              <MailX className="w-12 h-12 text-gray-600" />
            </div>
          </div>
          <CardTitle className="text-2xl">Unsubscribed Successfully</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            You have been successfully unsubscribed from our newsletter. You will no longer receive blog post notifications.
          </p>
          <p className="text-gray-600">
            We're sorry to see you go! If you change your mind, you can always subscribe again from our blog page.
          </p>
          <div className="pt-4">
            <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Link href="/blog">
                Back to Blog
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
