import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'Yeme İçme İşleri - Restoran ve Kafe İş İlanları'
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
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #60a5fa 100%)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Logo/Icon */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 120,
            height: 120,
            borderRadius: 24,
            background: 'white',
            marginBottom: 40,
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          }}
        >
          <svg
            width="70"
            height="70"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#1e3a8a"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
            <path d="M7 2v20" />
            <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
          </svg>
        </div>

        {/* Title */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <h1
            style={{
              fontSize: 64,
              fontWeight: 800,
              color: 'white',
              margin: 0,
              marginBottom: 16,
              textShadow: '0 2px 10px rgba(0,0,0,0.2)',
            }}
          >
            Yeme İçme İşleri
          </h1>
          <p
            style={{
              fontSize: 32,
              color: 'rgba(255,255,255,0.9)',
              margin: 0,
              fontWeight: 500,
            }}
          >
            Restoran ve Kafe İş İlanları
          </p>
        </div>

        {/* Tagline */}
        <div
          style={{
            display: 'flex',
            marginTop: 48,
            gap: 24,
          }}
        >
          {['Garson', 'Aşçı', 'Barista', 'Kurye'].map((job) => (
            <div
              key={job}
              style={{
                display: 'flex',
                padding: '12px 24px',
                background: 'rgba(255,255,255,0.2)',
                borderRadius: 999,
                color: 'white',
                fontSize: 20,
                fontWeight: 600,
              }}
            >
              {job}
            </div>
          ))}
        </div>

        {/* Footer URL */}
        <div
          style={{
            position: 'absolute',
            bottom: 32,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            color: 'rgba(255,255,255,0.8)',
            fontSize: 24,
          }}
        >
          <span>yemeicmeisleri.com</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
