/**
 * E-Commerce utility helpers.
 * Shared across API routes and server actions.
 */

/** Generate a human-readable order number like "ORD-20260727-AB3F" */
export function generateOrderNumber(): string {
  const d = new Date()
  const date = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `ORD-${date}-${rand}`
}

/** Generate a random guest session ID (stored in cookie for guest carts). */
export function generateGuestSessionId(): string {
  return crypto.randomUUID()
}

/** Slugify a string for URL-safe identifiers. */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}
