/**
 * Zod validation schemas for checkout, payments, and orders.
 *
 * ⚡ Place in: src/lib/validations/checkout.ts
 */

import { z } from 'zod'

/** Shipping address collected at checkout */
export const shippingAddressSchema = z.object({
  name: z.string().min(2, 'Name is required').max(100),
  phone: z.string().min(7, 'Phone number is required').max(20),
  line1: z.string().min(5, 'Address line 1 is required').max(200),
  line2: z.string().max(200).optional().default(''),
  city: z.string().min(2, 'City is required').max(100),
  state: z.string().max(100).optional().default(''),
  zip: z.string().min(3, 'ZIP/postal code is required').max(20),
  country: z.string().min(2, 'Country is required').max(100),
})

/** Create a checkout session */
export const checkoutSchema = z.object({
  shippingAddress: shippingAddressSchema,
  couponCode: z.string().max(50).optional().default(''),
  notes: z.string().max(1000).optional().default(''),
})

// ── Order Validations (STEP 6) ─────────────────────────────

/** Valid order statuses */
export const ORDER_STATUSES = [
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
] as const

export type OrderStatus = (typeof ORDER_STATUSES)[number]

/**
 * Status transition map — enforces valid state machine transitions.
 * Each key is the current status, and its value is the list of
 * statuses that the order CAN transition to.
 *
 * For example: pending → [processing, cancelled]
 *              processing → [shipped, cancelled]
 *              shipped → [delivered]
 *              delivered → [] (terminal state)
 *              cancelled → [] (terminal state)
 */
export const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
}

/** URL query params for customer order list */
export const orderListSchema = z.object({
  status: z.enum(ORDER_STATUSES).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

/** URL query params for admin order list */
export const adminOrderListSchema = z.object({
  status: z.enum(ORDER_STATUSES).optional(),
  search: z.string().max(100).optional(),
  sortBy: z.enum(['createdAt', 'total', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

/** Admin status update body */
export const updateOrderStatusSchema = z.object({
  status: z.enum(ORDER_STATUSES),
  trackingNumber: z.string().max(100).optional(),
  adminNote: z.string().max(1000).optional(),
})

/** Cancellation reason (optional) */
export const cancelOrderSchema = z.object({
  reason: z.string().max(500).optional().default(''),
})

export type ShippingAddress = z.infer<typeof shippingAddressSchema>
export type CheckoutInput = z.infer<typeof checkoutSchema>
export type OrderListQuery = z.infer<typeof orderListSchema>
export type AdminOrderListQuery = z.infer<typeof adminOrderListSchema>
export type UpdateOrderStatus = z.infer<typeof updateOrderStatusSchema>
export type CancelOrder = z.infer<typeof cancelOrderSchema>
