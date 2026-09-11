import { NextResponse } from 'next/server'
import { getPackagePrices } from '@/database/siteDb'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const packages = await getPackagePrices()
    return NextResponse.json({ packages, success: true })
  } catch (error) {
    console.error('Failed to get packages:', error)
    return NextResponse.json({ error: 'Failed to retrieve package prices' }, { status: 500 })
  }
}
