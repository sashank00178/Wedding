/**
 * Single Coupon API — PUT /api/coupons/[id], DELETE /api/coupons/[id]
 *
 * PUT — Update an existing coupon (admin only)
 *   - Partial update (only provided fields are changed)
 *   - Validates code uniqueness if code is being changed
 *   - Validates percentage max 100%
 *   - Validates date range
 *
 * DELETE — Delete a coupon (admin only)
 *   - Safety check: rejects if coupon has been used
 *   - Cascade: removes coupon association from orders
 *
 * ⚡ Place in: src/app/api/coupons/[id]/route.ts
 */

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, AuthError } from '@/lib/auth-helpers'
import { z } from 'zod'

const updateCouponSchema = z.object({
  code: z.string().min(3).max(50).toUpperCase().trim().optional(),
  type: z.enum(['percentage', 'fixed']).optional(),
  value: z.number().positive().optional(),
  minOrder: z.number().min(0).optional().nullable(),
  maxUses: z.number().int().min(1).optional().nullable(),
  isActive: z.boolean().optional(),
  validFrom: z.string().datetime().optional().nullable(),
  validUntil: z.string().datetime().optional().nullable(),
})

// ── GET: Single coupon detail (admin) ───────────────────────────

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params

    const coupon = await db.coupon.findUnique({
      where: { id },
      include: {
        _count: {
          select: { orders: true },
        },
      },
    })

    if (!coupon) {
      return NextResponse.json(
        { error: 'Coupon not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ coupon })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      )
    }

    console.error('[COUPON_DETAIL_GET] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch coupon' },
      { status: 500 }
    )
  }
}

// ── PUT: Update coupon (admin only) ──────────────────────────────

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params

    const body = await request.json()
    const result = updateCouponSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      )
    }

    const data = result.data

    // Check coupon exists
    const existing = await db.coupon.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Coupon not found' },
        { status: 404 }
      )
    }

    // If code is being changed, check uniqueness
    if (data.code && data.code !== existing.code) {
      const codeExists = await db.coupon.findUnique({ where: { code: data.code } })
      if (codeExists) {
        return NextResponse.json(
          { error: `Coupon code "${data.code}" already exists` },
          { status: 409 }
        )
      }
    }

    // Validate percentage if being changed
    if (data.type === 'percentage' && data.value && data.value > 100) {
      return NextResponse.json(
        { error: 'Percentage discount cannot exceed 100%' },
        { status: 400 }
      )
    }

    // Validate date range
    const validFrom = data.validFrom
      ? new Date(data.validFrom)
      : undefined
    const validUntil = data.validUntil
      ? new Date(data.validUntil)
      : undefined
    if (validFrom && validUntil && validFrom > validUntil) {
      return NextResponse.json(
        { error: 'Start date must be before end date' },
        { status: 400 }
      )
    }

    const coupon = await db.coupon.update({
      where: { id },
      data: {
        ...(data.code && { code: data.code }),
        ...(data.type && { type: data.type }),
        ...(data.value !== undefined && { value: data.value }),
        ...(data.minOrder !== undefined && { minOrder: data.minOrder }),
        ...(data.maxUses !== undefined && { maxUses: data.maxUses }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.validFrom !== undefined && { validFrom }),
        ...(data.validUntil !== undefined && { validUntil }),
      },
    })

    return NextResponse.json({
      message: `Coupon "${coupon.code}" updated`,
      coupon,
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      )
    }

    console.error('[COUPON_PUT] Error:', error)
    return NextResponse.json(
      { error: 'Failed to update coupon' },
      { status: 500 }
    )
  }
}

// ── DELETE: Delete coupon (admin only) ────────────────────────

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params

    const coupon = await db.coupon.findUnique({
      where: { id },
      include: {
        _count: {
          select: { orders: true },
        },
      },
    })

    if (!coupon) {
      return NextResponse.json(
        { error: 'Coupon not found' },
        { status: 404 }
      )
    }

    // Safety: reject if coupon has been used in any orders
    if (coupon._count.orders > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete coupon "${coupon.code}" — it has been used in ${coupon._count.orders} order(s). Deactivate it instead.`,
        },
        { status: 409 }
      )
    }

    await db.coupon.delete({ where: { id } })

    return NextResponse.json({
      message: `Coupon "${coupon.code}" deleted`,
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      )
    }

    console.error('[COUPON_DELETE] Error:', error)
    return NextResponse.json(
      { error: 'Failed to delete coupon' },
      { status: 500 }
    )
  }
}
