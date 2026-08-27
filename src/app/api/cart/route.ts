/**
 * Cart API — GET /api/cart
 *
 * What it does in plain language:
 *   Returns the current user's cart (or guest's cart) with all items,
 *   product details, variant info, and calculated totals.
 *
 *   - Logged-in users: finds cart by userId
 *   - Guest users: finds cart by guestSessionId query param
 *     (the frontend stores this in a cookie)
 *
 * Response includes:
 *   - items[] with product name, variant, price, quantity
 *   - subtotal (before discounts)
 *   - discount amount (if coupon applied)
 *   - total (subtotal - discount)
 *
 * ⚡ Place in: src/app/api/cart/route.ts
 */

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthSession } from '@/lib/auth-helpers'

export async function GET(request: Request) {
  try {
    // ── 1. Determine whose cart to fetch ───────────────────────────
    const { searchParams } = new URL(request.url)
    const guestSessionId = searchParams.get('guestSessionId')

    // Try logged-in user first, fall back to guest
    const session = await getAuthSession()
    const userId = session?.user?.id

    if (!userId && !guestSessionId) {
      return NextResponse.json(
        { error: 'Please log in or provide a guest session ID' },
        { status: 400 }
      )
    }

    // ── 2. Find the cart ──────────────────────────────────────────
    const cart = await db.cart.findFirst({
      where: userId ? { userId } : { guestSessionId },
      include: {
        items: {
          include: {
            productVariant: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                    images: true,
                    isActive: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    // No cart yet = empty cart
    if (!cart) {
      return NextResponse.json({
        items: [],
        subtotal: 0,
        discount: 0,
        total: 0,
      })
    }

    // ── 3. Calculate totals ───────────────────────────────────────
    let subtotal = 0
    const items = cart.items.map((item) => {
      const unitPrice = item.productVariant.price
      const lineTotal = unitPrice * item.quantity
      subtotal += lineTotal

      return {
        id: item.id,
        productVariantId: item.productVariantId,
        productName: item.productVariant.product.name,
        productSlug: item.productVariant.product.slug,
        productImage: item.productVariant.product.isActive
          ? (() => {
              try {
                const imgs = JSON.parse(item.productVariant.product.images)
                return imgs[0] || null
              } catch {
                return null
              }
            })()
          : null,
        variantName: item.productVariant.name,
        variantSku: item.productVariant.sku,
        unitPrice,
        quantity: item.quantity,
        lineTotal,
        inStock: item.productVariant.stockCount >= item.quantity,
      }
    })

    return NextResponse.json({
      cartId: cart.id,
      items,
      subtotal: Math.round(subtotal * 100) / 100,
      discount: 0, // coupon discount calculated on checkout (STEP 5)
      total: Math.round(subtotal * 100) / 100,
    })
  } catch (error) {
    console.error('[CART_GET] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cart' },
      { status: 500 }
    )
  }
}

/**
 * Cart API — POST /api/cart
 *
 * What it does in plain language:
 *   Adds a product variant to the cart (or updates the quantity
 *   if that variant is already in the cart).
 *
 *   - If no cart exists for this user/guest, creates one automatically
 *   - Checks the product is active and has enough stock
 *   - If the variant is already in the cart, increments the quantity
 *
 * Body: { productVariantId: string, quantity: number }
 * Headers: guestSessionId (for guest users)
 *
 * ⚡ Place in: src/app/api/cart/route.ts (same file)
 */
export async function POST(request: Request) {
  try {
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

    // ── 2. Validate input ─────────────────────────────────────────
    const body = await request.json()
    const { addToCartSchema } = await import('@/lib/validations/cart')
    const result = addToCartSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      )
    }

    const { productVariantId, quantity } = result.data

    // ── 3. Validate the product variant exists and has stock ───────
    const variant = await db.productVariant.findUnique({
      where: { id: productVariantId },
      include: { product: { select: { isActive: true } } },
    })

    if (!variant) {
      return NextResponse.json(
        { error: 'Product variant not found' },
        { status: 404 }
      )
    }

    if (!variant.product.isActive) {
      return NextResponse.json(
        { error: 'This product is no longer available' },
        { status: 410 }
      )
    }

    if (variant.stockCount < quantity) {
      return NextResponse.json(
        { error: `Only ${variant.stockCount} units available in stock` },
        { status: 409 }
      )
    }

    // ── 4. Find or create the cart ─────────────────────────────────
    const cart = await db.cart.upsert({
      where: userId ? { userId } : { guestSessionId: guestSessionId! },
      create: {
        userId: userId || null,
        guestSessionId: userId ? null : guestSessionId,
      },
      update: {}, // no-op if cart already exists
    })

    // ── 5. Upsert the cart item (add new or increment quantity) ──
    const cartItem = await db.cartItem.upsert({
      where: {
        cartId_productVariantId: {
          cartId: cart.id,
          productVariantId,
        },
      },
      create: {
        cartId: cart.id,
        productVariantId,
        quantity,
      },
      update: {
        quantity: { increment: quantity },
      },
      include: {
        productVariant: {
          include: { product: { select: { name: true } } },
        },
      },
    })

    return NextResponse.json({
      message: `Added to cart: ${cartItem.productVariant.product.name} × ${cartItem.quantity}`,
      item: {
        id: cartItem.id,
        quantity: cartItem.quantity,
      },
    })
  } catch (error) {
    console.error('[CART_POST] Error:', error)
    return NextResponse.json(
      { error: 'Failed to add to cart' },
      { status: 500 }
    )
  }
}
