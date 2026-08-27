/**
 * Admin Order Status Update — PUT /api/orders/[id]/status
 *
 * What it does in plain language:
 *   Allows admins to update the status of an order.
 *
 *   - Requires admin role (throws 403 if not admin)
 *   - Validates the status transition using a state machine:
 *       pending → processing | cancelled
 *       processing → shipped | cancelled
 *       shipped → delivered
 *       delivered → (terminal — no further transitions)
 *       cancelled → (terminal — no further transitions)
 *   - Optionally sets a tracking number (useful for shipped status)
 *   - Optionally adds an admin note
 *   - If order is cancelled and was paid, logs for refund (STEP 8/9)
 *
 * Body: { status: string, trackingNumber?: string, adminNote?: string }
 *
 * ⚡ Place in: src/app/api/orders/[id]/status/route.ts
 */

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, AuthError } from '@/lib/auth-helpers'
import {
  updateOrderStatusSchema,
  STATUS_TRANSITIONS,
  OrderStatus,
} from '@/lib/validations/checkout'
import { sendOrderStatusUpdate } from '@/lib/email'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ── 1. Require admin ─────────────────────────────────────────
    await requireAdmin()
    const { id } = await params

    // ── 2. Validate input ───────────────────────────────────────
    const body = await request.json()
    const result = updateOrderStatusSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      )
    }

    const { status: newStatus, trackingNumber, adminNote } = result.data

    // ── 3. Fetch the current order (with user email for notifications) ──
    const order = await db.order.findUnique({
      where: { id },
      include: {
        payment: {
          select: { status: true, amount: true, stripeSessionId: true },
        },
        user: {
          select: { name: true, email: true },
        },
      },
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // ── 4. Validate status transition ─────────────────────────
    const currentStatus = order.status as OrderStatus
    const allowedTransitions = STATUS_TRANSITIONS[currentStatus]

    if (!allowedTransitions.includes(newStatus)) {
      return NextResponse.json(
        {
          error: `Cannot transition order from "${currentStatus}" to "${newStatus}". Allowed: ${allowedTransitions.join(', ') || 'none (terminal state)'}`,
        },
        { status: 409 }
      )
    }

    // ── 5. Update the order status ──────────────────────────────
    const updatedOrder = await db.order.update({
      where: { id },
      data: {
        status: newStatus,
        notes: adminNote
          ? [order.notes, `[Admin] ${adminNote}`].filter(Boolean).join('\n')
          : order.notes,
        // Store tracking number in notes if provided
        // (trackingNumber column could be added to schema later)
        ...(trackingNumber
          ? {
              notes: [
                order.notes,
                `[Tracking] ${trackingNumber}`,
              ]
                .filter(Boolean)
                .join('\n'),
            }
          : {}),
      },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        updatedAt: true,
      },
    })

    // ── 6. Handle cancellation refund logic ─────────────────────
    // If the order is being cancelled and payment was succeeded,
    // log it for refund processing
    if (newStatus === 'cancelled' && order.payment?.status === 'succeeded') {
      console.log(
        `[ORDER_CANCEL] Refund needed for ${order.orderNumber} — ` +
        `amount: ${order.payment.amount}, stripeSessionId: ${order.payment.stripeSessionId}`
      )
      // TODO: In production, initiate Stripe refund here
    }

    // ── 7. Send status update email (shipped / delivered) ──────────
    // Fire-and-forget — don't block the response on email delivery
    if ((newStatus === 'shipped' || newStatus === 'delivered') && order.user?.email) {
      sendOrderStatusUpdate({
        to: order.user.email,
        customerName: order.user.name || 'Valued Customer',
        orderNumber: order.orderNumber,
        newStatus: newStatus as 'shipped' | 'delivered',
        trackingNumber: trackingNumber || undefined,
        adminNote: adminNote || undefined,
      }).catch((err) => {
        console.error(`[ORDER_STATUS] Failed to send status email:`, err)
      })
    }

    return NextResponse.json({
      message: `Order ${order.orderNumber} updated to "${newStatus}"`,
      order: updatedOrder,
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      )
    }

    console.error('[ORDER_STATUS_PUT] Error:', error)
    return NextResponse.json(
      { error: 'Failed to update order status' },
      { status: 500 }
    )
  }
}
