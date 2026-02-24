import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      )
    }

    // Check if already subscribed
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existing) {
      if (existing.status === 'ACTIVE') {
        return NextResponse.json(
          { message: 'You are already subscribed to our newsletter' },
          { status: 200 }
        )
      } else {
        // Reactivate subscription
        await prisma.newsletterSubscriber.update({
          where: { email: email.toLowerCase() },
          data: { status: 'ACTIVE', subscribedAt: new Date() },
        })
        return NextResponse.json({
          message: 'Welcome back! Your subscription has been reactivated.',
        })
      }
    }

    // Create new subscriber
    await prisma.newsletterSubscriber.create({
      data: {
        email: email.toLowerCase(),
        name: name || null,
      },
    })

    return NextResponse.json({
      message: 'Successfully subscribed! You will receive emails when we publish new blog posts.',
    })
  } catch (error) {
    console.error('Newsletter subscription failed:', error)
    return NextResponse.json(
      { error: 'Failed to subscribe. Please try again.' },
      { status: 500 }
    )
  }
}
