import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const sampleListings = [
  {
    title: "Profitable SaaS Project Management Tool",
    businessType: "SAAS",
    category: "Productivity",
    askingPrice: 15000000, // $150,000
    priceType: "ASKING",
    revenueTtm: 12000000, // $120,000
    profitTtm: 8000000, // $80,000
    mrr: 800000, // $8,000
    trafficTtm: 600000, // 50k monthly
    monetization: JSON.stringify(["Subscriptions", "Freemium"]),
    platform: JSON.stringify(["Web App"]),
    techStack: JSON.stringify(["React", "Node.js", "PostgreSQL", "Stripe"]),
    establishedAt: new Date("2021-03-15"),
    workloadHrsPerWk: 15,
    teamSize: 2,
    description: "A modern project management SaaS that helps teams organize tasks, track progress, and collaborate effectively. Built with a focus on simplicity and user experience, it has grown to serve over 1,000 paying customers across various industries.",
    highlights: JSON.stringify([
      "1,000+ paying customers with 95% satisfaction rate",
      "150% year-over-year revenue growth",
      "Minimal customer acquisition cost through organic growth",
      "Proven product-market fit in competitive niche"
    ]),
    growthOps: JSON.stringify([
      "Expand to mobile applications (iOS/Android)",
      "Add advanced reporting and analytics features",
      "Implement team collaboration tools",
      "Target enterprise customers with custom plans"
    ]),
    risks: JSON.stringify([
      "Competition from larger established players",
      "Dependency on organic growth channels"
    ]),
    assetsIncluded: JSON.stringify([
      "Complete source code and documentation",
      "Customer database and analytics",
      "Social media accounts and domain",
      "All intellectual property rights"
    ]),
    reasonForSale: "Founder moving to pursue new venture in different industry.",
    location: "United States",
    siteUrl: "https://example-pm-tool.com",
    confidential: false,
    ndaRequired: false,
  },
  {
    title: "Thriving E-commerce Beauty Brand",
    businessType: "ECOMMERCE",
    category: "Beauty & Cosmetics",
    askingPrice: 25000000, // $250,000
    priceType: "ASKING",
    revenueTtm: 18000000, // $180,000
    profitTtm: 5400000, // $54,000
    trafficTtm: 1200000, // 100k monthly
    monetization: JSON.stringify(["Direct Sales", "Affiliate"]),
    platform: JSON.stringify(["Shopify", "Instagram"]),
    techStack: JSON.stringify(["Shopify", "Facebook Ads", "Google Analytics"]),
    establishedAt: new Date("2020-06-10"),
    workloadHrsPerWk: 25,
    teamSize: 3,
    description: "A direct-to-consumer beauty brand specializing in natural, cruelty-free cosmetics. Built strong social media presence with 50k+ Instagram followers and consistent monthly sales growth.",
    highlights: JSON.stringify([
      "50,000+ social media followers across platforms",
      "30% repeat customer rate",
      "Featured in 3 major beauty publications",
      "Strong brand recognition in natural beauty niche"
    ]),
    growthOps: JSON.stringify([
      "Expand product line with new categories",
      "Enter international markets",
      "Develop subscription box service",
      "Partner with beauty influencers"
    ]),
    risks: JSON.stringify([
      "Seasonal fluctuations in sales",
      "Supply chain dependencies",
      "Social media algorithm changes"
    ]),
    assetsIncluded: JSON.stringify([
      "All inventory and product formulations",
      "Social media accounts and email list",
      "Supplier relationships and contracts",
      "Brand trademarks and designs"
    ]),
    reasonForSale: "Owner relocating internationally and cannot manage operations.",
    location: "California, USA",
    siteUrl: "https://example-beauty-brand.com",
    confidential: false,
    ndaRequired: true,
  },
  {
    title: "Niche Content Website in Finance",
    businessType: "CONTENT",
    category: "Finance & Investment",
    askingPrice: 8000000, // $80,000
    priceType: "ASKING",
    revenueTtm: 4800000, // $48,000
    profitTtm: 4200000, // $42,000
    trafficTtm: 2400000, // 200k monthly
    monetization: JSON.stringify(["Advertising", "Affiliate", "Sponsored Content"]),
    platform: JSON.stringify(["WordPress", "Google AdSense"]),
    techStack: JSON.stringify(["WordPress", "Google Analytics", "Mailchimp"]),
    establishedAt: new Date("2019-01-20"),
    workloadHrsPerWk: 10,
    teamSize: 1,
    description: "An authoritative finance blog covering personal finance, investing, and cryptocurrency. Consistently ranks #1 for several high-value keywords and has built a loyal readership of finance enthusiasts.",
    highlights: JSON.stringify([
      "200,000+ monthly organic visitors",
      "Ranks #1 for 15+ high-value finance keywords",
      "Email list of 25,000 engaged subscribers",
      "Consistent revenue growth for 3+ years"
    ]),
    growthOps: JSON.stringify([
      "Launch online courses and digital products",
      "Expand into video content (YouTube)",
      "Develop mobile app for content consumption",
      "Add premium membership tier"
    ]),
    risks: JSON.stringify([
      "Google algorithm changes affecting traffic",
      "Ad revenue fluctuations",
      "Single person dependency"
    ]),
    assetsIncluded: JSON.stringify([
      "WordPress website and all content",
      "Email subscriber list",
      "Social media accounts",
      "Domain name and hosting accounts"
    ]),
    reasonForSale: "Author pursuing full-time employment opportunity.",
    location: "Remote",
    siteUrl: "https://example-finance-blog.com",
    confidential: true,
    ndaRequired: false,
  }
]

const sampleUsers = [
  {
    email: "admin@startexus.com",
    name: "Admin User",
    role: "ADMIN",
    verified: true,
    handle: "admin",
    password: "admin123", // Will be hashed during creation
  },
  {
    email: "seller1@example.com",
    name: "John Smith",
    role: "SELLER",
    verified: true,
    handle: "johnsmith",
    bio: "Serial entrepreneur with 10+ years building and selling online businesses.",
    company: "Smith Ventures",
    location: "San Francisco, CA",
    password: "seller123",
  },
  {
    email: "seller2@example.com",
    name: "Sarah Johnson",
    role: "SELLER",
    verified: true,
    handle: "sarahjohnson",
    bio: "E-commerce expert specializing in direct-to-consumer brands.",
    company: "Johnson Digital",
    location: "Austin, TX",
    password: "seller123",
  },
  {
    email: "buyer1@example.com",
    name: "Mike Chen",
    role: "BUYER",
    verified: false,
    handle: "mikechen",
    bio: "Looking to acquire my first online business.",
    location: "New York, NY",
    password: "buyer123",
  },
  {
    email: "buyer2@example.com",
    name: "Lisa Williams",
    role: "BUYER",
    verified: true,
    handle: "lisawilliams",
    bio: "Investment professional focused on digital assets.",
    company: "Digital Acquisitions Fund",
    location: "London, UK",
    password: "buyer123",
  }
]

async function main() {
  console.log('🌱 Starting seed...')

  // Create users
  console.log('Creating users...')
  const users = []
  for (const userData of sampleUsers) {
    const { password, ...userDataWithoutPassword } = userData
    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        ...userDataWithoutPassword,
        password: hashedPassword,
        emailVerified: new Date(), // Mark as verified since we're creating them directly
      },
    })
    users.push(user)
    console.log(`✓ Created user: ${user.email}`)
  }

  // Get sellers for listings
  const sellers = users.filter(u => u.role === 'SELLER')

  // Create listings
  console.log('Creating listings...')
  const listings = []
  for (let i = 0; i < sampleListings.length; i++) {
    const listingData = sampleListings[i]
    const seller = sellers[i % sellers.length]

    // Generate slug from title
    const slug = listingData.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')

    const listing = await prisma.listing.create({
      data: {
        ...listingData,
        sellerId: seller.id,
        slug: `${slug}-${Date.now()}`, // Add timestamp to ensure uniqueness
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
    })

    // Add sample images
    await prisma.listingImage.create({
      data: {
        listingId: listing.id,
        url: `https://images.unsplash.com/photo-${1600000000000 + i}?w=800&h=600&fit=crop`,
        alt: `${listing.title} screenshot`,
        order: 0,
      },
    })

    listings.push(listing)
    console.log(`✓ Created listing: ${listing.title}`)
  }

  // Create some saved listings
  console.log('Creating saved listings...')
  const buyers = users.filter(u => u.role === 'BUYER')
  for (const buyer of buyers) {
    // Each buyer saves 1-2 random listings
    const numToSave = Math.floor(Math.random() * 2) + 1
    const shuffledListings = [...listings].sort(() => 0.5 - Math.random())

    for (let i = 0; i < Math.min(numToSave, shuffledListings.length); i++) {
      const listing = shuffledListings[i]
      await prisma.savedListing.create({
        data: {
          userId: buyer.id,
          listingId: listing.id,
        },
      })

      // Update favorites count
      await prisma.listing.update({
        where: { id: listing.id },
        data: { favorites: { increment: 1 } },
      })
    }
  }

  // Create some message threads and messages
  console.log('Creating message threads...')
  for (let i = 0; i < 3; i++) {
    const buyer = buyers[i % buyers.length]
    const listing = listings[i % listings.length]
    const seller = await prisma.user.findUnique({ where: { id: listing.sellerId } })

    if (seller && buyer.id !== seller.id) {
      const thread = await prisma.thread.create({
        data: {
          listingId: listing.id,
          participants: {
            create: [
              {
                userId: buyer.id,
                roleInThread: 'BUYER',
              },
              {
                userId: seller.id,
                roleInThread: 'SELLER',
              },
            ],
          },
        },
      })

      // Add some sample messages
      const messages = [
        { senderId: buyer.id, body: `Hi! I'm interested in your listing "${listing.title}". Could you share more details about the revenue breakdown?` },
        { senderId: seller.id, body: "Hello! Thanks for your interest. I'd be happy to share more details. The revenue comes primarily from monthly subscriptions with some one-time purchases." },
        { senderId: buyer.id, body: "That sounds great. What's the customer churn rate and how do you handle customer support currently?" },
      ]

      for (let index = 0; index < messages.length; index++) {
        const messageData = messages[index];
        await prisma.message.create({
          data: {
            threadId: thread.id,
            senderId: messageData.senderId,
            body: messageData.body,
            readBy: JSON.stringify([messageData.senderId]),
            createdAt: new Date(Date.now() - (messages.length - index) * 60 * 60 * 1000), // Space messages 1 hour apart
          },
        })
      }

      await prisma.thread.update({
        where: { id: thread.id },
        data: { lastMessageAt: new Date() },
      })

      console.log(`✓ Created thread for listing: ${listing.title}`)
    }
  }

  console.log('🎉 Seed completed successfully!')
  console.log('\n📊 Summary:')
  console.log(`- ${users.length} users created`)
  console.log(`- ${listings.length} listings created`)
  console.log(`- Sample threads and messages created`)
  console.log('\n🔑 Test accounts:')
  console.log('Admin: admin@startexus.com / admin123')
  console.log('Seller: seller1@example.com / seller123')
  console.log('Buyer: buyer1@example.com / buyer123')
  console.log('Use email/password to sign in.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })