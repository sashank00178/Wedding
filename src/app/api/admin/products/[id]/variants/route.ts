/**
 * Admin Product Variants — /api/admin/products/[id]/variants
 *
 * GET   — List all variants for a product
 * POST  — Add a new variant to a product
 *
 * Protected by middleware + requireAdmin() double-check.
 *
 * ⚡ Place in: src/app/api/admin/products/[id]/variants/route.ts
 */

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, AuthError } from '@/lib/auth-helpers'
import { variantSchema, type VariantInput } from '@/lib/validations/product'
import { z } from 'zod'

const createVariantSchema = z.object({
  name: z.string().min(1, 'Variant name is required'),
  sku: z.string().min(1, 'SKU is required'),
  price: z.number().positive('Price must be greater than 0'),
  stockCount: z.number().int().min(0).default(0),
  attributes: z.record(z.string(), z.unknown()).optional().default({}),
})

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id: productId } = await params

    // Verify product exists
    const product = await db.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found.' },
        { status: 404 }
      )
    }

    const variants = await db.productVariant.findMany({
      where: { productId },
      orderBy: { createdAt: 'asc' },
      include: {
        _count: {
          select: { cartItems: true, orderItems: true },
        },
      },
    })

    return NextResponse.json({ productId: product.id, productName: product.name, variants })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      )
    }

    console.error('[ADMIN_VARIANTS_GET] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch variants.' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id: productId } = await params

    const product = await db.product.findUnique({ where: { id: productId } })
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found.' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const parsed = createVariantSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const variantData = parsed.data

    // ── Create variant + update parent stock in transaction ──────
    const variant = await db.$transaction(async (tx) => {
      const newVariant = await tx.productVariant.create({
        data: {
          productId,
          name: variantData.name,
          sku: variantData.sku,
          price: variantData.price,
          stockCount: variantData.stockCount,
          attributes: JSON.stringify(variantData.attributes || {}),
        },
      })

      // Recalculate parent product stock
      const stockSum = await tx.productVariant.aggregate({
        where: { productId },
        _sum: { stockCount: true },
      })

      await tx.product.update({
        where: { id: productId },
        data: { stockCount: stockSum._sum.stockCount || 0 },
      })

      return newVariant
    })

    return NextResponse.json(
      { message: 'Variant created successfully.', variant },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      )
    }

    console.error('[ADMIN_VARIANTS_POST] Error:', error)

    if (error instanceof Error && error.message.includes('Unique')) {
      return NextResponse.json(
        { error: 'A variant with this SKU already exists.' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create variant.' },
      { status: 500 }
    )
  }
}
