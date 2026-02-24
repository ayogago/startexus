import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  const { secret } = await request.json()
  if (secret !== 'setup-admin-one-time-2024') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const email = 'info@startexus.com'
  const password = 'Ararat88!'
  const hashedPassword = await bcrypt.hash(password, 12)

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN', verified: true, password: hashedPassword, name: 'Admin' },
    })
    return NextResponse.json({ message: 'Updated to admin' })
  }

  await prisma.user.create({
    data: { email, password: hashedPassword, name: 'Admin', role: 'ADMIN', verified: true, emailVerified: new Date() },
  })
  return NextResponse.json({ message: 'Admin created' })
}
