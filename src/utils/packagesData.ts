export interface PackagePriceData {
  id?: string
  packageKey: string
  category: 'indoor' | 'wedding'
  subCategory: 'couple' | 'family' | 'graduation' | 'maternity' | 'bride' | 'combo' | 'groom'
  name: string
  description?: string | null
  priceType: 'advance' | 'fixed' | 'deposit'
  amount: number
  priceDisplay?: string | null
  isTbd?: boolean
  order: number
}

export const INITIAL_PACKAGES: PackagePriceData[] = [
  // ==========================================
  // INDOOR PHOTOGRAPHY
  // ==========================================
  // Couple / Pre-Wedding
  {
    packageKey: 'indoor-couple-p1',
    category: 'indoor',
    subCategory: 'couple',
    name: 'Package 1 (1 hour, 20 edited photos, 1 reel, framed print)',
    description: '1 hour studio session, 20 high-resolution edited photos, 1 viral cinematic reel, and complimentary framed table print.',
    priceType: 'advance',
    amount: 5000,
    priceDisplay: 'NPR 5,000 (Advance Price)',
    isTbd: false,
    order: 0,
  },
  {
    packageKey: 'indoor-couple-p2',
    category: 'indoor',
    subCategory: 'couple',
    name: 'Package 2 (3 hours, 2 dresses, makeup, 3 reels, 12x18 frame)',
    description: '3 hours extended studio session, 2 dress changes, professional makeup artist, 3 cinematic reels, and premium 12x18 wall frame.',
    priceType: 'advance',
    amount: 7000,
    priceDisplay: 'NPR 7,000 (Advance Price)',
    isTbd: false,
    order: 1,
  },
  // Family Photoshoot
  {
    packageKey: 'indoor-family',
    category: 'indoor',
    subCategory: 'family',
    name: 'Standard Package (1 hour, 20 edited photos, 1 reel, framed print)',
    description: 'Warm multigenerational family portraits, candid groupings, 20 edited portraits, 1 short family reel, and table frame.',
    priceType: 'advance',
    amount: 5000,
    priceDisplay: 'NPR 5,000 (Advance Price)',
    isTbd: false,
    order: 2,
  },
  // Graduation Photoshoot
  {
    packageKey: 'indoor-graduation',
    category: 'indoor',
    subCategory: 'graduation',
    name: 'Complete Session (University gowns, family shoot, 30+ photos, frame)',
    description: 'Convocation robes & cap shoot, individual graduate portraits, family celebration shots, 30+ edited photos, and keepsake frame.',
    priceType: 'fixed',
    amount: 6500,
    priceDisplay: 'NPR 6,500 (Fixed Rate)',
    isTbd: false,
    order: 3,
  },
  // Maternity Photoshoot
  {
    packageKey: 'indoor-maternity-p1',
    category: 'indoor',
    subCategory: 'maternity',
    name: 'Package 1 (3 dresses, makeup artist, partner shoot, 3+ reels)',
    description: 'Ethereal maternity styling, 3 wardrobe transitions, professional makeup & hair, partner inclusion, and 3 cinematic reels.',
    priceType: 'fixed',
    amount: 15000,
    priceDisplay: 'NPR 15,000',
    isTbd: false,
    order: 4,
  },
  {
    packageKey: 'indoor-maternity-p2',
    category: 'indoor',
    subCategory: 'maternity',
    name: 'Package 2 (Photoshoot only, 1 dress, natural / no makeup)',
    description: 'Intimate studio photoshoot, 1 wardrobe look, natural editorial lighting, partner portraits, and 15 edited photos.',
    priceType: 'fixed',
    amount: 10000,
    priceDisplay: 'NPR 10,000',
    isTbd: false,
    order: 5,
  },

  // ==========================================
  // WEDDING PHOTOGRAPHY: BRIDE SIDE
  // ==========================================
  {
    packageKey: 'wedding-bride-to-be',
    category: 'wedding',
    subCategory: 'bride',
    name: 'Bride to Be',
    description: '3–4 hours dedicated studio/location portraits, reels & bridal gallery documentation.',
    priceType: 'advance',
    amount: 25000,
    priceDisplay: 'NPR 25,000',
    isTbd: false,
    order: 10,
  },
  {
    packageKey: 'wedding-engagement-bride',
    category: 'wedding',
    subCategory: 'bride',
    name: 'Engagement',
    description: 'Bride side ring ceremony coverage, family documentation & cinematic reels.',
    priceType: 'advance',
    amount: 35000,
    priceDisplay: 'NPR 35,000',
    isTbd: false,
    order: 11,
  },
  {
    packageKey: 'wedding-mehendi-bride',
    category: 'wedding',
    subCategory: 'bride',
    name: 'Mehendi',
    description: 'Henna ceremony, vibrant musical evening & candid bridal portraits.',
    priceType: 'deposit',
    amount: 5000,
    priceDisplay: 'Price TBD (Deposit NPR 5,000)',
    isTbd: true,
    order: 12,
  },
  {
    packageKey: 'wedding-marriage-bride',
    category: 'wedding',
    subCategory: 'bride',
    name: 'Marriage',
    description: 'Sacred wedding rituals, emotional moments & family bridal portraits.',
    priceType: 'deposit',
    amount: 5000,
    priceDisplay: 'Price TBD (Deposit NPR 5,000)',
    isTbd: true,
    order: 13,
  },
  {
    packageKey: 'wedding-bride-all',
    category: 'wedding',
    subCategory: 'bride',
    name: 'All Included',
    description: 'Complete bride side package: Bride to Be, Engagement, Mehendi & Marriage rituals.',
    priceType: 'fixed',
    amount: 35000,
    priceDisplay: 'NPR 35,000 (Full Package)',
    isTbd: false,
    order: 14,
  },

  // ==========================================
  // WEDDING PHOTOGRAPHY: COMBO (BOTH SIDES)
  // ==========================================
  {
    packageKey: 'wedding-bride-to-be-combo',
    category: 'wedding',
    subCategory: 'combo',
    name: 'Bride to Be',
    description: 'Dedicated pre-wedding portraits & cinematic reels for both bride and groom.',
    priceType: 'advance',
    amount: 25000,
    priceDisplay: 'NPR 25,000',
    isTbd: false,
    order: 20,
  },
  {
    packageKey: 'wedding-engagement-combo',
    category: 'wedding',
    subCategory: 'combo',
    name: 'Engagement',
    description: 'Full joint engagement ceremony coverage (2 Photo + 2 Video crew).',
    priceType: 'advance',
    amount: 50000,
    priceDisplay: 'NPR 50,000',
    isTbd: false,
    order: 21,
  },
  {
    packageKey: 'wedding-mehendi-combo',
    category: 'wedding',
    subCategory: 'combo',
    name: 'Mehendi',
    description: 'Mehendi & Sangeet celebrations with joint families & friends.',
    priceType: 'deposit',
    amount: 5000,
    priceDisplay: 'Price TBD (Deposit NPR 5,000)',
    isTbd: true,
    order: 22,
  },
  {
    packageKey: 'wedding-marriage-combo',
    category: 'wedding',
    subCategory: 'combo',
    name: 'Marriage',
    description: 'Comprehensive marriage day coverage for both bride & groom families.',
    priceType: 'deposit',
    amount: 5000,
    priceDisplay: 'Price TBD (Deposit NPR 5,000)',
    isTbd: true,
    order: 23,
  },
  {
    packageKey: 'wedding-reception-combo',
    category: 'wedding',
    subCategory: 'combo',
    name: 'Reception',
    description: 'Grand reception evening documentation with party highlights & portraits.',
    priceType: 'deposit',
    amount: 5000,
    priceDisplay: 'Price TBD (Deposit NPR 5,000)',
    isTbd: true,
    order: 24,
  },
  {
    packageKey: 'wedding-post-shoot-combo',
    category: 'wedding',
    subCategory: 'combo',
    name: 'Post Shoot',
    description: 'Romantic couple post-wedding session in scenic outdoor destination.',
    priceType: 'deposit',
    amount: 5000,
    priceDisplay: 'Price TBD (Deposit NPR 5,000)',
    isTbd: true,
    order: 25,
  },
  {
    packageKey: 'wedding-combo-all',
    category: 'wedding',
    subCategory: 'combo',
    name: 'All Included',
    description: 'Grand combo: pre-wedding to reception & post-shoot with full crew & drone.',
    priceType: 'fixed',
    amount: 50000,
    priceDisplay: 'NPR 50,000 (Full Package)',
    isTbd: false,
    order: 26,
  },

  // ==========================================
  // WEDDING PHOTOGRAPHY: GROOM SIDE
  // ==========================================
  {
    packageKey: 'wedding-engagement-groom',
    category: 'wedding',
    subCategory: 'groom',
    name: 'Engagement',
    description: 'Groom side engagement ceremony, formal portraits & reels.',
    priceType: 'advance',
    amount: 40000,
    priceDisplay: 'NPR 40,000',
    isTbd: false,
    order: 30,
  },
  {
    packageKey: 'wedding-marriage-groom',
    category: 'wedding',
    subCategory: 'groom',
    name: 'Marriage',
    description: 'Baraat procession, marriage rituals & groom side celebrations.',
    priceType: 'deposit',
    amount: 5000,
    priceDisplay: 'Price TBD (Deposit NPR 5,000)',
    isTbd: true,
    order: 31,
  },
  {
    packageKey: 'wedding-reception-groom',
    category: 'wedding',
    subCategory: 'groom',
    name: 'Reception',
    description: 'Groom family reception celebration, stage photography & guest coverage.',
    priceType: 'deposit',
    amount: 5000,
    priceDisplay: 'Price TBD (Deposit NPR 5,000)',
    isTbd: true,
    order: 32,
  },
  {
    packageKey: 'wedding-post-shoot-groom',
    category: 'wedding',
    subCategory: 'groom',
    name: 'Post Shoot',
    description: 'Artistic post-wedding portrait session for the newlyweds.',
    priceType: 'deposit',
    amount: 5000,
    priceDisplay: 'Price TBD (Deposit NPR 5,000)',
    isTbd: true,
    order: 33,
  },
  {
    packageKey: 'wedding-groom-all',
    category: 'wedding',
    subCategory: 'groom',
    name: 'All Included',
    description: 'Complete groom package: Engagement, Baraat, Marriage, Reception & Post Shoot.',
    priceType: 'fixed',
    amount: 40000,
    priceDisplay: 'NPR 40,000 (Full Package)',
    isTbd: false,
    order: 34,
  },
]

/**
 * Helper to compute clean display label from priceType and amount
 */
export function formatPackagePriceDisplay(
  amount: number,
  priceType: 'advance' | 'fixed' | 'deposit',
  name: string,
  isTbd = false
): string {
  const formatted = `NPR ${amount.toLocaleString()}`

  if (isTbd) {
    return `Price TBD (Deposit ${formatted})`
  }

  if (priceType === 'advance') {
    return `${formatted} (Advance Price)`
  }

  if (priceType === 'fixed') {
    if (name.toLowerCase().includes('all included')) {
      return `${formatted} (Full Package)`
    }
    return `${formatted} (Fixed Rate)`
  }

  return formatted
}
