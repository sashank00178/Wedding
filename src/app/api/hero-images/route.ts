import { NextResponse } from 'next/server'
import { getDynamicHeroImages } from '@/services/galleryService'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const images = getDynamicHeroImages()
    return NextResponse.json({ images })
  } catch (error) {
    console.error('Failed to get hero images:', error)
    return NextResponse.json({ error: 'Failed to retrieve hero images' }, { status: 500 })
  }
}
