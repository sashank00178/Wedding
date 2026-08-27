/**
 * Products API — GET /api/products
 *
 * What it does in plain language:
 *   Returns a paginated, filterable list of products.
 *   Customers use this to browse the shop.
 *   Admins use it to manage the catalog.
 *
 * Query parameters:
 *   ?search=portrait        → search name & description
 *   &categoryId=abc123      → filter by category
 *   &minPrice=1000          → minimum price
 *   &maxPrice=20000         → maximum price
 *   &isFeatured=true        → only featured products
 *   &sortBy=newest          → newest | oldest | price-asc | price-desc | name-asc | name-desc
 *   &page=1                 → page number
 *   &limit=20               → items per page (max 100)
 *
 * ⚡ Place in: src/app/api/products/route.ts
 */

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { productQuerySchema, productSchema } from '@/lib/validations/product'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    // ── 1. Validate query parameters ──────────────────────────────
    const query = productQuerySchema.parse(Object.fromEntries(searchParams))

    // ── 2. Build the Prisma "where" filter ────────────────────────
    const where: Record<string, unknown> = { isActive: true }

    // If caller explicitly set isActive=false (admin browsing inactive),
    // override the default
    if (query.isActive === false) {
      where.isActive = false
    }
    if (query.isActive === undefined) {
      where.isActive = true // default to active products only
    } else {
      where.isActive = query.isActive
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search } },
        { description: { contains: query.search } },
      ]
    }

    if (query.categoryId) {
      where.categoryId = query.categoryId
    }

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      const priceFilter: Record<string, unknown> = {}
      if (query.minPrice !== undefined) priceFilter.gte = query.minPrice
      if (query.maxPrice !== undefined) priceFilter.lte = query.maxPrice
      where.basePrice = priceFilter
    }

    if (query.isFeatured !== undefined) {
      where.isFeatured = query.isFeatured
    }

    // ── 3. Build the sort order ───────────────────────────────────
    let orderBy: Record<string, string> = { createdAt: 'desc' } // newest
    switch (query.sortBy) {
      case 'price-asc':
        orderBy = { basePrice: 'asc' }
        break
      case 'price-desc':
        orderBy = { basePrice: 'desc' }
        break
      case 'oldest':
        orderBy = { createdAt: 'asc' }
        break
      case 'name-asc':
        orderBy = { name: 'asc' }
        break
      case 'name-desc':
        orderBy = { name: 'desc' }
        break
      default:
        orderBy = { createdAt: 'desc' }
    }

    // ── 4. Pagination math ─────────────────────────────────────────
    const skip = (query.page - 1) * query.limit

    // ── 5. Fetch products + total count in parallel ───────────────
    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        orderBy,
        skip,
        take: query.limit,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          variants: { select: { id: true, name: true, sku: true, price: true, stockCount: true } },
          _count: { select: { reviews: true } },
        },
      }),
      db.product.count({ where }),
    ])

    // ── 6. Return paginated response ──────────────────────────────
    return NextResponse.json({
      products,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    })
  } catch (error) {
    // Zod validation errors return 400
    if (error instanceof Error && error.message.includes('Expected')) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.message },
        { status: 400 }
      )
    }

    console.error('[PRODUCTS_GET] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

/**
 * Products API — POST /api/products (Admin)
 *
 * What it does in plain language:
 *   Creates a new product with its variants.
 *   Only admins can create products.
 *   Validates all input with Zod.
 *
 * ⚡ Place in: src/app/api/products/route.ts (same file, second handler)
 */
export async function POST(request: Request) {
  try {
    // ── 1. Auth check — admin only (middleware + double-check) ───
    const { requireAdmin, AuthError } = await import('@/lib/auth-helpers')
    try {
      await requireAdmin()
    } catch (error) {
      if (error instanceof AuthError) {
        return NextResponse.json(
          { error: error.message },
          { status: error.statusCode }
        )
      }
      throw error
    }

    // ── 2. Parse and validate ─────────────────────────────────────
    const body = await request.json()
    const result = productSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      )
    }

    const { variants, images, ...productData } = result.data

    // ── 3. Create product with variants in a transaction ────────────
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
      { message: 'Product created successfully', product },
      { status: 201 }
    )
  } catch (error) {
    console.error('[PRODUCTS_POST] Error:', error)

    // Handle unique constraint violations
    if (error instanceof Error && error.message.includes('Unique')) {
      return NextResponse.json(
        { error: 'A product with this slug already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}
