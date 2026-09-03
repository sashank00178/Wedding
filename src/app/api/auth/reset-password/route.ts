import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const user = await db.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    })

    if (!user) {
      // Don't reveal email existence
      return NextResponse.json({ success: true, message: 'If that email exists, reset instructions have been created.' })
    }

    // Generate reset token (valid for 1 hour)
    const token = crypto.randomBytes(32).toString('hex')
    const expiry = new Date(Date.now() + 60 * 60 * 1000)

    await db.user.update({
      where: { id: user.id },
      data: {
        resetToken: token,
        resetExpiry: expiry,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Password reset token generated.',
      token, // provided directly for admin recovery flow
    })
  } catch (error) {
    console.error('Password reset request error:', error)
    return NextResponse.json({ error: 'Failed to process reset request' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const { token, password } = await req.json()

    if (!token || !password) {
      return NextResponse.json({ error: 'Token and new password are required' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    const user = await db.user.findFirst({
      where: {
        resetToken: token,
        resetExpiry: {
          gt: new Date(),
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    await db.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetExpiry: null,
      },
    })

    return NextResponse.json({ success: true, message: 'Password updated successfully' })
  } catch (error) {
    console.error('Password reset update error:', error)
    return NextResponse.json({ error: 'Failed to update password' }, { status: 500 })
  }
}
