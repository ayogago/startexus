const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function setAdminPassword() {
  const email = process.argv[2]
  const password = process.argv[3]

  if (!email || !password) {
    console.error('❌ Please provide email and password')
    console.log('Usage: node scripts/set-admin-password.js <email> <password>')
    process.exit(1)
  }

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Update the user with the hashed password
    const user = await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        role: 'ADMIN',
        verified: true,
      },
    })

    console.log(`✅ Password set for admin user: ${user.email}`)
    console.log('🔑 You can now sign in with your email and password!')

  } catch (error) {
    console.error('❌ Failed to set password:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

setAdminPassword()