/**
 * Admin Products — /api/admin/products
 *
 * GET   — List ALL products (including inactive) with admin-level filters
 * POST  — Create a new product with variants (transaction)
 *
 * Unlike GET /api/products (customer-facing, active-only),
 * this endpoint shows all products including drafts/inactive.
 *
 * Protected by middleware + requireAdmin() double-check.
 *
 * ⚡ Place in: src/app/api/admin/products/route.ts
 */

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, AuthError } from '@/lib/auth-helpers'
import { productSchema } from '@/lib/validations/product'
import { z } from 'zod'

const adminProductListSchema = z.object({
  search: z.string().optional(),
  categoryId: z.string().optional(),
  isActive: z.enum(['true', 'false']).optional().transform(v => v === 'true' ? true : v === 'false' ? false : undefined),
  isFeatured: z.enum(['true', 'false']).optional().transform(v => v === 'true' ? true : v === 'false' ? false : undefined),
  lowStock: z.enum(['true', 'false']).optional().transform(v => v === 'true'),
  sortBy: z.enum(['createdAt', 'name', 'basePrice', 'stockCount']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

// ── GET: Admin product list ──────────────────────────────────────────

export async function GET(request: Request) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const query = adminProductListSchema.safeParse(
      Object.fromEntries(searchParams)
    )

    if (!query.success) {
      return NextResponse.json(
        { error: query.error.issues[0].message },
        { status: 400 }
      )
    }

    const { search, categoryId, isActive, isFeatured, lowStock, sortBy, sortOrder, page, limit } = query.data
    const skip = (page - 1) * limit

    // ── Build where clause ───────────────────────────────────────
    const where: Record<string, unknown> = {}

    if (isActive !== undefined) where.isActive = isActive
    if (isFeatured !== undefined) where.isFeatured = isFeatured
    if (categoryId) where.categoryId = categoryId
    if (lowStock) where.stockCount = { lte: 5 }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { slug: { contains: search } },
      ]
    }

    // ── Fetch products ───────────────────────────────────────────
    const orderBy: Record<string, string> = {}
    orderBy[sortBy] = sortOrder

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        select: {
          id: true,
          name: true,
          slug: true,
          basePrice: true,
          stockCount: true,
          isFeatured: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          category: { select: { id: true, name: true } },
          variants: {
            select: { id: true, name: true, sku: true, price: true, stockCount: true },
          },
          _count: { select: { reviews: true, orderItems: true } },
        },
        orderBy,
        skip,
        take: limit,
      }),
      db.product.count({ where }),
    ])

    // ── Quick aggregate stats ──────────────────────────────────
    const [totalCount, activeCount, lowStockCount] = await Promise.all([
      db.product.count(),
      db.product.count({ where: { isActive: true } }),
      db.product.count({ where: { stockCount: { lte: 5 } } }),
    ])

    return NextResponse.json({
      products,
      stats: {
        totalProducts: totalCount,
        activeProducts: activeCount,
        lowStockProducts: lowStockCount,
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      )
    }

    console.error('[ADMIN_PRODUCTS_GET] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

// ── POST: Create product with variants ────────────────────────────────

export async function POST(request: Request) {
  try {
    await requireAdmin()

    const body = await request.json()
    const result = productSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      )
    }

    const { variants, images, ...productData } = result.data

    // ── Create product with variants in a transaction ─────────────
    const product = await db.$transaction(async (tx) => {
      const newProduct = await tx.product.create({
        data: {
          ...productData,
          images: JSON.stringify(images),
          stockCount: variants.reduce(
            (sum, v) => sum + (v.stockCount || 0),
            0
          ),
          variants: {
            create: variants.map((v) => ({
              name: v.name,
              sku: v.sku,
              price: v.price,
              stockCount: v.stockCount,
              attributes: JSON.stringify(v.attributes || {}),
            })),
          },
        },
        include: {
          category: true,
          variants: true,
        },
      })

      return newProduct
    })

    return NextResponse.json(
      { message: 'Product created successfully.', product },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      )
    }

    console.error('[ADMIN_PRODUCTS_POST] Error:', error)

    if (error instanceof Error && error.message.includes('Unique')) {
      return NextResponse.json(
        { error: 'A product with this slug already exists.' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create product.' },
      { status: 500 }
    )
  }
}
