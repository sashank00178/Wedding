/**
 * Registration API Route — POST /api/auth/register
 *
 * What it does in plain language:
 *   1. Validates the form data (name, email, password) using Zod
 *   2. Checks if the email is already taken
 *   3. Hashes the password with bcrypt (never stores plaintext!)
 *   4. Creates a new User record in the database
 *   5. Returns success — user can now log in via /api/auth/signin
 *
 * Password rules enforced by Zod:
 *   - Minimum 8 characters
 *   - Maximum 128 characters
 *   - Must match the "confirm password" field
 *
 * ⚡ Place in: src/app/api/auth/register/route.ts
 */

import { NextResponse } from 'next/server'
import { db } from '@/database/client'
import bcrypt from 'bcryptjs'
import { registerSchema } from '@/utils/validations/auth'
import { registerLimiter, getClientIp } from '@/middleware/rateLimit'
import { rateLimitResponse } from '@/middleware/securityHeaders'
import { sendWelcomeEmail } from '@/services/emailService'

const BCRYPT_ROUNDS = 12 // higher = slower but more secure

export async function POST(request: Request) {
  try {
    // ── 0. Rate limiting ───────────────────────────────────────
    const ip = getClientIp(request)
    const rateResult = registerLimiter.check(ip)
    if (!rateResult.allowed) {
      return rateLimitResponse(rateResult.message, {
        remaining: rateResult.remaining,
        resetAt: rateResult.resetAt,
      })
    }

    // ── 1. Parse and validate the request body ───────────────────
    const body = await request.json()
    const result = registerSchema.safeParse(body)

    if (!result.success) {
      // Return the FIRST validation error in a readable format
      const firstError = result.error.issues[0]
      return NextResponse.json(
        { error: firstError.message },
        { status: 400 }
      )
    }

    const { name, email, password } = result.data

    // ── 2. Check if email is already registered ──────────────────
    const existingUser = await db.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 } // 409 Conflict
      )
    }

    // ── 3. Hash the password ─────────────────────────────────────
    // bcrypt automatically adds a random "salt" so identical passwords
    // produce different hashes. BCRYPT_ROUNDS=12 means ~250ms per hash.
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS)

    // ── 4. Create the user ───────────────────────────────────────
    const user = await db.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: 'customer', // all new sign-ups are customers (not admins)
      },
      // Only return safe fields (never expose the hash!)
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    })

    // ── 5. Return success ────────────────────────────────────────
    // Send welcome email (fire-and-forget — don't block registration)
    sendWelcomeEmail({
      to: user.email,
      name: user.name,
    }).catch((err) => {
      console.error(`[REGISTER] Failed to send welcome email to ${user.email}:`, err)
    })

    return NextResponse.json(
      {
        message: 'Account created successfully. You can now sign in.',
        user,
      },
      { status: 201 } // 201 Created
    )
  } catch (error) {
    console.error('[REGISTER] Error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again later.' },
      { status: 500 }
    )
  }
}
