'use client'

import * as React from 'react'
import { Section, SectionTitle } from '@/components/site/section'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import {
  Loader2,
  CalendarCheck,
  CreditCard,
  CheckCircle2,
  Camera,
  Sparkles,
  Layers,
} from 'lucide-react'
import { SERVICES, SITE, type ServiceInfo } from '@/lib/site'
import { cn } from '@/lib/utils'

type TabMode = 'booking' | 'advance'
type Gateway = 'esewa' | 'khalti'

export type MainCategory = 'indoor' | 'wedding'
export type WeddingSide = 'bride' | 'groom' | 'combo'
export type IndoorCategory = 'couple' | 'family' | 'graduation' | 'maternity'

export interface BookingPackageOption {
  key: string
  group: string
  label: string
  amount: number
  priceLabel: string
}

export interface WeddingSubCategoryItem {
  name: string
  packageKey: string
  priceDisplay: string
  advanceAmount: number
  isTbd?: boolean
  description?: string
}

export interface IndoorTierItem {
  id: string
  name: string
  packageKey: string
  priceDisplay: string
  advanceAmount: number
}

export interface IndoorCategoryItem {
  id: IndoorCategory
  name: string
  priceDisplay: string
  tiers: IndoorTierItem[]
}

// Side Options for Wedding Photography (Level 2)
export const WEDDING_SIDE_OPTIONS = [
  {
    id: 'bride' as const,
    name: 'Bride Side',
    subtitle: '5 Event Options • From NPR 25,000',
    description: 'Bridal rituals, Mehendi, Bride to Be, and Marriage ceremonies',
  },
  {
    id: 'groom' as const,
    name: 'Groom Side',
    subtitle: '5 Event Options • From NPR 40,000',
    description: 'Baraat procession, sacred rituals, Reception, and Post Shoot',
  },
  {
    id: 'combo' as const,
    name: 'Combo (Both Sides)',
    subtitle: '7 Event Options • Complete Coverage',
    description: 'Full synchronized two-family documentation from start to finish',
  },
]

// Distinct Level 3 Sub-categories per Wedding Side
export const WEDDING_SUBCATEGORIES_BY_SIDE: Record<WeddingSide, WeddingSubCategoryItem[]> = {
  bride: [
    {
      name: 'Bride to Be',
      packageKey: 'wedding-bride-to-be',
      priceDisplay: 'NPR 25,000',
      advanceAmount: 25000,
      description: '3–4 hours dedicated studio/location portraits, reels & gallery',
    },
    {
      name: 'Engagement',
      packageKey: 'wedding-engagement-bride',
      priceDisplay: 'NPR 35,000',
      advanceAmount: 35000,
      description: 'Bride side ring ceremony, family documentation & reels',
    },
    {
      name: 'Mehendi',
      packageKey: 'wedding-mehendi',
      priceDisplay: 'Price TBD (Deposit NPR 5,000)',
      advanceAmount: 5000,
      isTbd: true,
      description: 'Henna ceremony, musical evening & candid portraits',
    },
    {
      name: 'Marriage',
      packageKey: 'wedding-marriage-bride',
      priceDisplay: 'Price TBD (Deposit NPR 5,000)',
      advanceAmount: 5000,
      isTbd: true,
      description: 'Sacred wedding rituals, emotional moments & family portraits',
    },
    {
      name: 'All Included',
      packageKey: 'wedding-bride-all',
      priceDisplay: 'NPR 35,000 (Full Package)',
      advanceAmount: 35000,
      description: 'Complete bride side package: Bride to Be, Engagement, Mehendi & Marriage',
    },
  ],
  combo: [
    {
      name: 'Bride to Be',
      packageKey: 'wedding-bride-to-be',
      priceDisplay: 'NPR 25,000',
      advanceAmount: 25000,
      description: 'Dedicated pre-wedding portraits & cinematic reels',
    },
    {
      name: 'Engagement',
      packageKey: 'wedding-engagement-combo',
      priceDisplay: 'NPR 50,000',
      advanceAmount: 50000,
      description: 'Full joint engagement ceremony coverage (2 Photo + 2 Video crew)',
    },
    {
      name: 'Mehendi',
      packageKey: 'wedding-mehendi',
      priceDisplay: 'Price TBD (Deposit NPR 5,000)',
      advanceAmount: 5000,
      isTbd: true,
      description: 'Mehendi & Sangeet celebrations with family & friends',
    },
    {
      name: 'Marriage',
      packageKey: 'wedding-marriage-combo',
      priceDisplay: 'Price TBD (Deposit NPR 5,000)',
      advanceAmount: 5000,
      isTbd: true,
      description: 'Comprehensive marriage day coverage for both bride & groom families',
    },
    {
      name: 'Reception',
      packageKey: 'wedding-reception-combo',
      priceDisplay: 'Price TBD (Deposit NPR 5,000)',
      advanceAmount: 5000,
      isTbd: true,
      description: 'Grand reception evening documentation with party highlights & portraits',
    },
    {
      name: 'Post Shoot',
      packageKey: 'wedding-post-shoot-combo',
      priceDisplay: 'Price TBD (Deposit NPR 5,000)',
      advanceAmount: 5000,
      isTbd: true,
      description: 'Romantic couple post-wedding session in scenic outdoor destination',
    },
    {
      name: 'All Included',
      packageKey: 'wedding-combo-all',
      priceDisplay: 'NPR 50,000 (Full Package)',
      advanceAmount: 50000,
      description: 'Grand combo: pre-wedding to reception & post-shoot with full crew & drone',
    },
  ],
  groom: [
    {
      name: 'Engagement',
      packageKey: 'wedding-engagement-groom',
      priceDisplay: 'NPR 40,000',
      advanceAmount: 40000,
      description: 'Groom side engagement ceremony, formal portraits & reels',
    },
    {
      name: 'Marriage',
      packageKey: 'wedding-marriage-groom',
      priceDisplay: 'Price TBD (Deposit NPR 5,000)',
      advanceAmount: 5000,
      isTbd: true,
      description: 'Baraat procession, marriage rituals & groom side celebrations',
    },
    {
      name: 'Reception',
      packageKey: 'wedding-reception-groom',
      priceDisplay: 'Price TBD (Deposit NPR 5,000)',
      advanceAmount: 5000,
      isTbd: true,
      description: 'Groom family reception celebration, stage photography & guest coverage',
    },
    {
      name: 'Post Shoot',
      packageKey: 'wedding-post-shoot-groom',
      priceDisplay: 'Price TBD (Deposit NPR 5,000)',
      advanceAmount: 5000,
      isTbd: true,
      description: 'Artistic post-wedding portrait session for the newlyweds',
    },
    {
      name: 'All Included',
      packageKey: 'wedding-groom-all',
      priceDisplay: 'NPR 40,000 (Full Package)',
      advanceAmount: 40000,
      description: 'Complete groom package: Engagement, Baraat, Marriage, Reception & Post Shoot',
    },
  ],
}

// Level 2 Sub-categories for Indoor Photography
export const INDOOR_CATEGORY_OPTIONS: IndoorCategoryItem[] = [
  {
    id: 'couple',
    name: 'Couple / Pre-Wedding',
    priceDisplay: 'From NPR 5,000',
    tiers: [
      {
        id: 'p1',
        name: 'Package 1 (1 hour, 20 edited photos, 1 reel, framed print)',
        packageKey: 'indoor-couple-p1',
        priceDisplay: 'NPR 5,000 (Advance Price)',
        advanceAmount: 5000,
      },
      {
        id: 'p2',
        name: 'Package 2 (3 hours, 2 dresses, makeup, 3 reels, 12x18 frame)',
        packageKey: 'indoor-couple-p2',
        priceDisplay: 'NPR 7,000 (Advance Price)',
        advanceAmount: 7000,
      },
    ],
  },
  {
    id: 'family',
    name: 'Family Photoshoot',
    priceDisplay: 'NPR 5,000',
    tiers: [
      {
        id: 'p1',
        name: 'Standard Package (1 hour, 20 edited photos, 1 reel, framed print)',
        packageKey: 'indoor-family',
        priceDisplay: 'NPR 5,000 (Advance Price)',
        advanceAmount: 5000,
      },
    ],
  },
  {
    id: 'graduation',
    name: 'Graduation Photoshoot',
    priceDisplay: 'NPR 6,500',
    tiers: [
      {
        id: 'p1',
        name: 'Complete Session (University gowns, family shoot, 30+ photos, frame)',
        packageKey: 'indoor-graduation',
        priceDisplay: 'NPR 6,500 (Fixed Rate)',
        advanceAmount: 6500,
      },
    ],
  },
  {
    id: 'maternity',
    name: 'Maternity Photoshoot',
    priceDisplay: 'From NPR 10,000',
    tiers: [
      {
        id: 'p1',
        name: 'Package 1 (3 dresses, makeup artist, partner shoot, 3+ reels)',
        packageKey: 'indoor-maternity-p1',
        priceDisplay: 'NPR 15,000',
        advanceAmount: 15000,
      },
      {
        id: 'p2',
        name: 'Package 2 (Photoshoot only, 1 dress, natural / no makeup)',
        packageKey: 'indoor-maternity-p2',
        priceDisplay: 'NPR 10,000',
        advanceAmount: 10000,
      },
    ],
  },
]

// Legacy options maintained for backward compatibility
export const ADVANCE_PACKAGE_OPTIONS: BookingPackageOption[] = [
  {
    key: 'indoor-couple-p1',
    group: 'Indoor Photography',
    label: 'Couple Portrait / Pre-Wedding (Package 1: 1h, 20 photos, 1 reel, frame)',
    amount: 5000,
    priceLabel: 'NPR 5,000 (Advance)',
  },
  {
    key: 'indoor-couple-p2',
    group: 'Indoor Photography',
    label: 'Couple Portrait / Pre-Wedding (Package 2: 3h, 2 dresses, makeup, 3 reels)',
    amount: 7000,
    priceLabel: 'NPR 7,000 (Advance)',
  },
  {
    key: 'indoor-family',
    group: 'Indoor Photography',
    label: 'Family Photoshoot (1h, 20 edited photos, 1 reel, framed print)',
    amount: 5000,
    priceLabel: 'NPR 5,000 (Advance)',
  },
  {
    key: 'indoor-graduation',
    group: 'Indoor Photography',
    label: 'Graduation Photoshoot (Family included, reels, 30+ photos, gowns, frame)',
    amount: 6500,
    priceLabel: 'NPR 6,500 (Fixed Rate)',
  },
  {
    key: 'indoor-maternity-p1',
    group: 'Indoor Photography',
    label: 'Maternity Photoshoot (Package 1: 3 dresses, makeup, couple shoot, 3+ reels)',
    amount: 15000,
    priceLabel: 'NPR 15,000',
  },
  {
    key: 'indoor-maternity-p2',
    group: 'Indoor Photography',
    label: 'Maternity Photoshoot (Package 2: Photoshoot only, 1 dress, no makeup)',
    amount: 10000,
    priceLabel: 'NPR 10,000',
  },
  {
    key: 'wedding-bride-to-be',
    group: 'Wedding Photography',
    label: 'Bride to Be Shoot (Duration: 3–4 hours, portraits, reels, digital gallery)',
    amount: 25000,
    priceLabel: 'NPR 25,000 (Advance Price)',
  },
  {
    key: 'wedding-mehendi',
    group: 'Wedding Photography',
    label: 'Mehendi Photography & Videography (Duration: TBD • Price: TBD)',
    amount: 5000,
    priceLabel: 'Price TBD (Deposit Available)',
  },
  {
    key: 'wedding-engagement-bride',
    group: 'Wedding Photography',
    label: 'Engagement Photography (Bride Side: 1 Photo, 1 Video • NPR 35,000)',
    amount: 35000,
    priceLabel: 'NPR 35,000 (Advance Price)',
  },
  {
    key: 'wedding-engagement-groom',
    group: 'Wedding Photography',
    label: 'Engagement Photography (Groom Side: 1 Photo, 1 Video • NPR 40,000)',
    amount: 40000,
    priceLabel: 'NPR 40,000 (Advance Price)',
  },
  {
    key: 'wedding-engagement-combo',
    group: 'Wedding Photography',
    label: 'Engagement Photography (Combo Both Sides: 2 Photo, 2 Video • NPR 50,000)',
    amount: 50000,
    priceLabel: 'NPR 50,000 (Advance Price)',
  },
  {
    key: 'wedding-marriage-bride',
    group: 'Wedding Photography',
    label: 'Marriage Day Coverage (Bride Side • Duration: TBD • Price: TBD)',
    amount: 5000,
    priceLabel: 'Price TBD (Deposit Available)',
  },
  {
    key: 'wedding-marriage-groom',
    group: 'Wedding Photography',
    label: 'Marriage Day Coverage (Groom Side • Duration: TBD • Price: TBD)',
    amount: 5000,
    priceLabel: 'Price TBD (Deposit Available)',
  },
  {
    key: 'wedding-marriage-combo',
    group: 'Wedding Photography',
    label: 'Marriage Day Coverage (Combo Both Sides • Duration: TBD • Price: TBD)',
    amount: 5000,
    priceLabel: 'Price TBD (Deposit Available)',
  },
  {
    key: 'wedding-reception-combo',
    group: 'Wedding Photography',
    label: 'Wedding Reception Coverage (Combo Both Sides • Duration: TBD • Price: TBD)',
    amount: 5000,
    priceLabel: 'Price TBD (Deposit Available)',
  },
  {
    key: 'wedding-reception-groom',
    group: 'Wedding Photography',
    label: 'Wedding Reception Coverage (Groom Side • Duration: TBD • Price: TBD)',
    amount: 5000,
    priceLabel: 'Price TBD (Deposit Available)',
  },
  {
    key: 'wedding-post-shoot-combo',
    group: 'Wedding Photography',
    label: 'Post Wedding Shoot (Combo Both Sides • Duration: TBD • Price: TBD)',
    amount: 5000,
    priceLabel: 'Price TBD (Deposit Available)',
  },
  {
    key: 'wedding-post-shoot-groom',
    group: 'Wedding Photography',
    label: 'Post Wedding Shoot (Groom Side • Duration: TBD • Price: TBD)',
    amount: 5000,
    priceLabel: 'Price TBD (Deposit Available)',
  },
  {
    key: 'wedding-bride-all',
    group: 'Wedding Photography',
    label: 'Bride Side (All Included: Bride to Be, Engagement, Mehendi, Marriage)',
    amount: 35000,
    priceLabel: 'NPR 35,000 (All Included)',
  },
  {
    key: 'wedding-combo-all',
    group: 'Wedding Photography',
    label: 'Combo Package (All Included: Full Bride & Groom Coverage)',
    amount: 50000,
    priceLabel: 'NPR 50,000 (All Included)',
  },
  {
    key: 'wedding-groom-all',
    group: 'Wedding Photography',
    label: 'Groom Side (All Included: Engagement, Marriage, Reception, Post Shoot)',
    amount: 40000,
    priceLabel: 'NPR 40,000 (All Included)',
  },
]

/**
 * Intelligent helper to parse incoming package keys from service links or URL queries
 * and map them directly into our 3-level selection state.
 */
export function parseServiceSelection(pkgKey: string): {
  mainCategory: MainCategory
  indoorCategory?: IndoorCategory
  indoorTier?: string
  weddingSide?: WeddingSide
  weddingEvent?: string
} | null {
  if (!pkgKey) return null
  const k = pkgKey.trim().toLowerCase()

  // 1. Indoor Photography matching
  if (
    k.startsWith('indoor') ||
    k.includes('portrait') ||
    k.includes('couple') ||
    k.includes('family') ||
    k.includes('graduation') ||
    k.includes('maternity')
  ) {
    let indoorCat: IndoorCategory = 'couple'
    let tier = 'p1'

    if (k.includes('couple')) {
      indoorCat = 'couple'
      tier = k.includes('p2') ? 'p2' : 'p1'
    } else if (k.includes('family')) {
      indoorCat = 'family'
      tier = 'p1'
    } else if (k.includes('graduation')) {
      indoorCat = 'graduation'
      tier = 'p1'
    } else if (k.includes('maternity')) {
      indoorCat = 'maternity'
      tier = k.includes('p2') ? 'p2' : 'p1'
    }

    return {
      mainCategory: 'indoor',
      indoorCategory: indoorCat,
      indoorTier: tier,
    }
  }

  // 2. Wedding Photography matching
  if (
    k.startsWith('wedding') ||
    k.includes('bride') ||
    k.includes('groom') ||
    k.includes('combo')
  ) {
    let side: WeddingSide = 'combo'
    if (k.includes('bride') && !k.includes('combo')) {
      side = 'bride'
    } else if (k.includes('groom')) {
      side = 'groom'
    } else {
      side = 'combo'
    }

    // Determine event
    let eventName = 'All Included'
    if (k.includes('bride-to-be') || k.includes('bride to be')) {
      eventName = 'Bride to Be'
    } else if (k.includes('mehendi')) {
      eventName = 'Mehendi'
    } else if (k.includes('engagement')) {
      eventName = 'Engagement'
    } else if (k.includes('reception')) {
      eventName = 'Reception'
    } else if (k.includes('post-shoot') || k.includes('post shoot')) {
      eventName = 'Post Shoot'
    } else if (k.includes('marriage')) {
      eventName = 'Marriage'
    } else if (k.includes('all')) {
      eventName = 'All Included'
    }

    // If selected side does not have that event, adapt side sensibly
    const validEvents = WEDDING_SUBCATEGORIES_BY_SIDE[side].map((e) => e.name)
    if (!validEvents.includes(eventName)) {
      if (eventName === 'Bride to Be' || eventName === 'Mehendi') {
        side = 'bride'
      } else if (eventName === 'Reception' || eventName === 'Post Shoot') {
        side = 'combo'
      }
    }

    return {
      mainCategory: 'wedding',
      weddingSide: side,
      weddingEvent: eventName,
    }
  }

  return null
}

export function Booking() {
  const [activeTab, setActiveTab] = React.useState<TabMode>('booking')
  const [servicesList, setServicesList] = React.useState<ServiceInfo[]>(SERVICES)

  // Multi-level category selection states
  const [mainCategory, setMainCategory] = React.useState<MainCategory | ''>('')
  const [indoorCategory, setIndoorCategory] = React.useState<IndoorCategory | ''>('')
  const [indoorTier, setIndoorTier] = React.useState<string>('p1')
  const [weddingSide, setWeddingSide] = React.useState<WeddingSide | ''>('')
  const [weddingEvent, setWeddingEvent] = React.useState<string>('')

  // Booking form state
  const [bookingSubmitting, setBookingSubmitting] = React.useState(false)
  const [bookingForm, setBookingForm] = React.useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    date: '',
    message: '',
  })

  // Payment form state
  const [gateway, setGateway] = React.useState<Gateway>('esewa')
  const [paymentSubmitting, setPaymentSubmitting] = React.useState(false)
  const [paymentSuccess, setPaymentSuccess] = React.useState<null | {
    gateway: Gateway
    amount: number
    ref: string
  }>(null)
  const [paymentForm, setPaymentForm] = React.useState({
    name: '',
    phone: '',
    packageKey: 'wedding-combo-all',
  })

  // Compute live selection details, validation state, and pricing
  const currentSelectionDetails = React.useMemo(() => {
    if (mainCategory === 'indoor' && indoorCategory) {
      const cat = INDOOR_CATEGORY_OPTIONS.find((c) => c.id === indoorCategory)
      if (!cat) return null
      const tier = cat.tiers.find((t) => t.id === indoorTier) || cat.tiers[0]
      const tierSuffix =
        cat.tiers.length > 1
          ? ` (${tier.name.split(' (')[0]})`
          : ''
      const fullServiceLabel = `Indoor Photography — ${cat.name}${tierSuffix}`

      return {
        title: `Indoor Photography: ${cat.name}`,
        subtitle: tier.name,
        fullServiceLabel,
        packageKey: tier.packageKey,
        priceDisplay: tier.priceDisplay,
        advanceAmount: tier.advanceAmount,
        isTbd: false,
        isValid: true,
      }
    }

    if (mainCategory === 'wedding' && weddingSide && weddingEvent) {
      const sideObj = WEDDING_SIDE_OPTIONS.find((s) => s.id === weddingSide)
      const list = WEDDING_SUBCATEGORIES_BY_SIDE[weddingSide] || []
      const evt = list.find((e) => e.name === weddingEvent)
      if (!evt) return null
      const fullServiceLabel = `Wedding Photography — ${sideObj?.name || weddingSide} — ${evt.name}`

      return {
        title: `Wedding Photography: ${sideObj?.name || weddingSide}`,
        subtitle: `Selected Event: ${evt.name}${evt.description ? ` (${evt.description})` : ''}`,
        fullServiceLabel,
        packageKey: evt.packageKey,
        priceDisplay: evt.priceDisplay,
        advanceAmount: evt.advanceAmount,
        isTbd: Boolean(evt.isTbd),
        isValid: true,
      }
    }

    return null
  }, [mainCategory, indoorCategory, indoorTier, weddingSide, weddingEvent])

  // Synchronize selection changes with form state
  React.useEffect(() => {
    if (currentSelectionDetails?.isValid) {
      setBookingForm((prev) => ({
        ...prev,
        service: currentSelectionDetails.fullServiceLabel,
      }))
      setPaymentForm((prev) => ({
        ...prev,
        packageKey: currentSelectionDetails.packageKey,
      }))
    }
  }, [currentSelectionDetails])

  // Helper to apply incoming package keys smoothly
  const applyPackageKey = React.useCallback((pkgKey: string) => {
    if (!pkgKey) return
    const parsed = parseServiceSelection(pkgKey)
    if (parsed) {
      setMainCategory(parsed.mainCategory)
      if (parsed.mainCategory === 'indoor') {
        if (parsed.indoorCategory) setIndoorCategory(parsed.indoorCategory)
        if (parsed.indoorTier) setIndoorTier(parsed.indoorTier)
        setWeddingSide('')
        setWeddingEvent('')
      } else if (parsed.mainCategory === 'wedding') {
        if (parsed.weddingSide) setWeddingSide(parsed.weddingSide)
        if (parsed.weddingEvent) setWeddingEvent(parsed.weddingEvent)
        setIndoorCategory('')
      }
    }
  }, [])

  // Load dynamic services if available
  React.useEffect(() => {
    fetch('/api/site-data')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.services?.length) {
          setServicesList(data.services)
        }
      })
      .catch(() => {})
  }, [])

  // Sync URL parameters, hash, and custom navigation events
  React.useEffect(() => {
    const syncFromUrl = () => {
      if (typeof window === 'undefined') return
      const urlParams = new URLSearchParams(window.location.search)
      const tabParam = urlParams.get('tab')
      const hash = window.location.hash
      const pkgParam = urlParams.get('package') || urlParams.get('service')

      if (pkgParam) {
        applyPackageKey(pkgParam)
      } else {
        // Default to Wedding Photography -> Combo -> All Included if nothing pre-filled
        setMainCategory((prev) => prev || 'wedding')
        setWeddingSide((prev) => prev || 'combo')
        setWeddingEvent((prev) => prev || 'All Included')
      }

      if (
        tabParam === 'advance' ||
        hash === '#advance-booking' ||
        hash === '#payment' ||
        hash === '#advance'
      ) {
        handleTabChange('advance', false)
      } else if (tabParam === 'booking' || hash === '#booking') {
        handleTabChange('booking', false)
      }
    }

    const handleExternalSwitch = (e: Event) => {
      const customEvent = e as CustomEvent<TabMode>
      if (customEvent.detail) {
        handleTabChange(customEvent.detail, false)
      }
    }

    const handlePackageSelection = (e: Event) => {
      const customEvent = e as CustomEvent<{
        packageKey: string
        amount?: number
        packageName?: string
        tab?: TabMode
      }>
      if (customEvent.detail?.packageKey) {
        applyPackageKey(customEvent.detail.packageKey)
        handleTabChange(customEvent.detail.tab || 'advance', false)
      }
    }

    syncFromUrl()
    window.addEventListener('hashchange', syncFromUrl)
    window.addEventListener('booking-tab-change', handleExternalSwitch)
    window.addEventListener('booking-select-package', handlePackageSelection)
    return () => {
      window.removeEventListener('hashchange', syncFromUrl)
      window.removeEventListener('booking-tab-change', handleExternalSwitch)
      window.removeEventListener('booking-select-package', handlePackageSelection)
    }
  }, [applyPackageKey])

  // Sync Name and Phone between forms if empty to save user effort
  const handleTabChange = (tab: TabMode, broadcast = true) => {
    if (tab === 'advance') {
      setPaymentForm((prev) => ({
        ...prev,
        name: prev.name || bookingForm.name,
        phone: prev.phone || bookingForm.phone,
        packageKey: currentSelectionDetails?.packageKey || prev.packageKey,
      }))
    } else if (tab === 'booking') {
      setBookingForm((prev) => ({
        ...prev,
        name: prev.name || paymentForm.name,
        phone: prev.phone || paymentForm.phone,
        service: currentSelectionDetails?.fullServiceLabel || prev.service,
      }))
    }
    setActiveTab(tab)

    if (broadcast && typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('booking-tab-change', { detail: tab })
      )
      const targetHash = tab === 'advance' ? '#advance-booking' : '#booking'
      history.replaceState(null, '', targetHash)
    }
  }

  const updateBooking = (k: keyof typeof bookingForm, v: string) =>
    setBookingForm((prev) => ({ ...prev, [k]: v }))

  const updatePayment = (k: keyof typeof paymentForm, v: string) =>
    setPaymentForm((prev) => ({ ...prev, [k]: v }))

  // Current package selected for payment
  const selectedPkg = React.useMemo(() => {
    if (currentSelectionDetails?.isValid) {
      return {
        key: currentSelectionDetails.packageKey,
        label: currentSelectionDetails.fullServiceLabel,
        amount: currentSelectionDetails.advanceAmount,
        priceDisplay: currentSelectionDetails.priceDisplay,
        isTbd: currentSelectionDetails.isTbd,
      }
    }

    const matchedOption = ADVANCE_PACKAGE_OPTIONS.find((p) => p.key === paymentForm.packageKey)
    if (matchedOption) {
      return {
        key: matchedOption.key,
        label: matchedOption.label,
        amount: matchedOption.amount,
        priceDisplay: matchedOption.priceLabel,
        isTbd: false,
      }
    }

    return {
      key: 'wedding-combo-all',
      label: 'Wedding Photography — Combo (Both Sides) — All Included',
      amount: 50000,
      priceDisplay: 'NPR 50,000',
      isTbd: false,
    }
  }, [currentSelectionDetails, paymentForm.packageKey])

  // Submit standard booking
  const onBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!bookingForm.name || !bookingForm.email || !bookingForm.phone || !bookingForm.date) {
      toast.error('Please fill in all required customer details.')
      return
    }

    if (!mainCategory) {
      toast.error('Please select a Main Category (Indoor or Wedding Photography).')
      return
    }

    if (mainCategory === 'indoor' && !indoorCategory) {
      toast.error('Please select an Indoor Photoshoot session type.')
      return
    }

    if (mainCategory === 'wedding' && (!weddingSide || !weddingEvent)) {
      toast.error('Please select both a Wedding Side and the specific ceremonial event.')
      return
    }

    setBookingSubmitting(true)
    try {
      const resp = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...bookingForm,
          service: currentSelectionDetails?.fullServiceLabel || bookingForm.service,
        }),
      })
      const data = await resp.json()
      if (resp.ok && data.success) {
        toast.success('Booking received!', {
          description:
            "Thank you! We'll contact you within 24 hours to confirm your session.",
        })
        setBookingForm({
          name: '',
          email: '',
          phone: '',
          service: currentSelectionDetails?.fullServiceLabel || '',
          date: '',
          message: '',
        })
      } else {
        toast.error(data.message || 'Failed to submit booking.')
      }
    } catch (err) {
      console.error(err)
      toast.error('Network error. Please try again.')
    } finally {
      setBookingSubmitting(false)
    }
  }

  // Submit advance payment
  const onPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!paymentForm.name || !paymentForm.phone) {
      toast.error('Please enter your name and phone number.')
      return
    }

    if (!currentSelectionDetails?.isValid) {
      toast.error('Please complete your service selection before proceeding with payment.')
      return
    }

    setPaymentSubmitting(true)
    try {
      const resp = await fetch(`/api/payment/${gateway}/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: selectedPkg.amount,
          packageName: selectedPkg.label,
          customerName: paymentForm.name,
          customerPhone: paymentForm.phone,
        }),
      })
      const data = await resp.json()

      if (!resp.ok || !data.success) {
        toast.error(data.message || 'Failed to initiate payment.')
        setPaymentSubmitting(false)
        return
      }

      // DEMO MODE — no real gateway redirect
      if (data.demo) {
        await new Promise((r) => setTimeout(r, 600))
        setPaymentSuccess({
          gateway,
          amount: Number(data.amount),
          ref: data.transactionUuid || data.pidx,
        })
        toast.success('Payment successful (demo mode)', {
          description: `NPR ${Number(data.amount).toLocaleString()} • ${gateway.toUpperCase()} • ${data.transactionUuid || data.pidx}`,
        })
      } else if (data.payment_url) {
        window.location.href = data.payment_url
      }
    } catch (err) {
      console.error(err)
      toast.error('Payment gateway error. Please try again or contact studio directly.')
    } finally {
      setPaymentSubmitting(false)
    }
  }

  return (
    <Section id="booking" className="py-12 md:py-16 bg-background">
      <div className="container mx-auto px-4 max-w-6xl">
        <SectionTitle
          title="Book Your Session"
          subtitle="Reserve your date with Wedding Moment Nepal — Pokhara's premier photography team."
          align="center"
        />

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Studio Info */}
          <div className="lg:col-span-4 space-y-5">
            <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm">
              <h3 className="font-serif text-lg font-bold mb-3 text-foreground">
                How It Works
              </h3>
              <ol className="space-y-3.5 text-xs text-muted-foreground leading-relaxed">
                <li className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-gold/15 text-gold font-bold text-[10px]">
                    1
                  </span>
                  <span>
                    <strong className="text-foreground">Choose Service &amp; Event:</strong> Pick between Indoor or Wedding coverage, side, and exact ceremony.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-gold/15 text-gold font-bold text-[10px]">
                    2
                  </span>
                  <span>
                    <strong className="text-foreground">Booking or Advance:</strong> Submit a date inquiry, or pay an advance deposit to immediately lock your slot.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-gold/15 text-gold font-bold text-[10px]">
                    3
                  </span>
                  <span>
                    <strong className="text-foreground">Consultation &amp; Shoot:</strong> We review your vision, confirm lighting, outfits, and location timeline.
                  </span>
                </li>
              </ol>
            </div>

            <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm space-y-3">
              <h3 className="font-serif text-base font-bold text-foreground">
                Direct Contact
              </h3>
              <div className="text-xs space-y-1.5 text-muted-foreground">
                <p>
                  <span className="font-medium text-foreground">Phone:</span>{' '}
                  <a href={`tel:${SITE.phone}`} className="text-gold hover:underline">
                    {SITE.phone}
                  </a>
                </p>
                <p>
                  <span className="font-medium text-foreground">Email:</span>{' '}
                  {SITE.email}
                </p>
                <p>
                  <span className="font-medium text-foreground">Studio:</span>{' '}
                  {SITE.address}
                </p>
              </div>
              <div className="pt-2 text-[11px] text-muted-foreground border-t border-border">
                Advance payments secured via <span className="font-semibold text-foreground">eSewa</span> &amp; <span className="font-semibold text-foreground">Khalti</span>
              </div>
            </div>
          </div>

          {/* Right: Unified Tabbed Card */}
          <div className="lg:col-span-8 bg-card border border-border/80 rounded-2xl p-6 sm:p-7 shadow-sm flex flex-col justify-between">
            {/* Top Tab Navigation */}
            <div>
              <div className="flex border-b border-border mb-5">
                <button
                  type="button"
                  onClick={() => handleTabChange('booking')}
                  className={cn(
                    'relative pb-2.5 px-3 sm:px-4 text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-2',
                    activeTab === 'booking'
                      ? 'text-gold'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <CalendarCheck className="h-4 w-4" />
                  <span>Booking Request</span>
                  {activeTab === 'booking' && (
                    <span className="absolute -bottom-px left-0 right-0 h-[2px] bg-gold rounded-full transition-all" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleTabChange('advance')}
                  className={cn(
                    'relative pb-2.5 px-3 sm:px-4 text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-2',
                    activeTab === 'advance'
                      ? 'text-gold'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <CreditCard className="h-4 w-4" />
                  <span>Advance Payment</span>
                  {activeTab === 'advance' && (
                    <span className="absolute -bottom-px left-0 right-0 h-[2px] bg-gold rounded-full transition-all" />
                  )}
                </button>
              </div>

              {/* Tab 1: Standard Booking Form */}
              {activeTab === 'booking' && (
                <form
                  onSubmit={onBookingSubmit}
                  className="space-y-4 animate-in fade-in-50 duration-200"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <Label htmlFor="booking-name" className="text-xs font-medium text-foreground/80">
                        Full Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="booking-name"
                        value={bookingForm.name}
                        onChange={(e) => updateBooking('name', e.target.value)}
                        required
                        placeholder="Your full name"
                        className="h-9 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="booking-email" className="text-xs font-medium text-foreground/80">
                        Email Address <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="booking-email"
                        type="email"
                        value={bookingForm.email}
                        onChange={(e) => updateBooking('email', e.target.value)}
                        required
                        placeholder="you@example.com"
                        className="h-9 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="booking-phone" className="text-xs font-medium text-foreground/80">
                        Phone Number <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="booking-phone"
                        type="tel"
                        value={bookingForm.phone}
                        onChange={(e) => updateBooking('phone', e.target.value)}
                        required
                        placeholder="+977 98XXXXXXXX"
                        className="h-9 text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="booking-date" className="text-xs font-medium text-foreground/80">
                        Preferred Date <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="booking-date"
                        type="date"
                        value={bookingForm.date}
                        onChange={(e) => updateBooking('date', e.target.value)}
                        required
                        className="h-9 text-xs"
                      />
                    </div>

                    {/* Progressive Multi-Level Category Selection System */}
                    <div className="sm:col-span-2">
                      <MultiLevelCategorySelector
                        idPrefix="booking"
                        mode="booking"
                        mainCategory={mainCategory}
                        setMainCategory={(val) => {
                          setMainCategory(val)
                          if (val === 'indoor') {
                            setIndoorCategory('couple')
                            setIndoorTier('p1')
                            setWeddingSide('')
                            setWeddingEvent('')
                          } else {
                            setWeddingSide('combo')
                            setWeddingEvent('All Included')
                            setIndoorCategory('')
                          }
                        }}
                        indoorCategory={indoorCategory}
                        setIndoorCategory={setIndoorCategory}
                        indoorTier={indoorTier}
                        setIndoorTier={setIndoorTier}
                        weddingSide={weddingSide}
                        setWeddingSide={(side) => {
                          setWeddingSide(side)
                          const list = WEDDING_SUBCATEGORIES_BY_SIDE[side] || []
                          if (!list.some((e) => e.name === weddingEvent)) {
                            setWeddingEvent(list[0]?.name || 'All Included')
                          }
                        }}
                        weddingEvent={weddingEvent}
                        setWeddingEvent={setWeddingEvent}
                        selectionDetails={currentSelectionDetails}
                      />
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <Label htmlFor="booking-message" className="text-xs font-medium text-foreground/80">
                        Additional Details &amp; Notes
                      </Label>
                      <Textarea
                        id="booking-message"
                        rows={3}
                        value={bookingForm.message}
                        onChange={(e) => updateBooking('message', e.target.value)}
                        placeholder="Tell us about ceremony locations, special preferences, or schedule..."
                        className="text-xs resize-none"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={bookingSubmitting}
                    className="w-full bg-gold text-black hover:bg-gold/90 font-semibold h-10 px-6 text-xs uppercase tracking-wider transition-transform active:scale-95 shadow-sm"
                  >
                    {bookingSubmitting ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> Submitting...
                      </>
                    ) : (
                      'Send Booking Inquiry'
                    )}
                  </Button>
                </form>
              )}

              {/* Tab 2: Advance Booking (Payment) */}
              {activeTab === 'advance' && (
                <div className="animate-in fade-in-50 duration-200">
                  {paymentSuccess ? (
                    <SuccessCard
                      gateway={paymentSuccess.gateway}
                      amount={paymentSuccess.amount}
                      refId={paymentSuccess.ref}
                      onReset={() => setPaymentSuccess(null)}
                    />
                  ) : (
                    <form onSubmit={onPaymentSubmit} className="space-y-4">
                      {/* Wallet Gateway Selector */}
                      <div className="grid grid-cols-2 gap-2.5 p-1.5 bg-secondary/60 border border-border rounded-xl">
                        <GatewayTab
                          active={gateway === 'esewa'}
                          onClick={() => setGateway('esewa')}
                          color="#60bb46"
                          label="eSewa Wallet"
                        />
                        <GatewayTab
                          active={gateway === 'khalti'}
                          onClick={() => setGateway('khalti')}
                          color="#5c2d91"
                          label="Khalti Wallet"
                        />
                      </div>

                      {/* Contact Fields */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div className="space-y-1">
                          <Label htmlFor="pay-name" className="text-xs font-medium text-foreground/80">
                            Full Name <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="pay-name"
                            value={paymentForm.name}
                            onChange={(e) => updatePayment('name', e.target.value)}
                            required
                            placeholder="Your full name"
                            className="h-9 text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="pay-phone" className="text-xs font-medium text-foreground/80">
                            Mobile Number <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="pay-phone"
                            type="tel"
                            value={paymentForm.phone}
                            onChange={(e) => updatePayment('phone', e.target.value)}
                            required
                            placeholder="+977 98XXXXXXXX"
                            className="h-9 text-xs"
                          />
                        </div>
                      </div>

                      {/* Progressive Multi-Level Category Selection System */}
                      <MultiLevelCategorySelector
                        idPrefix="advance"
                        mode="advance"
                        mainCategory={mainCategory}
                        setMainCategory={(val) => {
                          setMainCategory(val)
                          if (val === 'indoor') {
                            setIndoorCategory('couple')
                            setIndoorTier('p1')
                            setWeddingSide('')
                            setWeddingEvent('')
                          } else {
                            setWeddingSide('combo')
                            setWeddingEvent('All Included')
                            setIndoorCategory('')
                          }
                        }}
                        indoorCategory={indoorCategory}
                        setIndoorCategory={setIndoorCategory}
                        indoorTier={indoorTier}
                        setIndoorTier={setIndoorTier}
                        weddingSide={weddingSide}
                        setWeddingSide={(side) => {
                          setWeddingSide(side)
                          const list = WEDDING_SUBCATEGORIES_BY_SIDE[side] || []
                          if (!list.some((e) => e.name === weddingEvent)) {
                            setWeddingEvent(list[0]?.name || 'All Included')
                          }
                        }}
                        weddingEvent={weddingEvent}
                        setWeddingEvent={setWeddingEvent}
                        selectionDetails={currentSelectionDetails}
                      />

                      {/* Advance Amount Display */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="pay-amount" className="text-xs font-medium text-foreground/80">
                            Advance Deposit Required (NPR)
                          </Label>
                          {selectedPkg.isTbd && (
                            <span className="text-[10px] text-amber-500 font-semibold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                              Deposit Only • Custom Quote TBD
                            </span>
                          )}
                        </div>
                        <Input
                          id="pay-amount"
                          value={`रु ${selectedPkg.amount.toLocaleString()}`}
                          readOnly
                          className="bg-secondary font-bold text-sm text-foreground h-9 border-border"
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={paymentSubmitting}
                        className={cn(
                          'w-full h-10 font-semibold text-white border-0 transition-all text-xs uppercase tracking-wider active:scale-95 shadow-sm',
                          gateway === 'esewa'
                            ? 'bg-[#60bb46] hover:bg-[#54a93d]'
                            : 'bg-[#5c2d91] hover:bg-[#4a2475]'
                        )}
                      >
                        {paymentSubmitting ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> Processing...
                          </>
                        ) : (
                          `Pay NPR ${selectedPkg.amount.toLocaleString()} with ${gateway === 'esewa' ? 'eSewa' : 'Khalti'}`
                        )}
                      </Button>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}

/**
 * Reusable Progressive Multi-Level Category Selection Component
 */
function MultiLevelCategorySelector({
  idPrefix,
  mode,
  mainCategory,
  setMainCategory,
  indoorCategory,
  setIndoorCategory,
  indoorTier,
  setIndoorTier,
  weddingSide,
  setWeddingSide,
  weddingEvent,
  setWeddingEvent,
  selectionDetails,
}: {
  idPrefix: string
  mode: 'booking' | 'advance'
  mainCategory: MainCategory | ''
  setMainCategory: (val: MainCategory) => void
  indoorCategory: IndoorCategory | ''
  setIndoorCategory: (val: IndoorCategory) => void
  indoorTier: string
  setIndoorTier: (val: string) => void
  weddingSide: WeddingSide | ''
  setWeddingSide: (val: WeddingSide) => void
  weddingEvent: string
  setWeddingEvent: (val: string) => void
  selectionDetails: {
    title: string
    subtitle: string
    fullServiceLabel: string
    packageKey: string
    priceDisplay: string
    advanceAmount: number
    isTbd: boolean
    isValid: boolean
  } | null
}) {
  const selectedIndoorOption = INDOOR_CATEGORY_OPTIONS.find((c) => c.id === indoorCategory)
  const weddingSubCategories = weddingSide
    ? WEDDING_SUBCATEGORIES_BY_SIDE[weddingSide] || []
    : []

  return (
    <div className="space-y-3 p-3.5 sm:p-4 rounded-xl bg-secondary/35 border border-border/80 transition-all">
      {/* Level 1: Main Category */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor={`${idPrefix}-main-cat`} className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <span className="flex items-center justify-center w-4 h-4 rounded-full bg-gold/20 text-gold text-[10px] font-bold">1</span>
            <span>Service Category</span>
            <span className="text-destructive">*</span>
          </Label>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
            Step 1 of {mainCategory === 'wedding' ? '3' : '2'}
          </span>
        </div>

        <Select
          value={mainCategory}
          onValueChange={(val) => setMainCategory(val as MainCategory)}
        >
          <SelectTrigger
            id={`${idPrefix}-main-cat`}
            className="w-full h-9 text-xs bg-background border-border hover:border-gold/50 focus:ring-1 focus:ring-gold/50 transition-colors"
          >
            <SelectValue placeholder="Select Main Category (Indoor / Wedding)..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="indoor" className="text-xs py-2">
              <div className="flex items-center justify-between w-full gap-4">
                <div className="flex items-center gap-2">
                  <Camera className="h-3.5 w-3.5 text-gold" />
                  <span className="font-semibold text-foreground">Indoor Photography</span>
                </div>
                <span className="text-[10px] text-muted-foreground">4 Studio Sessions</span>
              </div>
            </SelectItem>
            <SelectItem value="wedding" className="text-xs py-2">
              <div className="flex items-center justify-between w-full gap-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-gold" />
                  <span className="font-semibold text-foreground">Wedding Photography</span>
                </div>
                <span className="text-[10px] text-muted-foreground">Bride / Groom / Combo</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Level 2 (if Indoor Photography): 4 Sub-Categories */}
      {mainCategory === 'indoor' && (
        <div className="space-y-3 animate-in fade-in-50 slide-in-from-top-1 duration-200">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor={`${idPrefix}-indoor-cat`} className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <span className="flex items-center justify-center w-4 h-4 rounded-full bg-gold/20 text-gold text-[10px] font-bold">2</span>
                <span>Indoor Photoshoot Session</span>
                <span className="text-destructive">*</span>
              </Label>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                Step 2 of 2
              </span>
            </div>

            <Select
              value={indoorCategory}
              onValueChange={(val) => {
                setIndoorCategory(val as IndoorCategory)
                setIndoorTier('p1')
              }}
            >
              <SelectTrigger
                id={`${idPrefix}-indoor-cat`}
                className="w-full h-9 text-xs bg-background border-border hover:border-gold/50 focus:ring-1 focus:ring-gold/50 transition-colors"
              >
                <SelectValue placeholder="Select an indoor session type..." />
              </SelectTrigger>
              <SelectContent>
                {INDOOR_CATEGORY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.id} value={opt.id} className="text-xs py-2">
                    <div className="flex items-center justify-between w-full gap-4">
                      <span className="font-medium text-foreground">{opt.name}</span>
                      <span className="text-[11px] font-semibold text-gold">{opt.priceDisplay}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tier Options (for Couple and Maternity) */}
          {selectedIndoorOption && selectedIndoorOption.tiers.length > 1 && (
            <div className="space-y-1.5 animate-in fade-in-50 slide-in-from-top-1 duration-150 pt-1">
              <Label className="text-[11px] font-medium text-muted-foreground">
                Select Package Tier:
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedIndoorOption.tiers.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setIndoorTier(t.id)}
                    className={cn(
                      'text-left p-2.5 rounded-lg border text-xs transition-all flex flex-col justify-between',
                      indoorTier === t.id
                        ? 'border-gold bg-gold/10 text-foreground ring-1 ring-gold/40 shadow-sm'
                        : 'border-border bg-background/70 hover:bg-background text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <span className="font-semibold text-foreground text-xs">{t.name}</span>
                    <span className="text-[11px] text-gold font-bold mt-1">{t.priceDisplay}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Level 2 (if Wedding Photography): Choose Side */}
      {mainCategory === 'wedding' && (
        <div className="space-y-3 animate-in fade-in-50 slide-in-from-top-1 duration-200">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor={`${idPrefix}-wedding-side`} className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <span className="flex items-center justify-center w-4 h-4 rounded-full bg-gold/20 text-gold text-[10px] font-bold">2</span>
                <span>Choose Wedding Side</span>
                <span className="text-destructive">*</span>
              </Label>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                Step 2 of 3
              </span>
            </div>

            <Select
              value={weddingSide}
              onValueChange={(val) => setWeddingSide(val as WeddingSide)}
            >
              <SelectTrigger
                id={`${idPrefix}-wedding-side`}
                className="w-full h-9 text-xs bg-background border-border hover:border-gold/50 focus:ring-1 focus:ring-gold/50 transition-colors"
              >
                <SelectValue placeholder="Choose a Side (Bride Side / Groom Side / Combo)..." />
              </SelectTrigger>
              <SelectContent>
                {WEDDING_SIDE_OPTIONS.map((side) => (
                  <SelectItem key={side.id} value={side.id} className="text-xs py-2">
                    <div className="flex items-center justify-between w-full gap-4">
                      <span className="font-medium text-foreground">{side.name}</span>
                      <span className="text-[11px] font-semibold text-gold">{side.subtitle}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Level 3: Distinct Sub-Categories for chosen Side */}
          {weddingSide && (
            <div className="space-y-1.5 animate-in fade-in-50 slide-in-from-top-1 duration-200">
              <div className="flex items-center justify-between">
                <Label htmlFor={`${idPrefix}-wedding-event`} className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <span className="flex items-center justify-center w-4 h-4 rounded-full bg-gold/20 text-gold text-[10px] font-bold">3</span>
                  <span>
                    {weddingSide === 'bride'
                      ? 'Bride Side Event'
                      : weddingSide === 'groom'
                      ? 'Groom Side Event'
                      : 'Combo Event / Coverage'}
                  </span>
                  <span className="text-destructive">*</span>
                </Label>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                  Step 3 of 3 &bull; {weddingSubCategories.length} Options
                </span>
              </div>

              <Select
                value={weddingEvent}
                onValueChange={(val) => setWeddingEvent(val)}
              >
                <SelectTrigger
                  id={`${idPrefix}-wedding-event`}
                  className="w-full h-9 text-xs bg-background border-border hover:border-gold/50 focus:ring-1 focus:ring-gold/50 transition-colors"
                >
                  <SelectValue placeholder="Select specific ceremonial event..." />
                </SelectTrigger>
                <SelectContent>
                  {weddingSubCategories.map((evt) => (
                    <SelectItem key={evt.name} value={evt.name} className="text-xs py-2">
                      <div className="flex items-center justify-between w-full gap-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-foreground">{evt.name}</span>
                          {evt.name === 'All Included' && (
                            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-gold/20 text-gold border border-gold/30">
                              Full Package
                            </span>
                          )}
                        </div>
                        <span
                          className={cn(
                            'text-[11px] font-semibold',
                            evt.isTbd ? 'text-muted-foreground' : 'text-gold'
                          )}
                        >
                          {evt.priceDisplay}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      )}

      {/* Active Selection Price Badge */}
      {selectionDetails?.isValid && (
        <div className="mt-2.5 p-3 rounded-xl bg-gradient-to-r from-gold/15 via-gold/5 to-transparent border border-gold/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 animate-in fade-in duration-200">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gold">
              <Sparkles className="h-3 w-3" />
              <span>Selected Service</span>
            </div>
            <p className="text-xs font-semibold text-foreground truncate mt-0.5">
              {selectionDetails.title}
            </p>
            <p className="text-[11px] text-muted-foreground truncate">
              {selectionDetails.subtitle}
            </p>
          </div>
          <div className="sm:text-right shrink-0">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
              {mode === 'advance' ? 'Advance Deposit' : 'Service Price'}
            </span>
            <span
              className={cn(
                'text-xs sm:text-sm font-bold',
                selectionDetails.isTbd ? 'text-amber-500' : 'text-gold'
              )}
            >
              {mode === 'advance'
                ? `NPR ${selectionDetails.advanceAmount.toLocaleString()}`
                : selectionDetails.priceDisplay}
            </span>
            {selectionDetails.isTbd && (
              <span className="text-[10px] text-muted-foreground block">
                {mode === 'advance' ? 'Deposit to lock date (Quote TBD)' : 'Single Event &bull; Pricing TBD'}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function GatewayTab({
  active,
  onClick,
  color,
  label,
}: {
  active: boolean
  onClick: () => void
  color: string
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center justify-center py-3 rounded-lg border-2 font-semibold transition-all',
        active
          ? 'border-current bg-background shadow-sm'
          : 'border-border bg-background/50 text-muted-foreground hover:bg-background'
      )}
      style={active ? { color } : undefined}
    >
      <span className="text-xs sm:text-sm font-bold">{label}</span>
    </button>
  )
}

function SuccessCard({
  gateway,
  amount,
  refId,
  onReset,
}: {
  gateway: Gateway
  amount: number
  refId: string
  onReset: () => void
}) {
  return (
    <div className="text-center py-6 animate-in fade-in-50">
      <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20 text-green-500 mb-4 border border-green-500/30">
        <CheckCircle2 className="h-8 w-8" />
      </div>
      <h3 className="font-serif text-2xl font-bold mb-2 text-foreground">Payment Successful</h3>
      <p className="text-muted-foreground text-sm mb-6">
        Your advance booking payment has been received. We&apos;ll contact you shortly
        to finalize your session.
      </p>
      <div className="bg-secondary/60 border border-border rounded-lg p-4 mb-6 text-left text-sm space-y-2 max-w-sm mx-auto">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Gateway</span>
          <span className="font-semibold uppercase text-foreground">{gateway}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Amount</span>
          <span className="font-semibold text-gold">NPR {amount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-muted-foreground">Reference</span>
          <span className="font-mono text-xs break-all text-right text-foreground">{refId}</span>
        </div>
      </div>
      <Button
        onClick={onReset}
        variant="outline"
        className="border-gold text-gold hover:bg-gold/10 text-xs font-semibold"
      >
        Make Another Payment
      </Button>
    </div>
  )
}

function AdvanceBookingTooltip() {
  const [open, setOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  // Close on click outside (mobile tap & desktop click)
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener('pointerdown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('pointerdown', handleClickOutside)
    }
  }, [open])

  // Close on Escape key
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    if (open) {
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open])

  return (
    <div
      ref={containerRef}
      className="relative inline-flex items-center"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-label="Advance Booking Information"
        title="Advance Booking: Instant spot guarantee upon payment"
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation()
          setOpen((prev) => !prev)
        }}
        onFocus={() => setOpen(true)}
        onBlur={(e) => {
          if (
            containerRef.current &&
            !containerRef.current.contains(e.relatedTarget as Node)
          ) {
            setOpen(false)
          }
        }}
        className={cn(
          'inline-flex items-center justify-center h-4 w-4 sm:h-4.5 sm:w-4.5 rounded-full border text-[10px] sm:text-[11px] font-bold transition-all focus:outline-none focus:ring-2 focus:ring-gold/50 cursor-pointer select-none ml-0.5',
          open
            ? 'border-gold bg-gold text-black shadow-sm scale-105'
            : 'border-gold/50 bg-gold/10 text-gold hover:border-gold hover:bg-gold hover:text-black'
        )}
      >
        <span className="leading-none select-none font-bold">?</span>
      </button>

      {/* Tooltip Popover Overlay */}
      {open && (
        <div
          role="tooltip"
          className="absolute z-50 top-full mt-2.5 right-[-8px] sm:right-[-12px] w-72 sm:w-80 max-w-[calc(100vw-3rem)] p-4 rounded-xl bg-card/95 backdrop-blur-md border border-gold/40 shadow-2xl text-foreground text-xs leading-relaxed whitespace-normal break-words text-left animate-in fade-in-0 zoom-in-95 duration-150"
        >
          {/* Arrow pointing up at the icon */}
          <span className="absolute -top-1.5 right-3 sm:right-4 h-3 w-3 bg-card border-t border-l border-gold/40 rotate-45" />

          <div className="space-y-1">
            <p className="font-semibold text-gold text-xs whitespace-normal">
              Instant Slot Guarantee
            </p>
            <p className="text-muted-foreground text-[11px] sm:text-xs leading-relaxed whitespace-normal break-words">
              Advance Booking instantly reserves your spot for the selected date and time with no admin approval needed. Unlike a regular booking request, this guarantees your slot immediately upon payment, even if the date shows as limited or unavailable elsewhere.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
