/**
 * Admin Unlock — POST /api/auth/unlock
 *
 * What it does in plain language:
 *   Allows an admin to unlock an account that has been locked due to
 *   too many failed login attempts. Clears all failed login records
 *   for the given email.
 *
 *   - Requires admin role
 *   - Takes the email to unlock
 *   - Returns the count of cleared records
 *
 * Body: { email: string }
 *
 * ⚡ Place in: src/app/api/auth/unlock/route.ts
 */

import { NextResponse } from 'next/server'
import { requireAdmin, AuthError } from '@/lib/auth-helpers'
import { clearAllFailedLogins } from '@/lib/failed-login'
import { z } from 'zod'

const unlockSchema = z.object({
  email: z.string().email('Invalid email format'),
})

export async function POST(request: Request) {
  try {
    await requireAdmin()

    const body = await request.json()
    const result = unlockSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      )
    }

    const { email } = result.data

    // Clear all failed login records for this email
    const cleared = await clearAllFailedLogins(email)

    return NextResponse.json({
      message: cleared > 0
        ? `Account ${email} unlocked. Cleared ${cleared} failed login record(s).`
        : `Account ${email} was not locked.`,
      cleared,
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      )
    }

    console.error('[AUTH_UNLOCK_POST] Error:', error)
    return NextResponse.json(
      { error: 'Failed to unlock account' },
      { status: 500 }
    )
  }
}
