import { NextResponse } from 'next/server'
import { getFullSiteData } from '@/database/siteDb'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const data = await getFullSiteData()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to get site data:', error)
    return NextResponse.json({ error: 'Failed to retrieve site data' }, { status: 500 })
  }
}
