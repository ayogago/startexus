# Email Configuration Guide

This guide explains how to set up email functionality for StartExus.

## Email Features Implemented

The following email notifications are now automatically sent:

### 1. Welcome Emails 📧
- **Trigger**: When a new user signs up
- **Recipients**: New users (both buyers and sellers)
- **Content**: Welcome message with role-specific features and getting started information
- **Template**: Beautiful HTML email with StartExus branding

### 2. Valuation Request Confirmations 📊
- **Trigger**: When someone submits a business valuation request
- **Recipients**: The person requesting the valuation
- **Content**: Confirmation of request received, timeline expectations, and what to expect next
- **Admin Notification**: Also sends an internal notification to admin team

### 3. Listing Creation Confirmations 🚀
- **Trigger**: When a seller creates a new business listing
- **Recipients**: The seller who created the listing
- **Content**: Confirmation that listing was submitted, review process timeline, and next steps
- **Template**: Professional email with status updates and dashboard links

## Email Configuration

To enable email functionality, you need to configure the following environment variables in your `.env` file:

```bash
# Email server configuration
EMAIL_SERVER_HOST="smtp.gmail.com"           # SMTP server host
EMAIL_SERVER_PORT=587                         # SMTP port (587 for TLS, 465 for SSL)
EMAIL_SERVER_USER="your-email@gmail.com"     # SMTP username
EMAIL_SERVER_PASSWORD="your-app-password"    # SMTP password (use app password for Gmail)
EMAIL_FROM="noreply@startexus.com"          # From email address
ADMIN_EMAIL="admin@startexus.com"           # Admin email for notifications
```

## Email Provider Setup

### Option 1: Gmail (Recommended for Development)

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this password in `EMAIL_SERVER_PASSWORD`

### Option 2: SendGrid (Recommended for Production)

1. Sign up for SendGrid account
2. Create an API key
3. Update configuration:
   ```bash
   EMAIL_SERVER_HOST="smtp.sendgrid.net"
   EMAIL_SERVER_PORT=587
   EMAIL_SERVER_USER="apikey"
   EMAIL_SERVER_PASSWORD="your-sendgrid-api-key"
   ```

### Option 3: Other SMTP Providers

You can use any SMTP provider (Mailgun, AWS SES, etc.) by updating the configuration accordingly.

## Testing Email Functionality

Run the email test script to verify your configuration:

```bash
npx tsx scripts/test-email.ts
```

This will test all three email types and show you if they're working correctly.

## Email Templates

All email templates are defined in `src/lib/email.ts` and include:

- **HTML Version**: Beautiful, responsive HTML emails with inline CSS
- **Text Version**: Plain text fallback for email clients that don't support HTML
- **Consistent Branding**: StartExus logo, colors, and professional styling
- **Mobile-Friendly**: Responsive design that works on all devices

## Success Messaging

The application now shows appropriate success messages when:

- ✅ User signs up → Mentions welcome email will be sent
- ✅ Valuation submitted → Mentions confirmation email
- ✅ Listing created → Mentions confirmation email and review process

## Production Considerations

1. **Rate Limiting**: Consider implementing rate limiting for email APIs
2. **Queue System**: For high volume, use a queue system (Redis + Bull)
3. **Monitoring**: Set up email delivery monitoring and bounce handling
4. **Compliance**: Ensure GDPR/CAN-SPAM compliance with unsubscribe links
5. **Domain Authentication**: Set up SPF, DKIM, and DMARC for better deliverability

## Troubleshooting

### Common Issues:

1. **"Missing credentials for PLAIN"**
   - Check that EMAIL_SERVER_USER and EMAIL_SERVER_PASSWORD are set
   - Verify the credentials are correct

2. **"Connection timeout"**
   - Check EMAIL_SERVER_HOST and EMAIL_SERVER_PORT
   - Verify your server can reach the SMTP server (firewall/network issues)

3. **"Authentication failed"**
   - For Gmail, ensure you're using an App Password, not your regular password
   - Check that 2FA is enabled on your Google account

4. **Emails not being delivered**
   - Check spam folders
   - Verify FROM email domain is properly configured
   - Consider using a dedicated email service for production

## File Structure

```
src/lib/email.ts                 # Email service and templates
src/app/api/auth/signup/route.ts # Signup API with welcome emails
src/app/api/valuation/route.ts   # Valuation API with confirmations
src/app/api/listings/route.ts    # Listing API with notifications
scripts/test-email.ts            # Email testing script
```

## Future Enhancements

Potential improvements to consider:

- 📧 Email preferences management
- 📬 Digest emails for new listings
- 🔔 Buyer interest notifications for sellers
- 📊 Weekly/monthly analytics emails
- 🎯 Targeted marketing campaigns
- 📝 Email templates editor in admin panel