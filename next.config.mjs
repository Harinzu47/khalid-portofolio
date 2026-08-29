/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
      {
        source: '/(images|icons|fonts)/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/projects',
        destination: '/work',
        permanent: true,
      },
      {
        source: '/projects/:slug',
        destination: '/work/:slug',
        permanent: true,
      },
      {
        source: '/articles',
        destination: '/system?type=ARTICLE',
        permanent: true,
      },
      {
        source: '/notes',
        destination: '/system?type=TECH_NOTE',
        permanent: true,
      },
      {
        source: '/journal',
        destination: '/system?type=JOURNAL_ENTRY',
        permanent: true,
      },
      {
        source: '/certificates',
        destination: '/expertise',
        permanent: true,
      },
      {
        source: '/roadmap',
        destination: '/now',
        permanent: true,
      },
      {
        source: '/graph',
        destination: '/system',
        permanent: true,
      },
      {
        source: '/terminal',
        destination: '/about',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/os',
        destination: '/admin',
      },
      {
        source: '/os/:path*',
        destination: '/admin/:path*',
      },
    ];
  },
};

export default nextConfig;
