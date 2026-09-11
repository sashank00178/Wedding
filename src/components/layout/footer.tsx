'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { SITE, NAV_LINKS, SERVICES, STUDIO_HOURS } from '@/utils/siteConfig'
import { SocialLinks } from '@/components/layout/social-links'
import { getCurrentBsYear } from '@/utils/nepaliDate'

export function Footer() {
  const pathname = usePathname()
  const router = useRouter()
  const [site, setSite] = React.useState(SITE)
  const [servicesList, setServicesList] = React.useState(SERVICES)
  const [hoursList, setHoursList] = React.useState<{ day: string; time: string }[]>(STUDIO_HOURS)

  React.useEffect(() => {
    fetch('/api/site-data')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.site) setSite(data.site)
        if (data?.services?.length) setServicesList(data.services)
        if (data?.hours?.length) setHoursList(data.hours)
      })
      .catch(() => {})
  }, [])

  const handleNavClick = (e: React.MouseEvent, href: string) => {
    if (href.startsWith('/') && !href.includes('#')) {
      return
    }

    e.preventDefault()
    const targetHash = href.includes('#') ? '#' + href.split('#')[1] : href
    if (pathname === '/') {
      const el = document.querySelector(targetHash)
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY - 70
        window.scrollTo({ top, behavior: 'smooth' })
        history.replaceState(null, '', targetHash)
      }
    } else {
      router.push(`/${targetHash}`)
    }
  }

  return (
    <footer className="bg-card border-t border-border text-foreground mt-auto">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <Link
              href="/"
              onClick={(e) => {
                if (pathname === '/') {
                  handleNavClick(e, '#home')
                }
              }}
              className="flex items-center gap-3 mb-4 group"
            >
              <div className="relative h-10 w-10 shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Image
                  src="/logo.svg"
                  alt="Wedding Moment Logo"
                  width={40}
                  height={40}
                  className="h-9 w-9 object-contain drop-shadow-sm"
                />
              </div>
              <span className="font-serif text-xl font-bold text-foreground">
                Wedding<span className="text-gold">Moment</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              {site.footerNote}
            </p>
            <SocialLinks />
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-serif text-lg font-semibold mb-5 relative inline-block text-foreground">
              Quick Links
              <span className="absolute -bottom-2 left-0 h-0.5 w-10 bg-gold" />
            </h3>
            <ul className="space-y-3 mt-4">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    className="text-sm text-muted-foreground hover:text-gold transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-serif text-lg font-semibold mb-5 relative inline-block text-foreground">
              Our Services
              <span className="absolute -bottom-2 left-0 h-0.5 w-10 bg-gold" />
            </h3>
            <ul className="space-y-3 mt-4">
              {servicesList.map((s) => (
                <li key={s.key}>
                  <Link
                    href={`/services#${s.key}`}
                    className="text-sm text-muted-foreground hover:text-gold transition-colors"
                  >
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Studio Hours */}
          <div>
            <h3 className="font-serif text-lg font-semibold mb-5 relative inline-block text-foreground">
              Studio Hours
              <span className="absolute -bottom-2 left-0 h-0.5 w-10 bg-gold" />
            </h3>
            <ul className="space-y-3 mt-4">
              {hoursList.map((row, i) => (
                <li
                  key={i}
                  className="text-sm text-muted-foreground leading-relaxed"
                >
                  <span className="block text-foreground font-medium">
                    {row.day.replace(/–/g, 'to')}
                  </span>
                  <span className="text-muted-foreground/80">{row.time.replace(/–/g, 'to')}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground text-center sm:text-left">
          <p>
            &copy; {getCurrentBsYear()} BS ({new Date().getFullYear()} AD) Capture Studios Nepal. All rights reserved to the developer of this website any reproduction or duplication of this website will lead to legal action.
          </p>
          <p className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            Secure Payment Processing · Accepts eSewa &amp; Nepal Banks
          </p>
        </div>
      </div>
    </footer>
  )
}
