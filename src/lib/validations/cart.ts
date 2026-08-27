/**
 * Zod validation schemas for cart operations.
 *
 * Used by all cart API routes to ensure consistent validation.
 *
 * ⚡ Place in: src/lib/validations/cart.ts
 */

import { z } from 'zod'

/** Add an item to cart (or update quantity if already exists) */
export const addToCartSchema = z.object({
  productVariantId: z.string().min(1, 'Product variant ID is required'),
  quantity: z
    .number()
    .int('Quantity must be a whole number')
    .positive('Quantity must be at least 1')
    .max(99, 'Maximum 99 per item'),
})

/** Update quantity of an existing cart item */
export const updateCartItemSchema = z.object({
  quantity: z
    .number()
    .int('Quantity must be a whole number')
    .min(0, 'Quantity cannot be negative')
    .max(99, 'Maximum 99 per item'),
  // quantity=0 means "remove this item"
})

/** Apply a coupon code to the cart */
export const applyCouponSchema = z.object({
  code: z
    .string()
    .min(3, 'Coupon code must be at least 3 characters')
    .max(50, 'Coupon code too long')
    .toUpperCase()
    .trim(),
})

/** URL query params for fetching cart */
export const cartQuerySchema = z.object({
  guestSessionId: z.string().optional(),
})

export type AddToCartInput = z.infer<typeof addToCartSchema>
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>
export type ApplyCouponInput = z.infer<typeof applyCouponSchema>
