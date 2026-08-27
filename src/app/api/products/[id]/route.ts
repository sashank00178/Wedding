/**
 * Single Product API — GET /api/products/[id]
 *
 * What it does in plain language:
 *   Returns a single product with full detail — variants, reviews,
 *   category info. Used on the product detail page.
 *
 * ⚡ Place in: src/app/api/products/[id]/route.ts
 */

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Allow lookup by either ID or slug (SEO-friendly URLs)
    const product = await db.product.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
        isActive: true,
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        variants: {
          select: { id: true, name: true, sku: true, price: true, stockCount: true, attributes: true },
        },
        reviews: {
          where: { isApproved: true },
          select: {
            id: true,
            rating: true,
            title: true,
            comment: true,
            createdAt: true,
            user: { select: { name: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Calculate average rating
    const reviewCount = product.reviews.length
    const avgRating =
      reviewCount > 0
        ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
        : 0

    return NextResponse.json({
      ...product,
      reviewCount,
      avgRating: Math.round(avgRating * 10) / 10, // 1 decimal place
    })
  } catch (error) {
    console.error('[PRODUCT_GET] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}

/**
 * Single Product API — PUT /api/products/[id] (Admin)
 *
 * What it does in plain language:
 *   Updates an existing product. Only provided fields are changed.
 *   Admin-only endpoint.
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Auth check — admin only
    const authHeader = request.headers.get('x-user-role')
    if (authHeader !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      )
    }

    // Check product exists
    const existing = await db.product.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Parse and validate (partial — all fields optional)
    const body = await request.json()
    const { name, slug, description, basePrice, categoryId, images, isFeatured, isActive } = body

    // Build update payload with only provided fields
    const data: Record<string, unknown> = {}
    if (name !== undefined) data.name = name
    if (slug !== undefined) data.slug = slug
    if (description !== undefined) data.description = description
    if (basePrice !== undefined) data.basePrice = basePrice
    if (categoryId !== undefined) data.categoryId = categoryId
    if (images !== undefined) data.images = JSON.stringify(images)
    if (isFeatured !== undefined) data.isFeatured = isFeatured
    if (isActive !== undefined) data.isActive = isActive

    const product = await db.product.update({
      where: { id },
      data,
      include: {
        category: true,
        variants: true,
      },
    })

    return NextResponse.json({
      message: 'Product updated successfully',
      product,
    })
  } catch (error) {
    console.error('[PRODUCT_PUT] Error:', error)
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

/**
 * Single Product API — DELETE /api/products/[id] (Admin)
 *
 * What it does in plain language:
 *   Soft-deletes a product by setting isActive=false.
 *   Does NOT permanently remove it — orders with this product stay intact.
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Auth check — admin only
    const authHeader = request.headers.get('x-user-role')
    if (authHeader !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      )
    }

    const existing = await db.product.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Soft delete — set inactive instead of removing from database
    await db.product.update({
      where: { id },
      data: { isActive: false },
    })

    return NextResponse.json({
      message: 'Product deactivated successfully',
    })
  } catch (error) {
    console.error('[PRODUCT_DELETE] Error:', error)
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}
