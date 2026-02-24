import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { SessionProvider } from '@/components/providers/session-provider'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

const inter = Inter({ subsets: ['latin'] })

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export const metadata: Metadata = {
  title: {
    default: 'StartExus - Buy & Sell Online Businesses',
    template: '%s | StartExus'
  },
  description: 'The marketplace for buying and selling online businesses, SaaS, ecommerce, and digital assets. Find profitable businesses for sale or list your business with thousands of qualified buyers.',
  keywords: [
    'buy business online',
    'sell business online',
    'online business marketplace',
    'SaaS for sale',
    'ecommerce business sale',
    'business broker',
    'digital assets',
    'website flipping',
    'online business acquisition',
    'business investment'
  ],
  authors: [{ name: 'StartExus' }],
  creator: 'StartExus',
  publisher: 'StartExus',
  metadataBase: new URL('https://startexus.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://startexus.com',
    siteName: 'StartExus',
    title: 'StartExus - Buy & Sell Online Businesses',
    description: 'The marketplace for buying and selling online businesses, SaaS, ecommerce, and digital assets. Find profitable businesses for sale or list your business with thousands of qualified buyers.',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'StartExus - Online Business Marketplace',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@startexus',
    creator: '@startexus',
    title: 'StartExus - Buy & Sell Online Businesses',
    description: 'The marketplace for buying and selling online businesses, SaaS, ecommerce, and digital assets.',
    images: ['/og-image.svg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-code', // Replace with actual verification code
  },
  icons: {
    icon: [
      {
        url: '/favicon.svg',
        type: 'image/svg+xml',
      },
      {
        url: '/favicon.ico',
        sizes: '32x32',
        type: 'image/x-icon',
      },
    ],
    shortcut: '/favicon.ico',
    apple: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-TRPWHJPK4Z"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-TRPWHJPK4Z');
            `,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "StartExus",
              "alternateName": "StartExus Business Marketplace",
              "url": "https://startexus.com",
              "logo": "https://startexus.com/favicon.svg",
              "description": "The marketplace for buying and selling online businesses, SaaS, ecommerce, and digital assets.",
              "foundingDate": "2023",
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "customer service",
                "url": "https://startexus.com/contact"
              },
              "sameAs": [
                "https://twitter.com/startexus"
              ],
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://startexus.com/browse?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "StartExus",
              "url": "https://startexus.com",
              "description": "The marketplace for buying and selling online businesses, SaaS, ecommerce, and digital assets.",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://startexus.com/browse?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
      </head>
      <body className={inter.className}>
        <SessionProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </SessionProvider>
      </body>
    </html>
  )
}