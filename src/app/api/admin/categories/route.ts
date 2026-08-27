/**
 * Admin Categories — /api/admin/categories
 *
 * GET   — List all categories (including inactive) with product counts
 * POST  — Create a new category
 *
 * Protected by middleware + requireAdmin() double-check.
 *
 * ⚡ Place in: src/app/api/admin/categories/route.ts
 */

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, AuthError } from '@/lib/auth-helpers'
import { categorySchema } from '@/lib/validations/product'
import { z } from 'zod'

const adminCategoryListSchema = z.object({
  isActive: z.enum(['true', 'false']).optional().transform(v => v === 'true' ? true : v === 'false' ? false : undefined),
  search: z.string().max(100).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

// ── GET: Admin category list ─────────────────────────────────────────

export async function GET(request: Request) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const query = adminCategoryListSchema.safeParse(
      Object.fromEntries(searchParams)
    )

    if (!query.success) {
      return NextResponse.json(
        { error: query.error.issues[0].message },
        { status: 400 }
      )
    }

    const { isActive, search, page, limit } = query.data
    const skip = (page - 1) * limit

    // ── Build where clause ───────────────────────────────────────
    const where: Record<string, unknown> = {}

    if (isActive !== undefined) where.isActive = isActive
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { slug: { contains: search } },
      ]
    }

    // ── Fetch categories with product counts ────────────────────
    const [categories, total] = await Promise.all([
      db.category.findMany({
        where,
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          image: true,
          isActive: true,
          createdAt: true,
          _count: { select: { products: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.category.count({ where }),
    ])

    return NextResponse.json({
      categories,
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

    console.error('[ADMIN_CATEGORIES_GET] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories.' },
      { status: 500 }
    )
  }
}

// ── POST: Create a new category ───────────────────────────────────────

export async function POST(request: Request) {
  try {
    await requireAdmin()

    const body = await request.json()
    const parsed = categorySchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    // Check for duplicate slug
    const existing = await db.category.findUnique({
      where: { slug: parsed.data.slug },
    })

    if (existing) {
      return NextResponse.json(
        { error: `Category with slug "${parsed.data.slug}" already exists.` },
        { status: 409 }
      )
    }

    const category = await db.category.create({
      data: {
        name: parsed.data.name,
        slug: parsed.data.slug,
        description: parsed.data.description || null,
        image: parsed.data.image || null,
        isActive: parsed.data.isActive ?? true,
      },
    })

    return NextResponse.json(
      { message: 'Category created successfully.', category },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      )
    }

    console.error('[ADMIN_CATEGORIES_POST] Error:', error)

    if (error instanceof Error && error.message.includes('Unique')) {
      return NextResponse.json(
        { error: 'A category with this slug already exists.' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create category.' },
      { status: 500 }
    )
  }
}
