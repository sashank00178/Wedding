import RawNepaliDate from 'nepali-date-converter'

// Handle ES module, CommonJS, and Next.js bundler default export variations cleanly
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const NepaliDate: any = (RawNepaliDate as any)?.default || RawNepaliDate

export interface BsDateObject {
  year: number
  month: number // 0-indexed: 0 = Baisakh, 11 = Chaitra
  date: number  // 1-indexed day of month
  day: number   // 0 = Sunday, 6 = Saturday
  monthNameEn: string
  monthNameNp: string
  dayNameEn: string
  dayNameNp: string
}

export const NEPALI_MONTHS_EN = [
  'Baisakh',
  'Jestha',
  'Ashadh',
  'Shrawan',
  'Bhadra',
  'Ashoj',
  'Kartik',
  'Mangsir',
  'Poush',
  'Magh',
  'Falgun',
  'Chaitra',
] as const

export const NEPALI_MONTHS_NP = [
  'बैशाख',
  'जेठ',
  'असार',
  'साउन',
  'भदौ',
  'असोज',
  'कात्तिक',
  'मंसिर',
  'पुस',
  'माघ',
  'फागुन',
  'चैत',
] as const

export const NEPALI_DAYS_EN = [
  { short: 'Sun', long: 'Sunday' },
  { short: 'Mon', long: 'Monday' },
  { short: 'Tue', long: 'Tuesday' },
  { short: 'Wed', long: 'Wednesday' },
  { short: 'Thu', long: 'Thursday' },
  { short: 'Fri', long: 'Friday' },
  { short: 'Sat', long: 'Saturday' },
] as const

export const NEPALI_DAYS_NP = [
  { short: 'आइत', long: 'आइतबार' },
  { short: 'सोम', long: 'सोमबार' },
  { short: 'मङ्गल', long: 'मङ्गलबार' },
  { short: 'बुध', long: 'बुधबार' },
  { short: 'बिही', long: 'बिहीबार' },
  { short: 'शुक्र', long: 'शुक्रबार' },
  { short: 'शनि', long: 'शनिबार' },
] as const

const DEVANAGARI_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९']

/**
 * Convert numbers/strings to Nepali (Devanagari) numerals.
 * Example: 2083 -> २०८३
 */
export function toDevanagariNumerals(value: number | string): string {
  return String(value).replace(/[0-9]/g, (digit) => DEVANAGARI_DIGITS[Number(digit)] || digit)
}

/**
 * Normalize an AD date input (Date object, ISO string, or 'YYYY-MM-DD' date string)
 * into a safe JavaScript Date without timezone shift.
 */
export function parseAdDate(input: Date | string | null | undefined): Date | null {
  if (!input) return null
  if (input instanceof Date) {
    return isNaN(input.getTime()) ? null : input
  }

  const str = String(input).trim()
  if (!str) return null

  // Handle YYYY-MM-DD string safely by setting noon to prevent midnight timezone bleed
  const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(str)
  if (dateOnlyMatch) {
    const [, y, m, d] = dateOnlyMatch
    const date = new Date(Number(y), Number(m) - 1, Number(d), 12, 0, 0)
    return isNaN(date.getTime()) ? null : date
  }

  const parsed = new Date(str)
  return isNaN(parsed.getTime()) ? null : parsed
}

/**
 * Convert an AD Date or date string to NepaliDate instance.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function adToBs(input: Date | string | null | undefined): any | null {
  const adDate = parseAdDate(input)
  if (!adDate) return null
  try {
    return new NepaliDate(adDate)
  } catch {
    return null
  }
}

/**
 * Convert Bikram Sambat components (year, month 0-indexed, day 1-indexed) to a JavaScript AD Date.
 */
export function bsToAd(year: number, monthIndex: number, day: number): Date {
  const bsDate = new NepaliDate(year, monthIndex, day)
  return bsDate.toJsDate()
}

/**
 * Convert Bikram Sambat components to an AD date string (YYYY-MM-DD).
 */
export function bsToAdDateString(year: number, monthIndex: number, day: number): string {
  const ad = bsToAd(year, monthIndex, day)
  const y = ad.getFullYear()
  const m = String(ad.getMonth() + 1).padStart(2, '0')
  const d = String(ad.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * Get total number of days in a given Bikram Sambat month (29 to 32 days).
 */
export function getDaysInBsMonth(year: number, monthIndex: number): number {
  try {
    const start = new NepaliDate(year, monthIndex, 1)
    const nextMonthYear = monthIndex === 11 ? year + 1 : year
    const nextMonthIndex = (monthIndex + 1) % 12
    const next = new NepaliDate(nextMonthYear, nextMonthIndex, 1)
    const diffMs = next.toJsDate().getTime() - start.toJsDate().getTime()
    return Math.round(diffMs / (1000 * 60 * 60 * 24))
  } catch {
    return 30
  }
}

/**
 * Extract structured BS details for a date.
 */
export function getBsDetails(input: Date | string | null | undefined): BsDateObject | null {
  const bs = adToBs(input)
  if (!bs) return null

  try {
    const year = bs.getYear()
    const month = bs.getMonth()
    const date = bs.getDate()
    const day = bs.getDay()

    return {
      year,
      month,
      date,
      day,
      monthNameEn: NEPALI_MONTHS_EN[month] || `Month ${month + 1}`,
      monthNameNp: NEPALI_MONTHS_NP[month] || `महिना ${month + 1}`,
      dayNameEn: NEPALI_DAYS_EN[day]?.long || '',
      dayNameNp: NEPALI_DAYS_NP[day]?.long || '',
    }
  } catch {
    return null
  }
}

export interface FormatBsDateOptions {
  devanagari?: boolean
  showAd?: boolean
  showDayOfWeek?: boolean
}

/**
 * Format an AD date as a Bikram Sambat date string.
 * Example: "2083 Bhadra 21" or "२०८३ भदौ २१"
 * With showAd: "2083 Bhadra 21 (Sep 6, 2026)"
 */
export function formatBsDate(
  input: Date | string | null | undefined,
  options: FormatBsDateOptions = {}
): string {
  if (!input) return '—'

  const details = getBsDetails(input)
  if (!details) {
    return typeof input === 'string' ? input : '—'
  }

  const { devanagari = false, showAd = false, showDayOfWeek = false } = options

  let formatted = ''
  if (devanagari) {
    const dayStr = showDayOfWeek ? `${details.dayNameNp}, ` : ''
    formatted = `${dayStr}${toDevanagariNumerals(details.year)} ${details.monthNameNp} ${toDevanagariNumerals(details.date)}`
  } else {
    const dayStr = showDayOfWeek ? `${details.dayNameEn}, ` : ''
    formatted = `${dayStr}${details.year} ${details.monthNameEn} ${details.date}`
  }

  if (showAd) {
    const adDate = parseAdDate(input)
    if (adDate) {
      const adShort = adDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
      formatted += ` (${adShort})`
    }
  }

  return formatted
}

export interface FormatBsDateTimeOptions {
  devanagari?: boolean
  showAd?: boolean
}

/**
 * Format a full timestamp (createdAt/updatedAt/verifiedAt) with Bikram Sambat date and local time.
 * Example: "2083 Bhadra 21 · 3:45 PM"
 */
export function formatBsDateTime(
  input: Date | string | null | undefined,
  options: FormatBsDateTimeOptions = {}
): string {
  if (!input) return '—'

  const adDate = parseAdDate(input)
  if (!adDate) {
    return typeof input === 'string' ? input : '—'
  }

  const bsFormatted = formatBsDate(adDate, { devanagari: options.devanagari })

  // Format time in 12-hour format with AM/PM
  const timeStr = adDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })

  let result = `${bsFormatted} · ${timeStr}`

  if (options.showAd) {
    const adFormatted = adDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
    result += ` (${adFormatted})`
  }

  return result
}

/**
 * Get the current year in Bikram Sambat.
 */
export function getCurrentBsYear(): number {
  try {
    const bs = new NepaliDate()
    return bs.getYear()
  } catch {
    return 2083
  }
}
