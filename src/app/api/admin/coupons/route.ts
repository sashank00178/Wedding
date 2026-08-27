/**
 * Admin Coupons — /api/admin/coupons
 *
 * GET   — List all coupons with filters (search, type, active status)
 * POST  — Create a new coupon
 *
 * Protected by middleware + requireAdmin() double-check.
 *
 * ⚡ Place in: src/app/api/admin/coupons/route.ts
 */

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, AuthError } from '@/lib/auth-helpers'
import { z } from 'zod'

// ── Validation Schemas ──────────────────────────────────────────────

const adminCouponListSchema = z.object({
  isActive: z.enum(['true', 'false']).optional().transform(v => v === 'true' ? true : v === 'false' ? false : undefined),
  type: z.enum(['percentage', 'fixed']).optional(),
  search: z.string().max(50).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

const createCouponSchema = z.object({
  code: z
    .string()
    .min(3, 'Code must be at least 3 characters')
    .max(50, 'Code too long')
    .toUpperCase()
    .trim(),
  type: z.enum(['percentage', 'fixed']),
  value: z.number().positive('Value must be positive'),
  minOrder: z.number().min(0).default(0),
  maxUses: z.number().int().positive().nullable().default(null),
  validFrom: z.string().optional().default(() => new Date().toISOString()),
  validUntil: z.string().nullable().optional().default(null),
  isActive: z.boolean().default(true),
})

// ── GET: List all coupons ──────────────────────────────────────────

export async function GET(request: Request) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const query = adminCouponListSchema.safeParse(
      Object.fromEntries(searchParams)
    )

    if (!query.success) {
      return NextResponse.json(
        { error: query.error.issues[0].message },
        { status: 400 }
      )
    }

    const { isActive, type, search, page, limit } = query.data
    const skip = (page - 1) * limit

    // ── Build where clause ───────────────────────────────────────
    const where: Record<string, unknown> = {}

    if (isActive !== undefined) {
      where.isActive = isActive
    }

    if (type) {
      where.type = type
    }

    if (search) {
      where.code = { contains: search }
    }

    // ── Fetch coupons ──────────────────────────────────────────
    const [coupons, total] = await Promise.all([
      db.coupon.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.coupon.count({ where }),
    ])

    return NextResponse.json({
      coupons,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      )
    }

    console.error('[ADMIN_COUPONS_GET] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch coupons' },
      { status: 500 }
    )
  }
}

// ── POST: Create a new coupon ────────────────────────────────────────

export async function POST(request: Request) {
  try {
    await requireAdmin()

    const body = await request.json()
    const parsed = createCouponSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const data = parsed.data

    // Validate percentage type ≤ 100
    if (data.type === 'percentage' && data.value > 100) {
      return NextResponse.json(
        { error: 'Percentage discount cannot exceed 100%.' },
        { status: 400 }
      )
    }

    // Check for duplicate code
    const existing = await db.coupon.findUnique({
      where: { code: data.code },
    })

    if (existing) {
      return NextResponse.json(
        { error: `Coupon code "${data.code}" already exists.` },
        { status: 409 }
      )
    }

    // ── Create coupon ───────────────────────────────────────────
    const coupon = await db.coupon.create({
      data: {
        code: data.code,
        type: data.type,
        value: data.value,
        minOrder: data.minOrder,
        maxUses: data.maxUses,
        validFrom: new Date(data.validFrom!),
        validUntil: data.validUntil ? new Date(data.validUntil) : null,
        isActive: data.isActive,
      },
    })

    return NextResponse.json(
      { coupon, message: 'Coupon created successfully.' },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      )
    }

    console.error('[ADMIN_COUPONS_POST] Error:', error)
    return NextResponse.json(
      { error: 'Failed to create coupon' },
      { status: 500 }
    )
  }
}
