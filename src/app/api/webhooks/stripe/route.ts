/**
 * Stripe Webhook — POST /api/webhooks/stripe
 *
 * What it does in plain language:
 *   Stripe calls this URL automatically when a payment event happens.
 *   We listen for two events:
 *
 *   1. checkout.session.completed
 *      → The user successfully paid. We create an Order record,
 *        an OrderItem for each cart item, a Payment record,
 *        deduct stock from variants, increment the coupon used count,
 *        and clear the cart.
 *
 *   2. checkout.session.async_payment_failed
 *      → Payment failed (e.g., card declined). We log it.
 *
 *   SECURITY: This route verifies the webhook signature using
 *   STRIPE_WEBHOOK_SECRET to ensure the request actually came from
 *   Stripe and not from an attacker trying to create fake orders.
 *
 *   To test locally, use the Stripe CLI:
 *     stripe listen --forward-to localhost:3000/api/webhooks/stripe
 *
 * ⚡ Place in: src/app/api/webhooks/stripe/route.ts
 */

import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { db } from '@/lib/db'
import { stripe } from '@/lib/stripe'
import { sendOrderConfirmation, sendAdminOrderNotification, sendPaymentFailed } from '@/lib/email'

// Disable Next.js body parsing — Stripe needs the raw body to verify the signature
export const runtime = 'nodejs'

// We need raw body for webhook signature verification.
// In Next.js App Router, we read the raw body manually.
export async function POST(request: Request) {
  try {
    // ── 1. Get the raw body and signature headers ──────────────────
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      console.error('[WEBHOOK] Missing stripe-signature header')
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      )
    }

    // ── 2. Verify the webhook signature ───────────────────────────
    // This ensures the event actually came from Stripe.
    // STRIPE_WEBHOOK_SECRET is set in .env (get it from Stripe CLI or Dashboard)
    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET || ''
      )
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      console.error(`[WEBHOOK] Signature verification failed: ${msg}`)
      return NextResponse.json(
        { error: `Webhook signature verification failed: ${msg}` },
        { status: 400 }
      )
    }

    // ── 3. Handle the event ──────────────────────────────────────
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutComplete(event.data.object as Stripe.Checkout.Session)
        break

      case 'checkout.session.async_payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Checkout.Session)
        break

      default:
        console.log(`[WEBHOOK] Unhandled event type: ${event.type}`)
    }

    // ── 4. Return 200 to acknowledge receipt ──────────────────────
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[WEBHOOK] Error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

/**
 * Handle successful checkout — create Order, OrderItems, Payment,
 * deduct stock, clear cart.
 */
async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const metadata = session.metadata
  if (!metadata) {
    console.error('[WEBHOOK] No metadata on session')
    return
  }

  const {
    orderNumber,
    userId,
    guestSessionId,
    cartId,
    shippingAddress,
    notes,
    subtotal,
    tax,
    shippingCost,
    discount,
    total,
    couponId,
    cartItems,
  } = metadata

  // Check if order already exists (idempotency — in case Stripe retries)
  const existingOrder = await db.order.findUnique({ where: { orderNumber } })
  if (existingOrder) {
    console.log(`[WEBHOOK] Order ${orderNumber} already exists — skipping`)
    return
  }

  // Parse the cart items from metadata
  let items: Array<{
    productVariantId: string
    productName: string
    variantName: string
    sku: string
    price: number
    quantity: number
  }> = []
  try {
    items = JSON.parse(cartItems || '[]')
  } catch {
    console.error('[WEBHOOK] Failed to parse cart items from metadata')
    return
  }

  // Parse address
  let address = shippingAddress
  try {
    address = JSON.parse(shippingAddress)
  } catch {
    // Already a string if not JSON
  }

  // ── Create everything in a database transaction ─────────────────
  // If anything fails, everything rolls back — no partial orders.
  await db.$transaction(async (tx) => {
    // 1. Create the Order
    const order = await tx.order.create({
      data: {
        userId: userId || null,
        orderNumber,
        status: 'pending', // will be updated to "processing" after review
        subtotal: parseFloat(subtotal),
        tax: parseFloat(tax),
        shippingCost: parseFloat(shippingCost),
        discount: parseFloat(discount),
        total: parseFloat(total),
        shippingAddr: typeof address === 'string' ? address : JSON.stringify(address),
        notes: notes || null,
        couponId: couponId || null,
      },
    })

    // 2. Create OrderItems (snapshot of prices at purchase time)
    const variantProductIds = new Set<string>()
    for (const item of items) {
      await tx.orderItem.create({
        data: {
          orderId: order.id,
          productVariantId: item.productVariantId,
          productName: item.productName,
          variantName: item.variantName,
          priceAtPurchase: item.price,
          quantity: item.quantity,
        },
      })

      // 3. Deduct stock from the variant
      await tx.productVariant.update({
        where: { id: item.productVariantId },
        data: { stockCount: { decrement: item.quantity } },
      })

      // Track which products need stock recalculation
      variantProductIds.add(item.productVariantId)
    }

    // 4. Recalculate aggregated stockCount for affected products
    // (done AFTER all variant decrements to avoid double-decrement bugs)
    for (const variantId of variantProductIds) {
      const variant = await tx.productVariant.findUnique({
        where: { id: variantId },
        select: { productId: true },
      })
      if (variant) {
        const aggregate = await tx.productVariant.aggregate({
          where: { productId: variant.productId },
          _sum: { stockCount: true },
        })
        await tx.product.update({
          where: { id: variant.productId },
          data: { stockCount: Math.max(0, aggregate._sum.stockCount || 0) },
        })
      }
    }

    // 5. Create the Payment record
    await tx.payment.create({
      data: {
        orderId: order.id,
        stripeSessionId: session.id,
        amount: session.amount_total ? session.amount_total / 100 : parseFloat(total),
        currency: session.currency || 'npr',
        status: 'succeeded',
        method: 'stripe',
        metadata: JSON.stringify({
          paymentIntent: session.payment_intent,
          customerEmail: session.customer_details?.email,
          paymentMethod: session.payment_method_types?.[0],
        }),
        paidAt: new Date(),
      },
    })

    // 6. Increment coupon used count
    if (couponId) {
      await tx.coupon.update({
        where: { id: couponId },
        data: { usedCount: { increment: 1 } },
      })
    }

    // 7. Clear the cart items
    if (cartId) {
      await tx.cartItem.deleteMany({ where: { cartId } })
      // Delete the empty cart
      await tx.cart.delete({ where: { id: cartId } }).catch(() => {
        // Cart might already be deleted or not exist — that's fine
      })
    }

    console.log(`[WEBHOOK] Order created: ${orderNumber} — रु ${total}`)
  })

  // ── 9. Send confirmation emails ───────────────────────────────
  // Fire-and-forget — don't block the webhook response on email delivery
  const customerEmail = session.customer_details?.email
  const customerName = session.customer_details?.name || 'Valued Customer'

  // Customer confirmation
  if (customerEmail) {
    sendOrderConfirmation({
      to: customerEmail,
      customerName,
      orderNumber,
      items: items.map(i => ({
        name: i.productName,
        variant: i.variantName,
        price: i.price,
        quantity: i.quantity,
      })),
      subtotal: parseFloat(subtotal),
      discount: parseFloat(discount),
      tax: parseFloat(tax),
      shippingCost: parseFloat(shippingCost),
      total: parseFloat(total),
      shippingAddress: typeof address === 'string' ? address : JSON.stringify(address),
      status: 'pending',
    }).catch((err) => {
      console.error(`[WEBHOOK] Failed to send order confirmation to ${customerEmail}:`, err)
    })
  }

  // Admin notification
  sendAdminOrderNotification({
    orderNumber,
    customerName,
    customerEmail: customerEmail || 'Guest',
    total: parseFloat(total),
    itemCount: items.length,
  }).catch((err) => {
    console.error('[WEBHOOK] Failed to send admin notification:', err)
  })
}

/**
 * Handle failed payment — notify the customer.
 */
async function handlePaymentFailed(session: Stripe.Checkout.Session) {
  const orderNumber = session.metadata?.orderNumber || 'unknown'
  console.log(`[WEBHOOK] Payment failed for order: ${orderNumber}`)

  // Notify customer about the failure
  const customerEmail = session.customer_details?.email
  const customerName = session.customer_details?.name || 'Customer'

  if (customerEmail) {
    sendPaymentFailed({
      to: customerEmail,
      customerName,
      orderNumber,
    }).catch((err) => {
      console.error(`[WEBHOOK] Failed to send payment failure notification:`, err)
    })
  }
}
