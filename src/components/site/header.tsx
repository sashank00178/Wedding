'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useTheme } from 'next-themes'
import { Menu, X, Moon, Sun, Shield, ChevronDown } from 'lucide-react'
import { NAV_LINKS } from '@/lib/site'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function Header() {
  const [scrolled, setScrolled] = React.useState(false)
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [bookingDropdownOpen, setBookingDropdownOpen] = React.useState(false)
  const [activeBookingTab, setActiveBookingTab] = React.useState<'booking' | 'advance'>('booking')
  const [currentHash, setCurrentHash] = React.useState<string>('')
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const dropdownTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  React.useEffect(() => setMounted(true), [])

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Track active hash & listen for tab change events
  React.useEffect(() => {
    const updateActiveState = () => {
      if (typeof window === 'undefined') return
      const hash = window.location.hash
      setCurrentHash(hash)
      if (hash === '#advance-booking' || hash === '#payment' || hash === '#advance') {
        setActiveBookingTab('advance')
      } else if (hash === '#booking') {
        setActiveBookingTab('booking')
      }
    }

    const handleExternalTab = (e: Event) => {
      const customEvent = e as CustomEvent<'booking' | 'advance'>
      if (customEvent.detail) {
        setActiveBookingTab(customEvent.detail)
      }
    }

    updateActiveState()
    window.addEventListener('hashchange', updateActiveState)
    window.addEventListener('booking-tab-change', handleExternalTab)
    return () => {
      window.removeEventListener('hashchange', updateActiveState)
      window.removeEventListener('booking-tab-change', handleExternalTab)
    }
  }, [])

  const handleNavClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault()
    setMobileOpen(false)
    setBookingDropdownOpen(false)
    const el = document.querySelector(href)
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 70
      window.scrollTo({ top, behavior: 'smooth' })
      history.replaceState(null, '', href)
      setCurrentHash(href)
    }
  }

  const navigateToBookingTab = (tab: 'booking' | 'advance') => {
    setActiveBookingTab(tab)
    setBookingDropdownOpen(false)
    setMobileOpen(false)

    // Dispatch global synchronization event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('booking-tab-change', { detail: tab })
      )
      const targetHash = tab === 'advance' ? '#advance-booking' : '#booking'
      history.replaceState(null, '', targetHash)
      setCurrentHash(targetHash)
    }

    const el = document.querySelector('#booking')
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 70
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }

  const isBookingActive =
    currentHash === '#booking' ||
    currentHash === '#advance-booking' ||
    currentHash === '#payment'

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-background/95 backdrop-blur-md shadow-md border-b border-border py-2'
          : 'bg-transparent py-4'
      )}
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="#home"
          onClick={(e) => handleNavClick(e, '#home')}
          className="flex items-center gap-3 group"
        >
          <div className="relative h-10 w-10 shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Image
              src="/logo.svg"
              alt="Wedding Moment Logo"
              width={40}
              height={40}
              className="h-9 w-9 object-contain drop-shadow-sm"
              priority
            />
          </div>
          <span
            className={cn(
              'font-serif text-xl sm:text-2xl font-bold tracking-tight transition-colors leading-tight',
              scrolled ? 'text-foreground' : 'text-white'
            )}
          >
            Wedding<span className="text-gold">Moment</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {NAV_LINKS.map((link) => {
            // Render interactive dropdown for Booking
            if (link.href === '#booking') {
              return (
                <div
                  key="booking-dropdown"
                  className="relative group py-2"
                  onMouseEnter={() => {
                    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current)
                    setBookingDropdownOpen(true)
                  }}
                  onMouseLeave={() => {
                    dropdownTimeoutRef.current = setTimeout(() => {
                      setBookingDropdownOpen(false)
                    }, 180)
                  }}
                >
                  <button
                    type="button"
                    onClick={() => navigateToBookingTab('booking')}
                    className={cn(
                      'text-sm font-medium tracking-wide transition-colors relative flex items-center gap-1 cursor-pointer',
                      scrolled ? 'text-foreground/85 hover:text-gold' : 'text-white/90 hover:text-gold',
                      isBookingActive && 'text-gold font-semibold'
                    )}
                    aria-expanded={bookingDropdownOpen}
                    aria-haspopup="true"
                  >
                    <span>Booking</span>
                    <ChevronDown
                      className={cn(
                        'h-3.5 w-3.5 transition-transform duration-200',
                        bookingDropdownOpen && 'rotate-180 text-gold'
                      )}
                    />
                    <span
                      className={cn(
                        'absolute -bottom-1 left-0 h-0.5 bg-gold transition-all',
                        isBookingActive ? 'w-full' : 'w-0 group-hover:w-full'
                      )}
                    />
                  </button>

                  {/* Dropdown Menu Box */}
                  {bookingDropdownOpen && (
                    <div
                      className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50 animate-in fade-in-0 zoom-in-95 duration-150"
                      onMouseEnter={() => {
                        if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current)
                        setBookingDropdownOpen(true)
                      }}
                      onMouseLeave={() => {
                        dropdownTimeoutRef.current = setTimeout(() => {
                          setBookingDropdownOpen(false)
                        }, 180)
                      }}
                    >
                      <div className="w-64 rounded-xl bg-card/95 backdrop-blur-md border border-gold/40 shadow-2xl p-2 flex flex-col gap-1 text-left">
                        {/* Option 1: Book a Session */}
                        <button
                          type="button"
                          onClick={() => navigateToBookingTab('booking')}
                          className={cn(
                            'w-full p-2.5 rounded-lg text-left transition-all flex flex-col cursor-pointer',
                            activeBookingTab === 'booking' && isBookingActive
                              ? 'bg-gold/15 border border-gold/40 text-foreground'
                              : 'hover:bg-secondary/80 text-foreground/80 hover:text-foreground border border-transparent'
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span className={cn(
                              'text-xs font-bold uppercase tracking-wider',
                              activeBookingTab === 'booking' && isBookingActive ? 'text-gold' : 'text-foreground'
                            )}>
                              Book a Session
                            </span>
                            {activeBookingTab === 'booking' && isBookingActive && (
                              <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                            )}
                          </div>
                          <span className="text-[11px] text-muted-foreground mt-0.5">
                            Standard photoshoot request
                          </span>
                        </button>

                        {/* Option 2: Advance Booking */}
                        <button
                          type="button"
                          onClick={() => navigateToBookingTab('advance')}
                          className={cn(
                            'w-full p-2.5 rounded-lg text-left transition-all flex flex-col cursor-pointer',
                            activeBookingTab === 'advance' && isBookingActive
                              ? 'bg-gold/15 border border-gold/40 text-foreground'
                              : 'hover:bg-secondary/80 text-foreground/80 hover:text-foreground border border-transparent'
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span className={cn(
                              'text-xs font-bold uppercase tracking-wider',
                              activeBookingTab === 'advance' && isBookingActive ? 'text-gold' : 'text-foreground'
                            )}>
                              Advance Booking
                            </span>
                            {activeBookingTab === 'advance' && isBookingActive && (
                              <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                            )}
                          </div>
                          <span className="text-[11px] text-muted-foreground mt-0.5">
                            Instant guaranteed spot via deposit
                          </span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            }

            return (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className={cn(
                  'text-sm font-medium tracking-wide transition-colors relative group py-1',
                  scrolled
                    ? 'text-foreground/80 hover:text-gold'
                    : 'text-white/90 hover:text-gold',
                  currentHash === link.href && 'text-gold font-semibold'
                )}
              >
                {link.label}
                <span
                  className={cn(
                    'absolute -bottom-1 left-0 h-0.5 bg-gold transition-all',
                    currentHash === link.href ? 'w-full' : 'w-0 group-hover:w-full'
                  )}
                />
              </a>
            )
          })}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Dark mode toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label="Toggle theme"
              className={cn(
                'h-9 w-9 rounded-full flex items-center justify-center transition-colors border',
                scrolled
                  ? 'border-border text-foreground hover:bg-accent'
                  : 'border-white/20 text-white hover:bg-white/10'
              )}
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>
          )}

          {/* Admin link */}
          <Link
            href="/admin/login"
            title="Admin Portal"
            className={cn(
              'h-9 px-3 rounded-full flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider transition-colors border',
              scrolled
                ? 'border-border text-foreground hover:text-gold hover:border-gold/50'
                : 'border-white/20 text-white hover:text-gold hover:border-gold/50'
            )}
          >
            <Shield className="h-3.5 w-3.5 text-gold" />
            <span className="hidden sm:inline">Admin</span>
          </Link>

          {/* Book Now CTA (desktop) */}
          <Button
            asChild
            size="sm"
            className="bg-gold text-black hover:bg-gold/90 font-semibold"
          >
            <a
              href="#booking"
              onClick={(e) => {
                e.preventDefault()
                navigateToBookingTab('booking')
              }}
            >
              Book Now
            </a>
          </Button>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            className={cn(
              'lg:hidden h-9 w-9 rounded-full flex items-center justify-center transition-colors border',
              scrolled
                ? 'border-border text-foreground'
                : 'border-white/20 text-white'
            )}
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-background border-b border-border shadow-lg">
          <nav className="container mx-auto max-w-7xl px-4 py-4 flex flex-col gap-1">
            {NAV_LINKS.map((link) => {
              if (link.href === '#booking') {
                return (
                  <div key="mobile-booking" className="py-2 border-b border-border/50">
                    <span className="px-2 text-xs font-bold uppercase tracking-widest text-gold">
                      Booking Options
                    </span>
                    <div className="pl-3 pr-2 pt-2 flex flex-col gap-1">
                      <button
                        type="button"
                        onClick={() => navigateToBookingTab('booking')}
                        className={cn(
                          'w-full text-left py-2 px-2.5 rounded-lg text-sm transition-colors flex items-center justify-between',
                          activeBookingTab === 'booking' && isBookingActive
                            ? 'bg-gold/15 text-gold font-semibold'
                            : 'text-foreground/80 hover:text-gold'
                        )}
                      >
                        <span>Book a Session</span>
                        <span className="text-[10px] uppercase text-muted-foreground">Standard</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => navigateToBookingTab('advance')}
                        className={cn(
                          'w-full text-left py-2 px-2.5 rounded-lg text-sm transition-colors flex items-center justify-between',
                          activeBookingTab === 'advance' && isBookingActive
                            ? 'bg-gold/15 text-gold font-semibold'
                            : 'text-foreground/80 hover:text-gold'
                        )}
                      >
                        <span>Advance Booking</span>
                        <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-gold/20 text-gold font-bold">Instant</span>
                      </button>
                    </div>
                  </div>
                )
              }

              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={cn(
                    'py-3 px-2 text-foreground/80 hover:text-gold border-b border-border/50 last:border-0',
                    currentHash === link.href && 'text-gold font-semibold'
                  )}
                >
                  {link.label}
                </a>
              )
            })}
            <Link
              href="/admin/login"
              onClick={() => setMobileOpen(false)}
              className="py-3 px-2 flex items-center gap-2 text-gold font-medium border-b border-border/50"
            >
              <Shield className="h-4 w-4" />
              <span>Admin Portal</span>
            </Link>
            <Button
              asChild
              className="mt-3 bg-gold text-black hover:bg-gold/90"
            >
              <a
                href="#booking"
                onClick={(e) => {
                  e.preventDefault()
                  navigateToBookingTab('booking')
                }}
              >
                Book a Session
              </a>
            </Button>
          </nav>
        </div>
      )}
    </header>
  )
}
