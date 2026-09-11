/**
 * Security Headers — Added to all API responses.
 *
 * Headers included:
 *   - X-Content-Type-Options: nosniff (prevent MIME sniffing)
 *   - X-Frame-Options: DENY (prevent clickjacking)
 *   - X-XSS-Protection: 1; mode=block
 *   - Referrer-Policy: strict-origin-when-cross-origin
 *   - Content-Security-Policy: basic restrictions
 *   - X-RateLimit-*: rate limit info when applicable
 *
 * ⚡ Place in: src/lib/security-headers.ts
 */

export interface SecurityHeadersOptions {
  rateLimitRemaining?: number
  rateLimitReset?: number
}

/**
 * Build a Headers object with security headers.
 * Use with NextResponse: new NextResponse(body, { headers: securityHeaders() })
 */
export function securityHeaders(options: SecurityHeadersOptions = {}): HeadersInit {
  const headers: Record<string, string> = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    // Cache control for API responses (no caching by default)
    'Cache-Control': 'no-store, max-age=0, must-revalidate',
    'Pragma': 'no-cache',
  }

  // Add rate limit headers if provided
  if (options.rateLimitRemaining !== undefined) {
    headers['X-RateLimit-Remaining'] = String(options.rateLimitRemaining)
  }
  if (options.rateLimitReset !== undefined) {
    headers['X-RateLimit-Reset'] = String(options.rateLimitReset)
  }

  return headers
}

/**
 * Create a rate-limited 429 response with proper headers.
 */
export function rateLimitResponse(
  message: string,
  options: { remaining: number; resetAt: number }
) {
  const headers = securityHeaders({
    rateLimitRemaining: options.remaining,
    rateLimitReset: options.resetAt,
  })

  return new Response(
    JSON.stringify({ error: message }),
    {
      status: 429,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
        'Retry-After': String(Math.ceil((options.resetAt - Date.now()) / 1000)),
      },
    }
  )
}
