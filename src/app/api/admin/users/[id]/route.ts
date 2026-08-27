/**
 * Admin User Detail — GET /api/admin/users/[id]
 *
 * What it does in plain language:
 *   Returns full detail of a single user including their order history.
 *   Used by admins to view a customer's profile and past orders.
 *
 *   - Requires admin role
 *   - Includes user profile (without password hash)
 *   - Includes their order history (summary list)
 *   - Includes their review count
 *
 * ⚡ Place in: src/app/api/admin/users/[id]/route.ts
 */

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, AuthError } from '@/lib/auth-helpers'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params

    // ── 1. Fetch user ───────────────────────────────────────────
    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        // NEVER include passwordHash
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // ── 2. Fetch user's order summary ──────────────────────────
    const orders = await db.order.findMany({
      where: { userId: id },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        total: true,
        createdAt: true,
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 20, // last 20 orders
    })

    // ── 3. Aggregate stats ─────────────────────────────────────
    const orderStats = await db.order.aggregate({
      where: { userId: id },
      _count: true,
      _sum: { total: true },
    })

    const reviewCount = await db.review.count({ where: { userId: id } })

    return NextResponse.json({
      ...user,
      stats: {
        totalOrders: orderStats._count,
        totalSpent: Math.round((orderStats._sum.total || 0) * 100) / 100,
        reviewCount,
      },
      orders,
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      )
    }

    console.error('[ADMIN_USER_DETAIL_GET] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}
