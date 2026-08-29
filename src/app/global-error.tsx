'use client';

/**
 * Global Error Boundary — catches errors in the root layout itself.
 *
 * When this renders, the root layout (including fonts, CSS, ThemeProvider)
 * may be unavailable. This fallback must be fully self-contained.
 *
 * Production: no stack traces, no internal paths, no database details.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0a0a0a',
          color: '#e0e0e0',
          fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
        }}
      >
        <div
          style={{
            maxWidth: '480px',
            width: '100%',
            padding: '32px',
            border: '1px solid #333',
            borderRadius: '8px',
            backgroundColor: '#111',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '24px',
              paddingBottom: '16px',
              borderBottom: '1px solid #333',
            }}
          >
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: '#ef4444',
                opacity: 0.7,
              }}
            />
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: '#ca8a04',
                opacity: 0.7,
              }}
            />
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: '#22c55e',
                opacity: 0.7,
              }}
            />
            <span style={{ fontSize: '12px', color: '#666', marginLeft: '8px' }}>
              fatal — recovery
            </span>
          </div>

          <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
            <p>
              <span style={{ color: '#22c55e' }}>$ </span>
              <span>initialize application</span>
            </p>
            <p style={{ color: '#ef4444' }}>
              Fatal: A critical error occurred during page rendering.
            </p>
            {error.digest && (
              <p style={{ color: '#666', fontSize: '12px' }}>
                error id: {error.digest}
              </p>
            )}
          </div>

          <div
            style={{
              marginTop: '32px',
              paddingTop: '24px',
              borderTop: '1px solid #333',
            }}
          >
            <p style={{ color: '#999', marginBottom: '24px' }}>
              The application encountered a critical error. Try reloading or return to the home page.
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                onClick={reset}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #22c55e',
                  color: '#22c55e',
                  backgroundColor: 'transparent',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontSize: '14px',
                }}
              >
                $ reload
              </button>
              <a
                href="/"
                style={{
                  padding: '8px 16px',
                  border: '1px solid #333',
                  color: '#999',
                  textDecoration: 'none',
                  borderRadius: '4px',
                  fontSize: '14px',
                }}
              >
                $ cd ~/hzcode
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
