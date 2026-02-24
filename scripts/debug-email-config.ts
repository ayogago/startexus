#!/usr/bin/env npx tsx

import { config } from 'dotenv'

// Load environment variables
config()

console.log('🔍 Debugging email configuration...\n')

console.log('Environment variables:')
console.log('EMAIL_SERVER_HOST:', process.env.EMAIL_SERVER_HOST || 'NOT SET')
console.log('EMAIL_SERVER_PORT:', process.env.EMAIL_SERVER_PORT || 'NOT SET')
console.log('EMAIL_SERVER_USER:', process.env.EMAIL_SERVER_USER || 'NOT SET')
console.log('EMAIL_SERVER_PASSWORD:', process.env.EMAIL_SERVER_PASSWORD ? '***HIDDEN***' : 'NOT SET')
console.log('EMAIL_FROM:', process.env.EMAIL_FROM || 'NOT SET')
console.log('ADMIN_EMAIL:', process.env.ADMIN_EMAIL || 'NOT SET')

console.log('\nChecking auth object:')
const auth = {
  user: process.env.EMAIL_SERVER_USER,
  pass: process.env.EMAIL_SERVER_PASSWORD,
}
console.log('Auth user:', auth.user || 'EMPTY')
console.log('Auth pass:', auth.pass ? 'SET' : 'EMPTY')

if (!auth.user || !auth.pass) {
  console.log('\n❌ Missing credentials detected!')
  console.log('Make sure EMAIL_SERVER_USER and EMAIL_SERVER_PASSWORD are properly set in .env file')
} else {
  console.log('\n✅ Credentials appear to be set')
}