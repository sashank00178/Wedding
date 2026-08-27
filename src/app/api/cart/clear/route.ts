/**
 * Clear Cart — POST /api/cart/clear
 *
 * What it does in plain language:
 *   Removes ALL items from the current user's (or guest's) cart.
 *   Useful for the "Clear Cart" button.
 *   Does NOT delete the cart itself — just empties it.
 *
 * ⚡ Place in: src/app/api/cart/clear/route.ts
 */

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthSession } from '@/lib/auth-helpers'

export async function POST(request: Request) {
  try {
    const session = await getAuthSession()
    const userId = session?.user?.id
    const guestSessionId = request.headers.get('x-guest-session-id')

    if (!userId && !guestSessionId) {
      return NextResponse.json(
        { error: 'Please log in or provide a guest session ID' },
        { status: 400 }
      )
    }

    const cart = await db.cart.findFirst({
      where: userId ? { userId } : { guestSessionId },
    })

    if (!cart) {
      return NextResponse.json({ message: 'Cart is already empty' })
    }

    const { count } = await db.cartItem.deleteMany({ where: { cartId: cart.id } })

    return NextResponse.json({
      message: `Cart cleared (${count} item${count !== 1 ? 's' : ''} removed)`,
    })
  } catch (error) {
    console.error('[CART_CLEAR] Error:', error)
    return NextResponse.json(
      { error: 'Failed to clear cart' },
      { status: 500 }
    )
  }
}
