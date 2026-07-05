import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'NOIR RIDE — Премиальный трансфер в Москве';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0a0a0a',
          fontFamily: 'serif',
          position: 'relative',
        }}
      >
        {/* Subtle grid pattern */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(196,160,80,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(196,160,80,0.05) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* Top accent line */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'linear-gradient(90deg, transparent, #c4a050, transparent)',
          }}
        />

        {/* Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '32px',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              border: '2px solid #c4a050',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#c4a050',
              fontSize: '20px',
              fontWeight: 700,
              letterSpacing: '1px',
            }}
          >
            N
          </div>
          <span
            style={{
              fontSize: '36px',
              fontWeight: 700,
              letterSpacing: '8px',
              color: '#f5f0e8',
            }}
          >
            NOIR RIDE
          </span>
        </div>

        {/* Divider */}
        <div
          style={{
            width: '120px',
            height: '1px',
            backgroundColor: '#c4a050',
            marginBottom: '32px',
            opacity: 0.6,
          }}
        />

        {/* Tagline */}
        <div
          style={{
            fontSize: '22px',
            color: '#c4a050',
            letterSpacing: '4px',
            fontWeight: 400,
            textTransform: 'uppercase',
            marginBottom: '16px',
          }}
        >
          Премиальный трансфер
        </div>

        <div
          style={{
            fontSize: '16px',
            color: 'rgba(245,240,232,0.5)',
            letterSpacing: '2px',
          }}
        >
          МОСКВА · АЭРОПОРТЫ · МЕЖГОРОД
        </div>

        {/* Bottom accent */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'linear-gradient(90deg, transparent, #c4a050, transparent)',
          }}
        />
      </div>
    ),
    { ...size },
  );
}
