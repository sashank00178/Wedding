// Shared site content for Wedding Moment Nepal

export const SITE = {
  brand: "Wedding Moment Nepal",
  shortBrand: "WeddingMoment",
  tagline: "Capture Your Precious Moments",
  heroSubtitle:
    "Professional photography studio specializing in portrait, wedding, commercial, and event photography. We transform moments into timeless memories.",
  phone: "+977 9856010315",
  email: "weddingmomentpkr@gmail.com",
  address: "Rainpauwa, Pokhara, Nepal",
  locationLabel: "Rainpauwa, Pokhara, Nepal",
  mapLinkUrl: "https://www.google.com/maps/search/?api=1&query=Rainpauwa%2C+Pokhara%2C+Nepal",
  mapEmbedUrl:
    "https://maps.google.com/maps?q=Rainpauwa%2C+Pokhara%2C+Nepal&t=m&z=15&ie=UTF8&iwloc=&output=embed",
  since: "2015",
  footerNote:
    "Professional photography studio specializing in capturing life's most precious moments since 2015 in Nepal.",
  copyright: "Capture Studios Nepal",
} as const

export type ServiceKey = "portrait" | "wedding" | "commercial" | "event"

export interface ServiceInfo {
  key: ServiceKey
  title: string
  description: string
  priceFrom: number
  priceLabel: string
  icon?: string
  image?: string
}

export const SERVICES: ServiceInfo[] = [
  {
    key: "portrait",
    title: "Portrait Photography",
    description:
      "Professional portrait sessions for individuals, families, and groups. Perfect for capturing special moments and milestones.",
    priceFrom: 2999,
    priceLabel: "रु 2,999+",
    icon: "camera",
    image: "/gallery/portrait1.jpg",
  },
  {
    key: "wedding",
    title: "Wedding Photography",
    description:
      "Capture every special moment of your big day with our experienced wedding photography team.",
    priceFrom: 14999,
    priceLabel: "रु 14,999+",
    icon: "heart",
    image: "/gallery/wedding1.jpg",
  },
  {
    key: "commercial",
    title: "Commercial Photography",
    description:
      "High-quality commercial photography for businesses, products, and marketing materials.",
    priceFrom: 4999,
    priceLabel: "रु 4,999+",
    icon: "briefcase",
    image: "/gallery/commercial1.jpg",
  },
  {
    key: "event",
    title: "Event Photography",
    description:
      "Professional coverage for corporate events, parties, and special occasions.",
    priceFrom: 6499,
    priceLabel: "रु 6,499+",
    icon: "video",
    image: "/gallery/event1.jpg",
  },
]

export type GalleryCategory = "portrait" | "wedding" | "commercial" | "event"

export interface GalleryItem {
  src: string
  title: string
  category: GalleryCategory
  description: string
}

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    src: "/gallery/wedding1.jpg",
    title: "Sacred Vows",
    category: "wedding",
    description: "A traditional Nepali wedding ceremony bathed in golden hour light, capturing love and tradition intertwined.",
  },
  {
    src: "/gallery/wedding2.jpg",
    title: "Petals & Dreams",
    category: "wedding",
    description: "A dreamy bridal portrait with flower petals and soft bokeh, bringing elegance to every frame.",
  },
  {
    src: "/gallery/portrait1.jpg",
    title: "Quiet Confidence",
    category: "portrait",
    description: "Editorial studio portrait with dramatic rim lighting, framing personality in shadow and light.",
  },
  {
    src: "/gallery/portrait2.jpg",
    title: "Family Moments",
    category: "portrait",
    description: "Candid family portrait at sunset, featuring genuine smiles and warm backlight on a golden afternoon.",
  },
  {
    src: "/gallery/commercial1.jpg",
    title: "Timeless Luxury",
    category: "commercial",
    description: "High-end product photography with marble textures and studio precision, crafted for brands.",
  },
  {
    src: "/gallery/commercial2.jpg",
    title: "Culinary Art",
    category: "commercial",
    description: "Magazine-quality food photography with gourmet plating, captured in warm and inviting tones.",
  },
  {
    src: "/gallery/event1.jpg",
    title: "Stage Energy",
    category: "event",
    description: "Live concert photography with dynamic lighting, capturing the raw energy of live performance.",
  },
  {
    src: "/gallery/event2.jpg",
    title: "Gala Evening",
    category: "event",
    description: "Elegant outdoor gala under string lights with sophisticated event coverage.",
  },
]

export interface NavLink {
  href: string
  label: string
}

export const NAV_LINKS: NavLink[] = [
  { href: "#home", label: "Home" },
  { href: "#services", label: "Services" },
  { href: "#gallery", label: "Gallery" },
  { href: "#booking", label: "Booking" },
  { href: "#contact", label: "Contact" },
]

export const STUDIO_HOURS = [
  { day: "Sunday to Friday", time: "10:00 AM to 7:00 PM" },
  { day: "Saturday", time: "11:00 AM to 5:00 PM" },
  { day: "Emergency Sessions", time: "Available on request" },
  { day: "Nepali Public Holidays", time: "Closed" },
]

export const SOCIAL_LINKS = [
  { label: "Facebook", icon: "facebook", href: "#" },
  { label: "Instagram", icon: "instagram", href: "#" },
  { label: "TikTok", icon: "tiktok", href: "#" },
  { label: "Viber", icon: "viber", href: "#" },
]
