/**
 * Single Category API — GET/PUT/DELETE /api/categories/[id]
 *
 * GET:  Returns a single category with product count
 * PUT:  Updates category fields (admin)
 * DELETE: Soft-deletes a category (admin)
 *
 * ⚡ Place in: src/app/api/categories/[id]/route.ts
 */

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const category = await db.category.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: {
        products: {
          where: { isActive: true },
          select: { id: true, name: true, slug: true, basePrice: true, images: true },
          take: 10,
          orderBy: { basePrice: 'asc' },
        },
        _count: { select: { products: true } },
      },
    })

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error('[CATEGORY_GET] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const authHeader = request.headers.get('x-user-role')
    if (authHeader !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      )
    }

    const existing = await db.category.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    const body = await request.json()

    // Only update provided fields
    const data: Record<string, unknown> = {}
    if (body.name !== undefined) data.name = body.name
    if (body.slug !== undefined) data.slug = body.slug
    if (body.description !== undefined) data.description = body.description
    if (body.image !== undefined) data.image = body.image
    if (body.isActive !== undefined) data.isActive = body.isActive

    const category = await db.category.update({
      where: { id },
      data,
    })

    return NextResponse.json({ message: 'Category updated', category })
  } catch (error) {
    console.error('[CATEGORY_PUT] Error:', error)
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const authHeader = request.headers.get('x-user-role')
    if (authHeader !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      )
    }

    const existing = await db.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    // Don't delete if products still reference it
    if (existing._count.products > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with existing products. Move or delete products first.' },
        { status: 409 }
      )
    }

    await db.category.delete({ where: { id } })

    return NextResponse.json({ message: 'Category deleted' })
  } catch (error) {
    console.error('[CATEGORY_DELETE] Error:', error)
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    )
  }
}
