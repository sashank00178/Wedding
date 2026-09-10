import fs from 'fs'
import path from 'path'
import { GalleryItem, GalleryCategory } from '@/lib/site'

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif'])

interface FolderConfig {
  folderName: string
  category: GalleryCategory
  defaultCategoryLabel: string
}

const FOLDERS: FolderConfig[] = [
  { folderName: 'indoor', category: 'portrait', defaultCategoryLabel: 'Indoor Photo Shoot' },
  { folderName: 'weddings', category: 'wedding', defaultCategoryLabel: 'Wedding Photo Shoot' },
]

/**
 * Format raw filename into an elegant presentation title
 */
function formatTitleFromFilename(filename: string, category: GalleryCategory): string {
  // Strip double extensions like .JPG.jpeg or .jpg
  let base = filename.replace(/\.(jpeg|jpg|png|webp|avif)(\.jpeg|\.jpg)?$/i, '')
  
  // Custom friendly titles for known photo names
  const lower = base.toLowerCase().replace(/[-_]+/g, ' ').trim()
  
  if (lower === 'couplepotrait' || lower === 'couple potrait' || lower === 'couple portrait') {
    return 'Couple Portrait & Pre-Wedding'
  }
  if (lower === 'potrait' || lower === 'portrait') {
    return 'Fine Art Studio Portrait'
  }
  if (lower === 'bridetobe' || lower === 'bride to be') {
    return 'Bride to Be Session'
  }
  if (lower.startsWith('bridetobe1') || lower.startsWith('bride to be 1')) {
    return 'Radiant Bride to Be'
  }
  if (lower === 'engagement') {
    return 'Sacred Engagement Ceremony'
  }
  if (lower === 'mehendi') {
    return 'Mehendi Rituals & Joy'
  }
  if (lower === 'reception') {
    return 'Grand Reception Celebration'
  }
  if (lower === 'postshoot' || lower === 'post shoot') {
    return 'Post-Wedding Couple Session'
  }
  if (lower === 'marriage') {
    return 'Traditional Nepali Wedding'
  }
  if (lower.includes('family')) {
    return 'Heirloom Family Studio Portrait'
  }
  if (lower.includes('graduation') || lower.includes('dsc04212')) {
    return 'Academic Milestone Graduation'
  }
  if (lower.includes('maternity')) {
    return 'Ethereal Studio Maternity Portrait'
  }

  // Camera names like IMG_4144 or DSC06372
  const imgMatch = base.match(/^(?:img|dsc)[_-]?(\d+)$/i)
  if (imgMatch) {
    const num = imgMatch[1]
    return category === 'wedding'
      ? `Wedding Celebration #${num}`
      : `Indoor Studio Portrait #${num}`
  }

  // General title-casing
  return base
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map((w) => (w.length > 0 ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : ''))
    .join(' ')
}

/**
 * Auto-detect sub-category tag from filename
 */
function formatSubcategoryFromFilename(filename: string, category: GalleryCategory): string | null {
  const lower = filename.toLowerCase()

  if (category === 'portrait') {
    if (lower.includes('family')) return 'family'
    if (lower.includes('graduation') || lower.includes('dsc04212')) return 'graduation'
    if (lower.includes('maternity')) return 'maternity'
    if (lower.includes('couple') || lower.includes('couplepotrait') || lower.includes('potrait') || lower.includes('portrait')) {
      return 'couplepre-wedding'
    }
    return null
  }

  if (category === 'wedding') {
    if (lower.includes('bridetobe') || lower.includes('bride-to-be') || lower.includes('bride')) return 'bridetobe'
    if (lower.includes('engagement')) return 'engagement'
    if (lower.includes('mehendi')) return 'mehendi'
    if (lower.includes('marriage')) return 'marriage'
    if (lower.includes('reception')) return 'reception'
    if (lower.includes('postshoot') || lower.includes('post-shoot') || lower.includes('post')) return 'postshoot'
    return null
  }

  return null
}

/**
 * Default descriptions for known photo names or categories
 */
function formatDescriptionFromFilename(filename: string, category: GalleryCategory): string {
  const lower = filename.toLowerCase()
  if (lower.includes('family')) {
    return 'Cherished multi-generational studio family portrait with timeless warmth and gentle illumination.'
  }
  if (lower.includes('graduation') || lower.includes('dsc04212')) {
    return 'Celebrating academic milestone achievements with formal regalia, cap, gown, and genuine pride.'
  }
  if (lower.includes('maternity')) {
    return 'Gentle, ethereal studio maternity portrait honoring motherhood, partner bond, and new beginnings.'
  }
  if (lower.includes('marriage')) {
    return 'Sacred ceremonial rituals, wedding garlands, and traditional Nepali marriage vows.'
  }
  if (lower.includes('couplepotrait') || lower.includes('couple')) {
    return 'Intimate studio couple portrait capturing romantic chemistry with cinematic lighting.'
  }
  if (lower.includes('potrait')) {
    return 'Fine-art editorial studio portrait featuring dramatic rim-lighting and natural warmth.'
  }
  if (lower.includes('bridetobe')) {
    return 'Timeless pre-wedding bridal session celebrating radiant anticipation and traditional elegance.'
  }
  if (lower.includes('engagement')) {
    return 'Heartfelt engagement ceremony documenting the sacred promises and joyful families.'
  }
  if (lower.includes('mehendi')) {
    return 'Vibrant mehendi festivities filled with authentic laughter, intricate henna, and music.'
  }
  if (lower.includes('reception')) {
    return 'Glamorous evening wedding reception celebrating the newly-weds with family and guests.'
  }
  if (lower.includes('postshoot')) {
    return 'Scenic post-wedding outdoor couple portraits captured against breathtaking backdrops.'
  }
  if (category === 'wedding') {
    return 'Authentic ceremonial coverage capturing deep emotional milestones and family blessings.'
  }
  return 'Professional studio portraiture crafted with precision lighting and timeless framing.'
}

/**
 * Ensures any images dropped in src/app/gallery/[folder] are mirrored into public/gallery/[folder]
 * so Next.js static asset server can serve them via HTTP at /gallery/[folder]/[filename].
 */
function syncSourceFolderToPublic(folderName: string, cwd: string) {
  if (process.env.NODE_ENV === 'production') return
  try {
    const srcDir = path.join(cwd, 'src', 'app', 'gallery', folderName)
    const pubDir = path.join(cwd, 'public', 'gallery', folderName)

    if (!fs.existsSync(pubDir)) {
      fs.mkdirSync(pubDir, { recursive: true })
    }

    if (fs.existsSync(srcDir)) {
      const srcFiles = fs.readdirSync(srcDir)
      for (const file of srcFiles) {
        const ext = path.extname(file).toLowerCase()
        if (IMAGE_EXTENSIONS.has(ext) || file.toLowerCase().endsWith('.jpg.jpeg')) {
          const srcPath = path.join(srcDir, file)
          const pubPath = path.join(pubDir, file)
          if (!fs.existsSync(pubPath)) {
            fs.copyFileSync(srcPath, pubPath)
          }
        }
      }
    }
  } catch (err) {
    console.error(`[gallery-loader] Error syncing ${folderName}:`, err)
  }
}

/**
 * Dynamically reads public/gallery/indoor and public/gallery/weddings
 * Sorted by newest added/modified first (mtimeMs descending), with fallback to alphabetical.
 */
export function getDynamicGalleryPhotos(): GalleryItem[] {
  const cwd = process.cwd()
  const allItems: (GalleryItem & { mtimeMs: number })[] = []

  for (const { folderName, category } of FOLDERS) {
    // 1. Automatically sync from src/app/gallery if user placed files there
    syncSourceFolderToPublic(folderName, cwd)

    const pubDir = path.join(cwd, 'public', 'gallery', folderName)
    if (!fs.existsSync(pubDir)) {
      continue
    }

    try {
      const dirents = fs.readdirSync(pubDir, { withFileTypes: true })

      for (const dirent of dirents) {
        if (!dirent.isFile()) continue
        if (dirent.name.startsWith('.')) continue

        const ext = path.extname(dirent.name).toLowerCase()
        const isImage = IMAGE_EXTENSIONS.has(ext) || dirent.name.toLowerCase().endsWith('.jpg.jpeg')
        if (!isImage) continue

        const filePath = path.join(pubDir, dirent.name)
        let mtimeMs = 0
        try {
          const stats = fs.statSync(filePath)
          mtimeMs = Math.max(stats.mtimeMs || 0, stats.birthtimeMs || 0)
        } catch {
          mtimeMs = 0
        }

        // URL encoded path for web
        const webSrc = `/gallery/${folderName}/${encodeURIComponent(dirent.name)}`
        const title = formatTitleFromFilename(dirent.name, category)
        const description = formatDescriptionFromFilename(dirent.name, category)
        const subcategory = formatSubcategoryFromFilename(dirent.name, category)

        allItems.push({
          src: webSrc,
          title,
          category,
          subcategory,
          description,
          mtimeMs,
        })
      }
    } catch (err) {
      console.error(`[gallery-loader] Error reading ${folderName}:`, err)
    }
  }

  // Sort by newest first (highest timestamp), fallback to title alphabetical
  allItems.sort((a, b) => {
    if (b.mtimeMs !== a.mtimeMs) {
      return b.mtimeMs - a.mtimeMs
    }
    return a.title.localeCompare(b.title)
  })

  // Strip temporary mtimeMs helper property
  return allItems.map(({ src, title, category, subcategory, description }) => ({
    src,
    title,
    category,
    subcategory,
    description,
  }))
}

export interface HeroImageItem {
  src: string
  alt: string
  title: string
  filename: string
}

/**
 * Dynamically reads hero images from public/gallery/hero
 * (and mirrors from src/app/gallery/hero or gallery/hero in project root).
 * Guaranteed to auto-update when files are added or removed.
 */
export function getDynamicHeroImages(): HeroImageItem[] {
  const cwd = process.cwd()

  // 1. Sync from src/app/gallery/hero if user dropped files there
  syncSourceFolderToPublic('hero', cwd)

  // 2. Also sync from root "gallery/hero" if present
  try {
    const rootGalleryHero = path.join(cwd, 'gallery', 'hero')
    const pubDir = path.join(cwd, 'public', 'gallery', 'hero')
    if (fs.existsSync(rootGalleryHero)) {
      if (!fs.existsSync(pubDir)) {
        fs.mkdirSync(pubDir, { recursive: true })
      }
      const rootFiles = fs.readdirSync(rootGalleryHero)
      for (const file of rootFiles) {
        const ext = path.extname(file).toLowerCase()
        if (IMAGE_EXTENSIONS.has(ext)) {
          const srcPath = path.join(rootGalleryHero, file)
          const pubPath = path.join(pubDir, file)
          if (!fs.existsSync(pubPath)) {
            fs.copyFileSync(srcPath, pubPath)
          }
        }
      }
    }
  } catch (err) {
    console.error('[gallery-loader] Error syncing root gallery/hero:', err)
  }

  const heroPubDir = path.join(cwd, 'public', 'gallery', 'hero')
  if (!fs.existsSync(heroPubDir)) {
    return [
      {
        src: '/gallery/hero.jpeg',
        alt: 'Wedding Moment Nepal - Scenic outdoor showcase',
        title: 'Scenic Outdoor Showcase',
        filename: 'hero.jpeg',
      },
    ]
  }

  const items: (HeroImageItem & { mtimeMs: number })[] = []

  try {
    const dirents = fs.readdirSync(heroPubDir, { withFileTypes: true })
    for (const dirent of dirents) {
      if (!dirent.isFile()) continue
      if (dirent.name.startsWith('.')) continue

      const ext = path.extname(dirent.name).toLowerCase()
      const isImage = IMAGE_EXTENSIONS.has(ext)
      if (!isImage) continue

      const filePath = path.join(heroPubDir, dirent.name)
      let mtimeMs = 0
      try {
        const stats = fs.statSync(filePath)
        mtimeMs = Math.max(stats.mtimeMs || 0, stats.birthtimeMs || 0)
      } catch {
        mtimeMs = 0
      }

      const webSrc = `/gallery/hero/${encodeURIComponent(dirent.name)}`
      const baseName = dirent.name.replace(/\.[^/.]+$/, '').toLowerCase()

      let title = formatTitleFromFilename(dirent.name, 'wedding')
      if (baseName.includes('hero')) {
        title = 'Scenic Balloon & Lake Session'
      } else if (title.startsWith('Wedding Celebration #') || title.startsWith('Indoor Studio Portrait #')) {
        title = `Wedding Photography Celebration (${dirent.name.replace(/\.[^/.]+$/, '')})`
      }

      const alt = `Wedding Moment Nepal - ${title}`

      items.push({
        src: webSrc,
        alt,
        title,
        filename: dirent.name,
        mtimeMs,
      })
    }
  } catch (err) {
    console.error('[gallery-loader] Error reading hero images:', err)
  }

  if (items.length === 0) {
    return [
      {
        src: '/gallery/hero.jpeg',
        alt: 'Wedding Moment Nepal - Scenic outdoor showcase',
        title: 'Scenic Outdoor Showcase',
        filename: 'hero.jpeg',
      },
    ]
  }

  // Sort: Put 'hero.jpeg' first, followed by alphabetical order of remaining files
  items.sort((a, b) => {
    const aIsHero = a.filename.toLowerCase().startsWith('hero')
    const bIsHero = b.filename.toLowerCase().startsWith('hero')
    if (aIsHero && !bIsHero) return -1
    if (!aIsHero && bIsHero) return 1
    return a.filename.localeCompare(b.filename)
  })

  return items.map(({ src, alt, title, filename }) => ({
    src,
    alt,
    title,
    filename,
  }))
}
