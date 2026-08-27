/**
 * Merge Guest Cart — POST /api/cart/merge
 *
 * What it does in plain language:
 *   When a guest user logs in, this merges their guest cart into
 *   their account's cart. It adds items that don't exist yet and
 *   increments quantities for items already in the user's cart.
 *   After merging, the guest cart is deleted.
 *
 *   This is called right after successful login if the guest has items.
 *
 * Headers:
 *   x-guest-session-id: the guest's session ID (from cookie)
 *
 * ⚡ Place in: src/app/api/cart/merge/route.ts
 */

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth-helpers'

export async function POST(request: Request) {
  try {
    // ── 1. Must be logged in ───────────────────────────────────────
    const session = await requireAuth()
    const userId = session.user!.id
    const guestSessionId = request.headers.get('x-guest-session-id')

    if (!guestSessionId) {
      return NextResponse.json({ message: 'No guest cart to merge' })
    }

    // ── 2. Find the guest cart ────────────────────────────────────
    const guestCart = await db.cart.findFirst({
      where: { guestSessionId },
      include: { items: true },
    })

    if (!guestCart || guestCart.items.length === 0) {
      return NextResponse.json({ message: 'No guest cart to merge' })
    }

    // ── 3. Find or create the user's cart ──────────────────────────
    const userCart = await db.cart.upsert({
      where: { userId },
      create: { userId },
      update: {},
    })

    // ── 4. Merge items (in a transaction for safety) ──────────────
    await db.$transaction(async (tx) => {
      for (const guestItem of guestCart.items) {
        // Try to find existing item in user's cart with same variant
        const existing = await tx.cartItem.findUnique({
          where: {
            cartId_productVariantId: {
              cartId: userCart.id,
              productVariantId: guestItem.productVariantId,
            },
          },
        })

        if (existing) {
          // Increment quantity
          await tx.cartItem.update({
            where: { id: existing.id },
            data: { quantity: { increment: guestItem.quantity } },
          })
        } else {
          // Move item to user's cart
          await tx.cartItem.create({
            data: {
              cartId: userCart.id,
              productVariantId: guestItem.productVariantId,
              quantity: guestItem.quantity,
            },
          })
        }
      }

      // Delete the guest cart and its items
      await tx.cartItem.deleteMany({ where: { cartId: guestCart.id } })
      await tx.cart.delete({ where: { id: guestCart.id } })
    })

    // ── 5. Return the updated cart ────────────────────────────────
    const updatedCart = await db.cart.findFirst({
      where: { userId },
      include: {
        items: {
          include: {
            productVariant: {
              include: { product: { select: { name: true } } },
            },
          },
        },
      },
    })

    const totalItems = updatedCart?.items.reduce((sum, i) => sum + i.quantity, 0) || 0

    return NextResponse.json({
      message: `Guest cart merged into your account (${totalItems} items)`,
      totalItems,
    })
  } catch (error) {
    if (error instanceof Error && error.name === 'AuthError') {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }

    console.error('[CART_MERGE] Error:', error)
    return NextResponse.json(
      { error: 'Failed to merge cart' },
      { status: 500 }
    )
  }
}
