import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, AuthError } from '@/lib/auth-helpers'
import { ensureInitialData } from '@/lib/site-db'

export async function GET() {
  try {
    await requireAdmin()
    await ensureInitialData()

    const [settings, hours, socialLinks] = await Promise.all([
      db.siteSetting.findMany(),
      db.studioHour.findMany({ orderBy: { order: 'asc' } }),
      db.socialLink.findMany({ orderBy: { order: 'asc' } }),
    ])

    const settingsMap: Record<string, string> = {}
    for (const s of settings) {
      settingsMap[s.key] = s.value
    }

    return NextResponse.json({
      settings: settingsMap,
      hours,
      socialLinks,
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    console.error('Settings GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    await requireAdmin()
    const body = await req.json()
    const { settings, hours, socialLinks } = body

    // 1. Update Key-Value Site Settings (excluding permanent developer-only copyright)
    if (settings && typeof settings === 'object') {
      for (const [key, value] of Object.entries(settings)) {
        if (key === 'copyright') continue
        await db.siteSetting.upsert({
          where: { key },
          create: { key, value: String(value) },
          update: { value: String(value) },
        })
      }
    }

    // 2. Update Studio Hours
    if (Array.isArray(hours)) {
      await db.studioHour.deleteMany()
      for (let i = 0; i < hours.length; i++) {
        const h = hours[i]
        if (h.day && h.time) {
          await db.studioHour.create({
            data: {
              day: h.day,
              time: h.time,
              order: i,
            },
          })
        }
      }
    }

    // 3. Update Social Links
    if (Array.isArray(socialLinks)) {
      await db.socialLink.deleteMany()
      for (let i = 0; i < socialLinks.length; i++) {
        const s = socialLinks[i]
        if (s.label && s.href) {
          await db.socialLink.create({
            data: {
              label: s.label,
              icon: s.icon || 'globe',
              href: s.href,
              order: i,
            },
          })
        }
      }
    }

    return NextResponse.json({ success: true, message: 'Settings updated successfully' })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    console.error('Settings PUT error:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
