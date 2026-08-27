/**
 * Auth helper — get the current session from any API route.
 *
 * This is a lightweight wrapper around getServerSession() that
 * doesn't require importing NextAuth config in every route file.
 * All API routes call this instead of handling auth individually.
 *
 * ⚡ Place in: src/lib/auth-helpers.ts
 */

import { getServerSession, type Session } from 'next-auth'
import { authOptions } from '@/lib/auth'

/** Returns the current user's session, or null if not logged in. */
export async function getAuthSession(): Promise<Session | null> {
  return getServerSession(authOptions)
}

/**
 * Require authentication — returns session or throws a 401 response.
 * Use this in routes that MUST be logged in (e.g., order history).
 */
export async function requireAuth(): Promise<Session> {
  const session = await getAuthSession()
  if (!session?.user) {
    throw new AuthError('Authentication required. Please sign in.')
  }
  return session
}

/**
 * Require admin role — returns session or throws a 403 response.
 * Use this in admin-only routes.
 */
export async function requireAdmin(): Promise<Session> {
  const session = await requireAuth()
  if (session.user.role !== 'admin') {
    throw new AuthError('Admin access required.', 403)
  }
  return session
}

/** Custom error class for auth failures */
export class AuthError extends Error {
  statusCode: number
  constructor(message: string, statusCode = 401) {
    super(message)
    this.statusCode = statusCode
    this.name = 'AuthError'
  }
}
