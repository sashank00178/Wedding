import { NextResponse } from 'next/server'
import { db } from '@/database/client'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { sendPasswordResetOtp } from '@/services/emailService'
import { adminResetOtpLimiter, getClientIp } from '@/middleware/rateLimit'
import { clearAllFailedLogins } from '@/services/failedLoginService'
import { verifyAdminRecoveryPin } from '@/middleware/recoveryPin'

/**
 * Admin Password Reset API
 *
 * Supports two flows:
 * 1. PIN-Based Recovery (Primary & Recommended):
 *    - POST { action: 'verify-pin', pin, email? }:
 *      Verifies secret recovery PIN against ADMIN_RECOVERY_PIN_HASH with 15-minute brute-force lockout.
 *      Returns single-use resetTicket (10-minute expiry).
 *
 * 2. OTP-Based Verification (Fallback):
 *    - POST { email }: Generates and sends OTP code via email.
 *    - POST { email, code, action: 'verify-code' }: Verifies 6-digit OTP code.
 *
 * 3. Update Password:
 *    - PUT { resetTicket, password, email? }:
 *      Validates resetTicket, hashes new password with bcrypt, updates DB, clears ticket and login locks.
 */

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const ip = getClientIp(req)

    // ── PRIMARY FLOW: Verify secret recovery PIN ───────────────────────
    if (body.action === 'verify-pin' || body.pin) {
      const pin = String(body.pin || '').trim()
      const verification = await verifyAdminRecoveryPin(pin, ip)

      if (!verification.success) {
        return NextResponse.json(
          {
            error: verification.error || 'Invalid recovery PIN.',
            locked: verification.locked || false,
            remainingAttempts: verification.remainingAttempts,
            remainingMinutes: verification.remainingMinutes,
          },
          { status: verification.locked ? 429 : 400 }
        )
      }

      // PIN is verified! Find target admin user
      const targetEmail = String(body.email || '').trim().toLowerCase()
      let user = targetEmail
        ? await db.user.findFirst({
            where: { email: targetEmail },
          })
        : null

      if (!user) {
        const defaultAdminEmail = (process.env.ADMIN_EMAIL || 'weddingmomentpkr@gmail.com').toLowerCase()
        user = await db.user.findFirst({
          where: { email: defaultAdminEmail },
        })

        if (!user) {
          user = await db.user.findFirst({
            where: { role: 'admin' },
          })
        }
      }

      if (!user) {
        return NextResponse.json(
          { error: 'No administrator account was found in the database.' },
          { status: 404 }
        )
      }

      // Generate single-use reset ticket valid for 10 minutes
      const resetTicket = `v1_pin_${crypto.randomBytes(32).toString('hex')}`
      const ticketExpiry = new Date(Date.now() + 10 * 60 * 1000)

      await db.user.update({
        where: { id: user.id },
        data: {
          resetToken: resetTicket,
          resetExpiry: ticketExpiry,
        },
      })

      return NextResponse.json({
        success: true,
        message: 'Recovery PIN verified successfully.',
        resetTicket,
        adminEmail: user.email,
      })
    }

    // ── FALLBACK FLOW: Verify 6-digit OTP code ──────────────────────────
    if (body.action === 'verify-code' || (body.code && !body.password)) {
      const email = String(body.email || '').trim().toLowerCase()
      const code = String(body.code || '').trim()

      if (!email || !code) {
        return NextResponse.json(
          { error: 'Email and 6-digit verification code are required.' },
          { status: 400 }
        )
      }

      if (!/^\d{6}$/.test(code)) {
        return NextResponse.json(
          { error: 'Verification code must be exactly 6 digits.' },
          { status: 400 }
        )
      }

      const user = await db.user.findUnique({
        where: { email },
      })

      if (!user || !user.resetToken || !user.resetExpiry) {
        return NextResponse.json(
          { error: 'No active password reset request found. Please request a new code.' },
          { status: 400 }
        )
      }

      if (user.resetExpiry < new Date()) {
        return NextResponse.json(
          { error: 'This verification code has expired. Please request a new code.' },
          { status: 400 }
        )
      }

      // Check if resetToken matches bcrypt hash of the 6-digit code
      const isMatch = await bcrypt.compare(code, user.resetToken).catch(() => false)
      if (!isMatch) {
        return NextResponse.json(
          { error: 'Incorrect verification code. Please check and try again.' },
          { status: 400 }
        )
      }

      // Generate single-use reset ticket for the password change step (valid for 5 minutes)
      const resetTicket = `v1_${crypto.randomBytes(32).toString('hex')}`
      const ticketExpiry = new Date(Date.now() + 5 * 60 * 1000)

      await db.user.update({
        where: { id: user.id },
        data: {
          resetToken: resetTicket,
          resetExpiry: ticketExpiry,
        },
      })

      return NextResponse.json({
        success: true,
        message: 'Code verified successfully.',
        resetTicket,
      })
    }

    // ── FALLBACK FLOW: Request 6-digit email OTP ─────────────────────────
    const email = String(body.email || '').trim().toLowerCase()
    if (!email) {
      return NextResponse.json(
        { error: 'Please provide your registered email address or recovery PIN.' },
        { status: 400 }
      )
    }

    // Rate-limit check (IP and email keys, max 3 requests per hour)
    const ipCheck = adminResetOtpLimiter.check(`ip:${ip}`)
    if (!ipCheck.allowed) {
      return NextResponse.json({ error: ipCheck.message }, { status: 429 })
    }

    const emailCheck = adminResetOtpLimiter.check(`email:${email}`)
    if (!emailCheck.allowed) {
      return NextResponse.json({ error: emailCheck.message }, { status: 429 })
    }

    const genericResponse = {
      success: true,
      message: 'If this email is registered, a 6-digit verification code has been sent.',
    }

    const user = await db.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json(genericResponse)
    }

    const code = crypto.randomInt(100000, 1000000).toString()
    const hashedCode = await bcrypt.hash(code, 10)
    const codeExpiry = new Date(Date.now() + 10 * 60 * 1000)

    await db.user.update({
      where: { id: user.id },
      data: {
        resetToken: hashedCode,
        resetExpiry: codeExpiry,
      },
    })

    await sendPasswordResetOtp({
      to: user.email,
      name: user.name || 'Administrator',
      code,
    })

    return NextResponse.json(genericResponse)
  } catch (error) {
    console.error('[RESET-PASSWORD] Request error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred while processing your request.' },
      { status: 500 }
    )
  }
}

export async function PUT(req: Request) {
  try {
    const { email, resetTicket, password } = await req.json()

    const cleanTicket = String(resetTicket || '').trim()
    const cleanPassword = String(password || '')

    if (!cleanTicket || !cleanPassword) {
      return NextResponse.json(
        { error: 'Reset ticket and new password are required.' },
        { status: 400 }
      )
    }

    if (cleanPassword.length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters long.' },
        { status: 400 }
      )
    }

    // Verify resetTicket against the user in the database
    const user = await db.user.findFirst({
      where: {
        resetToken: cleanTicket,
        resetExpiry: {
          gt: new Date(),
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Reset session has expired or is invalid. Please enter your recovery PIN again.' },
        { status: 400 }
      )
    }

    // Hash new password with bcrypt
    const passwordHash = await bcrypt.hash(cleanPassword, 10)

    // Save new password and invalidate the reset token immediately
    await db.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetExpiry: null,
      },
    })

    // Unlock account if it was locked from previous failed attempts
    await clearAllFailedLogins(user.email)

    return NextResponse.json({
      success: true,
      email: user.email,
      message: 'Password updated successfully. Please log in with your new password.',
    })
  } catch (error) {
    console.error('[RESET-PASSWORD] Update error:', error)
    return NextResponse.json(
      { error: 'Failed to update password. Please try again.' },
      { status: 500 }
    )
  }
}
