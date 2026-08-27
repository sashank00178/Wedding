/**
 * Admin Category Detail — /api/admin/categories/[id]
 *
 * GET    — Single category with its products
 * PATCH  — Update category fields
 * DELETE — Soft-delete (deactivate) a category
 *
 * Protected by middleware + requireAdmin() double-check.
 *
 * ⚡ Place in: src/app/api/admin/categories/[id]/route.ts
 */

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, AuthError } from '@/lib/auth-helpers'
import { categorySchema } from '@/lib/validations/product'

const updateCategorySchema = categorySchema.partial()

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params

    const category = await db.category.findUnique({
      where: { id },
      include: {
        products: {
          select: {
            id: true,
            name: true,
            slug: true,
            basePrice: true,
            stockCount: true,
            isActive: true,
          },
          take: 20,
        },
        _count: { select: { products: true } },
      },
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found.' },
        { status: 404 }
      )
    }

    return NextResponse.json(category)
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      )
    }

    console.error('[ADMIN_CATEGORY_DETAIL_GET] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch category.' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params

    const body = await request.json()
    const parsed = updateCategorySchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const existing = await db.category.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Category not found.' },
        { status: 404 }
      )
    }

    // If updating slug, check for duplicates
    if (parsed.data.slug && parsed.data.slug !== existing.slug) {
      const duplicate = await db.category.findUnique({
        where: { slug: parsed.data.slug },
      })
      if (duplicate) {
        return NextResponse.json(
          { error: `Category with slug "${parsed.data.slug}" already exists.` },
          { status: 409 }
        )
      }
    }

    const updateData: Record<string, unknown> = {}
    if (parsed.data.name !== undefined) updateData.name = parsed.data.name
    if (parsed.data.slug !== undefined) updateData.slug = parsed.data.slug
    if (parsed.data.description !== undefined) updateData.description = parsed.data.description || null
    if (parsed.data.image !== undefined) updateData.image = parsed.data.image || null
    if (parsed.data.isActive !== undefined) updateData.isActive = parsed.data.isActive

    const updated = await db.category.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({
      message: 'Category updated successfully.',
      category: updated,
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      )
    }

    console.error('[ADMIN_CATEGORY_PATCH] Error:', error)
    return NextResponse.json(
      { error: 'Failed to update category.' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params

    const existing = await db.category.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Category not found.' },
        { status: 404 }
      )
    }

    // Check if category has active products
    const productCount = await db.product.count({
      where: { categoryId: id },
    })

    if (productCount > 0) {
      return NextResponse.json(
        { error: `Cannot deactivate category with ${productCount} product(s). Reassign or remove products first.` },
        { status: 409 }
      )
    }

    // ── Soft-delete: deactivate ─────────────────────────────────
    await db.category.update({
      where: { id },
      data: { isActive: false },
    })

    return NextResponse.json({
      message: 'Category deactivated successfully.',
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      )
    }

    console.error('[ADMIN_CATEGORY_DELETE] Error:', error)
    return NextResponse.json(
      { error: 'Failed to delete category.' },
      { status: 500 }
    )
  }
}
