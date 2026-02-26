import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendValuationEmail } from '@/lib/email'
import { z } from 'zod'

const valuationSchema = z.object({
  businessName: z.string().min(1, 'Business name is required'),
  businessType: z.string().min(1, 'Business type is required'),
  websiteUrl: z.string().url('Valid website URL is required'),
  monthlyRevenue: z.string().min(1, 'Monthly revenue range is required'),
  yearlyRevenue: z.string().optional(),
  profitMargin: z.string().optional(),
  monthsEstablished: z.string().min(1, 'Business age is required'),
  primaryTrafficSource: z.string().optional(),
  isAiRelated: z.boolean().optional(),
  sellTimeframe: z.string().optional(),
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  additionalInfo: z.string().optional(),
  valuationAmount: z.number().optional(),
  monthlyTraffic: z.number().optional(),
  customerCount: z.number().optional(),
  growthRate: z.string().optional(),
  assets: z.number().optional(),
  liabilities: z.number().optional(),
  ownerInvolvement: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = valuationSchema.parse(body)

    // Store valuation request in database
    const valuationRequest = await prisma.valuationRequest.create({
      data: {
        businessName: validatedData.businessName,
        businessType: validatedData.businessType,
        websiteUrl: validatedData.websiteUrl,
        monthlyRevenue: validatedData.monthlyRevenue,
        yearlyRevenue: validatedData.yearlyRevenue,
        profitMargin: validatedData.profitMargin,
        monthsEstablished: validatedData.monthsEstablished,
        primaryTrafficSource: validatedData.primaryTrafficSource,
        isAiRelated: validatedData.isAiRelated,
        sellTimeframe: validatedData.sellTimeframe,
        contactName: validatedData.fullName,
        contactEmail: validatedData.email,
        contactPhone: validatedData.phone,
        additionalInfo: validatedData.additionalInfo,
        status: 'PENDING',
        requestedAt: new Date(),
      },
    })

    // Send confirmation email to the requester
    sendValuationEmail(validatedData.email, validatedData.fullName, validatedData.businessName).catch((error) => {
      console.error('Failed to send valuation confirmation email:', error)
    })

    // Send notification email to admin team
    const adminEmail = process.env.ADMIN_EMAIL || 'info@startexus.com'

    const adminNotification = {
      to: adminEmail,
      subject: `New Valuation Request: ${validatedData.businessName}`,
      html: `
        <h2>New Valuation Request Received</h2>
        <p><strong>Business:</strong> ${validatedData.businessName}</p>
        <p><strong>Type:</strong> ${validatedData.businessType}</p>
        <p><strong>Website:</strong> ${validatedData.websiteUrl}</p>
        <p><strong>Monthly Revenue:</strong> ${validatedData.monthlyRevenue}</p>
        <p><strong>Contact:</strong> ${validatedData.fullName} (${validatedData.email})</p>
        <p><strong>Phone:</strong> ${validatedData.phone || 'Not provided'}</p>
        <p><strong>Timeframe:</strong> ${validatedData.sellTimeframe || 'Not specified'}</p>
        <p><strong>Additional Info:</strong> ${validatedData.additionalInfo || 'None'}</p>
        <p><a href="https://startexus.com/dashboard/admin/valuations/${valuationRequest.id}">View Request</a></p>
      `,
      text: `
        New Valuation Request Received

        Business: ${validatedData.businessName}
        Type: ${validatedData.businessType}
        Website: ${validatedData.websiteUrl}
        Monthly Revenue: ${validatedData.monthlyRevenue}
        Contact: ${validatedData.fullName} (${validatedData.email})
        Phone: ${validatedData.phone || 'Not provided'}
        Timeframe: ${validatedData.sellTimeframe || 'Not specified'}
        Additional Info: ${validatedData.additionalInfo || 'None'}
      `
    }

    // Don't wait for admin email to complete
    import('@/lib/email').then(({ sendEmail }) => {
      sendEmail(adminNotification).catch((error) => {
        console.error('Failed to send admin valuation notification:', error)
      })
    })

    return NextResponse.json({
      success: true,
      message: 'Valuation request submitted successfully',
      requestId: valuationRequest.id,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to submit valuation request' },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve valuation requests (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const valuationRequests = await prisma.valuationRequest.findMany({
      orderBy: { requestedAt: 'desc' },
      take: 50,
    })

    return NextResponse.json({ requests: valuationRequests })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch requests' },
      { status: 500 }
    )
  }
}