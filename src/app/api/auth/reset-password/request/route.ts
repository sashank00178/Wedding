/**
 * Password Reset Request — POST /api/auth/reset-password/request
 *
 * What it does in plain language:
 *   1. Validates the email address
 *   2. Finds the user by email
 *   3. Generates a random reset token and sets it to expire in 1 hour
 *   4. Saves the token to the user's record in the database
 *   5. (STEP 9 will add email sending — for now it just returns success)
 *
 * ⚡ Place in: src/app/api/auth/reset-password/request/route.ts
 */

import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { db } from '@/database/client'
import { resetRequestSchema } from '@/utils/validations/auth'
import { resetPasswordLimiter, getClientIp } from '@/middleware/rateLimit'
import { rateLimitResponse } from '@/middleware/securityHeaders'
import { sendPasswordReset } from '@/services/emailService'

export async function POST(request: Request) {
  try {
    // ── 0. Rate limiting ───────────────────────────────────────
    const ip = getClientIp(request)
    const rateResult = resetPasswordLimiter.check(ip)
    if (!rateResult.allowed) {
      return rateLimitResponse(rateResult.message, {
        remaining: rateResult.remaining,
        resetAt: rateResult.resetAt,
      })
    }

    // ── 1. Parse and validate ───────────────────────────────────
    const body = await request.json()
    const result = resetRequestSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      )
    }

    const { email } = result.data

    // ── 2. Find the user ─────────────────────────────────────────
    const user = await db.user.findUnique({ where: { email } })

    // Always return the same response whether the email exists or not.
    // This prevents attackers from guessing which emails are registered.
    // The token is only generated if the user exists.
    if (user) {
      const resetToken = crypto.randomBytes(32).toString('hex')
      const resetExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now

      await db.user.update({
        where: { id: user.id },
        data: {
          resetToken,
          resetExpiry,
        },
      })

      // ── 3. Send reset email ──────────────────────────────────
      await sendPasswordReset({
        to: user.email,
        name: user.name || 'there',
        resetToken,
      }).catch((emailErr) => {
        // Don't fail the request if email fails — user still gets the success message
        console.error(`[RESET] Failed to send reset email to ${email}:`, emailErr)
      })
    }

    // Always return success (even if email not found)
    return NextResponse.json({
      message:
        'If an account with that email exists, a password reset link has been sent.',
    })
  } catch (error) {
    console.error('[RESET_REQUEST] Error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again later.' },
      { status: 500 }
    )
  }
}
