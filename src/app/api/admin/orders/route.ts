/**
 * Admin Orders — GET /api/admin/orders
 *
 * What it does in plain language:
 *   Returns ALL orders (not just one user's) for the admin panel.
 *   Includes powerful filtering and search capabilities:
 *
 *   - Search by order number
 *   - Filter by status
 *   - Sort by createdAt, total, or status
 *   - Pagination
 *   - Includes customer name + email on each order
 *
 *   This is separate from GET /api/orders (customer's own orders).
 *
 * ⚡ Place in: src/app/api/admin/orders/route.ts
 */

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, AuthError } from '@/lib/auth-helpers'
import { adminOrderListSchema } from '@/lib/validations/checkout'

export async function GET(request: Request) {
  try {
    // ── 1. Require admin ────────────────────────────────────────
    await requireAdmin()

    // ── 2. Validate query params ─────────────────────────────────
    const { searchParams } = new URL(request.url)
    const query = adminOrderListSchema.safeParse(
      Object.fromEntries(searchParams)
    )

    if (!query.success) {
      return NextResponse.json(
        { error: query.error.issues[0].message },
        { status: 400 }
      )
    }

    const { status, search, sortBy, sortOrder, page, limit } = query.data
    const skip = (page - 1) * limit

    // ── 3. Build the where clause ───────────────────────────────
    const where: Record<string, unknown> = {}

    if (status) {
      where.status = status
    }

    if (search) {
      where.orderNumber = { contains: search }
    }

    // ── 4. Build the orderBy clause ─────────────────────────────
    const orderBy: Record<string, string> = {}
    orderBy[sortBy] = sortOrder

    // ── 5. Fetch orders with pagination ──────────────────────────
    const [orders, total] = await Promise.all([
      db.order.findMany({
        where,
        select: {
          id: true,
          orderNumber: true,
          status: true,
          subtotal: true,
          tax: true,
          shippingCost: true,
          discount: true,
          total: true,
          createdAt: true,
          updatedAt: true,
          payment: {
            select: {
              status: true,
              method: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: { items: true },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      db.order.count({ where }),
    ])

    return NextResponse.json({
      orders,
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

    console.error('[ADMIN_ORDERS_GET] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}
