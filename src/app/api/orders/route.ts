/**
 * Orders API — GET /api/orders
 *
 * What it does in plain language:
 *   Returns the authenticated user's order history.
 *
 *   - Requires login (throws 401 if not authenticated)
 *   - Supports filtering by status (pending, shipped, etc.)
 *   - Paginated results with page/limit query params
 *   - Sorted by newest first
 *   - Returns order summary (no items — use GET /api/orders/:id for detail)
 *
 * Query params:
 *   ?status=pending    — filter by status (optional)
 *   ?page=1            — page number (default: 1)
 *   ?limit=20          — items per page (default: 20, max: 100)
 *
 * ⚡ Place in: src/app/api/orders/route.ts
 */

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, AuthError } from '@/lib/auth-helpers'
import { orderListSchema } from '@/lib/validations/checkout'

export async function GET(request: Request) {
  try {
    // ── 1. Require authentication ──────────────────────────────
    const session = await requireAuth()
    const userId = session.user.id

    // ── 2. Validate query params ───────────────────────────────
    const { searchParams } = new URL(request.url)
    const query = orderListSchema.safeParse(Object.fromEntries(searchParams))

    if (!query.success) {
      return NextResponse.json(
        { error: query.error.issues[0].message },
        { status: 400 }
      )
    }

    const { status, page, limit } = query.data
    const skip = (page - 1) * limit

    // ── 3. Build the where clause ──────────────────────────────
    const where: Record<string, unknown> = { userId }
    if (status) {
      where.status = status
    }

    // ── 4. Fetch orders with pagination ─────────────────────────
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
          // Include payment status for quick reference
          payment: {
            select: {
              status: true,
              method: true,
            },
          },
          // Include item count
          _count: {
            select: { items: true },
          },
        },
        orderBy: { createdAt: 'desc' },
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
    // Handle auth errors thrown by requireAuth()
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      )
    }

    console.error('[ORDERS_GET] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}
