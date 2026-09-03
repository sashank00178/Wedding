'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { ChevronDown } from 'lucide-react'
import { SITE } from '@/lib/site'

export function Hero() {
  const [site, setSite] = React.useState(SITE)

  React.useEffect(() => {
    fetch('/api/site-data')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.site) {
          setSite(data.site)
        }
      })
      .catch(() => {})
  }, [])

  const handleScroll = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    const el = document.querySelector(href)
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 70
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Parallax backdrop */}
      <div className="absolute inset-0 hero-backdrop" aria-hidden />

      {/* Subtle gold accent overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 70% 30%, rgba(212,175,55,0.15), transparent 50%)',
        }}
        aria-hidden
      />

      <div className="relative z-10 container mx-auto max-w-4xl px-4 sm:px-6 text-center text-white">
        <h1
          className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6"
          style={{ animation: 'fadeUp 0.8s ease 0.1s both' }}
        >
          Capture Your
          <br />
          <span className="text-gold italic">Precious Moments</span>
        </h1>

        <p
          className="text-base sm:text-lg md:text-xl text-white/85 max-w-2xl mx-auto mb-10 leading-relaxed"
          style={{ animation: 'fadeUp 0.8s ease 0.25s both' }}
        >
          {site.heroSubtitle}
        </p>

        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          style={{ animation: 'fadeUp 0.8s ease 0.4s both' }}
        >
          <Button
            asChild
            size="lg"
            className="bg-gold text-black hover:bg-gold/90 font-semibold px-8 h-12 text-base shadow-lg hover:shadow-gold/20"
          >
            <a href="#booking" onClick={handleScroll('#booking')}>
              Book a Session
            </a>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="bg-transparent border-white/60 text-white hover:bg-white/15 hover:text-white hover:border-white backdrop-blur-sm px-8 h-12 text-base"
          >
            <a href="#gallery" onClick={handleScroll('#gallery')}>
              View Portfolio
            </a>
          </Button>
        </div>

        {/* Relocated studio info — clean, unboxed, gold text */}
        <p
          className="mt-8 sm:mt-10 text-xs sm:text-sm tracking-[0.25em] uppercase text-gold/90 font-medium"
          style={{ animation: 'fadeUp 0.8s ease 0.5s both' }}
        >
          Photography Studio · Pokhara, Nepal · Since {site.since}
        </p>
      </div>

      {/* Scroll-down indicator */}
      <a
        href="#services"
        onClick={handleScroll('#services')}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-white/70 hover:text-gold transition-colors"
        aria-label="Scroll down"
      >
        <ChevronDown className="h-6 w-6 animate-bounce" />
      </a>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  )
}
