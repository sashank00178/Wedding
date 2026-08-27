/**
 * Admin Dashboard — GET /api/admin/dashboard
 *
 * What it does in plain language:
 *   Returns a summary of key business metrics for the admin dashboard.
 *   Think of it as the "at a glance" panel an admin sees when they
 *   log into the admin panel.
 *
 *   Returns in a single response:
 *   - Total revenue (sum of paid order totals)
 *   - Order counts by status (pending, processing, shipped, delivered, cancelled)
 *   - Total orders count
 *   - Total customers count
 *   - Total products count (active + total)
 *   - Recent orders (last 5)
 *   - Top-selling products (by quantity sold)
 *   - Revenue trend: this month vs last month
 *
 *   Protected by middleware + requireAdmin() double-check.
 *
 * ⚡ Place in: src/app/api/admin/dashboard/route.ts
 */

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, AuthError } from '@/lib/auth-helpers'

export async function GET() {
  try {
    // ── 1. Require admin (double-check after middleware) ─────────
    await requireAdmin()

    // ── 2. Fetch all dashboard data in parallel ─────────────────
    const [
      orderStats,
      customerCount,
      productStats,
      recentOrders,
      topProducts,
      couponStats,
      thisMonthRevenue,
      lastMonthRevenue,
    ] = await Promise.all([
      // Order counts by status
      db.order.groupBy({
        by: ['status'],
        _count: true,
        _sum: { total: true },
      }),

      // Total customers (excluding admins)
      db.user.count({
        where: { role: 'customer' },
      }),

      // Product counts (active vs total)
      Promise.all([
        db.product.count(),
        db.product.count({ where: { isActive: true } }),
        db.productVariant.aggregate({ _sum: { stockCount: true } }),
      ]),

      // Last 5 orders with basic info
      db.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          orderNumber: true,
          status: true,
          total: true,
          createdAt: true,
          user: { select: { name: true, email: true } },
        },
      }),

      // Top-selling products by total quantity sold
      db.orderItem.groupBy({
        by: ['productName'],
        _sum: { quantity: true, priceAtPurchase: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
      }),

      // Coupon usage stats
      db.coupon.aggregate({
        _sum: { usedCount: true },
        _count: true,
      }),

      // This month revenue
      db.order.aggregate({
        where: {
          createdAt: {
            gte: new Date(
              new Date().getFullYear(),
              new Date().getMonth(),
              1
            ),
          },
          status: { not: 'cancelled' },
        },
        _sum: { total: true },
        _count: true,
      }),

      // Last month revenue
      db.order.aggregate({
        where: {
          createdAt: {
            gte: new Date(
              new Date().getFullYear(),
              new Date().getMonth() - 1,
              1
            ),
            lt: new Date(
              new Date().getFullYear(),
              new Date().getMonth(),
              1
            ),
          },
          status: { not: 'cancelled' },
        },
        _sum: { total: true },
        _count: true,
      }),
    ])

    // ── 3. Build the status breakdown map ─────────────────────
    const statusBreakdown: Record<string, { count: number; revenue: number }> = {}
    for (const stat of orderStats) {
      statusBreakdown[stat.status] = {
        count: stat._count,
        revenue: stat._sum.total || 0,
      }
    }

    const totalOrders = orderStats.reduce((sum, s) => sum + s._count, 0)
    const totalRevenue = orderStats.reduce((sum, s) => sum + (s._sum.total || 0), 0)

    // ── 4. Build response ──────────────────────────────────────
    return NextResponse.json({
      // Revenue
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      thisMonthRevenue: Math.round((thisMonthRevenue._sum.total || 0) * 100) / 100,
      lastMonthRevenue: Math.round((lastMonthRevenue._sum.total || 0) * 100) / 100,
      revenueChange: calculateChange(
        thisMonthRevenue._sum.total || 0,
        lastMonthRevenue._sum.total || 0
      ),

      // Orders
      totalOrders,
      thisMonthOrders: thisMonthRevenue._count,
      lastMonthOrders: lastMonthRevenue._count,
      ordersByStatus: statusBreakdown,

      // Customers
      customerCount,

      // Products
      totalProducts: productStats[0],
      activeProducts: productStats[1],
      totalStock: productStats[2]._sum.stockCount || 0,

      // Coupons
      totalCoupons: couponStats._count,
      totalCouponUses: couponStats._sum.usedCount || 0,

      // Recent orders
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        status: o.status,
        total: o.total,
        customer: o.user?.name || 'Guest',
        customerEmail: o.user?.email || null,
        createdAt: o.createdAt,
      })),

      // Top products
      topProducts: topProducts.map((p) => ({
        name: p.productName,
        unitsSold: p._sum.quantity || 0,
      })),
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      )
    }

    console.error('[ADMIN_DASHBOARD_GET] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}

/** Calculate percentage change between two values */
function calculateChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 100 * 10) / 10
}
