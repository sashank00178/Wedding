/**
 * Coupons API — Full CRUD
 *
 * GET /api/coupons?code=WELCOME10&subtotal=5000
 *   → Validate a coupon code (public — used at checkout)
 *
 * POST /api/coupons
 *   → Create a new coupon (admin only)
 *
 * ⚡ Place in: src/app/api/coupons/route.ts
 */

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, AuthError } from '@/lib/auth-helpers'
import { z } from 'zod'

// ── Validation schemas ──────────────────────────────────────────

const createCouponSchema = z.object({
  code: z
    .string()
    .min(3, 'Code must be at least 3 characters')
    .max(50, 'Code too long')
    .toUpperCase()
    .trim(),
  type: z.enum(['percentage', 'fixed']),
  value: z.number().positive('Value must be positive'),
  minOrder: z.number().min(0).optional().nullable(),
  maxUses: z.number().int().min(1).optional().nullable(),
  isActive: z.boolean().optional().default(true),
  validFrom: z.string().datetime().optional().nullable(),
  validUntil: z.string().datetime().optional().nullable(),
})

// ── GET: Validate coupon (public) ───────────────────────────────

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = (searchParams.get('code') || '').toUpperCase().trim()
    const subtotal = parseFloat(searchParams.get('subtotal') || '0')

    if (!code) {
      return NextResponse.json(
        { error: 'Coupon code is required' },
        { status: 400 }
      )
    }
    if (subtotal <= 0) {
      return NextResponse.json(
        { error: 'Subtotal must be greater than 0' },
        { status: 400 }
      )
    }

    const coupon = await db.coupon.findUnique({ where: { code } })

    if (!coupon || !coupon.isActive) {
      return NextResponse.json({ valid: false, error: 'Invalid coupon code' })
    }

    // Check validity dates
    const now = new Date()
    if (coupon.validFrom && coupon.validFrom > now) {
      return NextResponse.json({ valid: false, error: 'This coupon is not yet active' })
    }
    if (coupon.validUntil && coupon.validUntil < now) {
      return NextResponse.json({ valid: false, error: 'This coupon has expired' })
    }

    // Check usage limit
    if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ valid: false, error: 'This coupon has reached its usage limit' })
    }

    // Check minimum order
    if (coupon.minOrder !== null && subtotal < coupon.minOrder) {
      return NextResponse.json({
        valid: false,
        error: `Minimum order of रु ${coupon.minOrder.toLocaleString()} required for this coupon`,
      })
    }

    // Calculate discount
    let discount = 0
    if (coupon.type === 'percentage') {
      discount = Math.round(subtotal * (coupon.value / 100) * 100) / 100
    } else {
      discount = Math.min(coupon.value, subtotal)
    }

    return NextResponse.json({
      valid: true,
      coupon: {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        description:
          coupon.type === 'percentage'
            ? `${coupon.value}% off`
            : `रु ${coupon.value.toLocaleString()} off`,
      },
      discount,
      newTotal: Math.round((subtotal - discount) * 100) / 100,
    })
  } catch (error) {
    console.error('[COUPON_GET] Error:', error)
    return NextResponse.json(
      { error: 'Failed to validate coupon' },
      { status: 500 }
    )
  }
}

// ── POST: Create coupon (admin only) ────────────────────────────

export async function POST(request: Request) {
  try {
    await requireAdmin()

    const body = await request.json()
    const result = createCouponSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      )
    }

    const data = result.data

    // Check if coupon code already exists
    const existing = await db.coupon.findUnique({ where: { code: data.code } })
    if (existing) {
      return NextResponse.json(
        { error: `Coupon code "${data.code}" already exists` },
        { status: 409 }
      )
    }

    // Validate percentage value (must be 1-100)
    if (data.type === 'percentage' && data.value > 100) {
      return NextResponse.json(
        { error: 'Percentage discount cannot exceed 100%' },
        { status: 400 }
      )
    }

    // Validate date range
    if (data.validFrom && data.validUntil && data.validFrom > data.validUntil) {
      return NextResponse.json(
        { error: 'Start date must be before end date' },
        { status: 400 }
      )
    }

    const coupon = await db.coupon.create({
      data: {
        code: data.code,
        type: data.type,
        value: data.value,
        minOrder: data.minOrder,
        maxUses: data.maxUses,
        isActive: data.isActive,
        validFrom: data.validFrom ? new Date(data.validFrom) : null,
        validUntil: data.validUntil ? new Date(data.validUntil) : null,
      },
    })

    return NextResponse.json(
      { message: `Coupon "${coupon.code}" created successfully`, coupon },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      )
    }

    console.error('[COUPON_POST] Error:', error)
    return NextResponse.json(
      { error: 'Failed to create coupon' },
      { status: 500 }
    )
  }
}
