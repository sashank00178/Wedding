'use client'

import * as React from 'react'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { Menu, X, Moon, Sun, Camera } from 'lucide-react'
import { NAV_LINKS } from '@/lib/site'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function Header() {
  const [scrolled, setScrolled] = React.useState(false)
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => setMounted(true), [])

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleNavClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault()
    setMobileOpen(false)
    const el = document.querySelector(href)
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 70
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }

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
          className="flex items-center gap-2 group"
        >
          <span
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-full border border-gold transition-colors text-gold'
            )}
          >
            <Camera className="h-4 w-4" />
          </span>
          <span
            className={cn(
              'font-serif text-xl font-bold tracking-tight transition-colors',
              scrolled ? 'text-foreground' : 'text-white'
            )}
          >
            Wedding<span className="text-gold">Moment</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className={cn(
                'text-sm font-medium tracking-wide transition-colors relative group',
                scrolled
                  ? 'text-foreground/80 hover:text-gold'
                  : 'text-white/90 hover:text-gold'
              )}
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-gold transition-all group-hover:w-full" />
            </a>
          ))}
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

          {/* Book Now CTA (desktop) */}
          <Button
            asChild
            size="sm"
            className="hidden lg:inline-flex bg-gold text-black hover:bg-gold/90 font-semibold"
          >
            <a
              href="#booking"
              onClick={(e) => handleNavClick(e, '#booking')}
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
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="py-3 px-2 text-foreground/80 hover:text-gold border-b border-border/50 last:border-0"
              >
                {link.label}
              </a>
            ))}
            <Button
              asChild
              className="mt-3 bg-gold text-black hover:bg-gold/90"
            >
              <a
                href="#booking"
                onClick={(e) => handleNavClick(e, '#booking')}
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
