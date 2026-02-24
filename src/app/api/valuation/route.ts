import { NextRequest, NextResponse } from 'next/server'
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
  instantSell: z.boolean().optional(),
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
    sendValuationEmail(validatedData.email, validatedData.fullName, validatedData.businessName).catch(error => {
      console.error('Failed to send valuation confirmation email:', error)
    })

    // Send notification email to admin team
    const adminEmail = process.env.ADMIN_EMAIL || 'info@startexus.com'

    // Check if this is an instant sell request
    const isInstantSell = validatedData.instantSell === true
    const instantBuyoutPrice = validatedData.valuationAmount ? Math.floor(validatedData.valuationAmount * 0.8) : null

    const adminNotification = isInstantSell ? {
      to: adminEmail,
      subject: `🔥 INSTANT SELL REQUEST: ${validatedData.businessName} - $${instantBuyoutPrice?.toLocaleString() || 'N/A'}`,
      html: `
        <div style="background-color: #fef3c7; border: 2px solid #f59e0b; padding: 16px; margin-bottom: 20px; border-radius: 8px;">
          <h2 style="color: #92400e; margin: 0;">🔥 INSTANT SELL REQUEST - IMMEDIATE ACTION REQUIRED</h2>
        </div>

        <h3>Business Overview</h3>
        <p><strong>Business Name:</strong> ${validatedData.businessName}</p>
        <p><strong>Business Type:</strong> ${validatedData.businessType}</p>
        <p><strong>Website:</strong> <a href="${validatedData.websiteUrl}">${validatedData.websiteUrl}</a></p>
        <p><strong>AI Related:</strong> ${validatedData.isAiRelated ? 'Yes' : 'No'}</p>

        <h3 style="color: #059669;">💰 Valuation & Pricing</h3>
        <p><strong>Calculated Valuation:</strong> $${validatedData.valuationAmount?.toLocaleString() || 'N/A'}</p>
        <p><strong>Instant Buyout Offer:</strong> <span style="font-size: 20px; color: #059669; font-weight: bold;">$${instantBuyoutPrice?.toLocaleString() || 'N/A'}</span></p>

        <h3>📊 Financial Metrics</h3>
        <p><strong>Monthly Revenue:</strong> ${validatedData.monthlyRevenue}</p>
        <p><strong>Yearly Revenue:</strong> ${validatedData.yearlyRevenue || 'Not provided'}</p>
        <p><strong>Profit Margin:</strong> ${validatedData.profitMargin || 'Not provided'}</p>
        <p><strong>Growth Rate:</strong> ${validatedData.growthRate || 'Not provided'}</p>
        <p><strong>Assets:</strong> $${validatedData.assets?.toLocaleString() || '0'}</p>
        <p><strong>Liabilities:</strong> $${validatedData.liabilities?.toLocaleString() || '0'}</p>

        <h3>📈 Traffic & Customer Metrics</h3>
        <p><strong>Monthly Traffic:</strong> ${validatedData.monthlyTraffic?.toLocaleString() || 'Not provided'} visitors</p>
        <p><strong>Customer Count:</strong> ${validatedData.customerCount?.toLocaleString() || 'Not provided'}</p>
        <p><strong>Primary Traffic Source:</strong> ${validatedData.primaryTrafficSource || 'Not specified'}</p>

        <h3>⏰ Business Details</h3>
        <p><strong>Months Established:</strong> ${validatedData.monthsEstablished}</p>
        <p><strong>Owner Involvement:</strong> ${validatedData.ownerInvolvement || 'Not specified'}</p>
        <p><strong>Sell Timeframe:</strong> IMMEDIATELY</p>

        <h3>👤 Contact Information</h3>
        <p><strong>Name:</strong> ${validatedData.fullName}</p>
        <p><strong>Email:</strong> <a href="mailto:${validatedData.email}">${validatedData.email}</a></p>
        <p><strong>Phone:</strong> ${validatedData.phone || 'Not provided'}</p>

        <h3>📝 Additional Information</h3>
        <p>${validatedData.additionalInfo || 'None provided'}</p>

        <hr style="margin: 30px 0;">

        <div style="background-color: #dbeafe; padding: 16px; border-radius: 8px; margin-top: 20px;">
          <h3 style="color: #1e40af; margin-top: 0;">⚡ Next Steps</h3>
          <ol style="color: #1e3a8a;">
            <li><strong>Contact the seller within 24 hours</strong> via email or phone</li>
            <li><strong>Request documentation:</strong> revenue proof, traffic analytics, customer data, asset list, business registration, proof of ownership</li>
            <li><strong>Schedule due diligence call</strong> to verify all information</li>
            <li><strong>Complete transaction</strong> once verification is done</li>
          </ol>
        </div>

        <p style="margin-top: 30px;"><a href="https://startexus.com/dashboard/admin/valuations/${valuationRequest.id}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Request in Dashboard</a></p>
      `,
      text: `
        🔥 INSTANT SELL REQUEST - IMMEDIATE ACTION REQUIRED

        Business Overview
        -----------------
        Business Name: ${validatedData.businessName}
        Business Type: ${validatedData.businessType}
        Website: ${validatedData.websiteUrl}
        AI Related: ${validatedData.isAiRelated ? 'Yes' : 'No'}

        💰 Valuation & Pricing
        ----------------------
        Calculated Valuation: $${validatedData.valuationAmount?.toLocaleString() || 'N/A'}
        Instant Buyout Offer: $${instantBuyoutPrice?.toLocaleString() || 'N/A'}

        📊 Financial Metrics
        -------------------
        Monthly Revenue: ${validatedData.monthlyRevenue}
        Yearly Revenue: ${validatedData.yearlyRevenue || 'Not provided'}
        Profit Margin: ${validatedData.profitMargin || 'Not provided'}
        Growth Rate: ${validatedData.growthRate || 'Not provided'}
        Assets: $${validatedData.assets?.toLocaleString() || '0'}
        Liabilities: $${validatedData.liabilities?.toLocaleString() || '0'}

        📈 Traffic & Customer Metrics
        -----------------------------
        Monthly Traffic: ${validatedData.monthlyTraffic?.toLocaleString() || 'Not provided'} visitors
        Customer Count: ${validatedData.customerCount?.toLocaleString() || 'Not provided'}
        Primary Traffic Source: ${validatedData.primaryTrafficSource || 'Not specified'}

        ⏰ Business Details
        ------------------
        Months Established: ${validatedData.monthsEstablished}
        Owner Involvement: ${validatedData.ownerInvolvement || 'Not specified'}
        Sell Timeframe: IMMEDIATELY

        👤 Contact Information
        ---------------------
        Name: ${validatedData.fullName}
        Email: ${validatedData.email}
        Phone: ${validatedData.phone || 'Not provided'}

        📝 Additional Information
        ------------------------
        ${validatedData.additionalInfo || 'None provided'}

        ⚡ Next Steps
        ------------
        1. Contact the seller within 24 hours via email or phone
        2. Request documentation: revenue proof, traffic analytics, customer data, asset list, business registration, proof of ownership
        3. Schedule due diligence call to verify all information
        4. Complete transaction once verification is done

        View Request: https://startexus.com/dashboard/admin/valuations/${valuationRequest.id}
      `
    } : {
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
      sendEmail(adminNotification).catch(error => {
        console.error('Failed to send admin notification:', error)
      })
    })

    return NextResponse.json({
      success: true,
      message: 'Valuation request submitted successfully',
      requestId: valuationRequest.id,
    })
  } catch (error) {
    console.error('Failed to process valuation request:', error)

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
    // For now, return basic response - would need auth check in production
    const valuationRequests = await prisma.valuationRequest.findMany({
      orderBy: { requestedAt: 'desc' },
      take: 50,
    })

    return NextResponse.json({ requests: valuationRequests })
  } catch (error) {
    console.error('Failed to fetch valuation requests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch requests' },
      { status: 500 }
    )
  }
}