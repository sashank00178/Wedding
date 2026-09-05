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
import { getDynamicGalleryPhotos, getDynamicHeroImages } from '@/lib/gallery-loader'

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
    } else {
      // Sync latest Google Maps URLs
      await db.siteSetting.upsert({
        where: { key: 'mapLinkUrl' },
        create: { key: 'mapLinkUrl', value: SITE.mapLinkUrl },
        update: { value: SITE.mapLinkUrl },
      })
      await db.siteSetting.upsert({
        where: { key: 'mapEmbedUrl' },
        create: { key: 'mapEmbedUrl', value: SITE.mapEmbedUrl },
        update: { value: SITE.mapEmbedUrl },
      })
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
    } else {
      await db.studioService.updateMany({
        where: { key: 'portrait' },
        data: {
          title: 'Indoor Photography',
          description: 'Studio photography featuring 4 dedicated sessions: Couple Portrait & Pre-Wedding, Family, Graduation, and Maternity photoshoots.',
          priceFrom: 5000,
          priceLabel: 'रु 5,000+',
        },
      })
      await db.studioService.updateMany({
        where: { key: 'wedding' },
        data: {
          title: 'Wedding Photography',
          description: 'Comprehensive ceremonial coverage featuring Bride Side, Groom Side, and Complete Combo wedding packages.',
          priceFrom: 35000,
          priceLabel: 'रु 35,000+',
        },
      })
      // Ensure deprecated services are removed
      await db.studioService.deleteMany({
        where: { key: { in: ['commercial', 'event'] } },
      })
    }

    // 4. Ensure Gallery Photos
    // Remove obsolete placeholder photos
    await db.galleryPhoto.deleteMany({
      where: {
        OR: [
          { category: { in: ['commercial', 'event'] } },
          { src: { in: ['/gallery/wedding1.jpg', '/gallery/wedding2.jpg', '/gallery/portrait1.jpg', '/gallery/portrait2.jpg'] } },
        ],
      },
    })

    const dynamicPhotos = getDynamicGalleryPhotos()
    for (let i = 0; i < dynamicPhotos.length; i++) {
      const p = dynamicPhotos[i]
      const existing = await db.galleryPhoto.findFirst({
        where: { src: p.src },
      })
      if (!existing) {
        await db.galleryPhoto.create({
          data: {
            src: p.src,
            title: p.title,
            category: p.category,
            subcategory: p.subcategory,
            description: p.description,
            order: i,
          },
        })
      } else if (!existing.subcategory && p.subcategory) {
        await db.galleryPhoto.update({
          where: { id: existing.id },
          data: { subcategory: p.subcategory },
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
    } else {
      await db.socialLink.updateMany({
        where: {
          OR: [{ icon: 'facebook' }, { label: 'Facebook' }],
        },
        data: {
          href: 'https://www.facebook.com/share/19FMkBiqgK/',
        },
      })
      await db.socialLink.updateMany({
        where: {
          OR: [{ icon: 'instagram' }, { label: 'Instagram' }],
        },
        data: {
          href: 'https://www.instagram.com/weddingmoment_uncalmax1?igsi=MTVzcHZxb3B1enlteA==',
        },
      })
      await db.socialLink.updateMany({
        where: {
          OR: [{ icon: 'tiktok' }, { label: 'TikTok' }],
        },
        data: {
          href: 'https://www.tiktok.com/@uncalmax?_r=1&_t=ZS-99QPIkiKqzV',
        },
      })
      await db.socialLink.updateMany({
        where: {
          OR: [{ icon: 'whatsapp' }, { label: 'WhatsApp' }, { icon: 'viber' }, { label: 'Viber' }],
        },
        data: {
          label: 'WhatsApp',
          icon: 'whatsapp',
          href: 'https://wa.me/9779856010315?text=Hi%2C%20I%27m%20interested%20in%20booking%20a%20photography%20session%20with%20WeddingMoment.',
        },
      })
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
    mapEmbedUrl:
      settingsMap.mapEmbedUrl && settingsMap.mapEmbedUrl.includes('t=m')
        ? settingsMap.mapEmbedUrl
        : SITE.mapEmbedUrl,
    since: settingsMap.since || SITE.since,
    footerNote: settingsMap.footerNote || SITE.footerNote,
    copyright: settingsMap.copyright || SITE.copyright,
  }

  const dynamicPhotos = getDynamicGalleryPhotos()
  const dbPhotoMap = new Map(gallery.map((p) => [p.src, p]))

  // Merge dynamic photos with any custom DB overrides (title, description, order, subcategory)
  const mergedGallery = dynamicPhotos.map((dp, idx) => {
    const dbItem = dbPhotoMap.get(dp.src)
    return {
      id: dbItem?.id || `folder-${idx}`,
      src: dp.src,
      title: dbItem?.title || dp.title,
      category: (dbItem?.category as GalleryCategory) || dp.category,
      subcategory: dbItem?.subcategory !== undefined ? dbItem.subcategory : dp.subcategory,
      description: dbItem?.description !== undefined ? dbItem.description : dp.description,
      order: dbItem?.order !== undefined ? dbItem.order : idx,
    }
  })

  // Append any extra photos that might have been uploaded via admin dashboard not in folders
  const dynamicSrcSet = new Set(dynamicPhotos.map((p) => p.src))
  for (const dbItem of gallery) {
    if (!dynamicSrcSet.has(dbItem.src) && !dbItem.src.includes('wedding1.jpg') && !dbItem.src.includes('portrait1.jpg')) {
      mergedGallery.push({
        id: dbItem.id,
        src: dbItem.src,
        title: dbItem.title,
        category: dbItem.category as GalleryCategory,
        subcategory: dbItem.subcategory,
        description: dbItem.description,
        order: dbItem.order,
      })
    }
  }

  return {
    site: mergedSite,
    services: (services.length > 0 ? services : SERVICES).map((s) => {
      const defaultS = SERVICES.find((ds) => ds.key === s.key)
      return {
        ...s,
        image: defaultS?.image || (s.key === 'portrait' ? '/gallery/indoor/IMG_7952.JPG' : '/gallery/wedding-photography.jpg'),
      }
    }),
    gallery: (mergedGallery.length > 0 ? mergedGallery : GALLERY_ITEMS) as {
      id?: string
      src: string
      title: string
      category: GalleryCategory
      subcategory?: string | null
      description?: string | null
      order?: number
    }[],
    hours: hours.length > 0 ? hours : STUDIO_HOURS,
    socialLinks: socialLinks.length > 0 ? socialLinks : SOCIAL_LINKS,
    heroImages: getDynamicHeroImages(),
  }
}
