import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Unsubscribe token is required' },
        { status: 400 }
      )
    }

    const subscriber = await prisma.newsletterSubscriber.findUnique({
      where: { unsubscribeToken: token },
    })

    if (!subscriber) {
      return NextResponse.json(
        { error: 'Invalid unsubscribe link' },
        { status: 404 }
      )
    }

    await prisma.newsletterSubscriber.update({
      where: { id: subscriber.id },
      data: { status: 'UNSUBSCRIBED' },
    })

    // Redirect to a confirmation page
    return NextResponse.redirect(new URL('/newsletter/unsubscribed', request.url))
  } catch (error) {
    console.error('Unsubscribe failed:', error)
    return NextResponse.json(
      { error: 'Failed to unsubscribe' },
      { status: 500 }
    )
  }
}
