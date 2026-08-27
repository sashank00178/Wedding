/**
 * Admin Reviews — GET /api/admin/reviews
 *
 * Returns a paginated list of all reviews with optional filters.
 * Admins can filter by approval status, product, rating, or search term.
 *
 * Protected by middleware + requireAdmin() double-check.
 *
 * ⚡ Place in: src/app/api/admin/reviews/route.ts
 */

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, AuthError } from '@/lib/auth-helpers'
import { z } from 'zod'

const adminReviewListSchema = z.object({
  isApproved: z.enum(['true', 'false']).optional().transform(v => v === 'true' ? true : v === 'false' ? false : undefined),
  productId: z.string().optional(),
  minRating: z.coerce.number().int().min(1).max(5).optional(),
  maxRating: z.coerce.number().int().min(1).max(5).optional(),
  search: z.string().max(100).optional(),
  sortBy: z.enum(['createdAt', 'rating']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

export async function GET(request: Request) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const query = adminReviewListSchema.safeParse(
      Object.fromEntries(searchParams)
    )

    if (!query.success) {
      return NextResponse.json(
        { error: query.error.issues[0].message },
        { status: 400 }
      )
    }

    const { isApproved, productId, minRating, maxRating, search, sortBy, sortOrder, page, limit } = query.data
    const skip = (page - 1) * limit

    // ── Build where clause ───────────────────────────────────────
    const where: Record<string, unknown> = {}

    if (isApproved !== undefined) {
      where.isApproved = isApproved
    }

    if (productId) {
      where.productId = productId
    }

    if (minRating !== undefined || maxRating !== undefined) {
      const ratingFilter: Record<string, unknown> = {}
      if (minRating !== undefined) ratingFilter.gte = minRating
      if (maxRating !== undefined) ratingFilter.lte = maxRating
      where.rating = ratingFilter
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { comment: { contains: search } },
        { user: { name: { contains: search } } },
        { product: { name: { contains: search } } },
      ]
    }

    // ── Fetch reviews ───────────────────────────────────────────
    const orderBy: Record<string, string> = {}
    orderBy[sortBy] = sortOrder

    const [reviews, total] = await Promise.all([
      db.review.findMany({
        where,
        select: {
          id: true,
          rating: true,
          title: true,
          comment: true,
          isApproved: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: { id: true, name: true, email: true },
          },
          product: {
            select: { id: true, name: true },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      db.review.count({ where }),
    ])

    // ── Aggregate stats ─────────────────────────────────────────
    const [avgRating, pendingCount, approvedCount] = await Promise.all([
      db.review.aggregate({ _avg: { rating: true }, _count: true }),
      db.review.count({ where: { isApproved: false } }),
      db.review.count({ where: { isApproved: true } }),
    ])

    return NextResponse.json({
      reviews,
      stats: {
        totalReviews: total,
        avgRating: Math.round((avgRating._avg.rating || 0) * 10) / 10,
        pendingApproval: pendingCount,
        approved: approvedCount,
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

    console.error('[ADMIN_REVIEWS_GET] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}
