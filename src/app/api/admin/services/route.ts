import { NextResponse } from 'next/server'
import { db } from '@/database/client'
import { requireAdmin, AuthError } from '@/middleware/auth'
import { ensureInitialData } from '@/database/siteDb'

export async function GET() {
  try {
    await requireAdmin()
    await ensureInitialData()
    const services = await db.studioService.findMany({
      orderBy: { order: 'asc' },
    })
    return NextResponse.json(services)
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin()
    const body = await req.json()
    const { key, title, description, priceFrom, priceLabel, icon } = body

    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      )
    }

    const serviceKey = key || title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    const count = await db.studioService.count()

    const service = await db.studioService.create({
      data: {
        key: serviceKey,
        title,
        description,
        priceFrom: Number(priceFrom) || 0,
        priceLabel: priceLabel || `रु ${Number(priceFrom || 0).toLocaleString()}+`,
        icon: icon || 'camera',
        order: count,
      },
    })

    return NextResponse.json(service, { status: 201 })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    console.error('Service POST error:', error)
    return NextResponse.json({ error: 'Failed to create service' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    await requireAdmin()
    const body = await req.json()
    const { id, title, description, priceFrom, priceLabel, icon, order } = body

    if (!id) {
      return NextResponse.json({ error: 'Service ID is required' }, { status: 400 })
    }

    const updated = await db.studioService.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(priceFrom !== undefined && { priceFrom: Number(priceFrom) }),
        ...(priceLabel && { priceLabel }),
        ...(icon && { icon }),
        ...(order !== undefined && { order: Number(order) }),
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    console.error('Service PUT error:', error)
    return NextResponse.json({ error: 'Failed to update service' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    await requireAdmin()
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Service ID is required' }, { status: 400 })
    }

    await db.studioService.delete({
      where: { id },
    })

    return NextResponse.json({ success: true, message: 'Service deleted successfully' })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    console.error('Service DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete service' }, { status: 500 })
  }
}
