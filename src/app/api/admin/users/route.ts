/**
 * Admin Users — GET /api/admin/users
 *
 * What it does in plain language:
 *   Returns a list of all users (customers + admins) for the admin panel.
 *   Used to manage customer accounts, view who's registered, etc.
 *
 *   - Filter by role (admin/customer)
 *   - Search by name or email
 *   - Paginated results
 *   - Includes order count per user
 *
 *   Password hashes are NEVER included in the response.
 *
 * ⚡ Place in: src/app/api/admin/users/route.ts
 */

import { NextResponse } from 'next/server'
import { db } from '@/database/client'
import { requireAdmin, AuthError } from '@/middleware/auth'
import { z } from 'zod'

const adminUserListSchema = z.object({
  role: z.enum(['admin', 'customer']).optional(),
  search: z.string().max(100).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

export async function GET(request: Request) {
  try {
    await requireAdmin()

    // ── 1. Validate query params ────────────────────────────────
    const { searchParams } = new URL(request.url)
    const query = adminUserListSchema.safeParse(
      Object.fromEntries(searchParams)
    )

    if (!query.success) {
      return NextResponse.json(
        { error: query.error.issues[0].message },
        { status: 400 }
      )
    }

    const { role, search, page, limit } = query.data
    const skip = (page - 1) * limit

    // ── 2. Build where clause ───────────────────────────────────
    const where: Record<string, unknown> = {}

    if (role) {
      where.role = role
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ]
    }

    // ── 3. Fetch users ──────────────────────────────────────────
    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          image: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
          // NEVER expose passwordHash
          _count: {
            select: {
              orders: true,
              reviews: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.user.count({ where }),
    ])

    return NextResponse.json({
      users,
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

    console.error('[ADMIN_USERS_GET] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}
