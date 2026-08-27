/**
 * Password Reset Confirm — POST /api/auth/reset-password/confirm
 *
 * What it does in plain language:
 *   1. Validates the token + new password
 *   2. Looks up the user by their unique reset token
 *   3. Checks the token hasn't expired (1-hour window)
 *   4. Hashes the new password and saves it
 *   5. Clears the reset token so it can't be reused
 *
 * ⚡ Place in: src/app/api/auth/reset-password/confirm/route.ts
 */

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { resetConfirmSchema } from '@/lib/validations/auth'
import { resetPasswordLimiter, getClientIp } from '@/lib/rate-limit'
import { rateLimitResponse } from '@/lib/security-headers'

const BCRYPT_ROUNDS = 12

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
    const result = resetConfirmSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      )
    }

    const { token, password } = result.data

    // ── 2. Find user by reset token ───────────────────────────────
    const user = await db.user.findFirst({
      where: { resetToken: token },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      )
    }

    // ── 3. Check token hasn't expired ─────────────────────────────
    if (user.resetExpiry && user.resetExpiry < new Date()) {
      // Clear the expired token
      await db.user.update({
        where: { id: user.id },
        data: { resetToken: null, resetExpiry: null },
      })
      return NextResponse.json(
        { error: 'This reset link has expired. Please request a new one.' },
        { status: 400 }
      )
    }

    // ── 4. Hash the new password and save ───────────────────────
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS)

    await db.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        // Clear the reset token so it can't be reused
        resetToken: null,
        resetExpiry: null,
      },
    })

    // ── 5. Return success ────────────────────────────────────────
    return NextResponse.json({
      message: 'Password has been reset successfully. You can now sign in.',
    })
  } catch (error) {
    console.error('[RESET_CONFIRM] Error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again later.' },
      { status: 500 }
    )
  }
}
