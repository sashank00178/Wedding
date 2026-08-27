/**
 * Test Email — POST /api/admin/test-email
 *
 * What it does:
 *   Sends a test email to verify the Resend email service is working.
 *   Only accessible by admins.
 *
 * Body: { to?: string } — defaults to ADMIN_EMAIL if not provided
 *
 * ⚡ Place in: src/app/api/admin/test-email/route.ts
 */

import { NextResponse } from 'next/server'
import { requireAdmin, AuthError } from '@/lib/auth-helpers'
import { sendTestEmail } from '@/lib/email'

export async function POST(request: Request) {
  try {
    await requireAdmin()

    const body = await request.json().catch(() => ({}))
    const to = body.to || process.env.ADMIN_EMAIL || process.env.EMAIL_FROM

    if (!to) {
      return NextResponse.json(
        { error: 'No email address provided and ADMIN_EMAIL is not configured' },
        { status: 400 }
      )
    }

    const result = await sendTestEmail(to)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error, dryRun: result.error === 'dry-run' },
        { status: 200 } // still 200 — dry-run is expected with placeholder keys
      )
    }

    return NextResponse.json({
      success: true,
      message: `Test email sent to ${to}`,
      messageId: result.messageId,
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      )
    }

    console.error('[TEST_EMAIL] Error:', error)
    return NextResponse.json(
      { error: 'Failed to send test email' },
      { status: 500 }
    )
  }
}
