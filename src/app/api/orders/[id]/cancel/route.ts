/**
 * Customer Order Cancellation — POST /api/orders/[id]/cancel
 *
 * What it does in plain language:
 *   Allows a customer to cancel their own order — but ONLY if:
 *   - The order belongs to them (ownership check)
 *   - The order status is "pending" (not yet processing/shipped)
 *
 *   Once cancelled, the order status changes to "cancelled".
 *   If the payment was already completed, a refund is logged
 *   (actual Stripe refund processed in STEP 8/9).
 *
 *   Customers CANNOT cancel orders that are already processing,
 *   shipped, delivered, or already cancelled.
 *
 * Body: { reason?: string } — optional cancellation reason
 *
 * ⚡ Place in: src/app/api/orders/[id]/cancel/route.ts
 */

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, AuthError } from '@/lib/auth-helpers'
import { cancelOrderSchema } from '@/lib/validations/checkout'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ── 1. Require authentication ──────────────────────────────
    const session = await requireAuth()
    const userId = session.user.id
    const { id } = await params

    // ── 2. Validate body (optional reason) ─────────────────────
    const body = await request.json().catch(() => ({}))
    const result = cancelOrderSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      )
    }

    const { reason } = result.data

    // ── 3. Fetch the order ──────────────────────────────────────
    const order = await db.order.findUnique({
      where: { id },
      include: {
        payment: {
          select: { status: true, amount: true, stripeSessionId: true },
        },
      },
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // ── 4. Ownership check ─────────────────────────────────────
    if (order.userId !== userId) {
      return NextResponse.json(
        { error: 'You can only cancel your own orders' },
        { status: 403 }
      )
    }

    // ── 5. Status check — only pending orders can be cancelled ─
    if (order.status !== 'pending') {
      return NextResponse.json(
        {
          error: `Cannot cancel order with status "${order.status}". Only pending orders can be cancelled.`,
        },
        { status: 409 }
      )
    }

    // ── 6. Cancel the order ────────────────────────────────────
    const updatedOrder = await db.order.update({
      where: { id },
      data: {
        status: 'cancelled',
        notes: [
          order.notes,
          `[Cancelled by customer] ${reason || 'No reason provided'}`,
        ]
          .filter(Boolean)
          .join('\n'),
      },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        updatedAt: true,
      },
    })

    // ── 7. Log refund needed if payment was completed ──────────
    if (order.payment?.status === 'succeeded') {
      console.log(
        `[ORDER_CANCEL] Refund needed for ${order.orderNumber} — ` +
        `amount: ${order.payment.amount}, stripeSessionId: ${order.payment.stripeSessionId}`
      )
      // TODO: In production, initiate Stripe refund here or in STEP 9
    }

    return NextResponse.json({
      message: `Order ${order.orderNumber} has been cancelled`,
      order: updatedOrder,
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      )
    }

    console.error('[ORDER_CANCEL_POST] Error:', error)
    return NextResponse.json(
      { error: 'Failed to cancel order' },
      { status: 500 }
    )
  }
}
