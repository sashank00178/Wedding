/**
 * Categories API — GET /api/categories
 *
 * What it does in plain language:
 *   Returns a paginated list of product categories.
 *   Used to populate the category filter in the shop.
 *
 * Query params: ?search=portrait&isActive=true&page=1&limit=20
 *
 * ⚡ Place in: src/app/api/categories/route.ts
 */

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { categoryQuerySchema } from '@/lib/validations/product'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = categoryQuerySchema.parse(Object.fromEntries(searchParams))

    // Build filter
    const where: Record<string, unknown> = {}
    if (query.isActive !== undefined) where.isActive = query.isActive
    if (query.search) {
      where.OR = [
        { name: { contains: query.search } },
        { description: { contains: query.search } },
      ]
    }

    const skip = (query.page - 1) * query.limit

    const [categories, total] = await Promise.all([
      db.category.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: { name: 'asc' },
        include: {
          _count: { select: { products: true } },
        },
      }),
      db.category.count({ where }),
    ])

    return NextResponse.json({
      categories,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    })
  } catch (error) {
    console.error('[CATEGORIES_GET] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

/**
 * Categories API — POST /api/categories (Admin)
 *
 * What it does in plain language:
 *   Creates a new product category. Admin-only.
 */
export async function POST(request: Request) {
  try {
    // Auth check
    const authHeader = request.headers.get('x-user-role')
    if (authHeader !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { categorySchema } = await import('@/lib/validations/product')
    const result = categorySchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      )
    }

    const category = await db.category.create({ data: result.data })

    return NextResponse.json(
      { message: 'Category created', category },
      { status: 201 }
    )
  } catch (error) {
    console.error('[CATEGORIES_POST] Error:', error)
    if (error instanceof Error && error.message.includes('Unique')) {
      return NextResponse.json(
        { error: 'A category with this name or slug already exists' },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    )
  }
}
