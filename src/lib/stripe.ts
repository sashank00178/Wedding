/**
 * Stripe client singleton.
 *
 * Initialized once and reused across checkout and webhook routes.
 * The API version defaults to the latest — no need to pin it.
 *
 * ⚡ Place in: src/lib/stripe.ts
 */

import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  // Let Stripe use the default (latest) API version
  // No need to pin apiVersion — avoids version mismatch errors
})
