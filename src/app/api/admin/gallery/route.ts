import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, AuthError } from '@/lib/auth-helpers'
import { ensureInitialData } from '@/lib/site-db'

export async function GET() {
  try {
    await requireAdmin()
    await ensureInitialData()
    const photos = await db.galleryPhoto.findMany({
      orderBy: { order: 'asc' },
    })
    return NextResponse.json(photos)
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    return NextResponse.json({ error: 'Failed to fetch photos' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin()
    const body = await req.json()
    const { src, title, category, description } = body

    if (!src || !title || !category) {
      return NextResponse.json(
        { error: 'Image source, title, and category are required' },
        { status: 400 }
      )
    }

    const count = await db.galleryPhoto.count()
    const photo = await db.galleryPhoto.create({
      data: {
        src,
        title,
        category,
        description: description || '',
        order: count,
      },
    })

    return NextResponse.json(photo, { status: 201 })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    console.error('Gallery POST error:', error)
    return NextResponse.json({ error: 'Failed to create photo' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    await requireAdmin()
    const body = await req.json()
    const { id, src, title, category, description, order } = body

    if (!id) {
      return NextResponse.json({ error: 'Photo ID is required' }, { status: 400 })
    }

    const updated = await db.galleryPhoto.update({
      where: { id },
      data: {
        ...(src && { src }),
        ...(title && { title }),
        ...(category && { category }),
        ...(description !== undefined && { description }),
        ...(order !== undefined && { order }),
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    console.error('Gallery PUT error:', error)
    return NextResponse.json({ error: 'Failed to update photo' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    await requireAdmin()
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Photo ID is required' }, { status: 400 })
    }

    await db.galleryPhoto.delete({
      where: { id },
    })

    return NextResponse.json({ success: true, message: 'Photo deleted successfully' })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    console.error('Gallery DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete photo' }, { status: 500 })
  }
}
