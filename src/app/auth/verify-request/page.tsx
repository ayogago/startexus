import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mail } from 'lucide-react'
import Link from 'next/link'

export default function VerifyRequestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle>Check your email</CardTitle>
          <CardDescription>
            A sign in link has been sent to your email address.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-gray-600">
            Click the link in your email to sign in to your account.
            If you don't see the email, check your spam folder.
          </p>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> The link will expire in 24 hours for security reasons.
            </p>
          </div>

          <Button asChild variant="outline" className="w-full">
            <Link href="/auth/signin">
              Back to sign in
            </Link>
          </Button>

          <p className="text-xs text-gray-500">
            Having trouble? <Link href="/contact" className="text-blue-600 hover:text-blue-500">Contact support</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}