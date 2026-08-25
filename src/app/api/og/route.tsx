import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get('title') || 'hzcode — Developer OS';
  const type = searchParams.get('type') || 'SYSTEM ARCHITECTURE';
  const description =
    searchParams.get('description') ||
    'Network & Infrastructure Engineer transitioning to Fullstack Development';

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#0d1117',
          padding: '60px 80px',
          fontFamily: 'monospace',
          color: '#c9d1d9',
          border: '12px solid #161b22',
        }}
      >
        {/* Top Terminal Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '2px solid #30363d',
            paddingBottom: '24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                backgroundColor: '#f85149',
              }}
            />
            <div
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                backgroundColor: '#d29922',
              }}
            />
            <div
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                backgroundColor: '#2ea043',
              }}
            />
            <span
              style={{
                marginLeft: '12px',
                fontSize: '20px',
                color: '#8b949e',
              }}
            >
              hzcode@kernel:~/{type.toLowerCase()}
            </span>
          </div>

          <div
            style={{
              fontSize: '16px',
              padding: '6px 16px',
              borderRadius: '6px',
              backgroundColor: '#161b22',
              border: '1px solid #30363d',
              color: '#58a6ff',
            }}
          >
            {type.toUpperCase()}
          </div>
        </div>

        {/* Content Body */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ color: '#2ea043', fontSize: '32px', fontWeight: 'bold' }}>
              $
            </span>
            <span style={{ color: '#58a6ff', fontSize: '24px' }}>
              cat metadata.json
            </span>
          </div>

          <h1
            style={{
              fontSize: title.length > 45 ? '42px' : '54px',
              fontWeight: 800,
              color: '#f0f6fc',
              lineHeight: 1.15,
              margin: 0,
            }}
          >
            {title}
          </h1>

          <p
            style={{
              fontSize: '22px',
              color: '#8b949e',
              lineHeight: 1.4,
              margin: 0,
            }}
          >
            {description}
          </p>
        </div>

        {/* Footer Brand */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '2px solid #30363d',
            paddingTop: '24px',
            fontSize: '18px',
            color: '#8b949e',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#2ea043', fontWeight: 'bold' }}>~/hzcode</span>
            <span>• Khalid Jundullah</span>
          </div>
          <span>hzcode.my.id</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
