import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
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
            value: "DENY",
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
          // Cache control — no caching for API routes
          {
            key: "Cache-Control",
            value: "no-store, max-age=0, must-revalidate",
          },
          // HSTS — enforce HTTPS in production (1 year, include subdomains)
          // Only enable in production — localhost doesn't have HTTPS
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

  // ── Body Size Limits ─────────────────────────────────────────────
  // Prevent oversized payloads from crashing the server.
  // Default is 1MB per Next.js, but we set explicit limits per route.
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },

  // ── Allowed External Images ─────────────────────────────────────
  images: {
    remotePatterns: [
      // Allow images from the gallery directory (local)
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  // ── Powered-by header removal ────────────────────────────────────
  poweredByHeader: false,
};

export default nextConfig;
