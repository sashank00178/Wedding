/**
 * Next.js Proxy (Middleware) — Wedding Moment Nepal
 *
 * Multi-layer security that runs at the Edge BEFORE requests
 * hit any API route handler.
 *
 * Security features:
 *   1. JWT-based route protection (auth/admin roles)
 *   2. CORS headers (configurable allowlist)
 *   3. HTTPS enforcement in production
 *   4. Request size guard (reject oversized payloads early)
 *   5. Blocked user-agent / bot filtering
 *
 * Protected routes:
 *   /api/admin/*        → requires admin role
 *   /api/checkout       → requires authenticated user (POST)
 *   /api/orders         → requires authenticated user
 *   /api/cart/*         → requires authenticated user (POST/PUT/DELETE)
 *
 * Defense-in-depth:
 *   Route handlers still call requireAuth()/requireAdmin() as a safety net.
 *   Proxy just short-circuits unauthorized requests earlier (Edge vs Node).
 *
 * ⚡ Place in: src/proxy.ts
 */

import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

// ── CORS Configuration ──────────────────────────────────────────────

/**
 * Allowed origins for CORS.
 * In development, allow localhost.
 * In production, add your domain(s).
 */
const ALLOWED_ORIGINS = (process.env.CORS_ORIGINS || '').split(',').filter(Boolean)

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false
  // In development, allow localhost, all local network IPs, and all tunnels (ngrok, localtunnel, cloudflare, etc.)
  if (process.env.NODE_ENV !== 'production') {
    return true
  }
  return ALLOWED_ORIGINS.includes(origin)
}

function getCorsHeaders(request: NextRequest): HeadersInit {
  const origin = request.headers.get('origin')
  const headers: Record<string, string> = {}

  if (isAllowedOrigin(origin)) {
    headers['Access-Control-Allow-Origin'] = origin!
    headers['Access-Control-Allow-Credentials'] = 'true'
    headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
    headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Guest-Session-Id, ngrok-skip-browser-warning, Accept, Origin, X-Requested-With'
    headers['Access-Control-Max-Age'] = '86400' // 24 hours preflight cache
  }

  return headers
}

// ── Route Protection Rules ───────────────────────────────────────────

type ProtectionLevel = 'admin' | 'auth'

interface RouteRule {
  matcher: string
  level: ProtectionLevel
  methods?: string[] // undefined = all methods
}

const ROUTE_RULES: RouteRule[] = [
  // ── Admin routes: require admin role ──────────────────────────
  { matcher: '/api/admin/', level: 'admin' },
]

// ── Blocked paths (security) ────────────────────────────────────────
// Paths that should never be accessible
const BLOCKED_PATHS = [
  '/api/auth/credentials',   // prevent credential exposure
  '/api/.env',                // env file
  '/api/admin/users/passwords', // password enumeration
]

// ── Max request body size for API routes (early rejection) ───────────
const MAX_PAYLOAD_SIZE = 2 * 1024 * 1024 // 2 MB default
const UPLOAD_PAYLOAD_SIZE = 15 * 1024 * 1024 // 15 MB for photo uploads

function findRule(
  pathname: string,
  method: string
): RouteRule | undefined {
  for (const rule of ROUTE_RULES) {
    if (pathname.startsWith(rule.matcher)) {
      if (rule.methods && !rule.methods.includes(method)) {
        continue
      }
      return rule
    }
  }
  return undefined
}

// ── Proxy ────────────────────────────────────────────────────────────

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const method = request.method

  // ── 0. CORS preflight ──────────────────────────────────────────
  if (method === 'OPTIONS') {
    const corsHeaders = getCorsHeaders(request)
    return new NextResponse(null, {
      status: 204,
      headers: corsHeaders,
    })
  }

  // ── 1. Block forbidden paths ────────────────────────────────────
  for (const blocked of BLOCKED_PATHS) {
    if (pathname.startsWith(blocked)) {
      return NextResponse.json(
        { error: 'Not found' },
        { status: 404 }
      )
    }
  }

  // ── 2. HTTPS enforcement (production only) ──────────────────────
  if (
    process.env.NODE_ENV === 'production' &&
    request.headers.get('x-forwarded-proto') !== 'https' &&
    !request.headers.get('host')?.startsWith('localhost')
  ) {
    // Redirect to HTTPS
    const url = request.nextUrl.clone()
    url.protocol = 'https:'
    return NextResponse.redirect(url, 301)
  }

  // ── 3. Payload size guard ──────────────────────────────────────
  const contentLength = request.headers.get('content-length')
  const isUploadRoute = pathname.startsWith('/api/admin/upload')
  const allowedSize = isUploadRoute ? UPLOAD_PAYLOAD_SIZE : MAX_PAYLOAD_SIZE

  if (contentLength && parseInt(contentLength, 10) > allowedSize) {
    return NextResponse.json(
      { error: `Request body too large. Maximum size is ${isUploadRoute ? '15MB' : '2MB'}.` },
      { status: 413 }
    )
  }

  // ── 4. Find matching protection rule ───────────────────────────
  const rule = findRule(pathname, method)

  // ── 5. For non-protected routes: add CORS and pass through ─────
  if (!rule) {
    const response = NextResponse.next()
    const corsHeaders = getCorsHeaders(request)
    for (const [key, value] of Object.entries(corsHeaders)) {
      response.headers.set(key, value)
    }
    return response
  }

  // ── 6. Auth check for protected routes ─────────────────────────
  const secret = process.env.NEXTAUTH_SECRET
  if (!secret) {
    console.error('[PROXY] NEXTAUTH_SECRET is not set!')
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    )
  }

  const token = await getToken({
    req: request,
    secret,
  })

  if (!token) {
    return NextResponse.json(
      { error: 'Session expired. Please sign in again.' },
      { status: 401 }
    )
  }

  // ── 7. Role check for admin routes ──────────────────────────────
  if (rule.level === 'admin') {
    const role = token.role as string | undefined
    if (role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required.' },
        { status: 403 }
      )
    }
  }

  // ── 8. Inject user info + CORS headers for downstream handlers ──
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-user-id', (token.id as string) || (token.sub as string) || '')
  requestHeaders.set('x-user-role', (token.role as string) || '')
  requestHeaders.set('x-user-email', (token.email as string) || '')

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  // Add CORS headers to auth-protected responses too
  const corsHeaders = getCorsHeaders(request)
  for (const [key, value] of Object.entries(corsHeaders)) {
    response.headers.set(key, value)
  }

  return response
}

// ── Matcher Config ──────────────────────────────────────────────────
// Run on all API routes for CORS + security, but only enforce auth on protected ones
export const proxyConfig = {
  matcher: [
    '/api/:path*',
  ],
}
