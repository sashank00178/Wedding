'use client'

import * as React from 'react'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, RotateCcw } from 'lucide-react'
import { cn } from '@/utils/common'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  adToBs,
  bsToAd,
  bsToAdDateString,
  formatBsDate,
  getBsDetails,
  getDaysInBsMonth,
  getCurrentBsYear,
  NEPALI_MONTHS_EN,
  NEPALI_MONTHS_NP,
  NEPALI_DAYS_EN,
  NEPALI_DAYS_NP,
  parseAdDate,
  toDevanagariNumerals,
} from '@/utils/nepaliDate'

export interface NepaliDatePickerProps {
  /**
   * The value in standard AD 'YYYY-MM-DD' ISO format (matches database storage).
   */
  value?: string
  /**
   * Callback fired when a date is selected.
   * Receives the AD ISO date string ('YYYY-MM-DD') and formatted BS date string ('2083 Bhadra 25').
   */
  onChange?: (adDate: string, bsFormatted: string) => void
  /**
   * Minimum selectable AD date string ('YYYY-MM-DD') or 'today'.
   * Defaults to 'today' for forward-looking event/photoshoot bookings.
   */
  minDate?: string | 'today'
  /**
   * Maximum selectable AD date string ('YYYY-MM-DD').
   */
  maxDate?: string
  placeholder?: string
  disabled?: boolean
  id?: string
  name?: string
  className?: string
  required?: boolean
  showDevanagariSub?: boolean
}

export function NepaliDatePicker({
  value,
  onChange,
  minDate = 'today',
  maxDate,
  placeholder = 'Select date (Bikram Sambat)',
  disabled = false,
  id,
  name,
  className,
  required,
  showDevanagariSub = true,
}: NepaliDatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  // Determine current BS context (Today)
  const todayBs = React.useMemo(() => {
    return getBsDetails(new Date()) || {
      year: getCurrentBsYear(),
      month: 4,
      date: 1,
      day: 0,
      monthNameEn: 'Bhadra',
      monthNameNp: 'भदौ',
      dayNameEn: 'Sunday',
      dayNameNp: 'आइतबार',
    }
  }, [])

  // Selected date details (from value prop)
  const selectedBs = React.useMemo(() => {
    if (!value) return null
    return getBsDetails(value)
  }, [value])

  // Active view (Year & Month being browsed in the calendar)
  const [viewYear, setViewYear] = React.useState<number>(() => {
    return selectedBs ? selectedBs.year : todayBs.year
  })

  const [viewMonth, setViewMonth] = React.useState<number>(() => {
    return selectedBs ? selectedBs.month : todayBs.month
  })

  // Keep view in sync when value changes externally
  React.useEffect(() => {
    if (selectedBs) {
      setViewYear(selectedBs.year)
      setViewMonth(selectedBs.month)
    }
  }, [selectedBs])

  // Available BS years in the dropdown (from 2075 to 2090)
  const yearOptions = React.useMemo(() => {
    const current = todayBs.year
    const years: number[] = []
    for (let y = Math.max(2075, current - 3); y <= current + 6; y++) {
      years.push(y)
    }
    return years
  }, [todayBs.year])

  // Calculate days in the currently viewed BS month
  const totalDays = React.useMemo(() => {
    return getDaysInBsMonth(viewYear, viewMonth)
  }, [viewYear, viewMonth])

  // Calculate day of week of the 1st day of the current BS month (0 = Sun, 6 = Sat)
  const firstDayOfWeek = React.useMemo(() => {
    try {
      const adFirst = bsToAd(viewYear, viewMonth, 1)
      return adFirst.getDay()
    } catch {
      return 0
    }
  }, [viewYear, viewMonth])

  // Calculate min AD date timestamp for disabling past dates
  const minAdTimestamp = React.useMemo(() => {
    if (!minDate) return null
    if (minDate === 'today') {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return today.getTime()
    }
    const parsed = parseAdDate(minDate)
    if (!parsed) return null
    parsed.setHours(0, 0, 0, 0)
    return parsed.getTime()
  }, [minDate])

  // Calculate max AD date timestamp
  const maxAdTimestamp = React.useMemo(() => {
    if (!maxDate) return null
    const parsed = parseAdDate(maxDate)
    if (!parsed) return null
    parsed.setHours(23, 59, 59, 999)
    return parsed.getTime()
  }, [maxDate])

  // Helper to check if a specific BS day is disabled
  const isDayDisabled = React.useCallback(
    (day: number) => {
      try {
        const adDate = bsToAd(viewYear, viewMonth, day)
        adDate.setHours(12, 0, 0, 0)
        const time = adDate.getTime()

        if (minAdTimestamp !== null && time < minAdTimestamp) {
          return true
        }
        if (maxAdTimestamp !== null && time > maxAdTimestamp) {
          return true
        }
        return false
      } catch {
        return false
      }
    },
    [viewYear, viewMonth, minAdTimestamp, maxAdTimestamp]
  )

  // Navigation handlers
  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((prev) => prev - 1)
      setViewMonth(11)
    } else {
      setViewMonth((prev) => prev - 1)
    }
  }

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((prev) => prev + 1)
      setViewMonth(0)
    } else {
      setViewMonth((prev) => prev + 1)
    }
  }

  const handleJumpToday = () => {
    setViewYear(todayBs.year)
    setViewMonth(todayBs.month)
  }

  const handleSelectDay = (day: number) => {
    if (isDayDisabled(day)) return
    const adDateStr = bsToAdDateString(viewYear, viewMonth, day)
    const bsFormatted = `${viewYear} ${NEPALI_MONTHS_EN[viewMonth]} ${day}`
    onChange?.(adDateStr, bsFormatted)
    setIsOpen(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange?.('', '')
  }

  // Display text for the trigger button
  const displayBsText = React.useMemo(() => {
    if (!value) return ''
    return formatBsDate(value)
  }, [value])

  const displayAdSubtitle = React.useMemo(() => {
    if (!value) return ''
    const ad = parseAdDate(value)
    if (!ad) return ''
    return ad.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }, [value])

  return (
    <div className={cn('relative w-full', className)}>
      {/* Hidden input for HTML form submission compatibility */}
      {name && <input type="hidden" name={name} value={value || ''} required={required} />}

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            id={id}
            disabled={disabled}
            className={cn(
              'flex w-full items-center justify-between rounded-lg border border-border/80 bg-background/90 px-3.5 py-2.5 text-left text-sm transition-all focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold hover:border-gold/40 shadow-sm',
              !value && 'text-muted-foreground',
              disabled && 'opacity-50 cursor-not-allowed',
              isOpen && 'border-gold ring-2 ring-gold/20'
            )}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <CalendarIcon className="h-4 w-4 text-gold shrink-0" />
              {value ? (
                <div className="flex items-center gap-2 truncate">
                  <span className="font-semibold text-foreground tracking-wide">
                    {displayBsText}
                  </span>
                  <span className="text-[11px] text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded font-mono">
                    AD: {displayAdSubtitle}
                  </span>
                </div>
              ) : (
                <span className="text-muted-foreground/80 truncate text-xs sm:text-sm">
                  {placeholder}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 shrink-0 ml-2">
              {value && !disabled && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={handleClear}
                  className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                  title="Clear date"
                >
                  <X className="h-3.5 w-3.5" />
                </span>
              )}
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-gold/15 text-gold border border-gold/30">
                BS
              </span>
            </div>
          </button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          sideOffset={6}
          className="w-[330px] sm:w-[350px] p-4 bg-card/95 backdrop-blur-md border border-border/90 rounded-2xl shadow-2xl z-50 animate-in fade-in-50 zoom-in-95"
        >
          {/* Calendar Header with Year & Month Selectors */}
          <div className="space-y-3 pb-3 border-b border-border/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-gold flex items-center gap-1">
                  <span>नेपाली पात्रो</span>
                  <span className="text-[10px] text-muted-foreground font-normal">· BS Calendar</span>
                </span>
              </div>
              <button
                type="button"
                onClick={handleJumpToday}
                className="text-[11px] font-medium text-gold hover:text-gold/80 flex items-center gap-1 px-2 py-0.5 rounded-full bg-gold/10 border border-gold/20 hover:bg-gold/20 transition-all"
                title="Jump to today's Nepali date"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Today (आज)</span>
              </button>
            </div>

            {/* Navigation & Selectors */}
            <div className="flex items-center justify-between gap-1.5">
              <button
                type="button"
                onClick={handlePrevMonth}
                aria-label="Previous month"
                className="p-1.5 rounded-lg border border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-1.5 flex-1 justify-center">
                {/* Month Dropdown */}
                <select
                  value={viewMonth}
                  onChange={(e) => setViewMonth(Number(e.target.value))}
                  className="bg-background/90 text-foreground font-semibold text-xs border border-border/80 rounded-lg px-2 py-1.5 focus:border-gold focus:outline-none cursor-pointer"
                >
                  {NEPALI_MONTHS_EN.map((monthEn, idx) => (
                    <option key={idx} value={idx}>
                      {monthEn} ({NEPALI_MONTHS_NP[idx]})
                    </option>
                  ))}
                </select>

                {/* Year Dropdown */}
                <select
                  value={viewYear}
                  onChange={(e) => setViewYear(Number(e.target.value))}
                  className="bg-background/90 text-foreground font-semibold text-xs border border-border/80 rounded-lg px-2 py-1.5 focus:border-gold focus:outline-none cursor-pointer"
                >
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year} BS ({toDevanagariNumerals(year)})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleNextMonth}
                aria-label="Next month"
                className="p-1.5 rounded-lg border border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 pt-3 pb-1 text-center">
            {NEPALI_DAYS_EN.map((day, idx) => (
              <div key={idx} className="flex flex-col items-center py-1">
                <span
                  className={cn(
                    'text-[10px] font-bold tracking-tight',
                    idx === 6 ? 'text-destructive/90' : 'text-muted-foreground'
                  )}
                >
                  {day.short}
                </span>
                {showDevanagariSub && (
                  <span
                    className={cn(
                      'text-[9px]',
                      idx === 6 ? 'text-destructive/70' : 'text-muted-foreground/60'
                    )}
                  >
                    {NEPALI_DAYS_NP[idx].short}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Calendar Day Grid */}
          <div className="grid grid-cols-7 gap-1 pt-1">
            {/* Empty slots for days before 1st day of month */}
            {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
              <div key={`empty-${idx}`} className="h-9 w-full" />
            ))}

            {/* Days of the month */}
            {Array.from({ length: totalDays }).map((_, idx) => {
              const day = idx + 1
              const isDisabled = isDayDisabled(day)

              const isSelected =
                selectedBs &&
                selectedBs.year === viewYear &&
                selectedBs.month === viewMonth &&
                selectedBs.date === day

              const isToday =
                todayBs.year === viewYear &&
                todayBs.month === viewMonth &&
                todayBs.date === day

              return (
                <button
                  key={day}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => handleSelectDay(day)}
                  className={cn(
                    'h-9 w-full rounded-lg text-xs font-semibold flex flex-col items-center justify-center transition-all relative group',
                    // Normal state
                    !isSelected &&
                      !isDisabled &&
                      'hover:bg-gold/15 hover:text-gold text-foreground',
                    // Selected state
                    isSelected &&
                      'bg-gold text-primary-foreground font-bold shadow-md scale-105 ring-2 ring-gold/40',
                    // Today outline
                    isToday &&
                      !isSelected &&
                      'border border-gold/60 text-gold font-bold bg-gold/5',
                    // Disabled state
                    isDisabled &&
                      'text-muted-foreground/30 opacity-40 cursor-not-allowed hover:bg-transparent'
                  )}
                >
                  <span>{day}</span>
                  {showDevanagariSub && (
                    <span
                      className={cn(
                        'text-[9px] leading-none -mt-0.5',
                        isSelected ? 'text-black/70' : 'text-muted-foreground/60'
                      )}
                    >
                      {toDevanagariNumerals(day)}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Footer note: Today's date reference & quick conversion preview */}
          <div className="pt-3 mt-3 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
            <div>
              <span>Today: </span>
              <span className="font-semibold text-foreground">
                {todayBs.year} {todayBs.monthNameEn} {todayBs.date}
              </span>
            </div>
            {value && (
              <span className="text-[10px] text-gold font-mono">
                {displayBsText}
              </span>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
