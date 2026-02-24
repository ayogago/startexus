#!/usr/bin/env npx tsx

import { config } from 'dotenv'
import { sendWelcomeEmail, sendValuationEmail, sendListingCreatedEmail } from '../src/lib/email'

// Load environment variables
config()

async function testEmails() {
  console.log('🧪 Testing email functionality...\n')

  // Test welcome email
  console.log('📧 Testing welcome email...')
  try {
    const result1 = await sendWelcomeEmail('test@example.com', 'John Doe', 'BUYER')
    console.log('✅ Welcome email:', result1.success ? 'SUCCESS' : 'FAILED')
    if (!result1.success) console.log('   Error:', result1.error)
  } catch (error) {
    console.log('❌ Welcome email FAILED:', error instanceof Error ? error.message : String(error))
  }

  console.log()

  // Test valuation email
  console.log('📧 Testing valuation confirmation email...')
  try {
    const result2 = await sendValuationEmail('test@example.com', 'Jane Smith', 'My SaaS Business')
    console.log('✅ Valuation email:', result2.success ? 'SUCCESS' : 'FAILED')
    if (!result2.success) console.log('   Error:', result2.error)
  } catch (error) {
    console.log('❌ Valuation email FAILED:', error instanceof Error ? error.message : String(error))
  }

  console.log()

  // Test listing created email
  console.log('📧 Testing listing created email...')
  try {
    const result3 = await sendListingCreatedEmail('test@example.com', 'Bob Johnson', 'Profitable E-commerce Store', 'PENDING_REVIEW')
    console.log('✅ Listing created email:', result3.success ? 'SUCCESS' : 'FAILED')
    if (!result3.success) console.log('   Error:', result3.error)
  } catch (error) {
    console.log('❌ Listing created email FAILED:', error instanceof Error ? error.message : String(error))
  }

  console.log('\n🏁 Email testing complete!')
  console.log('\n📝 Note: If emails are failing, please check your email configuration in .env file:')
  console.log('   - EMAIL_SERVER_HOST')
  console.log('   - EMAIL_SERVER_PORT')
  console.log('   - EMAIL_SERVER_USER')
  console.log('   - EMAIL_SERVER_PASSWORD')
  console.log('   - EMAIL_FROM')
}

testEmails().catch(console.error)