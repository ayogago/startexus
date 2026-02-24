import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const rateLimitMap = new Map<string, { count: number; lastReset: number }>()

const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const MAX_REQUESTS: Record<string, number> = {
  '/api/auth/signup': 5,
  '/api/auth/callback/credentials': 10,
  '/api/newsletter/subscribe': 5,
  '/api/valuation': 5,
  '/api/contact': 5,
}

function getClientIp(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
}

function isRateLimited(key: string, maxRequests: number): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(key)

  if (!entry || now - entry.lastReset > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(key, { count: 1, lastReset: now })
    return false
  }

  entry.count++
  return entry.count > maxRequests
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rate limiting for specific routes
  for (const [route, maxReqs] of Object.entries(MAX_REQUESTS)) {
    if (pathname.startsWith(route) && request.method === 'POST') {
      const ip = getClientIp(request)
      const key = `${ip}:${route}`

      if (isRateLimited(key, maxReqs)) {
        return NextResponse.json(
          { error: 'Too many requests. Please try again later.' },
          { status: 429 }
        )
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/:path*'],
}
