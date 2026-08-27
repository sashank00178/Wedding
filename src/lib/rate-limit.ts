/**
 * Rate Limiter — In-memory sliding window rate limiter.
 *
 * No external dependencies — pure TypeScript using a Map.
 * Tracks requests by IP address (or any key) within a time window.
 *
 * Usage:
 *   const limiter = new RateLimiter({ maxRequests: 5, windowMs: 60000 })
 *   if (!limiter.allowed(ip)) { return 429 }
 *
 * ⚡ Place in: src/lib/rate-limit.ts
 */

export interface RateLimitOptions {
  /** Maximum requests allowed within the window */
  maxRequests: number
  /** Time window in milliseconds */
  windowMs: number
  /** Optional custom error message */
  message?: string
}

export interface RateLimitResult {
  /** Whether the request is allowed */
  allowed: boolean
  /** Remaining requests in current window */
  remaining: number
  /** When the window resets (Unix timestamp in ms) */
  resetAt: number
  /** Suggested HTTP status code (429 if not allowed) */
  statusCode: number
  /** Human-readable message */
  message: string
}

interface RequestRecord {
  timestamps: number[]
}

export class RateLimiter {
  private maxRequests: number
  private windowMs: number
  private defaultMessage: string
  private store: Map<string, RequestRecord>

  constructor(options: RateLimitOptions) {
    this.maxRequests = options.maxRequests
    this.windowMs = options.windowMs
    this.defaultMessage =
      options.message ||
      `Too many requests. Please try again later. (Limit: ${options.maxRequests} per ${Math.round(options.windowMs / 1000)}s)`
    this.store = new Map()

    // Clean up stale entries every 5 minutes to prevent memory leaks
    setInterval(() => this.cleanup(), 5 * 60 * 1000)
  }

  /**
   * Check if a request from the given key is allowed.
   * Returns a result object with all info needed for the response.
   */
  check(key: string): RateLimitResult {
    const now = Date.now()
    const windowStart = now - this.windowMs

    // Get or create record
    let record = this.store.get(key)
    if (!record) {
      record = { timestamps: [] }
      this.store.set(key, record)
    }

    // Filter out timestamps outside the current window
    record.timestamps = record.timestamps.filter((ts) => ts > windowStart)

    // Check if limit exceeded
    if (record.timestamps.length >= this.maxRequests) {
      const oldestInWindow = record.timestamps[0]
      const resetAt = oldestInWindow + this.windowMs

      return {
        allowed: false,
        remaining: 0,
        resetAt,
        statusCode: 429,
        message: this.defaultMessage,
      }
    }

    // Add this request
    record.timestamps.push(now)

    return {
      allowed: true,
      remaining: this.maxRequests - record.timestamps.length,
      resetAt: now + this.windowMs,
      statusCode: 200,
      message: 'OK',
    }
  }

  /**
   * Convenience method — returns true if allowed, false otherwise.
   */
  allowed(key: string): boolean {
    return this.check(key).allowed
  }

  /**
   * Remove stale entries from the store.
   */
  private cleanup(): void {
    const now = Date.now()
    const windowStart = now - this.windowMs

    for (const [key, record] of this.store) {
      record.timestamps = record.timestamps.filter((ts) => ts > windowStart)
      if (record.timestamps.length === 0) {
        this.store.delete(key)
      }
    }
  }

  /**
   * Get the current count for a key (useful for testing).
   */
  getCount(key: string): number {
    const record = this.store.get(key)
    if (!record) return 0
    const windowStart = Date.now() - this.windowMs
    return record.timestamps.filter((ts) => ts > windowStart).length
  }

  /**
   * Reset/clear all rate limit records.
   */
  reset(): void {
    this.store.clear()
  }
}

// ── Pre-configured limiters for common routes ──────────────────────

/** Login attempts: 10 per minute per IP */
export const loginLimiter = new RateLimiter({
  maxRequests: 10,
  windowMs: 60 * 1000,
  message: 'Too many login attempts. Please wait a minute before trying again.',
})

/** Registration: 5 per minute per IP */
export const registerLimiter = new RateLimiter({
  maxRequests: 5,
  windowMs: 60 * 1000,
  message: 'Too many registration attempts. Please wait a minute before trying again.',
})

/** Password reset requests: 3 per minute per IP */
export const resetPasswordLimiter = new RateLimiter({
  maxRequests: 3,
  windowMs: 60 * 1000,
  message: 'Too many password reset requests. Please wait a minute before trying again.',
})

/** Checkout attempts: 5 per minute per IP */
export const checkoutLimiter = new RateLimiter({
  maxRequests: 5,
  windowMs: 60 * 1000,
  message: 'Too many checkout attempts. Please wait a minute before trying again.',
})

/** Contact form: 3 per minute per IP */
export const contactLimiter = new RateLimiter({
  maxRequests: 3,
  windowMs: 60 * 1000,
  message: 'Too many messages sent. Please wait a minute before trying again.',
})

/**
 * Extract client IP from request headers.
 * Handles X-Forwarded-For (proxies like Caddy) and falls back to
 * a default for local development.
 */
type HeaderSource =
  | Request
  | { headers?: Headers | Record<string, string | string[] | undefined> | null }

function readHeader(source: HeaderSource, name: string): string | undefined {
  const headers = (source as Request).headers ?? (source as { headers?: unknown }).headers

  if (!headers) return undefined

  // Web Fetch API Headers instance (has .get)
  if (typeof (headers as Headers).get === 'function') {
    return (headers as Headers).get(name) ?? undefined
  }

  // Plain object (e.g. NextAuth's RequestInternal.headers, or Node IncomingHttpHeaders)
  const record = headers as unknown as Record<string, string | string[] | undefined>
  const value = record[name] ?? record[name.toLowerCase()]
  return Array.isArray(value) ? value[0] : value
}

export function getClientIp(request: HeaderSource): string {
  const forwarded = readHeader(request, 'x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  const realIp = readHeader(request, 'x-real-ip')
  if (realIp) {
    return realIp.trim()
  }

  // In development / testing, return a default
  return '127.0.0.1'
}
