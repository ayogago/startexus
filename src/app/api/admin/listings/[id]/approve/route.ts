import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { action, reason } = await request.json()

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const listing = await prisma.listing.findUnique({
      where: { id: params.id },
      include: { seller: true }
    })

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    if (listing.status !== 'PENDING_REVIEW') {
      return NextResponse.json({ error: 'Listing is not pending review' }, { status: 400 })
    }

    const newStatus = action === 'approve' ? 'PUBLISHED' : 'REJECTED'
    const publishedAt = action === 'approve' ? new Date() : null

    const updatedListing = await prisma.listing.update({
      where: { id: params.id },
      data: {
        status: newStatus,
        publishedAt,
        rejectionReason: action === 'reject' ? reason : null
      },
      include: { seller: true }
    })

    // Send email notification to seller
    if (updatedListing.seller?.email && updatedListing.seller?.name) {
      const subject = action === 'approve'
        ? `Your listing "${updatedListing.title}" has been approved!`
        : `Your listing "${updatedListing.title}" requires updates`

      const html = action === 'approve' ? `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Listing Approved</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f7fafc; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center; }
            .logo { margin-bottom: 10px; }
            .header-text { color: white; font-size: 16px; opacity: 0.9; }
            .content { padding: 40px 30px; }
            .title { color: #1a202c; font-size: 28px; font-weight: bold; margin-bottom: 20px; text-align: center; }
            .message { color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 30px; }
            .success-box { background-color: #d1fae5; border: 1px solid #34d399; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
            .next-steps { background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; }
            .step-item { margin-bottom: 8px; color: #065f46; }
            .cta-button { display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: 600; margin: 20px 0; }
            .footer { background-color: #f7fafc; padding: 30px; text-align: center; color: #718096; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo"><img src="https://startexus.com/startexus-light.png" alt="StartExus" width="240" style="display:block;margin:0 auto;" /></div>
              <div class="header-text">Business Marketplace</div>
            </div>

            <div class="content">
              <h1 class="title">🎉 Congratulations!</h1>

              <div class="message">
                Hi ${updatedListing.seller.name},<br><br>
                Great news! Your business listing "<strong>${updatedListing.title}</strong>" has been approved and is now live on StartExus.
              </div>

              <div class="success-box">
                <p style="margin: 0; color: #065f46; font-size: 18px; font-weight: 600;">✅ Your listing is now visible to potential buyers!</p>
              </div>

              <div class="next-steps">
                <h3 style="color: #065f46; margin-top: 0;">What's next?</h3>
                <div class="step-item">✓ Monitor inquiries in your dashboard</div>
                <div class="step-item">✓ Respond promptly to buyer questions</div>
                <div class="step-item">✓ Keep your listing information up to date</div>
              </div>

              <div style="text-align: center;">
                <a href="https://startexus.com/listings/${updatedListing.slug}" class="cta-button">
                  View Your Listing →
                </a>
              </div>
            </div>

            <div class="footer">
              <p>Best regards,<br>The StartExus Team</p>
            </div>
          </div>
        </body>
        </html>
      ` : `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Listing Needs Updates</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f7fafc; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; }
            .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px 30px; text-align: center; }
            .logo { margin-bottom: 10px; }
            .header-text { color: white; font-size: 16px; opacity: 0.9; }
            .content { padding: 40px 30px; }
            .title { color: #1a202c; font-size: 28px; font-weight: bold; margin-bottom: 20px; text-align: center; }
            .message { color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 30px; }
            .review-box { background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .review-title { color: #78350f; font-weight: 600; margin-bottom: 10px; }
            .review-text { color: #92400e; }
            .cta-button { display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: 600; margin: 20px 0; }
            .footer { background-color: #f7fafc; padding: 30px; text-align: center; color: #718096; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo"><img src="https://startexus.com/startexus-light.png" alt="StartExus" width="240" style="display:block;margin:0 auto;" /></div>
              <div class="header-text">Business Marketplace</div>
            </div>

            <div class="content">
              <h1 class="title">📝 Your Listing Needs Updates</h1>

              <div class="message">
                Hi ${updatedListing.seller.name},<br><br>
                Thank you for submitting your business listing "<strong>${updatedListing.title}</strong>" to StartExus.<br><br>
                After reviewing your submission, we need some additional information or changes before we can approve your listing.
              </div>

              <div class="review-box">
                <div class="review-title">Review Comments:</div>
                <div class="review-text">${reason || 'Please review and update your listing information.'}</div>
              </div>

              <div class="message">
                Please update your listing and resubmit for review. If you have any questions, please don't hesitate to contact us.
              </div>

              <div style="text-align: center;">
                <a href="https://startexus.com/dashboard/listings" class="cta-button">
                  Update Your Listing →
                </a>
              </div>
            </div>

            <div class="footer">
              <p>Best regards,<br>The StartExus Team</p>
            </div>
          </div>
        </body>
        </html>
      `

      const text = action === 'approve' ? `
        Congratulations! Your listing has been approved

        Hi ${updatedListing.seller.name},

        Great news! Your business listing "${updatedListing.title}" has been approved and is now live on StartExus.

        Your listing is now visible to potential buyers and you may start receiving inquiries.

        View your listing: https://startexus.com/listings/${updatedListing.slug}

        What's next?
        - Monitor inquiries in your dashboard
        - Respond promptly to buyer questions
        - Keep your listing information up to date

        Best regards,
        The StartExus Team
      ` : `
        Your listing requires updates

        Hi ${updatedListing.seller.name},

        Thank you for submitting your business listing "${updatedListing.title}" to StartExus.

        After reviewing your submission, we need some additional information or changes before we can approve your listing:

        Review Comments:
        ${reason || 'Please review and update your listing information.'}

        Please update your listing and resubmit for review.

        Update your listing: https://startexus.com/dashboard/listings

        If you have any questions, please don't hesitate to contact us.

        Best regards,
        The StartExus Team
      `

      sendEmail({
        to: updatedListing.seller.email,
        subject,
        html,
        text,
      }).catch(error => {
        console.error('Failed to send listing status notification:', error)
      })
    }

    return NextResponse.json({
      success: true,
      listing: updatedListing,
      message: `Listing ${action === 'approve' ? 'approved' : 'rejected'} successfully`
    })
  } catch (error) {
    console.error('Failed to update listing status:', error)
    return NextResponse.json(
      { error: 'Failed to update listing status' },
      { status: 500 }
    )
  }
}