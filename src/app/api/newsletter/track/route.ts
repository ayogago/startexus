import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Track email opens
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const emailId = searchParams.get('id')

    if (emailId) {
      await prisma.newsletterEmail.updateMany({
        where: {
          id: emailId,
          openedAt: null,
        },
        data: {
          openedAt: new Date(),
        },
      })
    }

    // Return a 1x1 transparent pixel
    const pixel = Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64'
    )

    return new NextResponse(pixel, {
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
  } catch (error) {
    console.error('Email tracking failed:', error)
    const pixel = Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64'
    )
    return new NextResponse(pixel, {
      headers: { 'Content-Type': 'image/gif' },
    })
  }
}

// Track link clicks
export async function POST(request: NextRequest) {
  try {
    const { emailId, link } = await request.json()

    if (emailId) {
      const email = await prisma.newsletterEmail.findUnique({
        where: { id: emailId },
      })

      if (email) {
        const clickedLinks = JSON.parse(email.clickedLinks || '[]')
        if (!clickedLinks.includes(link)) {
          clickedLinks.push(link)
        }

        await prisma.newsletterEmail.update({
          where: { id: emailId },
          data: {
            clickedAt: email.clickedAt || new Date(),
            clickedLinks: JSON.stringify(clickedLinks),
          },
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Link tracking failed:', error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
