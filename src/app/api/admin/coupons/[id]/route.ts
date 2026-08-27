/**
 * Admin Coupon Detail — /api/admin/coupons/[id]
 *
 * GET    — Get single coupon detail with usage stats
 * PATCH  — Update coupon (code, value, dates, active status)
 * DELETE — Soft-delete (deactivate) or hard-delete a coupon
 *
 * Protected by middleware + requireAdmin() double-check.
 *
 * ⚡ Place in: src/app/api/admin/coupons/[id]/route.ts
 */

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, AuthError } from '@/lib/auth-helpers'
import { z } from 'zod'

const updateCouponSchema = z.object({
  code: z.string().min(3).max(50).toUpperCase().trim().optional(),
  type: z.enum(['percentage', 'fixed']).optional(),
  value: z.number().positive().optional(),
  minOrder: z.number().min(0).optional(),
  maxUses: z.number().int().positive().nullable().optional(),
  validFrom: z.string().optional(),
  validUntil: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
})

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params

    const coupon = await db.coupon.findUnique({ where: { id } })

    if (!coupon) {
      return NextResponse.json(
        { error: 'Coupon not found' },
        { status: 404 }
      )
    }

    // ── Usage stats ─────────────────────────────────────────────
    const ordersUsingCoupon = await db.order.count({
      where: { couponId: id },
    })

    const revenueFromCoupon = await db.order.aggregate({
      where: { couponId: id, status: { not: 'cancelled' } },
      _sum: { discount: true },
    })

    return NextResponse.json({
      ...coupon,
      stats: {
        timesUsed: ordersUsingCoupon,
        totalDiscountGiven: revenueFromCoupon._sum.discount || 0,
      },
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      )
    }

    console.error('[ADMIN_COUPON_DETAIL_GET] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch coupon' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params

    const body = await request.json()
    const parsed = updateCouponSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    // Check coupon exists
    const existing = await db.coupon.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Coupon not found' },
        { status: 404 }
      )
    }

    // If updating code, check for duplicates
    if (parsed.data.code && parsed.data.code !== existing.code) {
      const duplicate = await db.coupon.findUnique({
        where: { code: parsed.data.code },
      })
      if (duplicate) {
        return NextResponse.json(
          { error: `Coupon code "${parsed.data.code}" already exists.` },
          { status: 409 }
        )
      }
    }

    // Validate percentage type
    if (
      parsed.data.type === 'percentage' &&
      parsed.data.value !== undefined &&
      parsed.data.value > 100
    ) {
      return NextResponse.json(
        { error: 'Percentage discount cannot exceed 100%.' },
        { status: 400 }
      )
    }

    // ── Build update data ───────────────────────────────────────
    const updateData: Record<string, unknown> = {}
    if (parsed.data.code !== undefined) updateData.code = parsed.data.code
    if (parsed.data.type !== undefined) updateData.type = parsed.data.type
    if (parsed.data.value !== undefined) updateData.value = parsed.data.value
    if (parsed.data.minOrder !== undefined) updateData.minOrder = parsed.data.minOrder
    if (parsed.data.maxUses !== undefined) updateData.maxUses = parsed.data.maxUses
    if (parsed.data.isActive !== undefined) updateData.isActive = parsed.data.isActive
    if (parsed.data.validFrom !== undefined) updateData.validFrom = new Date(parsed.data.validFrom)
    if (parsed.data.validUntil !== undefined) {
      updateData.validUntil = parsed.data.validUntil
        ? new Date(parsed.data.validUntil)
        : null
    }

    const updated = await db.coupon.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({
      coupon: updated,
      message: 'Coupon updated successfully.',
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      )
    }

    console.error('[ADMIN_COUPON_PATCH] Error:', error)
    return NextResponse.json(
      { error: 'Failed to update coupon' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params

    const existing = await db.coupon.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Coupon not found' },
        { status: 404 }
      )
    }

    // ── Soft-delete: deactivate instead of hard delete ─────────
    // Coupons linked to orders should not be hard-deleted (FK constraint + audit trail)
    await db.coupon.update({
      where: { id },
      data: { isActive: false },
    })

    return NextResponse.json({
      message: 'Coupon deactivated successfully.',
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      )
    }

    console.error('[ADMIN_COUPON_DELETE] Error:', error)
    return NextResponse.json(
      { error: 'Failed to delete coupon' },
      { status: 500 }
    )
  }
}
