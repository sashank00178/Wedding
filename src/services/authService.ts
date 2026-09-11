/**
 * NextAuth.js Configuration — Wedding Moment Nepal
 *
 * Handles:
 *  - Email/password login via CredentialsProvider
 *  - JWT sessions (not database sessions — lighter & works with our custom User model)
 *  - Role-based access: "customer" | "admin"
 *  - Password hashing with bcryptjs
 *  - Failed login tracking with progressive lockout (STEP 8)
 *
 * ⚡ This file is imported by [...nextauth]/route.ts (the catch-all route).
 */

import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { db } from '@/database/client'
import bcrypt from 'bcryptjs'
import {
  checkAccountLock,
  recordFailedLogin,
  clearFailedLogins,
} from '@/services/failedLoginService'
import { getClientIp } from '@/middleware/rateLimit'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      // ── authorize(): called on every login attempt ──────────────
      async authorize(credentials, request) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required')
        }

        const email = credentials.email as string
        const ip = getClientIp(request ?? {})

        // ── STEP 8: Check if account is locked ─────────────────
        const lockCheck = await checkAccountLock(email, ip)
        if (!lockCheck.allowed) {
          throw new Error(lockCheck.message)
        }

        const user = await db.user.findUnique({
          where: { email },
        })

        // User not found — throw generic error (don't reveal which emails exist)
        if (!user) {
          // Record failed attempt even for non-existent emails
          await recordFailedLogin(email, ip)
          throw new Error('Invalid email or password')
        }

        // Compare the submitted password against the stored bcrypt hash
        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        )

        if (!isValid) {
          // Record failed attempt
          const result = await recordFailedLogin(email, ip)
          throw new Error(result.message)
        }

        // ── Success — clear failed login records ───────────────────
        await clearFailedLogins(email, ip)

        // Return the user object — NextAuth embeds this into the JWT
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,       // custom field: "customer" or "admin"
          image: user.image,
        }
      },
    }),
  ],

  // ── Session strategy ────────────────────────────────────────────
  // JWT = stateless session stored in an encrypted cookie.
  // No database session table needed.
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // ── JWT callback ───────────────────────────────────────────────
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as { role: string }).role = token.role as string
        ;(session.user as { id: string }).id = token.id as string
      }
      return session
    },
  },

  // ── Secret (used to sign the JWT cookie) ───────────────────────
  secret: process.env.NEXTAUTH_SECRET,
}
