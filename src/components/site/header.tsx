'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { Menu, X, Moon, Sun, Shield, ChevronDown } from 'lucide-react'
import { NAV_LINKS } from '@/lib/site'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { WhatsAppButton } from '@/components/site/whatsapp-button'

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const [scrolled, setScrolled] = React.useState(false)
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [bookingDropdownOpen, setBookingDropdownOpen] = React.useState(false)
  const [activeBookingTab, setActiveBookingTab] = React.useState<'booking' | 'advance'>('booking')
  const [currentHash, setCurrentHash] = React.useState<string>('')
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const dropdownTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)
  const lastToggleRef = React.useRef(0)

  const toggleTheme = React.useCallback(
    (e?: React.MouseEvent) => {
      if (e) {
        e.preventDefault()
        e.stopPropagation()
      }
      const now = Date.now()
      if (now - lastToggleRef.current < 250) return
      lastToggleRef.current = now

      const isDark =
        document.documentElement.classList.contains('dark') ||
        resolvedTheme === 'dark' ||
        theme === 'dark'

      const nextTheme = isDark ? 'light' : 'dark'

      setTheme(nextTheme)

      if (nextTheme === 'dark') {
        document.documentElement.classList.add('dark')
        document.documentElement.classList.remove('light')
        document.documentElement.style.colorScheme = 'dark'
        try {
          localStorage.setItem('theme', 'dark')
        } catch {}
      } else {
        document.documentElement.classList.remove('dark')
        document.documentElement.classList.add('light')
        document.documentElement.style.colorScheme = 'light'
        try {
          localStorage.setItem('theme', 'light')
        } catch {}
      }
    },
    [theme, resolvedTheme, setTheme]
  )

  const isAtNonHomeHash = Boolean(
    pathname === '/' &&
    currentHash &&
    currentHash !== '#home' &&
    currentHash !== '#'
  )
  const isSolidHeader = scrolled || isAtNonHomeHash || pathname !== '/' || mobileOpen

  React.useEffect(() => setMounted(true), [])

  // Automatically close mobile menu when navigating to another page
  React.useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  // Robust scroll listener supporting mobile touch scrolling and documentElement
  React.useEffect(() => {
    const handleScroll = () => {
      const y =
        window.scrollY ||
        window.pageYOffset ||
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        0
      setScrolled(y > 15)
    }

    handleScroll()

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('touchmove', handleScroll, { passive: true })
    window.addEventListener('touchend', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll, { passive: true })

    // Native IntersectionObserver on #home hero section
    let observer: IntersectionObserver | null = null
    const heroEl = document.getElementById('home')
    if (heroEl && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry) {
            const atTop = entry.isIntersecting && entry.boundingClientRect.top > -20
            setScrolled(!atTop)
          }
        },
        { rootMargin: '-15px 0px 0px 0px', threshold: [0, 0.1, 0.5, 1.0] }
      )
      observer.observe(heroEl)
    }

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('touchmove', handleScroll)
      window.removeEventListener('touchend', handleScroll)
      window.removeEventListener('resize', handleScroll)
      if (observer) observer.disconnect()
    }
  }, [pathname])


  // Track active hash & listen for tab change events
  React.useEffect(() => {
    const updateActiveState = () => {
      if (typeof window === 'undefined') return
      const hash = window.location.hash
      setCurrentHash(hash)
      if (hash && hash !== '#home' && hash !== '#') {
        setScrolled(true)
      }
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
    setMobileOpen(false)
    setBookingDropdownOpen(false)

    // Dedicated standalone pages (e.g. /services, /gallery)
    if (href.startsWith('/') && !href.includes('#')) {
      return
    }

    e.preventDefault()
    const targetHash = href.includes('#') ? '#' + href.split('#')[1] : href

    if (targetHash && targetHash !== '#home') {
      setScrolled(true)
    } else {
      setScrolled(false)
    }

    if (pathname === '/') {
      const el = document.querySelector(targetHash)
      if (el) {
        const currentY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0
        const top = el.getBoundingClientRect().top + currentY - 70
        window.scrollTo({ top, behavior: 'smooth' })
        history.replaceState(null, '', targetHash)
        setCurrentHash(targetHash)
      }
    } else {
      router.push(`/${targetHash}`)
    }
  }

  const navigateToBookingTab = (tab: 'booking' | 'advance') => {
    setActiveBookingTab(tab)
    setBookingDropdownOpen(false)
    setMobileOpen(false)
    setScrolled(true)

    if (pathname === '/') {
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
        const currentY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0
        const top = el.getBoundingClientRect().top + currentY - 70
        window.scrollTo({ top, behavior: 'smooth' })
      }
    } else {
      router.push(`/#booking?tab=${tab}`)
    }
  }

  const isBookingActive =
    currentHash === '#booking' ||
    currentHash === '#advance-booking' ||
    currentHash === '#payment' ||
    pathname === '/booking'

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 site-header',
        isSolidHeader
          ? 'is-solid bg-background/95 backdrop-blur-md shadow-md border-b border-border py-2 sm:py-2.5'
          : 'bg-transparent py-3 sm:py-4 border-b border-transparent'
      )}
    >
      <div className="container mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2">
        {/* Logo */}
        <Link
          href="/"
          onClick={(e) => {
            if (pathname === '/') {
              handleNavClick(e, '#home')
            }
          }}
          className="flex items-center gap-2 sm:gap-2.5 group shrink-0"
        >
          <div className="relative h-7 w-7 sm:h-8 sm:w-8 shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Image
              src="/logo.svg"
              alt="Wedding Moment Logo"
              width={32}
              height={32}
              className="h-7 w-7 sm:h-8 sm:w-8 object-contain drop-shadow-sm"
              priority
            />
          </div>
          <span
            className={cn(
              'font-serif text-base sm:text-xl font-bold tracking-tight transition-colors leading-tight site-header-logo-text',
              isSolidHeader ? 'is-solid text-foreground' : 'text-white'
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

            const isPageLink = link.href.startsWith('/') && !link.href.includes('#')
            const isActive = isPageLink
              ? (link.href === '/' ? pathname === '/' && !currentHash : pathname === link.href)
              : (currentHash === link.href)

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  if (!isPageLink) {
                    handleNavClick(e, link.href)
                  } else {
                    setMobileOpen(false)
                  }
                }}
                className={cn(
                  'text-sm font-medium tracking-wide transition-colors relative group py-1',
                  isSolidHeader
                    ? 'text-foreground/80 hover:text-gold'
                    : 'text-white/90 hover:text-gold',
                  isActive && 'text-gold font-semibold'
                )}
              >
                {link.label}
                <span
                  className={cn(
                    'absolute -bottom-1 left-0 h-0.5 bg-gold transition-all',
                    isActive ? 'w-full' : 'w-0 group-hover:w-full'
                  )}
                />
              </Link>
            )
          })}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Dark / Light mode toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title="Toggle theme"
            className={cn(
              'h-9 w-9 rounded-full flex items-center justify-center transition-all border shrink-0 site-header-toggle cursor-pointer active:scale-90 select-none touch-manipulation',
              isSolidHeader
                ? 'is-solid border-border text-foreground hover:bg-accent'
                : 'border-white/20 text-white hover:bg-white/10'
            )}
          >
            <Sun className="h-4 w-4 hidden dark:block pointer-events-none text-gold transition-transform duration-200" />
            <Moon className="h-4 w-4 block dark:hidden pointer-events-none text-gold transition-transform duration-200" />
            <span className="sr-only">Toggle theme</span>
          </button>

          {/* Admin link */}
          <Link
            href="/admin/login"
            title="Admin Portal"
            className={cn(
              'flex h-9 px-2.5 rounded-full items-center gap-1.5 text-xs font-semibold uppercase tracking-wider transition-all border shrink-0 site-header-admin select-none touch-manipulation active:scale-95',
              isSolidHeader
                ? 'is-solid border-border text-foreground hover:text-gold hover:border-gold/50'
                : 'border-white/20 text-white hover:text-gold hover:border-gold/50'
            )}
          >
            <Shield className="h-3.5 w-3.5 text-gold shrink-0" />
            <span>ADMIN</span>
          </Link>

          {/* Book Now CTA (tablet & desktop) */}
          <Button
            asChild
            size="sm"
            className="hidden md:inline-flex h-9 px-3.5 text-xs bg-gold text-black hover:bg-gold/90 font-semibold uppercase tracking-wider shrink-0"
          >
            <a
              href={pathname === '/' ? '#booking' : '/#booking'}
              onClick={(e) => {
                e.preventDefault()
                navigateToBookingTab('booking')
              }}
            >
              Book Now
            </a>
          </Button>

          {/* Let's Talk WhatsApp CTA (desktop only) */}
          <WhatsAppButton
            variant="navbar"
            scrolled={isSolidHeader}
            className="hidden lg:inline-flex h-9 text-xs px-3 shrink-0"
          />

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            className={cn(
              'lg:hidden h-9 w-9 rounded-full flex items-center justify-center transition-all border shrink-0 active:scale-90 cursor-pointer site-header-menu-btn select-none touch-manipulation',
              isSolidHeader
                ? 'is-solid border-border text-foreground hover:bg-accent'
                : 'border-white/20 text-white hover:bg-white/10'
            )}
          >
            {mobileOpen ? <X className="h-5 w-5 pointer-events-none" /> : <Menu className="h-5 w-5 pointer-events-none" />}
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-background/98 backdrop-blur-lg border-b border-border shadow-2xl animate-in slide-in-from-top-2 duration-200 z-50">
          <nav className="container mx-auto max-w-7xl px-4 py-4 flex flex-col gap-1">
            {NAV_LINKS.map((link) => {
              const isBookingLink =
                link.href === '/#booking' ||
                link.href === '#booking' ||
                link.label.toLowerCase() === 'booking'

              if (isBookingLink) {
                return (
                  <div key="mobile-booking" className="py-2 border-b border-border/50">
                    <span className="px-2 text-xs font-bold uppercase tracking-widest text-gold flex items-center justify-between">
                      <span>Booking Options</span>
                    </span>
                    <div className="pl-2 pr-1 pt-2 flex flex-col gap-1.5">
                      <button
                        type="button"
                        onClick={() => navigateToBookingTab('booking')}
                        className={cn(
                          'w-full text-left py-2.5 px-3 rounded-xl text-sm transition-colors flex items-center justify-between',
                          activeBookingTab === 'booking' && isBookingActive
                            ? 'bg-gold/15 text-gold font-semibold'
                            : 'text-foreground/80 hover:text-gold hover:bg-accent'
                        )}
                      >
                        <span>Book a Session</span>
                        <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-secondary text-muted-foreground font-semibold">Standard</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => navigateToBookingTab('advance')}
                        className={cn(
                          'w-full text-left py-2.5 px-3 rounded-xl text-sm transition-colors flex items-center justify-between',
                          activeBookingTab === 'advance' && isBookingActive
                            ? 'bg-gold/15 text-gold font-semibold'
                            : 'text-foreground/80 hover:text-gold hover:bg-accent'
                        )}
                      >
                        <span>Advance Booking</span>
                        <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-gold/20 text-gold font-bold">Instant</span>
                      </button>
                    </div>
                  </div>
                )
              }

              const isPageLink = link.href.startsWith('/') && !link.href.includes('#')
              const isActive = isPageLink
                ? (link.href === '/' ? pathname === '/' && !currentHash : pathname === link.href)
                : (currentHash === link.href || (link.href.includes('#') && currentHash === '#' + link.href.split('#')[1]))

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={(e) => {
                    setMobileOpen(false)
                    if (!isPageLink) {
                      handleNavClick(e, link.href)
                    }
                  }}
                  className={cn(
                    'py-3 px-3 text-foreground/85 hover:text-gold hover:bg-accent/50 rounded-xl transition-colors border-b border-border/40 last:border-0 flex items-center justify-between font-medium text-sm',
                    isActive && 'text-gold font-bold bg-gold/10'
                  )}
                >
                  <span>{link.label}</span>
                  {isActive && <span className="h-2 w-2 rounded-full bg-gold" />}
                </Link>
              )
            })}

            {/* Admin Portal link */}
            <Link
              href="/admin/login"
              onClick={() => setMobileOpen(false)}
              className="py-3 px-3 flex items-center justify-between text-gold font-semibold text-sm hover:bg-gold/10 rounded-xl transition-colors border-b border-border/40 mt-1"
            >
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>Admin Portal</span>
              </div>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-normal">Login</span>
            </Link>

            {/* Action buttons */}
            <div className="pt-3 pb-1 grid grid-cols-2 gap-2">
              <Button
                asChild
                className="h-11 bg-gold text-black hover:bg-gold/90 font-bold text-xs uppercase tracking-wider shadow-sm rounded-xl"
              >
                <a
                  href={pathname === '/' ? '#booking' : '/#booking'}
                  onClick={(e) => {
                    e.preventDefault()
                    setMobileOpen(false)
                    navigateToBookingTab('booking')
                  }}
                >
                  Book Now
                </a>
              </Button>
              <WhatsAppButton
                variant="outline"
                className="w-full justify-center h-11 border-border text-foreground hover:border-[#25D366]/50 rounded-xl text-xs font-semibold"
              />
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
