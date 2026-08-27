/**
 * Zod validation schemas for products and categories.
 *
 * Used by both public (GET) and admin (POST/PUT) routes to ensure
 * consistent validation across the entire API.
 *
 * ⚡ Place in: src/lib/validations/product.ts
 */

import { z } from 'zod'

// ── Category schemas ─────────────────────────────────────────────

/** Create/update a category */
export const categorySchema = z.object({
  name: z
    .string()
    .min(2, 'Category name must be at least 2 characters')
    .max(100, 'Category name must be under 100 characters'),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .max(100, 'Slug must be under 100 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must only contain lowercase letters, numbers, and hyphens'),
  description: z.string().max(500, 'Description must be under 500 characters').optional(),
  image: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  isActive: z.boolean().optional().default(true),
})

/** URL query params for filtering/searching categories */
export const categoryQuerySchema = z.object({
  search: z.string().optional(),
  isActive: z
    .string()
    .optional()
    .transform((v) => (v === undefined ? undefined : v === 'true')),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

export type CategoryInput = z.infer<typeof categorySchema>
export type CategoryQuery = z.infer<typeof categoryQuerySchema>

// ── Product schemas ──────────────────────────────────────────────

/** Create/update a product */
export const productSchema = z.object({
  name: z
    .string()
    .min(3, 'Product name must be at least 3 characters')
    .max(200, 'Product name must be under 200 characters'),
  slug: z
    .string()
    .min(3, 'Slug must be at least 3 characters')
    .max(200, 'Slug must be under 200 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must only contain lowercase letters, numbers, and hyphens'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  basePrice: z
    .number()
    .positive('Price must be greater than 0')
    .max(99999999, 'Price seems too high'),
  categoryId: z.string().min(1, 'Category is required'),
  images: z
    .array(z.string().url('Each image must be a valid URL'))
    .max(20, 'Maximum 20 images allowed')
    .default([]),
  isFeatured: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
  // Variants are created/updated separately, but we accept them here
  // for convenience on the admin create endpoint
  variants: z
    .array(
      z.object({
        name: z.string().min(1, 'Variant name is required'),
        sku: z.string().min(1, 'SKU is required'),
        price: z.number().positive('Variant price must be greater than 0'),
        stockCount: z.number().int().min(0).default(0),
        attributes: z.record(z.string(), z.unknown()).optional().default({}),
      })
    )
    .optional()
    .default([]),
})

/** Update product (all fields optional — only provided fields are changed) */
export const productUpdateSchema = productSchema.partial()

/** URL query params for filtering/searching products */
export const productQuerySchema = z.object({
  search: z.string().optional(),                  // free-text search in name/description
  categoryId: z.string().optional(),                // filter by category
  minPrice: z.coerce.number().positive().optional(), // price range floor
  maxPrice: z.coerce.number().positive().optional(), // price range ceiling
  isFeatured: z
    .string()
    .optional()
    .transform((v) => (v === undefined ? undefined : v === 'true')),
  isActive: z
    .string()
    .optional()
    .transform((v) => (v === undefined ? undefined : v === 'true')),
  sortBy: z
    .enum(['price-asc', 'price-desc', 'newest', 'oldest', 'name-asc', 'name-desc'])
    .default('newest'),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

/** Single variant update */
export const variantSchema = z.object({
  name: z.string().min(1, 'Variant name is required').optional(),
  sku: z.string().min(1, 'SKU is required').optional(),
  price: z.number().positive('Variant price must be greater than 0').optional(),
  stockCount: z.number().int().min(0).optional(),
  attributes: z.record(z.string(), z.unknown()).optional(),
})

export type ProductInput = z.infer<typeof productSchema>
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>
export type ProductQuery = z.infer<typeof productQuerySchema>
export type VariantInput = z.infer<typeof variantSchema>
