'use client'

import * as React from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ChevronDown } from 'lucide-react'
import { SITE } from '@/lib/site'
import type { HeroImageItem } from '@/lib/gallery-loader'

interface HeroProps {
  initialImages?: HeroImageItem[]
}

const DEFAULT_HERO_IMAGES: HeroImageItem[] = [
  {
    src: '/gallery/hero/hero.jpeg',
    alt: 'Wedding Moment Nepal - Scenic outdoor portrait showcase',
    title: 'Scenic Balloon & Lake Session',
    filename: 'hero.jpeg',
  },
]

export function Hero({ initialImages }: HeroProps) {
  const [site, setSite] = React.useState(SITE)
  const [images, setImages] = React.useState<HeroImageItem[]>(() =>
    initialImages && initialImages.length > 0 ? initialImages : DEFAULT_HERO_IMAGES
  )

  const [currentIndex, setCurrentIndex] = React.useState(0)
  const [prevIndex, setPrevIndex] = React.useState<number | null>(null)
  const [isAnimating, setIsAnimating] = React.useState(false)

  // Fetch site data and dynamic hero images if needed
  React.useEffect(() => {
    fetch('/api/site-data')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.site) {
          setSite(data.site)
        }
        if (data?.heroImages && data.heroImages.length > 0) {
          setImages(data.heroImages)
        }
      })
      .catch(() => {})
  }, [])

  // Auto-sliding function (smooth right to left)
  const goToNext = React.useCallback(() => {
    if (images.length <= 1) return
    setCurrentIndex((current) => {
      setPrevIndex(current)
      setIsAnimating(true)
      return (current + 1) % images.length
    })
  }, [images.length])

  // Clear animating state after transition finishes (800ms)
  React.useEffect(() => {
    if (!isAnimating) return
    const timer = setTimeout(() => {
      setIsAnimating(false)
      setPrevIndex(null)
    }, 800)
    return () => clearTimeout(timer)
  }, [isAnimating])

  // Preload upcoming images in browser background cache to prevent any flash/blank
  React.useEffect(() => {
    if (images.length === 0 || typeof window === 'undefined') return
    const nextIdx1 = (currentIndex + 1) % images.length
    const nextIdx2 = (currentIndex + 2) % images.length
    ;[nextIdx1, nextIdx2].forEach((idx) => {
      const img = images[idx]
      if (img?.src) {
        const pImg = new window.Image()
        pImg.src = img.src
      }
    })
  }, [currentIndex, images])

  // Automatic timer: triggers and loops automatically every 2 seconds (2000ms)
  React.useEffect(() => {
    if (images.length <= 1) return

    const timer = setInterval(() => {
      goToNext()
    }, 2000)

    return () => clearInterval(timer)
  }, [images.length, goToNext])

  // Smooth scroll handler
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
      className="relative min-h-screen flex items-center justify-center overflow-hidden select-none"
      role="region"
      aria-roledescription="carousel"
      aria-label="Homepage hero showcase"
    >
      {/* ── Sliding Background Carousel ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        {images.map((item, idx) => {
          const isActive = idx === currentIndex
          const isPrevious = idx === prevIndex

          // Slide right-to-left logic:
          // Active slide: sits at 0, transitions in from 100% when active
          // Previous slide: glides out to -100%
          // Inactive slides: parked at +100% offscreen right with no transition
          let transform = 'translate3d(100%, 0, 0)'
          let opacity = 0
          let zIndex = 0
          let transition = 'none'

          if (isActive) {
            transform = 'translate3d(0, 0, 0)'
            opacity = 1
            zIndex = 2
            transition = isAnimating
              ? 'transform 0.8s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.8s ease-in-out'
              : 'none'
          } else if (isPrevious) {
            transform = 'translate3d(-100%, 0, 0)'
            opacity = 0
            zIndex = 1
            transition = 'transform 0.8s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.8s ease-in-out'
          }

          return (
            <div
              key={`${item.src}-${idx}`}
              className="absolute inset-0 will-change-transform"
              style={{
                transform,
                opacity,
                zIndex,
                transition,
                visibility: isActive || isPrevious ? 'visible' : 'hidden',
              }}
            >
              <Image
                src={item.src}
                alt={item.alt || 'Wedding Moment Nepal showcase'}
                fill
                priority={idx === 0 || idx === 1}
                sizes="100vw"
                quality={75}
                className="object-cover"
                style={{
                  objectPosition: item.filename.toLowerCase().includes('hero')
                    ? 'center 25%'
                    : 'center 30%',
                }}
              />
            </div>
          )
        })}
      </div>

      {/* ── Dark Gradient & Vignette Overlays (Stationary, on top of sliding images) ── */}
      <div
        className="absolute inset-0 z-[5] pointer-events-none"
        style={{
          background:
            'linear-gradient(rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.72))',
        }}
        aria-hidden
      />

      {/* Subtle gold radial ambient lighting */}
      <div
        className="absolute inset-0 z-[6] pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 70% 30%, rgba(212,175,55,0.15), transparent 55%)',
        }}
        aria-hidden
      />

      {/* Subtle edge vignette */}
      <div
        className="absolute inset-0 z-[6] pointer-events-none shadow-[inset_0_0_120px_rgba(0,0,0,0.6)]"
        aria-hidden
      />

      {/* ── Fixed Foreground Content (Never slides or moves) ── */}
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
        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 text-white/70 hover:text-gold transition-colors"
        aria-label="Scroll down to services"
      >
        <ChevronDown className="h-5 w-5 animate-bounce" />
      </a>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  )
}
