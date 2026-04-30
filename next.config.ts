import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
  async headers() {
    const scriptSrc = [
      "'self'",
      "'unsafe-eval'",
      "'unsafe-inline'"
    ];

    const connectSrc = [
      "'self'",
      "https://*.supabase.co",
      "wss://*.supabase.co"
    ];

    const frameSrc = [
      "https://*.supabase.co",
      "blob:"
    ];

    const cspValue = `default-src 'self'; script-src ${scriptSrc.join(' ')}; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src ${connectSrc.join(' ')}; media-src 'self' blob:; frame-src ${frameSrc.join(' ')}; frame-ancestors 'self';`;
    
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
          {
            key: 'Content-Security-Policy',
            value: cspValue
          }
        ],
      },
    ]
  },
};

export default nextConfig;
