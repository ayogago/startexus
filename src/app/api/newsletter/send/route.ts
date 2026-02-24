import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Only admins can send newsletters
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { blogPostId } = await request.json()

    if (!blogPostId) {
      return NextResponse.json(
        { error: 'Blog post ID is required' },
        { status: 400 }
      )
    }

    // Get the blog post
    const post = await prisma.blogPost.findUnique({
      where: { id: blogPostId },
      include: { author: true },
    })

    if (!post) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 })
    }

    // Get all active subscribers
    const subscribers = await prisma.newsletterSubscriber.findMany({
      where: { status: 'ACTIVE' },
    })

    if (subscribers.length === 0) {
      return NextResponse.json({
        message: 'No active subscribers',
        sent: 0,
      })
    }

    // Create email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    })

    const siteUrl = process.env.NEXTAUTH_URL || 'https://startexus.com'
    const postUrl = `${siteUrl}/blog/${post.slug}`

    let sentCount = 0
    const errors: string[] = []

    // Send emails to all subscribers
    for (const subscriber of subscribers) {
      try {
        // Create newsletter email record
        const newsletterEmail = await prisma.newsletterEmail.create({
          data: {
            subscriberId: subscriber.id,
            blogPostId: post.id,
            subject: `New Post: ${post.title}`,
          },
        })

        const trackingPixel = `${siteUrl}/api/newsletter/track?id=${newsletterEmail.id}`
        const unsubscribeLink = `${siteUrl}/api/newsletter/unsubscribe?token=${subscriber.unsubscribeToken}`

        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${post.title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); padding: 40px 20px; text-align: center;">
              <div style="color: #ffffff; font-size: 28px; font-weight: bold; margin-bottom: 8px;">StartExus</div>
              <div style="color: #ffffff; font-size: 16px; opacity: 0.9;">Business Marketplace</div>
            </td>
          </tr>

          ${post.featuredImage ? `
          <!-- Featured Image -->
          <tr>
            <td>
              <a href="${postUrl}" style="display: block;">
                <img src="${siteUrl}${post.featuredImage}" alt="${post.title}" style="width: 100%; height: auto; display: block;" />
              </a>
            </td>
          </tr>
          ` : ''}

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">${post.title}</h2>
              ${post.excerpt ? `<p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">${post.excerpt}</p>` : ''}

              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); border-radius: 6px; padding: 14px 28px;">
                    <a href="${postUrl}" style="color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px;">Read Full Article →</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">
                You're receiving this because you subscribed to StartExus blog updates.
              </p>
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                <a href="${unsubscribeLink}" style="color: #2563eb; text-decoration: none;">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>

  <!-- Tracking Pixel -->
  <img src="${trackingPixel}" width="1" height="1" alt="" style="display: none;" />
</body>
</html>
        `

        await transporter.sendMail({
          from: process.env.EMAIL_FROM,
          to: subscriber.email,
          subject: `New Post: ${post.title}`,
          html: emailHtml,
        })

        sentCount++
      } catch (error) {
        console.error(`Failed to send to ${subscriber.email}:`, error)
        errors.push(subscriber.email)
      }
    }

    return NextResponse.json({
      message: `Newsletter sent to ${sentCount} subscribers`,
      sent: sentCount,
      total: subscribers.length,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error('Newsletter send failed:', error)
    return NextResponse.json(
      { error: 'Failed to send newsletter' },
      { status: 500 }
    )
  }
}
