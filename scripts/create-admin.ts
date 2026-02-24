#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createAdmin() {
  const email = process.argv[2]

  if (!email) {
    console.error('❌ Please provide an email address')
    console.log('Usage: npm run create-admin <email>')
    process.exit(1)
  }

  try {
    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email },
    })

    if (user) {
      // Update existing user to admin
      user = await prisma.user.update({
        where: { email },
        data: {
          role: 'ADMIN',
          verified: true,
        },
      })
      console.log(`✅ Updated existing user ${email} to admin`)
    } else {
      // Create new admin user
      user = await prisma.user.create({
        data: {
          email,
          role: 'ADMIN',
          verified: true,
          name: 'Admin User',
        },
      })
      console.log(`✅ Created new admin user: ${email}`)
    }

    console.log('\n🔑 Admin user details:')
    console.log(`Email: ${user.email}`)
    console.log(`Role: ${user.role}`)
    console.log(`Verified: ${user.verified}`)
    console.log('\n💡 Use the magic link sign-in to access the admin dashboard.')

  } catch (error) {
    console.error('❌ Failed to create admin user:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()