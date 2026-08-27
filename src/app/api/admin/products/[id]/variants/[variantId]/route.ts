/**
 * Admin Single Variant — /api/admin/products/[id]/variants/[variantId]
 *
 * PATCH  — Update a variant (price, stock, attributes)
 * DELETE — Remove a variant (recalculates parent stock)
 *
 * Protected by middleware + requireAdmin() double-check.
 *
 * ⚡ Place in: src/app/api/admin/products/[id]/variants/[variantId]/route.ts
 */

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, AuthError } from '@/lib/auth-helpers'
import { variantSchema } from '@/lib/validations/product'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; variantId: string }> }
) {
  try {
    await requireAdmin()
    const { id: productId, variantId } = await params

    const body = await request.json()
    const parsed = variantSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    // Check variant exists and belongs to this product
    const existing = await db.productVariant.findFirst({
      where: { id: variantId, productId },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Variant not found.' },
        { status: 404 }
      )
    }

    // ── Build update data ───────────────────────────────────────
    const updateData: Record<string, unknown> = {}
    if (parsed.data.name !== undefined) updateData.name = parsed.data.name
    if (parsed.data.sku !== undefined) updateData.sku = parsed.data.sku
    if (parsed.data.price !== undefined) updateData.price = parsed.data.price
    if (parsed.data.stockCount !== undefined) updateData.stockCount = parsed.data.stockCount
    if (parsed.data.attributes !== undefined) updateData.attributes = JSON.stringify(parsed.data.attributes)

    // ── Update variant + recalculate parent stock ────────────────
    const variant = await db.$transaction(async (tx) => {
      const updated = await tx.productVariant.update({
        where: { id: variantId },
        data: updateData,
      })

      // Recalculate parent stock
      const stockSum = await tx.productVariant.aggregate({
        where: { productId },
        _sum: { stockCount: true },
      })

      await tx.product.update({
        where: { id: productId },
        data: { stockCount: stockSum._sum.stockCount || 0 },
      })

      return updated
    })

    return NextResponse.json({
      message: 'Variant updated successfully.',
      variant,
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      )
    }

    console.error('[ADMIN_VARIANT_PATCH] Error:', error)

    if (error instanceof Error && error.message.includes('Unique')) {
      return NextResponse.json(
        { error: 'A variant with this SKU already exists.' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update variant.' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; variantId: string }> }
) {
  try {
    await requireAdmin()
    const { id: productId, variantId } = await params

    const existing = await db.productVariant.findFirst({
      where: { id: variantId, productId },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Variant not found.' },
        { status: 404 }
      )
    }

    // ── Delete variant + recalculate parent stock ───────────────
    await db.$transaction(async (tx) => {
      await tx.productVariant.delete({ where: { id: variantId } })

      const stockSum = await tx.productVariant.aggregate({
        where: { productId },
        _sum: { stockCount: true },
      })

      await tx.product.update({
        where: { id: productId },
        data: { stockCount: stockSum._sum.stockCount || 0 },
      })
    })

    return NextResponse.json({
      message: 'Variant deleted successfully.',
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      )
    }

    console.error('[ADMIN_VARIANT_DELETE] Error:', error)
    return NextResponse.json(
      { error: 'Failed to delete variant.' },
      { status: 500 }
    )
  }
}
