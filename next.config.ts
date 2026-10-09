import type { NextConfig } from "next";
import os from "os";
import path from "path";

// Dynamically discover all active local IPv4 addresses so any Wi-Fi IP and tunnels are allowed
function getDevAllowedOrigins(): string[] {
  const origins = [
    "localhost",
    "localhost:3000",
    "127.0.0.1",
    "127.0.0.1:3000",
    "*.ngrok-free.app",
    "*.ngrok.io",
    "*.ngrok.app",
    "*.loca.lt",
    "*.trycloudflare.com",
    "*.local",
  ];

  try {
    const interfaces = os.networkInterfaces();
    for (const addrs of Object.values(interfaces)) {
      if (!addrs) continue;
      for (const addr of addrs) {
        if (addr.family === "IPv4") {
          origins.push(addr.address);
          origins.push(`${addr.address}:3000`);
          origins.push(`${addr.address}:80`);
          origins.push(`${addr.address}:81`);
        }
      }
    }
  } catch { }

  return Array.from(new Set(origins));
}

const devOrigins = getDevAllowedOrigins();

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  // Allow Turbopack dev server and HMR WebSockets from local network IPs and tunnels
  allowedDevOrigins: devOrigins,

  output: "standalone",
  transpilePackages: ["next-auth"],
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,

  // ── Security Headers (applied to ALL responses) ──────────────────
  async headers() {
    return [
      {
        // Apply to all routes
        source: "/(.*)",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          // HSTS — enforce HTTPS in production (1 year, include subdomains)
          // Only enable in production — localhost and LAN IPs don't have HTTPS
          {
            key: "Strict-Transport-Security",
            value:
              process.env.NODE_ENV === "production"
                ? "max-age=31536000; includeSubDomains; preload"
                : "max-age=0",
          },
        ],
      },
      {
        // Apply to API routes only — stricter CORS & no caching
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, private, max-age=0, must-revalidate",
          },
          {
            key: "Pragma",
            value: "no-cache",
          },
        ],
      },
    ];
  },

  // ── Body Size Limits & Server Actions ─────────────────────────────
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
      allowedOrigins: devOrigins,
    },
  },

  // ── Allowed External Images ─────────────────────────────────────
  images: {
    qualities: [75, 80],
    remotePatterns: [
      // Allow images from the gallery directory (local)
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  // ── Redirects for admin dashboard aliases ──────────────────────
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/admin/dashboard',
        permanent: false,
      },
      {
        source: '/admin-dashboard',
        destination: '/admin/dashboard',
        permanent: false,
      },
      {
        source: '/admindashboard',
        destination: '/admin/dashboard',
        permanent: false,
      },
      {
        source: '/admin/dashbord',
        destination: '/admin/dashboard',
        permanent: false,
      },
      // Service aliases & plural/singular redirects
      {
        source: '/service',
        destination: '/services',
        permanent: false,
      },
      {
        source: '/services/wedding',
        destination: '/services/wedding-photography',
        permanent: false,
      },
      {
        source: '/services/weddings',
        destination: '/services/wedding-photography',
        permanent: false,
      },
      {
        source: '/services/indoor',
        destination: '/services/indoor-photography',
        permanent: false,
      },
      {
        source: '/services/portrait',
        destination: '/services/indoor-photography',
        permanent: false,
      },
      {
        source: '/services/portraits',
        destination: '/services/indoor-photography',
        permanent: false,
      },
      {
        source: '/service/wedding-photography',
        destination: '/services/wedding-photography',
        permanent: false,
      },
      {
        source: '/service/indoor-photography',
        destination: '/services/indoor-photography',
        permanent: false,
      },
      {
        source: '/service/wedding',
        destination: '/services/wedding-photography',
        permanent: false,
      },
      {
        source: '/service/indoor',
        destination: '/services/indoor-photography',
        permanent: false,
      },
      // Admin dashboard tab aliases
      {
        source: '/admin/services',
        destination: '/admin/dashboard?tab=services',
        permanent: false,
      },
      {
        source: '/admin/gallery',
        destination: '/admin/dashboard?tab=gallery',
        permanent: false,
      },
      {
        source: '/admin/bookings',
        destination: '/admin/dashboard?tab=bookings',
        permanent: false,
      },
      {
        source: '/admin/messages',
        destination: '/admin/dashboard?tab=messages',
        permanent: false,
      },
      {
        source: '/admin/payments',
        destination: '/admin/dashboard?tab=payments',
        permanent: false,
      },
    ]
  },

  // ── Rewrites for backward-compatible image paths ──────────────
  async rewrites() {
    return [
      {
        source: '/gallery/indoor/:path*',
        destination: '/assets/images/gallery/indoor/:path*',
      },
      {
        source: '/gallery/weddings/:path*',
        destination: '/assets/images/gallery/weddings/:path*',
      },
      {
        source: '/gallery/hero/:path*',
        destination: '/assets/images/hero/:path*',
      },
      {
        source: '/hero.jpeg',
        destination: '/assets/images/hero/hero.jpeg',
      },
    ]
  },

  // ── Powered-by header removal ────────────────────────────────────
  poweredByHeader: false,
};

export default nextConfig;
