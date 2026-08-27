/**
 * Admin Review Detail & Approve/Reject — /api/admin/reviews/[id]
 *
 * GET    — Get single review detail
 * PATCH  — Toggle approval status (approve or reject)
 * DELETE — Delete a review (admin only)
 *
 * Protected by middleware + requireAdmin() double-check.
 *
 * ⚡ Place in: src/app/api/admin/reviews/[id]/route.ts
 */

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, AuthError } from '@/lib/auth-helpers'
import { z } from 'zod'

const updateReviewSchema = z.object({
  isApproved: z.boolean(),
})

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params

    const review = await db.review.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
        product: {
          select: { id: true, name: true, images: true },
        },
      },
    })

    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(review)
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      )
    }

    console.error('[ADMIN_REVIEW_DETAIL_GET] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch review' },
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
    const parsed = updateReviewSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    // Check review exists
    const existing = await db.review.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      )
    }

    const updated = await db.review.update({
      where: { id },
      data: { isApproved: parsed.data.isApproved },
    })

    return NextResponse.json({
      review: updated,
      message: parsed.data.isApproved
        ? 'Review approved successfully.'
        : 'Review rejected (unapproved).',
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      )
    }

    console.error('[ADMIN_REVIEW_PATCH] Error:', error)
    return NextResponse.json(
      { error: 'Failed to update review' },
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

    const existing = await db.review.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      )
    }

    await db.review.delete({ where: { id } })

    return NextResponse.json({ message: 'Review deleted successfully.' })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      )
    }

    console.error('[ADMIN_REVIEW_DELETE] Error:', error)
    return NextResponse.json(
      { error: 'Failed to delete review' },
      { status: 500 }
    )
  }
}
