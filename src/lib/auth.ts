import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

const MAX_FAILED_ATTEMPTS = 5
const LOCKOUT_DURATION_MS = 15 * 60 * 1000 // 15 minutes

async function checkAccountLock(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { lockedUntil: true }
  })

  if (!user?.lockedUntil) return false

  // Check if still locked
  if (new Date() < user.lockedUntil) {
    return true
  }

  // Lock expired, reset
  await prisma.user.update({
    where: { id: userId },
    data: {
      lockedUntil: null,
      failedLoginAttempts: 0
    }
  })

  return false
}

async function recordFailedAttempt(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { failedLoginAttempts: true }
  })

  const newAttempts = (user?.failedLoginAttempts || 0) + 1

  await prisma.user.update({
    where: { id: userId },
    data: {
      failedLoginAttempts: newAttempts,
      lockedUntil: newAttempts >= MAX_FAILED_ATTEMPTS
        ? new Date(Date.now() + LOCKOUT_DURATION_MS)
        : null
    }
  })
}

async function recordSuccessfulLogin(userId: string, ip?: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      failedLoginAttempts: 0,
      lockedUntil: null,
      lastLoginAt: new Date(),
      lastLoginIp: ip || 'unknown'
    }
  })
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please provide email and password')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || !user.password) {
          // Don't reveal whether email exists
          throw new Error('Invalid email or password')
        }

        // Check if account is locked
        const isLocked = await checkAccountLock(user.id)
        if (isLocked) {
          throw new Error('Account temporarily locked due to too many failed login attempts. Please try again in 15 minutes.')
        }

        // Check if account is disabled
        if (user.disabled) {
          throw new Error('This account has been disabled. Please contact support.')
        }

        const isValidPassword = await bcrypt.compare(credentials.password, user.password)

        if (!isValidPassword) {
          await recordFailedAttempt(user.id)
          throw new Error('Invalid email or password')
        }

        // Get IP for suspicious login detection
        const ip = (req as any)?.headers?.['x-forwarded-for']?.split(',')[0] ||
                   (req as any)?.headers?.['x-real-ip'] ||
                   'unknown'

        // Check for suspicious login (different IP)
        const suspiciousLogin = user.lastLoginIp && user.lastLoginIp !== ip && user.lastLoginIp !== 'unknown'

        // Record successful login
        await recordSuccessfulLogin(user.id, ip)

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          verified: user.verified,
          handle: user.handle,
          suspiciousLogin: suspiciousLogin || false,
        }
      }
    }),
  ],
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
    maxAge: 12 * 60 * 60, // 12 hours
    updateAge: 60 * 60, // 1 hour - refresh session every hour
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.handle = user.handle
        token.verified = user.verified
      }
      return token
    },
    session: async ({ session, token }) => {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.handle = token.handle as string
        session.user.verified = token.verified as boolean
      }
      return session
    },
  },
}