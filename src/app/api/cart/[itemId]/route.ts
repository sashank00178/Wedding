/**
 * Cart Item API — PUT /api/cart/[itemId]
 *
 * What it does in plain language:
 *   Updates the quantity of a specific cart item.
 *   Setting quantity to 0 removes the item.
 *   Validates the user owns the cart before making changes.
 *
 * Body: { quantity: number } (0-99)
 *
 * ⚡ Place in: src/app/api/cart/[itemId]/route.ts
 */

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthSession } from '@/lib/auth-helpers'
import { updateCartItemSchema } from '@/lib/validations/cart'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const { itemId } = await params

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
    const result = updateCartItemSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      )
    }

    const { quantity } = result.data

    // ── 3. Find the cart item and verify ownership ────────────────
    const cartItem = await db.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true, productVariant: true },
    })

    if (!cartItem) {
      return NextResponse.json({ error: 'Cart item not found' }, { status: 404 })
    }

    // Ownership check — user must own the cart this item belongs to
    if (userId && cartItem.cart.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
    if (!userId && cartItem.cart.guestSessionId !== guestSessionId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // ── 4. Handle remove (quantity = 0) ───────────────────────────
    if (quantity === 0) {
      await db.cartItem.delete({ where: { id: itemId } })
      return NextResponse.json({ message: 'Item removed from cart' })
    }

    // ── 5. Check stock ─────────────────────────────────────────────
    if (cartItem.productVariant.stockCount < quantity) {
      return NextResponse.json(
        { error: `Only ${cartItem.productVariant.stockCount} units available` },
        { status: 409 }
      )
    }

    // ── 6. Update quantity ───────────────────────────────────────
    const updated = await db.cartItem.update({
      where: { id: itemId },
      data: { quantity },
      include: {
        productVariant: {
          include: { product: { select: { name: true } } },
        },
      },
    })

    return NextResponse.json({
      message: `Updated: ${updated.productVariant.product.name} × ${updated.quantity}`,
      quantity: updated.quantity,
    })
  } catch (error) {
    console.error('[CART_ITEM_PUT] Error:', error)
    return NextResponse.json(
      { error: 'Failed to update cart item' },
      { status: 500 }
    )
  }
}

/**
 * Cart Item API — DELETE /api/cart/[itemId]
 *
 * What it does in plain language:
 *   Removes a specific item from the cart entirely.
 *   Verifies ownership before deleting.
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const { itemId } = await params

    // Identify the user
    const session = await getAuthSession()
    const userId = session?.user?.id
    const guestSessionId = request.headers.get('x-guest-session-id')

    if (!userId && !guestSessionId) {
      return NextResponse.json(
        { error: 'Please log in or provide a guest session ID' },
        { status: 400 }
      )
    }

    // Find and verify ownership
    const cartItem = await db.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true },
    })

    if (!cartItem) {
      return NextResponse.json({ error: 'Cart item not found' }, { status: 404 })
    }

    if (userId && cartItem.cart.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
    if (!userId && cartItem.cart.guestSessionId !== guestSessionId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Delete the item
    await db.cartItem.delete({ where: { id: itemId } })

    return NextResponse.json({ message: 'Item removed from cart' })
  } catch (error) {
    console.error('[CART_ITEM_DELETE] Error:', error)
    return NextResponse.json(
      { error: 'Failed to remove cart item' },
      { status: 500 }
    )
  }
}
