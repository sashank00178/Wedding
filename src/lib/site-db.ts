import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import {
  SITE,
  SERVICES,
  GALLERY_ITEMS,
  STUDIO_HOURS,
  SOCIAL_LINKS,
  type GalleryCategory,
} from '@/lib/site'

export async function ensureInitialData() {
  try {
    // 1. Ensure Admin User
    const adminEmail = process.env.ADMIN_EMAIL || 'weddingmomentpkr@gmail.com'
    const adminUser = await db.user.findUnique({
      where: { email: adminEmail },
    })

    if (!adminUser) {
      const passwordHash = await bcrypt.hash('admin123', 10)
      await db.user.create({
        data: {
          name: 'Wedding Moment Admin',
          email: adminEmail,
          passwordHash,
          role: 'admin',
        },
      })
    }

    // 2. Ensure Site Settings
    const settingsCount = await db.siteSetting.count()
    if (settingsCount === 0) {
      const initialSettings: Record<string, string> = {
        brand: SITE.brand,
        shortBrand: SITE.shortBrand,
        tagline: SITE.tagline,
        heroSubtitle: SITE.heroSubtitle,
        phone: SITE.phone,
        email: SITE.email,
        address: SITE.address,
        locationLabel: SITE.locationLabel,
        mapLinkUrl: SITE.mapLinkUrl,
        mapEmbedUrl: SITE.mapEmbedUrl,
        since: SITE.since,
        footerNote: SITE.footerNote,
        copyright: SITE.copyright,
      }

      for (const [key, value] of Object.entries(initialSettings)) {
        await db.siteSetting.upsert({
          where: { key },
          create: { key, value },
          update: { value },
        })
      }
    }

    // 3. Ensure Services
    const servicesCount = await db.studioService.count()
    if (servicesCount === 0) {
      for (let i = 0; i < SERVICES.length; i++) {
        const s = SERVICES[i]
        await db.studioService.create({
          data: {
            key: s.key,
            title: s.title,
            description: s.description,
            priceFrom: s.priceFrom,
            priceLabel: s.priceLabel,
            icon: s.icon,
            order: i,
          },
        })
      }
    }

    // 4. Ensure Gallery Photos
    const galleryCount = await db.galleryPhoto.count()
    if (galleryCount === 0) {
      for (let i = 0; i < GALLERY_ITEMS.length; i++) {
        const g = GALLERY_ITEMS[i]
        await db.galleryPhoto.create({
          data: {
            src: g.src,
            title: g.title,
            category: g.category,
            description: g.description,
            order: i,
          },
        })
      }
    } else {
      for (const g of GALLERY_ITEMS) {
        await db.galleryPhoto.updateMany({
          where: { src: g.src },
          data: { description: g.description, title: g.title },
        })
      }
    }

    // 5. Ensure Studio Hours
    const hoursCount = await db.studioHour.count()
    if (hoursCount === 0) {
      for (let i = 0; i < STUDIO_HOURS.length; i++) {
        const h = STUDIO_HOURS[i]
        await db.studioHour.create({
          data: {
            day: h.day,
            time: h.time,
            order: i,
          },
        })
      }
    } else {
      const existingHours = await db.studioHour.findMany()
      for (const eh of existingHours) {
        if (eh.day.includes('–') || eh.time.includes('–')) {
          await db.studioHour.update({
            where: { id: eh.id },
            data: {
              day: eh.day.replace(/–/g, 'to'),
              time: eh.time.replace(/–/g, 'to'),
            },
          })
        }
      }
    }

    // 6. Ensure Social Links
    const socialCount = await db.socialLink.count()
    if (socialCount === 0) {
      for (let i = 0; i < SOCIAL_LINKS.length; i++) {
        const s = SOCIAL_LINKS[i]
        await db.socialLink.create({
          data: {
            label: s.label,
            icon: s.icon,
            href: s.href,
            order: i,
          },
        })
      }
    }
  } catch (error) {
    console.error('Error seeding initial studio data:', error)
  }
}

export async function getFullSiteData() {
  await ensureInitialData()

  const [settings, services, gallery, hours, socialLinks] = await Promise.all([
    db.siteSetting.findMany(),
    db.studioService.findMany({ orderBy: { order: 'asc' } }),
    db.galleryPhoto.findMany({ orderBy: { order: 'asc' } }),
    db.studioHour.findMany({ orderBy: { order: 'asc' } }),
    db.socialLink.findMany({ orderBy: { order: 'asc' } }),
  ])

  const settingsMap: Record<string, string> = {}
  for (const s of settings) {
    settingsMap[s.key] = s.value
  }

  const mergedSite = {
    brand: settingsMap.brand || SITE.brand,
    shortBrand: settingsMap.shortBrand || SITE.shortBrand,
    tagline: settingsMap.tagline || SITE.tagline,
    heroSubtitle: settingsMap.heroSubtitle || SITE.heroSubtitle,
    phone: settingsMap.phone || SITE.phone,
    email: settingsMap.email || SITE.email,
    address: settingsMap.address || SITE.address,
    locationLabel: settingsMap.locationLabel || SITE.locationLabel,
    mapLinkUrl: settingsMap.mapLinkUrl || SITE.mapLinkUrl,
    mapEmbedUrl: settingsMap.mapEmbedUrl || SITE.mapEmbedUrl,
    since: settingsMap.since || SITE.since,
    footerNote: settingsMap.footerNote || SITE.footerNote,
    copyright: settingsMap.copyright || SITE.copyright,
  }

  return {
    site: mergedSite,
    services: services.length > 0 ? services : SERVICES,
    gallery: (gallery.length > 0 ? gallery : GALLERY_ITEMS) as {
      id?: string
      src: string
      title: string
      category: GalleryCategory
      description?: string | null
      order?: number
    }[],
    hours: hours.length > 0 ? hours : STUDIO_HOURS,
    socialLinks: socialLinks.length > 0 ? socialLinks : SOCIAL_LINKS,
  }
}
