import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, AuthError } from '@/lib/auth-helpers'
import { ensureInitialData } from '@/lib/site-db'
import { formatPackagePriceDisplay } from '@/lib/packages-data'

// Package Price Management API (Admin)
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await requireAdmin()
    await ensureInitialData()

    const packages = await db.packagePrice.findMany({
      orderBy: { order: 'asc' },
    })

    return NextResponse.json(packages)
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    console.error('Admin Packages GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch packages' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    await requireAdmin()
    const body = await req.json()
    const { id, packageKey, amount, priceType } = body

    if (!id && !packageKey) {
      return NextResponse.json(
        { error: 'Package ID or packageKey is required' },
        { status: 400 }
      )
    }

    const numAmount = Number(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json(
        { error: 'Please enter a valid positive price number' },
        { status: 400 }
      )
    }

    // Find the package
    const existing = await db.packagePrice.findFirst({
      where: id ? { id } : { packageKey },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 })
    }

    // Determine target priceType
    let targetPriceType = existing.priceType
    if (priceType === 'fixed' || priceType === 'advance') {
      targetPriceType = priceType
    }

    // Format display string and remove TBD flag since admin provided real price
    const newPriceDisplay = formatPackagePriceDisplay(
      numAmount,
      targetPriceType as 'advance' | 'fixed' | 'deposit',
      existing.name,
      false
    )

    const updated = await db.packagePrice.update({
      where: { id: existing.id },
      data: {
        amount: numAmount,
        priceType: targetPriceType,
        priceDisplay: newPriceDisplay,
        isTbd: false,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    console.error('Admin Packages PUT error:', error)
    return NextResponse.json({ error: 'Failed to update package price' }, { status: 500 })
  }
}
