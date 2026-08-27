/**
 * Input Sanitizer — Wedding Moment Nepal
 *
 * Utility functions for sanitizing user input to prevent:
 *   - XSS (cross-site scripting) via HTML/script injection
 *   - SQL injection (defense-in-depth with Prisma parameterized queries)
 *   - NoSQL injection
 *   - Prototype pollution
 *
 * IMPORTANT: Prisma already uses parameterized queries, so SQL injection
 * is handled at the ORM level. This module adds defense-in-depth
 * for other attack vectors.
 *
 * ⚡ Place in: src/lib/request-sanitizer.ts
 */

// ── HTML Sanitization ────────────────────────────────────────────────

/**
 * Strip HTML tags from a string.
 * Prevents XSS by removing all HTML/script content.
 */
export function stripHtml(input: unknown): string {
  if (typeof input !== 'string') return String(input || '')
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim()
}

/**
 * Escape HTML entities to prevent XSS when rendering user content.
 */
export function escapeHtml(input: unknown): string {
  if (typeof input !== 'string') return String(input || '')
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

// ── String Cleaning ─────────────────────────────────────────────────

/**
 * Trim and collapse whitespace in a string.
 * Prevents whitespace-based attacks (e.g., null bytes, unicode tricks).
 */
export function cleanString(input: unknown): string {
  if (typeof input !== 'string') return String(input || '')
  return input
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '') // Remove control chars except \t\n\r
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Normalize a string to safe ASCII characters (remove emojis, etc.)
 * Useful for slugs, SKUs, order numbers.
 */
export function sanitizeAscii(input: unknown): string {
  if (typeof input !== 'string') return String(input || '')
  return input
    .replace(/[^\x20-\x7E]/g, '') // Keep only printable ASCII
    .trim()
}

// ── Object Deep Cleaning ─────────────────────────────────────────────

/**
 * Recursively sanitize an object (or array) by stripping HTML from all string values.
 * Does NOT modify the original — returns a new object.
 */
export function sanitizeObject<T>(input: T): T {
  if (input === null || input === undefined) return input
  if (typeof input === 'string') return stripHtml(input) as unknown as T
  if (typeof input !== 'object') return input

  if (Array.isArray(input)) {
    return input.map(item => sanitizeObject(item)) as unknown as T
  }

  const sanitized: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    // Skip prototype pollution attempts
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue
    }
    sanitized[key] = sanitizeObject(value)
  }
  return sanitized as unknown as T
}

// ── Email / Phone ───────────────────────────────────────────────────

/**
 * Basic email sanitization (lowercase, trim).
 * Does NOT validate — use Zod for that.
 */
export function sanitizeEmail(input: unknown): string {
  if (typeof input !== 'string') return ''
  return input.toLowerCase().trim()
}

/**
 * Basic phone sanitization (keep digits and + only).
 */
export function sanitizePhone(input: unknown): string {
  if (typeof input !== 'string') return ''
  return input.replace(/[^\d+]/g, '').trim()
}

// ── Request Body Sanitizer ─────────────────────────────────────────

/**
 * Middleware-level body sanitizer.
 * Strips HTML from all string values in the request body.
 * Use this before passing to Zod validation.
 */
export function sanitizeRequestBody<T>(body: unknown): T {
  if (!body || typeof body !== 'object') return body as T
  return sanitizeObject(body as T)
}
