function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let transporter: any = null

async function getTransporter() {
  if (!transporter) {
    const nodemailer = (await import('nodemailer')).default
    const port = parseInt(process.env.EMAIL_SERVER_PORT || '587')
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST || 'smtp.gmail.com',
      port: port,
      secure: port === 465,
      requireTLS: true,
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
      tls: { rejectUnauthorized: process.env.NODE_ENV !== 'development' }
    })
  }
  return transporter
}

// Email templates
export const emailTemplates = {
  welcome: {
    subject: 'Welcome to StartExus - Your Account is Ready!',
    html: (name: string, role: string) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to StartExus</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f7fafc; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; }
          .header { background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 40px 30px; text-align: center; }
          .logo { margin-bottom: 10px; }
          .header-text { color: white; font-size: 16px; opacity: 0.9; }
          .content { padding: 40px 30px; }
          .welcome-title { color: #1a202c; font-size: 28px; font-weight: bold; margin-bottom: 20px; text-align: center; }
          .welcome-message { color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 30px; }
          .features { background-color: #f7fafc; border-radius: 8px; padding: 30px; margin: 30px 0; }
          .feature { display: flex; align-items: flex-start; margin-bottom: 20px; }
          .feature-icon { background-color: #3b82f6; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px; font-weight: bold; }
          .feature-text { flex: 1; }
          .feature-title { color: #1a202c; font-weight: 600; margin-bottom: 5px; }
          .feature-desc { color: #718096; font-size: 14px; }
          .cta-button { display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: 600; margin: 20px 0; }
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
            <h1 class="welcome-title">Welcome to StartExus, ${escapeHtml(name)}! 🎉</h1>

            <div class="welcome-message">
              Thank you for joining StartExus as a <strong>${escapeHtml(role.toLowerCase())}</strong>! You're now part of a thriving community of entrepreneurs buying and selling businesses.
            </div>

            <div class="features">
              ${role === 'SELLER' ? `
                <div class="feature">
                  <div class="feature-icon">🚀</div>
                  <div class="feature-text">
                    <div class="feature-title">List Your Business</div>
                    <div class="feature-desc">Create compelling listings to showcase your business to qualified buyers</div>
                  </div>
                </div>
                <div class="feature">
                  <div class="feature-icon">💰</div>
                  <div class="feature-text">
                    <div class="feature-title">Free Valuation</div>
                    <div class="feature-desc">Get expert business valuations to price your business competitively</div>
                  </div>
                </div>
                <div class="feature">
                  <div class="feature-icon">🎯</div>
                  <div class="feature-text">
                    <div class="feature-title">Marketing Support</div>
                    <div class="feature-desc">We'll help market your business to our network of verified buyers</div>
                  </div>
                </div>
              ` : `
                <div class="feature">
                  <div class="feature-icon">🔍</div>
                  <div class="feature-text">
                    <div class="feature-title">Browse Businesses</div>
                    <div class="feature-desc">Discover vetted businesses across various industries and price ranges</div>
                  </div>
                </div>
                <div class="feature">
                  <div class="feature-icon">💬</div>
                  <div class="feature-text">
                    <div class="feature-title">Direct Communication</div>
                    <div class="feature-desc">Connect directly with sellers through our secure messaging system</div>
                  </div>
                </div>
                <div class="feature">
                  <div class="feature-icon">📊</div>
                  <div class="feature-text">
                    <div class="feature-title">Due Diligence</div>
                    <div class="feature-desc">Access detailed business analytics and financial information</div>
                  </div>
                </div>
              `}
            </div>

            <div style="text-align: center;">
              <a href="https://startexus.com/dashboard" class="cta-button">
                Get Started →
              </a>
            </div>
          </div>

          <div class="footer">
            <p>Questions? Contact us at <a href="mailto:support@startexus.com">support@startexus.com</a></p>
            <p>StartExus - The Premier Business Marketplace</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: (name: string, role: string) => `
      Welcome to StartExus, ${name}!

      Thank you for joining as a ${role.toLowerCase()}. You're now part of our business marketplace community.

      Get started: https://startexus.com/dashboard

      Questions? Contact support@startexus.com
    `
  },

  valuationReceived: {
    subject: 'Your Business Valuation Request Has Been Received',
    html: (name: string, businessName: string) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Valuation Request Received</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f7fafc; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center; }
          .logo { margin-bottom: 10px; }
          .header-text { color: white; font-size: 16px; opacity: 0.9; }
          .content { padding: 40px 30px; }
          .title { color: #1a202c; font-size: 28px; font-weight: bold; margin-bottom: 20px; text-align: center; }
          .message { color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 30px; }
          .timeline { background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 30px; margin: 30px 0; }
          .timeline-item { margin-bottom: 20px; }
          .timeline-title { color: #065f46; font-weight: 600; margin-bottom: 5px; }
          .timeline-desc { color: #047857; font-size: 14px; }
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
            <h1 class="title">Valuation Request Confirmed! ✅</h1>

            <div class="message">
              Hi ${escapeHtml(name)},<br><br>

              We've received your valuation request for <strong>${escapeHtml(businessName)}</strong>. Our expert team is already working on your comprehensive business analysis.
            </div>

            <div class="timeline">
              <h3 style="color: #065f46; margin-top: 0;">What happens next:</h3>

              <div class="timeline-item">
                <div class="timeline-title">📋 Initial Review (2-4 hours)</div>
                <div class="timeline-desc">Our specialists review your business information and conduct preliminary research</div>
              </div>

              <div class="timeline-item">
                <div class="timeline-title">📊 Detailed Analysis (12-24 hours)</div>
                <div class="timeline-desc">Comprehensive valuation with market comparisons and growth potential assessment</div>
              </div>

              <div class="timeline-item">
                <div class="timeline-title">📞 Personal Consultation (Within 24 hours)</div>
                <div class="timeline-desc">One-on-one discussion with a senior business broker about your results</div>
              </div>
            </div>

            <div style="text-align: center;">
              <a href="https://startexus.com/valuation" class="cta-button">
                Track Your Request →
              </a>
            </div>
          </div>

          <div class="footer">
            <p>Questions? Contact us at <a href="mailto:valuations@startexus.com">valuations@startexus.com</a> or call (555) 123-4567</p>
            <p>StartExus - Professional Business Valuations</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: (name: string, businessName: string) => `
      Valuation Request Confirmed!

      Hi ${name},

      We've received your valuation request for ${businessName}. Our expert team is working on your analysis.

      What's next:
      - Initial Review (2-4 hours)
      - Detailed Analysis (12-24 hours)
      - Personal Consultation (Within 24 hours)

      Track your request: https://startexus.com/valuation

      Questions? Contact valuations@startexus.com
    `
  },

  listingCreated: {
    subject: 'Your Business Listing Has Been Submitted for Review',
    html: (name: string, businessTitle: string, status: string) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Listing Submitted</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f7fafc; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; }
          .header { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 40px 30px; text-align: center; }
          .logo { margin-bottom: 10px; }
          .header-text { color: white; font-size: 16px; opacity: 0.9; }
          .content { padding: 40px 30px; }
          .title { color: #1a202c; font-size: 28px; font-weight: bold; margin-bottom: 20px; text-align: center; }
          .message { color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 30px; }
          .status-badge { display: inline-block; background-color: #fbbf24; color: #92400e; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; margin: 10px 0; }
          .process { background-color: #faf5ff; border: 1px solid #e9d5ff; border-radius: 8px; padding: 30px; margin: 30px 0; }
          .process-item { margin-bottom: 15px; }
          .process-title { color: #6b21a8; font-weight: 600; margin-bottom: 5px; }
          .process-desc { color: #7c2d92; font-size: 14px; }
          .cta-button { display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: 600; margin: 20px 0; }
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
            <h1 class="title">Listing Submitted Successfully! 🎉</h1>

            <div class="message">
              Hi ${escapeHtml(name)},<br><br>

              Your business listing for <strong>"${escapeHtml(businessTitle)}"</strong> has been successfully submitted and is now under review.
            </div>

            <div style="text-align: center;">
              <span class="status-badge">📋 ${status === 'PENDING_REVIEW' ? 'Pending Review' : status}</span>
            </div>

            <div class="process">
              <h3 style="color: #6b21a8; margin-top: 0;">Review Process:</h3>

              <div class="process-item">
                <div class="process-title">✅ Listing Received</div>
                <div class="process-desc">Your listing has been successfully submitted</div>
              </div>

              <div class="process-item">
                <div class="process-title">🔍 Quality Review (1-2 business days)</div>
                <div class="process-desc">Our team reviews your listing for completeness and quality</div>
              </div>

              <div class="process-item">
                <div class="process-title">📈 Optimization (if needed)</div>
                <div class="process-desc">We may suggest improvements to maximize your listing's appeal</div>
              </div>

              <div class="process-item">
                <div class="process-title">🚀 Publication</div>
                <div class="process-desc">Your listing goes live and starts receiving buyer interest</div>
              </div>
            </div>

            <div style="text-align: center;">
              <a href="https://startexus.com/dashboard/listings" class="cta-button">
                View Your Listings →
              </a>
            </div>
          </div>

          <div class="footer">
            <p>Questions about your listing? Contact us at <a href="mailto:listings@startexus.com">listings@startexus.com</a></p>
            <p>StartExus - Your Partner in Business Sales</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: (name: string, businessTitle: string, status: string) => `
      Listing Submitted Successfully!

      Hi ${name},

      Your business listing "${businessTitle}" has been submitted and is now under review.

      Status: ${status === 'PENDING_REVIEW' ? 'Pending Review' : status}

      Review Process:
      - Quality Review (1-2 business days)
      - Optimization (if needed)
      - Publication

      View your listings: https://startexus.com/dashboard/listings

      Questions? Contact listings@startexus.com
    `
  }
}

// Send email function
export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string
  subject: string
  html: string
  text: string
}) {
  try {
    const mailer = await getTransporter()
    const info = await mailer.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@startexus.com',
      to,
      subject,
      html,
      text,
    })

    return { success: true, messageId: info.messageId }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
}

// Convenience functions for specific email types
export async function sendWelcomeEmail(email: string, name: string, role: string) {
  const template = emailTemplates.welcome
  return sendEmail({
    to: email,
    subject: template.subject,
    html: template.html(name, role),
    text: template.text(name, role),
  })
}

export async function sendValuationEmail(email: string, name: string, businessName: string) {
  const template = emailTemplates.valuationReceived
  return sendEmail({
    to: email,
    subject: template.subject,
    html: template.html(name, businessName),
    text: template.text(name, businessName),
  })
}

export async function sendListingCreatedEmail(email: string, name: string, businessTitle: string, status: string) {
  const template = emailTemplates.listingCreated
  return sendEmail({
    to: email,
    subject: template.subject,
    html: template.html(name, businessTitle, status),
    text: template.text(name, businessTitle, status),
  })
}

export async function sendAdminListingNotification(listingData: {
  id: string,
  title: string,
  businessType: string,
  askingPrice: number | null,
  sellerName: string,
  sellerEmail: string
}) {
  const adminEmail = process.env.ADMIN_EMAIL || 'info@startexus.com'

  const subject = `New Listing Pending Review: ${listingData.title}`

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>New Listing Pending Review</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f7fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px 30px; text-align: center; }
        .logo { margin-bottom: 10px; }
        .header-text { color: white; font-size: 16px; opacity: 0.9; }
        .content { padding: 40px 30px; }
        .title { color: #1a202c; font-size: 28px; font-weight: bold; margin-bottom: 20px; text-align: center; }
        .message { color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 30px; }
        .details-box { background-color: #fffbeb; border: 1px solid #fcd34d; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .detail-item { margin-bottom: 10px; }
        .detail-label { color: #78350f; font-weight: 600; }
        .detail-value { color: #92400e; }
        .actions-box { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; }
        .action-item { margin-bottom: 8px; color: #78350f; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        .footer { background-color: #f7fafc; padding: 30px; text-align: center; color: #718096; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo"><img src="https://startexus.com/startexus-light.png" alt="StartExus" width="240" style="display:block;margin:0 auto;" /></div>
          <div class="header-text">Admin Notification</div>
        </div>

        <div class="content">
          <h1 class="title">🔔 New Listing Pending Review</h1>

          <div class="message">
            A new business listing has been submitted and requires admin review.
          </div>

          <div class="details-box">
            <h3 style="color: #78350f; margin-top: 0;">Listing Details:</h3>
            <div class="detail-item">
              <span class="detail-label">Title:</span>
              <span class="detail-value">${escapeHtml(listingData.title)}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Type:</span>
              <span class="detail-value">${listingData.businessType}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Asking Price:</span>
              <span class="detail-value">${listingData.askingPrice ? '$' + (listingData.askingPrice / 100).toLocaleString() : 'Make Offer'}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Seller:</span>
              <span class="detail-value">${escapeHtml(listingData.sellerName)} (${escapeHtml(listingData.sellerEmail)})</span>
            </div>
          </div>

          <div class="actions-box">
            <h4 style="color: #78350f; margin-top: 0;">Actions Required:</h4>
            <div class="action-item">✓ Review the listing details in the admin dashboard</div>
            <div class="action-item">✓ Verify business information and financials</div>
            <div class="action-item">✓ Approve or request modifications</div>
          </div>

          <div style="text-align: center;">
            <a href="https://startexus.com/dashboard/admin/listings/${listingData.id}/edit" class="cta-button">
              Review Listing →
            </a>
          </div>
        </div>

        <div class="footer">
          <p>StartExus Admin System</p>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
    New Business Listing Submitted

    A new business listing has been submitted and requires admin review.

    Listing Details:
    - Title: ${listingData.title}
    - Type: ${listingData.businessType}
    - Asking Price: ${listingData.askingPrice ? '$' + (listingData.askingPrice / 100).toLocaleString() : 'Make Offer'}
    - Seller: ${listingData.sellerName} (${listingData.sellerEmail})

    Actions Required:
    1. Review the listing details in the admin dashboard
    2. Verify business information and financials
    3. Approve or request modifications

    Review at: https://startexus.com/dashboard/admin/listings/${listingData.id}/edit
  `

  return sendEmail({
    to: adminEmail,
    subject,
    html,
    text,
  })
}