/**
 * Admin Product Detail — /api/admin/products/[id]
 *
 * GET    — Full product detail with all variants, reviews, and sales data
 * PATCH  — Update product fields
 * DELETE — Soft-delete (deactivate) a product
 *
 * Protected by middleware + requireAdmin() double-check.
 *
 * ⚡ Place in: src/app/api/admin/products/[id]/route.ts
 */

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, AuthError } from '@/lib/auth-helpers'
import { productUpdateSchema } from '@/lib/validations/product'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params

    const product = await db.product.findUnique({
      where: { id },
      include: {
        category: true,
        variants: {
          orderBy: { createdAt: 'asc' },
        },
        reviews: {
          select: {
            id: true,
            rating: true,
            title: true,
            comment: true,
            isApproved: true,
            user: { select: { name: true } },
          },
          take: 10,
        },
      },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found.' },
        { status: 404 }
      )
    }

    // ── Sales stats for this product ────────────────────────────
    const salesStats = await db.orderItem.aggregate({
      where: { productVariantId: { in: product.variants.map(v => v.id) } },
      _sum: { quantity: true, priceAtPurchase: true },
      _count: true,
    })

    return NextResponse.json({
      ...product,
      salesStats: {
        totalUnitsSold: salesStats._sum.quantity || 0,
        totalRevenue: salesStats._sum.priceAtPurchase || 0,
        orderCount: salesStats._count,
      },
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      )
    }

    console.error('[ADMIN_PRODUCT_DETAIL_GET] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product.' },
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
    const result = productUpdateSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      )
    }

    // Check product exists
    const existing = await db.product.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Product not found.' },
        { status: 404 }
      )
    }

    const { variants, images, ...productData } = result.data

    // ── Build update payload ────────────────────────────────────
    const updateData: Record<string, unknown> = { ...productData }

    if (images !== undefined) {
      updateData.images = JSON.stringify(images)
    }

    // ── Update in transaction (product + stock recalculation) ────
    const updated = await db.$transaction(async (tx) => {
      const product = await tx.product.update({
        where: { id },
        data: updateData,
        include: { variants: true },
      })

      // If new variants are provided, recreate them
      if (variants && variants.length > 0) {
        // Delete existing variants
        await tx.productVariant.deleteMany({ where: { productId: id } })

        // Create new variants
        await tx.productVariant.createMany({
          data: variants.map((v) => ({
            productId: id,
            name: v.name || '',
            sku: v.sku || '',
            price: v.price || product.basePrice,
            stockCount: v.stockCount || 0,
            attributes: JSON.stringify(v.attributes || {}),
          })),
        })

        // Recalculate product stock
        const variantStock = await tx.productVariant.aggregate({
          where: { productId: id },
          _sum: { stockCount: true },
        })

        await tx.product.update({
          where: { id },
          data: { stockCount: variantStock._sum.stockCount || 0 },
        })
      }

      return tx.product.findUnique({
        where: { id },
        include: {
          category: true,
          variants: true,
        },
      })
    })

    return NextResponse.json({
      message: 'Product updated successfully.',
      product: updated,
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      )
    }

    console.error('[ADMIN_PRODUCT_PATCH] Error:', error)

    if (error instanceof Error && error.message.includes('Unique')) {
      return NextResponse.json(
        { error: 'A product with this slug already exists.' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update product.' },
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

    const existing = await db.product.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Product not found.' },
        { status: 404 }
      )
    }

    // ── Soft-delete: deactivate ───────────────────────────────────
    await db.product.update({
      where: { id },
      data: { isActive: false },
    })

    return NextResponse.json({
      message: 'Product deactivated successfully.',
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      )
    }

    console.error('[ADMIN_PRODUCT_DELETE] Error:', error)
    return NextResponse.json(
      { error: 'Failed to delete product.' },
      { status: 500 }
    )
  }
}
