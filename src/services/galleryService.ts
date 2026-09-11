import fs from 'fs'
import path from 'path'
import { GalleryItem, GalleryCategory } from '@/utils/siteConfig'

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

const KNOWN_MOMENT_TITLES: Record<string, string> = {
  // Wedding specific filenames
  'bridetobe': 'Bride To Be',
  'bridetobe1': 'Bride To Be',
  'bridetobe1_original_wide': 'Bride To Be',
  'd93a9617_groom_portrait': 'The Groom',
  'd93a9617 groom portrait': 'The Groom',
  'd93a9617': 'The Groom',
  'dsc00502': 'Garland Exchange',
  'dsc00748': 'Sindoor Moment',
  'dsc01530': 'Mandap Ritual',
  'dsc01671': 'Baraat Entry',
  'dsc02222': 'Seven Pheras',
  'dsc02423': 'Happy Couple',
  'dsc02464': 'Kanyadaan',
  'dsc02976': 'Grand Entry',
  'dsc03954_bride_portrait': 'The Bride',
  'dsc03954 bride portrait': 'The Bride',
  'dsc03954': 'The Bride',
  'dsc04833': 'Bidaai Tears',
  'dsc05338': 'Newlyweds',
  'dsc06785': 'Family Blessing',
  'dsc07274': 'Sunset Love',
  'dsc07830': 'Sangeet Dance',
  'dsc08002': 'Sweet Memories',
  'dsc08125': 'Golden Hour',
  'dsc09266': 'Wedding Music',
  'dsc09470': 'True Love',
  'engagement': 'Engagement',
  'marriage': 'Wedding Day',
  'mehendi': 'Mehendi Night',
  'postshoot': 'Post Wedding',
  'reception': 'Reception Night',
  'sony (7426)': 'Wedding Vows',
  'sony 7426': 'Wedding Vows',
  'sony (7834)': 'Bridal Details',
  'sony 7834': 'Bridal Details',
  'wedding-photography': 'Wedding Moments',
  'wedding': 'Wedding Day',

  // Indoor studio filenames
  '0004': 'Studio Elegance',
  'couplepotrait': 'Couple Portrait',
  'couple potrait': 'Couple Portrait',
  'dsc03612': 'Studio Smile',
  'dsc03625': 'Modern Style',
  'dsc04005': 'Happy Smile',
  'dsc04019': 'Black & White',
  'dsc04101': 'Graduation Day',
  'dsc04104': 'Graduation Smile',
  'dsc04212': 'Convocation',
  'dsc04223': 'Graduate Pride',
  'dsc04678': 'Family Portrait',
  'dsc04699': 'Family Love',
  'dsc04735': 'Family Joy',
  'dsc06372': 'Couple Studio',
  'dsc09336': 'Classic Pose',
  'img_2416': 'Artistic Mood',
  'img 2416': 'Artistic Mood',
  'img_4144': 'Soft Focus',
  'img 4144': 'Soft Focus',
  'img_6453': 'Studio Pose',
  'img 6453': 'Studio Pose',
  'img_6564': 'Studio Light',
  'img 6564': 'Studio Light',
  'img_7868': 'Warm Light',
  'img 7868': 'Warm Light',
  'img_7952': 'Studio Beauty',
  'img 7952': 'Studio Beauty',
  'max00023': 'Studio Charm',
  'oo3': 'Studio Glow',
  'potrait': 'Solo Portrait',
  'portrait': 'Solo Portrait',
  '_bp_9261': 'Timeless Pose',
  'bp 9261': 'Timeless Pose',
  'bp_9261': 'Timeless Pose',
  'indoor-photography': 'Studio Collection',
}

/**
 * Format raw filename into a short, elegant, easy-to-pronounce presentation title
 */
export function formatTitleFromFilename(filename: string, category: GalleryCategory): string {
  // Strip double extensions like .JPG.jpeg or .jpg
  let base = filename.replace(/\.(jpeg|jpg|png|webp|avif)(\.jpeg|\.jpg)?$/i, '')
  const rawKey = base.toLowerCase().trim()
  const cleanKey = rawKey.replace(/[-_]+/g, ' ').trim()

  if (KNOWN_MOMENT_TITLES[rawKey]) return KNOWN_MOMENT_TITLES[rawKey]
  if (KNOWN_MOMENT_TITLES[cleanKey]) return KNOWN_MOMENT_TITLES[cleanKey]

  // Check prefix matches in dictionary
  for (const [key, title] of Object.entries(KNOWN_MOMENT_TITLES)) {
    if (rawKey.startsWith(key) || cleanKey.startsWith(key)) {
      return title
    }
  }

  // Strip camera code prefixes, numbers, hashes, brackets, parentheses e.g. (1), (7834), #9261
  let cleaned = base
    .replace(/^(sony|dsc|img|d93a|nikon|canon|_bp|bp|oo|max|image)[_\s-]*\(?\d*\)?/i, '')
    .replace(/\s*\(\d+\)\s*/g, ' ')
    .replace(/\s*\[\d+\]\s*/g, ' ')
    .replace(/\s*#?\d+\s*/g, ' ')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  // Remove generic image/photo words at the beginning
  cleaned = cleaned.replace(/^(image|photo|pic)\b/i, '').trim()

  if (cleaned.length >= 3 && !/^\d+$/.test(cleaned)) {
    const words = cleaned
      .split(' ')
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())

    return words.slice(0, 3).join(' ')
  }

  return category === 'wedding' ? 'Wedding Moment' : 'Studio Portrait'
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
  const seenBaseNames = new Set<string>()

  for (const { folderName, category } of FOLDERS) {
    const primaryDir = path.join(cwd, 'public', 'assets', 'images', 'gallery', folderName)
    const fallbackDir = path.join(cwd, 'public', 'gallery', folderName)
    const pubDir = fs.existsSync(primaryDir) ? primaryDir : fallbackDir
    const basePrefix = fs.existsSync(primaryDir)
      ? `/assets/images/gallery/${folderName}`
      : `/gallery/${folderName}`

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

        // Normalize base name to guarantee each image is included at most once
        const baseNorm = dirent.name
          .toLowerCase()
          .replace(/\.(jpeg|jpg|png|webp|avif)(\.jpeg|\.jpg)?$/i, '')
          .replace(/[-_]+/g, '')
        if (seenBaseNames.has(baseNorm)) continue
        seenBaseNames.add(baseNorm)

        const filePath = path.join(pubDir, dirent.name)
        let mtimeMs = 0
        try {
          const stats = fs.statSync(filePath)
          mtimeMs = Math.max(stats.mtimeMs || 0, stats.birthtimeMs || 0)
        } catch {
          mtimeMs = 0
        }

        // URL encoded path for web
        const webSrc = `${basePrefix}/${encodeURIComponent(dirent.name)}`
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

  const primaryHeroDir = path.join(cwd, 'public', 'assets', 'images', 'hero')
  const fallbackHeroDir = path.join(cwd, 'public', 'gallery', 'hero')
  const heroPubDir = fs.existsSync(primaryHeroDir) ? primaryHeroDir : fallbackHeroDir
  const heroPrefix = fs.existsSync(primaryHeroDir) ? '/assets/images/hero' : '/gallery/hero'

  if (!fs.existsSync(heroPubDir)) {
    return [
      {
        src: '/assets/images/hero/hero.jpeg',
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

      const webSrc = `${heroPrefix}/${encodeURIComponent(dirent.name)}`
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
        src: '/assets/images/hero/hero.jpeg',
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
