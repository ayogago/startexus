import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'StartExus - Buy & Sell Online Businesses'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 50%, #6366f1 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
        }}
      >
        {/* Background Pattern */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
            background: 'radial-gradient(circle at 20% 20%, white 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '80px',
            zIndex: 1,
          }}
        >
          {/* Logo/Icon */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '40px',
              fontSize: '80px',
            }}
          >
            🚀
          </div>

          {/* Title */}
          <h1
            style={{
              fontSize: '72px',
              fontWeight: 'bold',
              color: 'white',
              margin: 0,
              marginBottom: '24px',
              textShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            }}
          >
            StartExus
          </h1>

          {/* Tagline */}
          <p
            style={{
              fontSize: '36px',
              color: 'rgba(255, 255, 255, 0.9)',
              margin: 0,
              fontWeight: 500,
              maxWidth: '900px',
            }}
          >
            Buy & Sell Online Businesses
          </p>

          {/* Subtitle */}
          <p
            style={{
              fontSize: '24px',
              color: 'rgba(255, 255, 255, 0.8)',
              margin: 0,
              marginTop: '20px',
            }}
          >
            The Marketplace for SaaS, eCommerce & Digital Assets
          </p>
        </div>

        {/* Bottom Badge */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            padding: '16px 32px',
            borderRadius: '999px',
            backdropFilter: 'blur(10px)',
          }}
        >
          <span style={{ color: 'white', fontSize: '20px', fontWeight: 600 }}>
            Trusted by 5,000+ Entrepreneurs
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
