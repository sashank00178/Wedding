/**
 * Single Order API — GET /api/orders/[id]
 *
 * What it does in plain language:
 *   Returns the full detail of a single order, including:
 *   - Order header (number, status, totals, timestamps)
 *   - All order items (product name, variant, price snapshot, quantity)
 *   - Payment record (status, method, paid date)
 *   - Shipping address (parsed JSON)
 *   - Coupon used (if any)
 *
 *   Both customers and admins can access this route, but:
 *   - Customers can only see their OWN orders
 *   - Admins can see any order
 *
 * ⚡ Place in: src/app/api/orders/[id]/route.ts
 */

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, AuthError } from '@/lib/auth-helpers'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ── 1. Require authentication ──────────────────────────────
    const session = await requireAuth()
    const userId = session.user.id
    const userRole = (session.user as { role?: string }).role
    const { id } = await params

    // ── 2. Fetch the order ─────────────────────────────────────
    const order = await db.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            productVariant: {
              select: {
                sku: true,
                attributes: true,
              },
            },
          },
        },
        payment: true,
        coupon: {
          select: {
            code: true,
            type: true,
            value: true,
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // ── 3. Ownership check — customers can only see their orders ─
    // Admins can see any order
    if (userRole !== 'admin' && order.userId !== userId) {
      return NextResponse.json(
        { error: 'You do not have permission to view this order' },
        { status: 403 }
      )
    }

    // ── 4. Parse shipping address from JSON string ─────────────
    let shippingAddress: unknown = null
    try {
      shippingAddress = JSON.parse(order.shippingAddr)
    } catch {
      // If it's not valid JSON, return as-is
      shippingAddress = { raw: order.shippingAddr }
    }

    // ── 5. Parse variant attributes from JSON string ────────────
    const items = order.items.map((item) => {
      let attributes = {}
      try {
        attributes = JSON.parse(item.productVariant.attributes)
      } catch {
        // keep empty object
      }
      return {
        id: item.id,
        productVariantId: item.productVariantId,
        productName: item.productName,
        variantName: item.variantName,
        sku: item.productVariant.sku,
        attributes,
        priceAtPurchase: item.priceAtPurchase,
        quantity: item.quantity,
        lineTotal: Math.round(item.priceAtPurchase * item.quantity * 100) / 100,
      }
    })

    // ── 6. Return the order ─────────────────────────────────────
    return NextResponse.json({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      subtotal: order.subtotal,
      tax: order.tax,
      shippingCost: order.shippingCost,
      discount: order.discount,
      total: order.total,
      shippingAddress,
      notes: order.notes,
      coupon: order.coupon
        ? {
            code: order.coupon.code,
            type: order.coupon.type,
            value: order.coupon.value,
          }
        : null,
      items,
      payment: order.payment
        ? {
            id: order.payment.id,
            amount: order.payment.amount,
            currency: order.payment.currency,
            status: order.payment.status,
            method: order.payment.method,
            paidAt: order.payment.paidAt,
          }
        : null,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      )
    }

    console.error('[ORDER_DETAIL_GET] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    )
  }
}
