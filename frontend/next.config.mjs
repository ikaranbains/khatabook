/** @type {import('next').NextConfig} */
const isProduction = process.env.NODE_ENV === "production";
const defaultBackendUrl = isProduction
  ? "https://khatabook-backend-mdl7.onrender.com"
  : "http://localhost:5000";

const backendBaseUrl = (process.env.BACKEND_URL || defaultBackendUrl)
  .replace(/\/$/, "")
  .replace(/\/api\/v1\/?$/, "");

const nextConfig = {
  /* Config options for SEO and performance */
  
  // Enable SWR (stale-while-revalidate) for better caching
  onDemandEntries: {
    maxInactiveAge: 60 * 60 * 1000, // 1 hour
    pagesBufferLength: 5,
  },

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year for versioned images
  },

  // Compression
  compress: true,

  // Headers for SEO
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
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
            value: 'geolocation=(), microphone=(), camera=()',
          },
        ],
      },
      {
        source: '/sitemap.xml',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/xml; charset=utf-8',
          },
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=86400, stale-while-revalidate=604800',
          },
        ],
      },
      {
        source: '/robots.txt',
        headers: [
          {
            key: 'Content-Type',
            value: 'text/plain',
          },
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=2592000, stale-while-revalidate=2592000',
          },
        ],
      },
    ];
  },

  // Redirects for SEO
  async redirects() {
    return [
      {
        source: '/index',
        destination: '/',
        permanent: true,
      },
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },

  // Rewrites for clean URLs
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [
        {
          source: "/api/v1/:path*",
          destination: `${backendBaseUrl}/api/v1/:path*`,
        },
      ],
      fallback: [],
    };
  },

  // Turbopack configuration for Next.js 16
  turbopack: {},
};

export default nextConfig;
