// Shared site content for Wedding Moment Nepal

export const SITE = {
  brand: "Wedding Moment Nepal",
  shortBrand: "WeddingMoment",
  tagline: "Capture Your Precious Moments",
  heroSubtitle:
    "Professional photography studio specializing in wedding and indoor portrait photography. We transform moments into timeless memories.",
  phone: "+977 9856010315",
  email: "weddingmomentpkr@gmail.com",
  address: "Rainpauwa, Pokhara, Nepal",
  locationLabel: "Rainpauwa, Pokhara, Nepal",
  mapLinkUrl: "https://maps.app.goo.gl/KomtAVoNHAvwJJUG8",
  mapEmbedUrl:
    "https://maps.google.com/maps?q=Wedding+Moment%2C+Lamachour%2C+Pokhara&t=m&z=16&ie=UTF8&iwloc=&output=embed",
  since: "2015",
  footerNote:
    "Professional photography studio specializing in capturing life's most precious moments since 2015 in Nepal.",
  copyright:
    "Capture Studios Nepal. All rights reserved to the developer of this website any reproduction or duplication of this website will lead to legal action.",
} as const

export type ServiceKey = "portrait" | "wedding"

export interface ServiceInfo {
  key: ServiceKey
  title: string
  description: string
  priceFrom: number
  priceLabel: string
  icon?: string
  image?: string
}

export interface IndoorPackage {
  id: string
  name: string
  duration?: string
  includes: string[]
  priceType: 'Advance Price' | 'Fixed Rate' | 'Price'
  amount: number
  priceLabel: string
}

export interface IndoorSubService {
  id: string
  key: string
  title: string
  image: string
  badge?: string
  description?: string
  packages: IndoorPackage[]
}

export const INDOOR_SUB_SERVICES: IndoorSubService[] = [
  {
    id: 'couple',
    key: 'indoor-couple',
    title: 'Couple Portrait / Pre-Wedding',
    image: '/gallery/couplepotrait.jpeg',
    badge: '2 Packages',
    description: 'Intimate studio sessions capturing the connection and authentic romance between partners.',
    packages: [
      {
        id: 'p1',
        name: 'Package 1',
        duration: '1 hour',
        includes: [
          '20 edited photos',
          '1 cinematic reel',
          'Couple photo with photo frame / gallery (8x12)',
        ],
        priceType: 'Advance Price',
        amount: 5000,
        priceLabel: 'NPR 5,000',
      },
      {
        id: 'p2',
        name: 'Package 2',
        duration: '3 hours • Dress change included',
        includes: [
          '2 dress changes',
          '40+ creative guided poses',
          '3 cinematic reels',
          '10 couple photo prints (4x6)',
          '1 couple frame (12x18)',
          'Professional makeup included',
        ],
        priceType: 'Advance Price',
        amount: 7000,
        priceLabel: 'NPR 7,000',
      },
    ],
  },
  {
    id: 'family',
    key: 'indoor-family',
    title: 'Family Photoshoot',
    image: '/gallery/family1.jpg',
    badge: 'Single Package',
    description: 'Timeless studio portraits celebrating family milestones, togetherness, and warmth.',
    packages: [
      {
        id: 'p1',
        name: 'Standard Package',
        duration: '1 hour',
        includes: [
          '20 edited photos',
          '1 cinematic reel',
          'Couple / family photo with photo frame / gallery (8x12)',
        ],
        priceType: 'Advance Price',
        amount: 5000,
        priceLabel: 'NPR 5,000',
      },
    ],
  },
  {
    id: 'graduation',
    key: 'indoor-graduation',
    title: 'Graduation Photoshoot',
    image: '/gallery/graduation1.jpg',
    badge: 'Fixed Rate',
    description: 'Celebrate your academic milestone with university gowns, family portraits, and frame.',
    packages: [
      {
        id: 'p1',
        name: 'Complete Session',
        duration: 'Studio session',
        includes: [
          'Family included in the shoot',
          'Cinematic reels included',
          '30+ photos with different poses',
          '12x18 luxury photo frame',
          'Dress available for universities (PU, TU, KU)',
        ],
        priceType: 'Fixed Rate',
        amount: 6500,
        priceLabel: 'NPR 6,500',
      },
    ],
  },
  {
    id: 'maternity',
    key: 'indoor-maternity',
    title: 'Maternity Photoshoot',
    image: '/gallery/maternity1.jpg',
    badge: '2 Packages',
    description: 'Gentle, ethereal indoor maternity portraiture honoring motherhood and new beginnings.',
    packages: [
      {
        id: 'p1',
        name: 'Package 1',
        duration: 'Full experience with wardrobe & makeup',
        includes: [
          'Single photoshoot with different dress options (3 dresses available)',
          'Professional makeup artist',
          'Couple shoot included with partner',
          '3+ cinematic reels',
          '30+ edited high-resolution photos',
        ],
        priceType: 'Price',
        amount: 15000,
        priceLabel: 'NPR 15,000',
      },
      {
        id: 'p2',
        name: 'Package 2',
        duration: 'Photoshoot essential',
        includes: [
          'Photoshoot only',
          'One dress provided',
          'No makeup (natural / self-prepared)',
        ],
        priceType: 'Price',
        amount: 10000,
        priceLabel: 'NPR 10,000',
      },
    ],
  },
]

export type WeddingMainCategoryKey = 'bride' | 'combo' | 'groom'

export interface WeddingCategoryConfig {
  id: WeddingMainCategoryKey
  title: string
  subtitle: string
  badge?: string
  price: number
  priceLabel: string
  image: string
  subCategories: string[]
  allIncludedPackageKey: string
  allIncludedDescription: string
  allIncludedEvents: string[]
  deliverables: string[]
}

export const WEDDING_CATEGORIES: Record<WeddingMainCategoryKey, WeddingCategoryConfig> = {
  bride: {
    id: 'bride',
    title: 'Bride Side',
    subtitle: 'Heartfelt emotional ceremonies and bridal rituals captured with delicate artistry',
    badge: 'Ceremonial Coverage',
    price: 35000,
    priceLabel: 'NPR 35,000',
    image: '/gallery/weddings/DSC03954_bride_portrait.jpg',
    subCategories: [
      'Bride to Be',
      'Engagement',
      'Mehendi',
      'Marriage',
      'All Included',
    ],
    allIncludedPackageKey: 'wedding-bride-all',
    allIncludedDescription:
      'Complete all-inclusive coverage for the bride side — including intimate Bride to Be moments, Engagement, Mehendi rituals, and full traditional Marriage celebrations.',
    allIncludedEvents: [
      'Bride to Be Shoot',
      'Engagement Ceremony',
      'Mehendi Rituals & Portraits',
      'Marriage Day Ceremonies',
    ],
    deliverables: [
      'Dual photographer coverage (Candid & Traditional)',
      'Cinematic social media teaser reel delivered within 72 hours',
      '500+ color-graded high-resolution master photographs',
      'Complete private cloud gallery for family & relatives',
      'Custom framed portrait (12x18)',
      '1-year secure cloud backup of high-res files',
    ],
  },
  combo: {
    id: 'combo',
    title: 'Combo',
    subtitle: 'Complete two-family synchronized wedding documentation from pre-events to post-shoot',
    badge: 'Most Popular Choice',
    price: 50000,
    priceLabel: 'NPR 50,000',
    image: '/gallery/wedding-photography.jpg',
    subCategories: [
      'Bride to Be',
      'Engagement',
      'Mehendi',
      'Marriage',
      'Reception',
      'Post Shoot',
      'All Included',
    ],
    allIncludedPackageKey: 'wedding-combo-all',
    allIncludedDescription:
      'Our signature grand coverage package uniting both bride and groom celebrations seamlessly — from pre-wedding preparations all the way through marriage, grand reception party, and couple post-shoot.',
    allIncludedEvents: [
      'Bride to Be Shoot',
      'Engagement Ceremony',
      'Mehendi & Sangeet Celebrations',
      'Marriage Day Complete Rituals',
      'Grand Reception Party',
      'Romantic Couple Post-Shoot',
    ],
    deliverables: [
      'Triple crew coverage (Lead candid photographer, traditional photographer, and reel maker)',
      'Drone aerial videography / photography for venue & grand processions',
      '3 cinematic highlight reels for Instagram / TikTok within 72 hours',
      '800+ color-graded master photographs in full resolution',
      'Handcrafted luxury wedding photo album / photobook preview',
      '2 framed heirloom portraits (12x18) for both families',
      'Complete archive delivery via USB keepsake & cloud portal',
    ],
  },
  groom: {
    id: 'groom',
    title: 'Groom Side',
    subtitle: 'High-energy baraat processions, sacred vows, and elegant reception celebrations',
    badge: 'Baraat & Reception',
    price: 40000,
    priceLabel: 'NPR 40,000',
    image: '/gallery/weddings/D93A9617_groom_portrait.jpg',
    subCategories: [
      'Engagement',
      'Marriage',
      'Reception',
      'Post Shoot',
      'All Included',
    ],
    allIncludedPackageKey: 'wedding-groom-all',
    allIncludedDescription:
      'Tailored comprehensive coverage for the groom side — featuring formal Engagement, Marriage day rituals and baraat procession, grand Reception evening, and dedicated Couple Post-Shoot.',
    allIncludedEvents: [
      'Engagement Ceremony',
      'Marriage Day & Baraat Procession',
      'Grand Reception Evening',
      'Couple Post-Shoot',
    ],
    deliverables: [
      'Dual senior photographer team (Candid & Traditional rituals)',
      'High-energy Baraat procession and ritual documentation',
      '2 cinematic highlight reels within 72 hours',
      '600+ color-graded high-resolution photographs',
      'Custom framed family portrait (12x18)',
      'Private digital gallery with high-speed download access',
    ],
  },
}

export const SERVICES: ServiceInfo[] = [
  {
    key: "portrait",
    title: "Indoor Photography",
    description:
      "Studio photography featuring 4 dedicated sessions: Couple Portrait & Pre-Wedding, Family, Graduation, and Maternity photoshoots.",
    priceFrom: 5000,
    priceLabel: "रु 5,000+",
    icon: "camera",
    image: "/gallery/indoor/IMG_7952.JPG",
  },
  {
    key: "wedding",
    title: "Wedding Photography",
    description:
      "Comprehensive ceremonial coverage featuring Bride Side, Groom Side, and Complete Combo wedding packages.",
    priceFrom: 35000,
    priceLabel: "रु 35,000+",
    icon: "heart",
    image: "/gallery/wedding-photography.jpg",
  },
]

export type GalleryCategory = "portrait" | "wedding"

export interface SubCategoryOption {
  key: string
  label: string
  badge?: string
}

export const INDOOR_SUBCATEGORIES: SubCategoryOption[] = [
  { key: 'all', label: 'All' },
  { key: 'couplepre-wedding', label: 'Couple / Pre-Wedding' },
  { key: 'family', label: 'Family Photoshoot' },
  { key: 'graduation', label: 'Graduation Photoshoot' },
  { key: 'maternity', label: 'Maternity Photoshoot' },
]

export const WEDDING_SUBCATEGORIES: SubCategoryOption[] = [
  { key: 'all-included', label: 'All Included', badge: 'Full Package' },
  { key: 'bridetobe', label: 'Bride to Be' },
  { key: 'engagement', label: 'Engagement' },
  { key: 'mehendi', label: 'Mehendi' },
  { key: 'marriage', label: 'Marriage' },
  { key: 'reception', label: 'Reception' },
  { key: 'postshoot', label: 'Post Shoot' },
]

export const GALLERY_SUBCATEGORY_LABELS: Record<string, string> = {
  'couplepre-wedding': 'Couple / Pre-Wedding',
  family: 'Family Photoshoot',
  graduation: 'Graduation Photoshoot',
  maternity: 'Maternity Photoshoot',
  'all-included': 'All Included',
  bridetobe: 'Bride to Be',
  engagement: 'Engagement',
  mehendi: 'Mehendi',
  marriage: 'Marriage',
  reception: 'Reception',
  postshoot: 'Post Shoot',
}

export const GALLERY_CATEGORY_LABELS: Record<string, string> = {
  wedding: "Wedding Photo Shoots",
  portrait: "Indoor Photo Shoots",
}

export interface GalleryItem {
  id?: string
  src: string
  title: string
  category: GalleryCategory
  subcategory?: string | null
  description?: string | null
  order?: number
}

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    src: "/gallery/weddings/reception.jpg",
    title: "Grand Reception Celebration",
    category: "wedding",
    description: "Glamorous evening wedding reception celebrating the newly-weds with family and guests.",
  },
  {
    src: "/gallery/weddings/postshoot.jpg",
    title: "Post-Wedding Couple Session",
    category: "wedding",
    description: "Scenic post-wedding outdoor couple portraits captured against breathtaking backdrops.",
  },
  {
    src: "/gallery/weddings/mehendi.jpeg",
    title: "Mehendi Rituals & Joy",
    category: "wedding",
    description: "Vibrant mehendi festivities filled with authentic laughter, intricate henna, and music.",
  },
  {
    src: "/gallery/weddings/engagement.jpg",
    title: "Sacred Engagement Ceremony",
    category: "wedding",
    description: "Heartfelt engagement ceremony documenting the sacred promises and joyful families.",
  },
  {
    src: "/gallery/weddings/bridetobe.jpeg",
    title: "Bride to Be Session",
    category: "wedding",
    description: "Timeless pre-wedding bridal session celebrating radiant anticipation and traditional elegance.",
  },
  {
    src: "/gallery/weddings/bridetobe1_original_wide.jpg",
    title: "Radiant Bride to Be",
    category: "wedding",
    description: "Timeless pre-wedding bridal session celebrating radiant anticipation and traditional elegance.",
  },
  {
    src: "/gallery/indoor/potrait.jpeg",
    title: "Fine Art Studio Portrait",
    category: "portrait",
    description: "Fine-art editorial studio portrait featuring dramatic rim-lighting and natural warmth.",
  },
  {
    src: "/gallery/indoor/IMG_7868.JPG.jpeg",
    title: "Indoor Studio Portrait #7868",
    category: "portrait",
    description: "Professional studio portraiture crafted with precision lighting and timeless framing.",
  },
  {
    src: "/gallery/indoor/IMG_7952.JPG.jpeg",
    title: "Indoor Studio Portrait #7952",
    category: "portrait",
    description: "Professional studio portraiture crafted with precision lighting and timeless framing.",
  },
  {
    src: "/gallery/indoor/IMG_6453.JPG.jpeg",
    title: "Indoor Studio Portrait #6453",
    category: "portrait",
    description: "Professional studio portraiture crafted with precision lighting and timeless framing.",
  },
  {
    src: "/gallery/indoor/IMG_6564.JPG.jpeg",
    title: "Indoor Studio Portrait #6564",
    category: "portrait",
    description: "Professional studio portraiture crafted with precision lighting and timeless framing.",
  },
  {
    src: "/gallery/indoor/IMG_2416.JPG.jpeg",
    title: "Indoor Studio Portrait #2416",
    category: "portrait",
    description: "Professional studio portraiture crafted with precision lighting and timeless framing.",
  },
  {
    src: "/gallery/indoor/IMG_4144.JPG.jpeg",
    title: "Indoor Studio Portrait #4144",
    category: "portrait",
    description: "Professional studio portraiture crafted with precision lighting and timeless framing.",
  },
  {
    src: "/gallery/indoor/DSC06372.jpg",
    title: "Indoor Studio Portrait #06372",
    category: "portrait",
    description: "Professional studio portraiture crafted with precision lighting and timeless framing.",
  },
  {
    src: "/gallery/indoor/couplepotrait.jpeg",
    title: "Couple Portrait & Pre-Wedding",
    category: "portrait",
    description: "Intimate studio couple portrait capturing romantic chemistry with cinematic lighting.",
  },
]

export interface NavLink {
  href: string
  label: string
}

export const NAV_LINKS: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/gallery", label: "Gallery" },
  { href: "/#booking", label: "Booking" },
  { href: "/#contact", label: "Contact" },
]

export const STUDIO_HOURS = [
  { day: "Sunday to Friday", time: "10:00 AM to 7:00 PM" },
  { day: "Saturday", time: "11:00 AM to 5:00 PM" },
  { day: "Emergency Sessions", time: "Available on request" },
  { day: "Nepali Public Holidays", time: "Closed" },
]

export const SOCIAL_LINKS = [
  { label: "Facebook", icon: "facebook", href: "https://www.facebook.com/share/19FMkBiqgK/" },
  { label: "Instagram", icon: "instagram", href: "https://www.instagram.com/weddingmoment_uncalmax1?igsi=MTVzcHZxb3B1enlteA==" },
  { label: "TikTok", icon: "tiktok", href: "https://www.tiktok.com/@uncalmax?_r=1&_t=ZS-99QPIkiKqzV" },
  { label: "WhatsApp", icon: "whatsapp", href: "https://wa.me/9779856010315?text=Hi%2C%20I%27m%20interested%20in%20booking%20a%20photography%20session%20with%20WeddingMoment." },
]
