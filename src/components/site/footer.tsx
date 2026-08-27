'use client'

import * as React from 'react'
import Link from 'next/link'
import { Camera, Facebook, Instagram, Music2, Phone } from 'lucide-react'
import { SITE, NAV_LINKS, SERVICES, STUDIO_HOURS } from '@/lib/site'

export function Footer() {
  const handleNavClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault()
    const el = document.querySelector(href)
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 70
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }

  return (
    <footer className="bg-foreground text-background mt-auto">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <Link
              href="#home"
              onClick={(e) => handleNavClick(e, '#home')}
              className="flex items-center gap-2 mb-4"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-gold text-gold">
                <Camera className="h-4 w-4" />
              </span>
              <span className="font-serif text-xl font-bold text-background">
                Wedding<span className="text-gold">Moment</span>
              </span>
            </Link>
            <p className="text-sm text-background/70 leading-relaxed mb-5">
              {SITE.footerNote}
            </p>
            <div className="flex items-center gap-3">
              <SocialIcon icon={<Facebook className="h-4 w-4" />} label="Facebook" />
              <SocialIcon icon={<Instagram className="h-4 w-4" />} label="Instagram" />
              <SocialIcon icon={<Music2 className="h-4 w-4" />} label="TikTok" />
              <SocialIcon icon={<Phone className="h-4 w-4" />} label="Viber" />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-serif text-lg font-semibold mb-5 relative inline-block">
              Quick Links
              <span className="absolute -bottom-2 left-0 h-0.5 w-10 bg-gold" />
            </h3>
            <ul className="space-y-3 mt-4">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    className="text-sm text-background/70 hover:text-gold transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-serif text-lg font-semibold mb-5 relative inline-block">
              Our Services
              <span className="absolute -bottom-2 left-0 h-0.5 w-10 bg-gold" />
            </h3>
            <ul className="space-y-3 mt-4">
              {SERVICES.map((s) => (
                <li key={s.key}>
                  <a
                    href="#services"
                    onClick={(e) => handleNavClick(e, '#services')}
                    className="text-sm text-background/70 hover:text-gold transition-colors"
                  >
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Studio Hours */}
          <div>
            <h3 className="font-serif text-lg font-semibold mb-5 relative inline-block">
              Studio Hours
              <span className="absolute -bottom-2 left-0 h-0.5 w-10 bg-gold" />
            </h3>
            <ul className="space-y-3 mt-4">
              {STUDIO_HOURS.map((row) => (
                <li
                  key={row.day}
                  className="text-sm text-background/70 leading-relaxed"
                >
                  <span className="block text-background font-medium">
                    {row.day}
                  </span>
                  <span className="text-background/60">{row.time}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-background/15 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-background/60 text-center sm:text-left">
          <p>
            &copy; {new Date().getFullYear()} {SITE.copyright}. All rights
            reserved.
          </p>
          <p className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            Secure Payment Processing · Accepts eSewa, Khalti &amp; Nepal Banks
          </p>
        </div>
      </div>
    </footer>
  )
}

function SocialIcon({
  icon,
  label,
}: {
  icon: React.ReactNode
  label: string
}) {
  return (
    <a
      href="#"
      aria-label={label}
      className="h-9 w-9 rounded-full bg-background/10 hover:bg-gold hover:text-black text-background flex items-center justify-center transition-colors"
    >
      {icon}
    </a>
  )
}
