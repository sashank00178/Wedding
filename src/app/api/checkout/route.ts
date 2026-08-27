/**
 * Checkout API — POST /api/checkout
 *
 * What it does in plain language:
 *   1. Validates the shipping address and optional coupon code
 *   2. Fetches the user's cart (or guest cart) with all items
 *   3. Validates stock for every item (rejects if anything is out of stock)
 *   4. Validates the coupon code (if provided) and calculates the discount
 *   5. Creates a Stripe Checkout Session with line items and metadata
 *   6. Returns the Stripe checkout URL — the frontend redirects the user there
 *
 *   When the user completes payment, Stripe calls our webhook (webhook route)
 *   which creates the Order and Payment records in the database.
 *
 * Flow:
 *   Frontend → POST /api/checkout → Stripe Checkout Page → User Pays
 *   → Stripe Webhook → POST /api/webhooks/stripe → Order Created
 *
 * ⚡ Place in: src/app/api/checkout/route.ts
 */

import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { db } from '@/lib/db'
import { getAuthSession } from '@/lib/auth-helpers'
import { checkoutSchema } from '@/lib/validations/checkout'
import { generateOrderNumber } from '@/lib/ecommerce'
import { stripe } from '@/lib/stripe'
import { checkoutLimiter, getClientIp } from '@/lib/rate-limit'
import { rateLimitResponse } from '@/lib/security-headers'

export async function POST(request: Request) {
  try {
    // ── 0. Rate limiting ──────────────────────────────────────────
    const ip = getClientIp(request)
    const rateResult = checkoutLimiter.check(ip)
    if (!rateResult.allowed) {
      return rateLimitResponse(rateResult.message, {
        remaining: rateResult.remaining,
        resetAt: rateResult.resetAt,
      })
    }

    // ── 1. Identify the user ──────────────────────────────────────
    const session = await getAuthSession()
    const userId = session?.user?.id
    const guestSessionId = request.headers.get('x-guest-session-id')

    if (!userId && !guestSessionId) {
      return NextResponse.json(
        { error: 'Please log in or provide a guest session ID' },
        { status: 400 }
      )
    }

    // ── 2. Validate checkout input ────────────────────────────────
    const body = await request.json()
    const result = checkoutSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      )
    }

    const { shippingAddress, couponCode, notes } = result.data

    // ── 3. Fetch the cart ──────────────────────────────────────────
    const cart = await db.cart.findFirst({
      where: userId ? { userId } : { guestSessionId: guestSessionId! },
      include: {
        items: {
          include: {
            productVariant: {
              include: { product: { select: { isActive: true, name: true } } },
            },
          },
        },
      },
    })

    if (!cart || cart.items.length === 0) {
      return NextResponse.json(
        { error: 'Your cart is empty. Add items before checking out.' },
        { status: 400 }
      )
    }

    // ── 4. Validate stock for all items ────────────────────────────
    for (const item of cart.items) {
      if (!item.productVariant.product.isActive) {
        return NextResponse.json(
          { error: `"${item.productVariant.product.name}" is no longer available. Please remove it from your cart.` },
          { status: 409 }
        )
      }
      if (item.productVariant.stockCount < item.quantity) {
        return NextResponse.json(
          { error: `Only ${item.productVariant.stockCount} units of "${item.productVariant.product.name}" available. Please update your cart.` },
          { status: 409 }
        )
      }
    }

    // ── 5. Calculate totals + coupon ─────────────────────────────
    let subtotal = 0
    for (const item of cart.items) {
      subtotal += item.productVariant.price * item.quantity
    }

    let discount = 0
    let couponId: string | null = null
    const tax = 0 // Nepal doesn't have VAT on services — adjust if needed
    const shippingCost = 0 // Free shipping — adjust if needed

    // Validate coupon code if provided
    if (couponCode) {
      const coupon = await db.coupon.findUnique({ where: { code: couponCode } })

      if (
        !coupon ||
        !coupon.isActive ||
        (coupon.validFrom && coupon.validFrom > new Date()) ||
        (coupon.validUntil && coupon.validUntil < new Date()) ||
        (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) ||
        (coupon.minOrder !== null && subtotal < coupon.minOrder)
      ) {
        return NextResponse.json(
          { error: 'This coupon code is invalid, expired, or cannot be applied to your order.' },
          { status: 400 }
        )
      }

      // Calculate discount
      if (coupon.type === 'percentage') {
        discount = Math.round(subtotal * (coupon.value / 100) * 100) / 100
      } else {
        discount = Math.min(coupon.value, subtotal)
      }

      couponId = coupon.id
    }

    const total = Math.round((subtotal + tax + shippingCost - discount) * 100) / 100

    if (total <= 0) {
      return NextResponse.json(
        { error: 'Order total must be greater than zero.' },
        { status: 400 }
      )
    }

    // ── 6. Generate order number ──────────────────────────────────
    const orderNumber = generateOrderNumber()

    // ── 7. Create Stripe Checkout Session ──────────────────────────
    // We pass all the data as metadata so the webhook can create the order.
    // Stripe metadata has a 500-char limit per value, so we store the
    // cart items as a JSON string and the full address too.
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
      cart.items.map((item) => ({
        price_data: {
          currency: 'npr', // Nepalese Rupee — change to 'usd' if needed
          product_data: {
            name: item.productVariant.product.name,
            description: item.productVariant.name,
          },
          // Stripe expects amounts in the smallest currency unit (paisa)
          unit_amount: Math.round(item.productVariant.price * 100),
        },
        quantity: item.quantity,
      }))

    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: lineItems,
      success_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/?payment=success`,
      cancel_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/?payment=cancelled`,
      metadata: {
        orderNumber,
        userId: userId || '',
        guestSessionId: guestSessionId || '',
        cartId: cart.id,
        shippingAddress: JSON.stringify(shippingAddress),
        notes,
        subtotal: String(subtotal),
        tax: String(tax),
        shippingCost: String(shippingCost),
        discount: String(discount),
        total: String(total),
        couponId: couponId || '',
        cartItems: JSON.stringify(
          cart.items.map((i) => ({
            productVariantId: i.productVariantId,
            productName: i.productVariant.product.name,
            variantName: i.productVariant.name,
            sku: i.productVariant.sku,
            price: i.productVariant.price,
            quantity: i.quantity,
          }))
        ),
      },
      // Automatic tax calculation (optional — requires Stripe Tax)
      // automatic_tax: { enabled: false },
    })

    // ── 8. Return the checkout URL ────────────────────────────────
    return NextResponse.json({
      checkoutUrl: stripeSession.url,
      sessionId: stripeSession.id,
      orderNumber,
    })
  } catch (error) {
    console.error('[CHECKOUT_POST] Error:', error)

    // Stripe API errors
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: `Payment error: ${error.message}` },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create checkout session. Please try again.' },
      { status: 500 }
    )
  }
}
