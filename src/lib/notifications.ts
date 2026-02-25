import { prisma } from './prisma'
import { sendEmail } from './email'

export async function createNotification({
  userId,
  type,
  title,
  message,
  link,
  data,
  sendEmailNotification = false,
}: {
  userId: string
  type: string
  title: string
  message: string
  link?: string
  data?: Record<string, any>
  sendEmailNotification?: boolean
}) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        link,
        data: JSON.stringify(data || {}),
      },
    })

    if (sendEmailNotification) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, name: true },
      })

      if (user?.email) {
        sendEmail({
          to: user.email,
          subject: title,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f7fafc; }
                .container { max-width: 600px; margin: 0 auto; background-color: white; }
                .header { background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 30px; text-align: center; }
                .logo { margin-bottom: 10px; }
                .content { padding: 30px; }
                .title { color: #1a202c; font-size: 22px; font-weight: bold; margin-bottom: 15px; }
                .message { color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 25px; }
                .cta-button { display: inline-block; background: #3b82f6; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; }
                .footer { padding: 20px 30px; text-align: center; color: #718096; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header"><div class="logo"><img src="https://startexus.com/startexus-light.png" alt="StartExus" width="240" style="display:block;margin:0 auto;" /></div></div>
                <div class="content">
                  <h1 class="title">${title}</h1>
                  <p class="message">${message}</p>
                  ${link ? `<a href="https://startexus.com${link}" class="cta-button">View Details</a>` : ''}
                </div>
                <div class="footer">StartExus - Business Marketplace</div>
              </div>
            </body>
            </html>
          `,
          text: `${title}\n\n${message}\n\n${link ? 'View: https://startexus.com' + link : ''}`,
        }).catch(() => {})
      }
    }

    return notification
  } catch {
    return null
  }
}

export async function notifyNewMessage(threadId: string, senderId: string, listingTitle: string) {
  const participants = await prisma.threadParticipant.findMany({
    where: { threadId, userId: { not: senderId } },
    select: { userId: true },
  })

  const sender = await prisma.user.findUnique({
    where: { id: senderId },
    select: { name: true },
  })

  for (const participant of participants) {
    await createNotification({
      userId: participant.userId,
      type: 'MESSAGE',
      title: 'New Message',
      message: `${sender?.name || 'Someone'} sent you a message about "${listingTitle}"`,
      link: `/dashboard/messages`,
      sendEmailNotification: true,
    })
  }
}

export async function notifyListingStatusChange(listingId: string, sellerId: string, status: string, reason?: string) {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { title: true },
  })

  const isApproved = status === 'PUBLISHED'
  await createNotification({
    userId: sellerId,
    type: isApproved ? 'LISTING_APPROVED' : 'LISTING_REJECTED',
    title: isApproved ? 'Listing Approved!' : 'Listing Needs Changes',
    message: isApproved
      ? `Your listing "${listing?.title}" has been approved and is now live.`
      : `Your listing "${listing?.title}" needs changes: ${reason || 'Please review and resubmit.'}`,
    link: `/dashboard/listings`,
    sendEmailNotification: true,
  })
}

export async function notifyDealUpdate(dealId: string, recipientId: string, stage: string, listingTitle: string) {
  await createNotification({
    userId: recipientId,
    type: 'DEAL_UPDATE',
    title: 'Deal Updated',
    message: `The deal for "${listingTitle}" has moved to ${stage.replace(/_/g, ' ').toLowerCase()}.`,
    link: `/dashboard/deals/${dealId}`,
    sendEmailNotification: true,
  })
}

export async function notifyNewReview(targetId: string, reviewerName: string, rating: number) {
  await createNotification({
    userId: targetId,
    type: 'REVIEW',
    title: 'New Review',
    message: `${reviewerName} left you a ${rating}-star review.`,
    link: `/dashboard/reviews`,
    sendEmailNotification: true,
  })
}

export async function notifySavedSearchMatch(userId: string, searchName: string, listingTitle: string, listingSlug: string) {
  await createNotification({
    userId,
    type: 'SAVED_ALERT',
    title: 'New Match for Your Saved Search',
    message: `"${listingTitle}" matches your saved search "${searchName}".`,
    link: `/listings/${listingSlug}`,
    sendEmailNotification: true,
  })
}
