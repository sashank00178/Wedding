'use client'

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  Sparkles,
  CreditCard,
  CalendarCheck,
  Camera,
  Heart,
  Users,
  GraduationCap,
  Baby,
} from 'lucide-react'
import { Header } from '@/components/site/header'
import { Footer } from '@/components/site/footer'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function IndoorPhotographyPage() {
  const [packages, setPackages] = React.useState<
    Record<string, { amount: number; priceDisplay: string; priceType: 'fixed' | 'advance' }>
  >({})

  React.useEffect(() => {
    fetch('/api/packages')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const list = Array.isArray(data) ? data : (data?.packages || [])
        if (list.length > 0) {
          const map: Record<string, { amount: number; priceDisplay: string; priceType: 'fixed' | 'advance' }> = {}
          for (const p of list) {
            map[p.packageKey] = {
              amount: p.amount,
              priceDisplay: p.priceDisplay,
              priceType: (p.priceType === 'advance' ? 'advance' : 'fixed') as 'fixed' | 'advance',
            }
          }
          setPackages(map)
        }
      })
      .catch(() => { })
  }, [])

  const getPrice = (key: string, fallback: string) => {
    const pkg = packages[key]
    if (!pkg) return fallback
    return `NPR ${pkg.amount.toLocaleString()}`
  }

  const getPriceTypeLabel = (key: string, fallbackType: 'fixed' | 'advance' = 'advance') => {
    const pkg = packages[key]
    const type = pkg?.priceType || fallbackType
    return type === 'fixed' ? 'Fixed Rate' : 'Advance Price'
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1 pt-24 pb-20">
        {/* Top Back Navigation Bar */}
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-6">
          <Link
            href="/services"
            onClick={(e) => {
              if (typeof window !== 'undefined' && window.history.length > 1) {
                e.preventDefault()
                window.history.back()
              }
            }}
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-gold transition-colors py-2 group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span>Back to Services</span>
          </Link>
        </div>

        {/* Hero Banner */}
        <section className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-16 sm:mb-20">
          <div className="relative rounded-2xl overflow-hidden border border-border/80 bg-card shadow-2xl">
            {/* Background Image with Dark Vignette */}
            <div className="relative h-[280px] sm:h-[380px] lg:h-[440px] w-full">
              <Image
                src="/gallery/indoor/IMG_7952.JPG"
                alt="Indoor Photography Studio"
                fill
                priority
                sizes="(max-width: 1280px) 100vw, 1280px"
                quality={75}
                className="object-cover object-[center_30%]"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
            </div>

            {/* Hero Overlay Content */}
            <div className="absolute inset-0 p-6 sm:p-10 lg:p-14 flex flex-col justify-end max-w-3xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/15 border border-gold/40 text-gold text-xs font-bold uppercase tracking-widest mb-3.5 w-fit backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Dedicated Studio Sessions • Pokhara</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-tight mb-3 sm:mb-4">
                Indoor <span className="text-gold">Photography</span>
              </h1>

              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-6 max-w-2xl">
                Our luxury indoor studio provides fully equipped backdrops, editorial lighting, and creative direction.
                Explore our 4 dedicated sessions below — featuring couple portraits, family celebrations, graduation ceremonies,
                and ethereal maternity shoots with transparent package rates.
              </p>

              {/* Quick Jump Anchor Pills */}
              <div className="flex flex-wrap gap-2 pt-2">
                <a
                  href="#couple"
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-card/80 backdrop-blur-sm border border-border hover:border-gold/50 text-foreground/85 hover:text-gold transition-colors flex items-center gap-1.5"
                >
                  <Heart className="h-3 w-3 text-gold" />
                  <span>Couple / Pre-Wedding</span>
                </a>
                <a
                  href="#family"
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-card/80 backdrop-blur-sm border border-border hover:border-gold/50 text-foreground/85 hover:text-gold transition-colors flex items-center gap-1.5"
                >
                  <Users className="h-3 w-3 text-gold" />
                  <span>Family Photoshoot</span>
                </a>
                <a
                  href="#graduation"
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-card/80 backdrop-blur-sm border border-border hover:border-gold/50 text-foreground/85 hover:text-gold transition-colors flex items-center gap-1.5"
                >
                  <GraduationCap className="h-3 w-3 text-gold" />
                  <span>Graduation Photoshoot</span>
                </a>
                <a
                  href="#maternity"
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-card/80 backdrop-blur-sm border border-border hover:border-gold/50 text-foreground/85 hover:text-gold transition-colors flex items-center gap-1.5"
                >
                  <Baby className="h-3 w-3 text-gold" />
                  <span>Maternity Photoshoot</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Detailed Sections List */}
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-20">
          {/* SECTION 1: Couple Portrait / Pre-Wedding */}
          <section id="couple" className="scroll-mt-24">
            <div className="rounded-2xl border border-border bg-card/50 p-6 sm:p-8 lg:p-10 backdrop-blur-sm shadow-xl">
              {/* Category Header with Image */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center pb-8 border-b border-border/70 mb-8">
                <div className="relative aspect-[16/10] lg:aspect-[4/3] rounded-xl overflow-hidden border border-border/80 lg:col-span-4 bg-secondary">
                  <Image
                    src="/gallery/indoor/potrait.jpeg"
                    alt="Couple Portrait and Pre-Wedding Photography"
                    fill
                    priority
                    quality={100}
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover object-[center_10%]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm px-2.5 py-1 rounded text-gold text-xs font-bold uppercase tracking-wider border border-gold/30">
                    2 Selectable Packages
                  </div>
                </div>

                <div className="lg:col-span-8">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gold mb-1.5">
                    <Heart className="h-4 w-4" />
                    <span>Session 01</span>
                  </div>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground mb-3">
                    Couple Portrait / Pre-Wedding
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl mb-4">
                    Celebrate your romantic story with editorial indoor poses, soft rim lighting, and luxury framing.
                    Choose between our focused 1-hour session or our complete 3-hour experience with wardrobe changes, multiple reels, and makeup.
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs text-foreground/80">
                    <span className="px-2.5 py-1 rounded bg-secondary border border-border">Studio Lighting Setup</span>
                    <span className="px-2.5 py-1 rounded bg-secondary border border-border">Posing Guidance</span>
                    <span className="px-2.5 py-1 rounded bg-secondary border border-border">Luxury Frames Included</span>
                  </div>
                </div>
              </div>

              {/* Package 1 vs Package 2 Side-by-Side Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                {/* Package 1 Card */}
                <div className="rounded-xl border border-border bg-card p-6 flex flex-col justify-between hover:border-gold/40 transition-all shadow-sm hover:shadow-md">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-secondary text-foreground font-sans">
                        Package 1
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-gold font-medium bg-gold/10 px-2 py-0.5 rounded border border-gold/20">
                        <Clock className="h-3 w-3" />
                        1 Hour Duration
                      </span>
                    </div>

                    <h3 className="font-serif text-xl font-bold text-foreground mb-4">
                      Essential Couple Session
                    </h3>

                    <div className="space-y-2.5 mb-6">
                      <div className="text-xs uppercase tracking-widest font-semibold text-muted-foreground">
                        Includes:
                      </div>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground/90">
                          <Check className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                          <span>1 hour studio photoshoot</span>
                        </li>
                        <li className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground/90">
                          <Check className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                          <span>20 fully edited high-resolution photos</span>
                        </li>
                        <li className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground/90">
                          <Check className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                          <span>1 cinematic reel for social media</span>
                        </li>
                        <li className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground/90">
                          <Check className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                          <span>Couple photo with photo frame / gallery (8x12)</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border mt-auto">
                    <div className="mb-4">
                      <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold block">
                        {getPriceTypeLabel('indoor-couple-p1', 'advance')}
                      </span>
                      <span className="text-2xl font-bold text-gold">
                        {getPrice('indoor-couple-p1', 'NPR 5,000')}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <Link
                        href="/booking?tab=booking&package=indoor-couple-p1"
                        className="w-full py-2.5 px-3 rounded-lg text-xs font-bold uppercase tracking-wider bg-gold text-black hover:bg-gold/90 transition-all flex items-center justify-center gap-1.5 text-center shadow-sm active:scale-95"
                      >
                        <CalendarCheck className="h-3.5 w-3.5" />
                        <span>Book Now</span>
                      </Link>
                      <Link
                        href="/booking?tab=advance&package=indoor-couple-p1"
                        className="w-full py-2.5 px-3 rounded-lg text-xs font-semibold uppercase tracking-wider bg-secondary hover:bg-secondary/80 text-foreground border border-border hover:border-gold/40 transition-all flex items-center justify-center gap-1.5 text-center active:scale-95"
                      >
                        <CreditCard className="h-3.5 w-3.5 text-gold" />
                        <span>Advance Booking</span>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Package 2 Card */}
                <div className="rounded-xl border-2 border-gold/60 bg-card p-6 flex flex-col justify-between transition-all shadow-md shadow-gold/5 relative">
                  <div className="absolute -top-3 right-4 bg-gold text-black font-bold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-sm">
                    Recommended
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-gold/20 text-gold font-sans border border-gold/30">
                        Package 2
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-gold font-medium bg-gold/10 px-2 py-0.5 rounded border border-gold/20">
                        <Clock className="h-3 w-3" />
                        3 Hours Duration
                      </span>
                    </div>

                    <h3 className="font-serif text-xl font-bold text-foreground mb-4">
                      Complete Pre-Wedding Experience
                    </h3>

                    <div className="space-y-2.5 mb-6">
                      <div className="text-xs uppercase tracking-widest font-semibold text-muted-foreground">
                        Includes:
                      </div>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground/90">
                          <Check className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                          <span>3 hours duration (dress change included)</span>
                        </li>
                        <li className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground/90">
                          <Check className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                          <span>2 dress changes</span>
                        </li>
                        <li className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground/90">
                          <Check className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                          <span>40+ creative guided poses</span>
                        </li>
                        <li className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground/90">
                          <Check className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                          <span>3 cinematic reels for social media</span>
                        </li>
                        <li className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground/90">
                          <Check className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                          <span>10 couple photo prints (4x6)</span>
                        </li>
                        <li className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground/90">
                          <Check className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                          <span>1 couple frame (12x18)</span>
                        </li>
                        <li className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground/90">
                          <Check className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                          <span>Professional makeup included</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border mt-auto">
                    <div className="mb-4">
                      <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold block">
                        {getPriceTypeLabel('indoor-couple-p2', 'advance')}
                      </span>
                      <span className="text-2xl font-bold text-gold">
                        {getPrice('indoor-couple-p2', 'NPR 7,000')}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <Link
                        href="/booking?tab=booking&package=indoor-couple-p2"
                        className="w-full py-2.5 px-3 rounded-lg text-xs font-bold uppercase tracking-wider bg-gold text-black hover:bg-gold/90 transition-all flex items-center justify-center gap-1.5 text-center shadow-sm active:scale-95"
                      >
                        <CalendarCheck className="h-3.5 w-3.5" />
                        <span>Book Now</span>
                      </Link>
                      <Link
                        href="/booking?tab=advance&package=indoor-couple-p2"
                        className="w-full py-2.5 px-3 rounded-lg text-xs font-semibold uppercase tracking-wider bg-secondary hover:bg-secondary/80 text-foreground border border-gold/40 transition-all flex items-center justify-center gap-1.5 text-center active:scale-95"
                      >
                        <CreditCard className="h-3.5 w-3.5 text-gold" />
                        <span>Advance Booking</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 2: Family Photoshoot */}
          <section id="family" className="scroll-mt-24">
            <div className="rounded-2xl border border-border bg-card/50 p-6 sm:p-8 lg:p-10 backdrop-blur-sm shadow-xl">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center pb-8 border-b border-border/70 mb-8">
                <div className="relative aspect-[16/10] lg:aspect-[4/3] rounded-xl overflow-hidden border border-border/80 lg:col-span-4 bg-secondary">
                  <Image
                    src="/gallery/indoor/couplepotrait.jpeg"
                    alt="Family Photoshoot Session"
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm px-2.5 py-1 rounded text-gold text-xs font-bold uppercase tracking-wider border border-gold/30">
                    Standard Family Session
                  </div>
                </div>

                <div className="lg:col-span-8">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gold mb-1.5">
                    <Users className="h-4 w-4" />
                    <span>Session 02</span>
                  </div>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground mb-3">
                    Family Photoshoot
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl mb-4">
                    Preserve generational milestones, warmth, and natural laughter in our spacious indoor studio.
                    Includes dedicated group portraits, parent-child combinations, individual portraits, and framed wall art for your living room.
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs text-foreground/80">
                    <span className="px-2.5 py-1 rounded bg-secondary border border-border">All Generations Welcome</span>
                    <span className="px-2.5 py-1 rounded bg-secondary border border-border">Individual & Group Shots</span>
                    <span className="px-2.5 py-1 rounded bg-secondary border border-border">Frame Included</span>
                  </div>
                </div>
              </div>

              {/* Family Photoshoot Single Package Card */}
              <div className="max-w-2xl mx-auto rounded-xl border border-border bg-card p-6 sm:p-8 flex flex-col justify-between shadow-sm">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-secondary text-foreground">
                      Standard Package
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-gold font-medium bg-gold/10 px-2 py-0.5 rounded border border-gold/20">
                      <Clock className="h-3 w-3" />
                      1 Hour Duration
                    </span>
                  </div>

                  <h3 className="font-serif text-xl font-bold text-foreground mb-4">
                    Full Studio Family Portrait
                  </h3>

                  <div className="space-y-2.5 mb-6">
                    <div className="text-xs uppercase tracking-widest font-semibold text-muted-foreground">
                      Includes:
                    </div>
                    <ul className="space-y-2.5">
                      <li className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground/90">
                        <Check className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                        <span>1 hour comprehensive studio session</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground/90">
                        <Check className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                        <span>20 fully edited high-resolution digital photos</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground/90">
                        <Check className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                        <span>1 cinematic reel highlight for social media</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground/90">
                        <Check className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                        <span>Couple / family photo with photo frame / gallery (8x12)</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="pt-4 border-t border-border mt-auto">
                  <div className="mb-4">
                    <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold block">
                      {getPriceTypeLabel('indoor-family', 'advance')}
                    </span>
                    <span className="text-2xl font-bold text-gold">
                      {getPrice('indoor-family', 'NPR 5,000')}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Link
                      href="/booking?tab=booking&package=indoor-family"
                      className="w-full py-2.5 px-4 rounded-lg text-xs font-bold uppercase tracking-wider bg-gold text-black hover:bg-gold/90 transition-all flex items-center justify-center gap-1.5 text-center shadow-sm active:scale-95"
                    >
                      <CalendarCheck className="h-3.5 w-3.5" />
                      <span>Book Now</span>
                    </Link>
                    <Link
                      href="/booking?tab=advance&package=indoor-family"
                      className="w-full py-2.5 px-4 rounded-lg text-xs font-semibold uppercase tracking-wider bg-secondary hover:bg-secondary/80 text-foreground border border-border hover:border-gold/40 transition-all flex items-center justify-center gap-1.5 text-center active:scale-95"
                    >
                      <CreditCard className="h-3.5 w-3.5 text-gold" />
                      <span>Advance Booking</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 3: Graduation Photoshoot */}
          <section id="graduation" className="scroll-mt-24">
            <div className="rounded-2xl border border-border bg-card/50 p-6 sm:p-8 lg:p-10 backdrop-blur-sm shadow-xl">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center pb-8 border-b border-border/70 mb-8">
                <div className="relative aspect-[16/10] lg:aspect-[4/3] rounded-xl overflow-hidden border border-border/80 lg:col-span-4 bg-secondary">
                  <Image
                    src="/gallery/indoor/DSC04212.jpg"
                    alt="Graduation Photoshoot Session"
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm px-2.5 py-1 rounded text-gold text-xs font-bold uppercase tracking-wider border border-gold/30">
                    Official Gowns Available
                  </div>
                </div>

                <div className="lg:col-span-8">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gold mb-1.5">
                    <GraduationCap className="h-4 w-4" />
                    <span>Session 03</span>
                  </div>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground mb-3">
                    Graduation Photoshoot
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl mb-4">
                    Celebrate your degree with family and friends! Our studio provides authentic gowns and sashes
                    for Pokhara University (PU), Tribhuvan University (TU), and Kathmandu University (KU).
                    Bring your parents and siblings along at no extra cost.
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs text-foreground/80">
                    <span className="px-2.5 py-1 rounded bg-secondary border border-border">Family Included at No Extra Fee</span>
                    <span className="px-2.5 py-1 rounded bg-secondary border border-border">PU, TU & KU Gowns Available</span>
                    <span className="px-2.5 py-1 rounded bg-secondary border border-border">12x18 Luxury Frame</span>
                  </div>
                </div>
              </div>

              {/* Graduation Photoshoot Single Package Card */}
              <div className="max-w-2xl mx-auto rounded-xl border border-border bg-card p-6 sm:p-8 flex flex-col justify-between shadow-sm">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-gold/15 text-gold border border-gold/30">
                      Complete Graduation Session
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground">
                      {getPriceTypeLabel('indoor-graduation', 'fixed')}
                    </span>
                  </div>

                  <h3 className="font-serif text-xl font-bold text-foreground mb-4">
                    Degree Milestone & Family Portraits
                  </h3>

                  <div className="space-y-2.5 mb-6">
                    <div className="text-xs uppercase tracking-widest font-semibold text-muted-foreground">
                      Includes:
                    </div>
                    <ul className="space-y-2.5">
                      <li className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground/90">
                        <Check className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                        <span>Family members included in the photoshoot</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground/90">
                        <Check className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                        <span>Cinematic reels included</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground/90">
                        <Check className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                        <span>30+ edited photos with different poses</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground/90">
                        <Check className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                        <span>12x18 luxury graduation photo frame</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground/90">
                        <Check className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                        <span>Academic dress available for universities (PU, TU, KU)</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="pt-4 border-t border-border mt-auto">
                  <div className="mb-4">
                    <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold block">
                      {getPriceTypeLabel('indoor-graduation', 'fixed')}
                    </span>
                    <span className="text-2xl font-bold text-gold">
                      {getPrice('indoor-graduation', 'NPR 6,500')}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Link
                      href="/booking?tab=booking&package=indoor-graduation"
                      className="w-full py-2.5 px-4 rounded-lg text-xs font-bold uppercase tracking-wider bg-gold text-black hover:bg-gold/90 transition-all flex items-center justify-center gap-1.5 text-center shadow-sm active:scale-95"
                    >
                      <CalendarCheck className="h-3.5 w-3.5" />
                      <span>Book Now</span>
                    </Link>
                    <Link
                      href="/booking?tab=advance&package=indoor-graduation"
                      className="w-full py-2.5 px-4 rounded-lg text-xs font-semibold uppercase tracking-wider bg-secondary hover:bg-secondary/80 text-foreground border border-border hover:border-gold/40 transition-all flex items-center justify-center gap-1.5 text-center active:scale-95"
                    >
                      <CreditCard className="h-3.5 w-3.5 text-gold" />
                      <span>Advance Booking</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 4: Maternity Photoshoot */}
          <section id="maternity" className="scroll-mt-24">
            <div className="rounded-2xl border border-border bg-card/50 p-6 sm:p-8 lg:p-10 backdrop-blur-sm shadow-xl">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center pb-8 border-b border-border/70 mb-8">
                <div className="relative aspect-[16/10] lg:aspect-[4/3] rounded-xl overflow-hidden border border-border/80 lg:col-span-4 bg-secondary">
                  <Image
                    src="/gallery/indoor/MAX00023.jpg"
                    alt="Maternity Photoshoot Session"
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm px-2.5 py-1 rounded text-gold text-xs font-bold uppercase tracking-wider border border-gold/30">
                    Wardrobe & Makeup Options
                  </div>
                </div>

                <div className="lg:col-span-8">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gold mb-1.5">
                    <Baby className="h-4 w-4" />
                    <span>Session 04</span>
                  </div>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground mb-3">
                    Maternity Photoshoot
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl mb-4">
                    Celebrate the tender anticipation of motherhood with artistic rim lighting, comfortable private studio suites,
                    and flowing maternity gowns. Select between our all-inclusive Package 1 with wardrobe and makeup,
                    or our streamlined Package 2 photoshoot only.
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs text-foreground/80">
                    <span className="px-2.5 py-1 rounded bg-secondary border border-border">Partner / Couple Included</span>
                    <span className="px-2.5 py-1 rounded bg-secondary border border-border">Studio Gowns Available</span>
                    <span className="px-2.5 py-1 rounded bg-secondary border border-border">High-Res Retouched Gallery</span>
                  </div>
                </div>
              </div>

              {/* Package 1 vs Package 2 Side-by-Side Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                {/* Package 1 Card */}
                <div className="rounded-xl border-2 border-gold/60 bg-card p-6 flex flex-col justify-between transition-all shadow-md shadow-gold/5 relative">
                  <div className="absolute -top-3 right-4 bg-gold text-black font-bold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-sm">
                    Complete Experience
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-gold/20 text-gold font-sans border border-gold/30">
                        Package 1
                      </span>
                      <span className="text-xs font-medium text-gold bg-gold/10 px-2 py-0.5 rounded">
                        Full Wardrobe & Makeup
                      </span>
                    </div>

                    <h3 className="font-serif text-xl font-bold text-foreground mb-4">
                      Luxury Maternity Styling
                    </h3>

                    <div className="space-y-2.5 mb-6">
                      <div className="text-xs uppercase tracking-widest font-semibold text-muted-foreground">
                        Includes:
                      </div>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground/90">
                          <Check className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                          <span>Single photoshoot with different dress options (3 dresses available)</span>
                        </li>
                        <li className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground/90">
                          <Check className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                          <span>Professional makeup artist</span>
                        </li>
                        <li className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground/90">
                          <Check className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                          <span>Couple shoot included with partner</span>
                        </li>
                        <li className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground/90">
                          <Check className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                          <span>3+ cinematic reels</span>
                        </li>
                        <li className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground/90">
                          <Check className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                          <span>30+ edited high-resolution photos</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border mt-auto">
                    <div className="mb-4">
                      <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold block">
                        {getPriceTypeLabel('indoor-maternity-p1', 'fixed')}
                      </span>
                      <span className="text-2xl font-bold text-gold">
                        {getPrice('indoor-maternity-p1', 'NPR 15,000')}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <Link
                        href="/booking?tab=booking&package=indoor-maternity-p1"
                        className="w-full py-2.5 px-3 rounded-lg text-xs font-bold uppercase tracking-wider bg-gold text-black hover:bg-gold/90 transition-all flex items-center justify-center gap-1.5 text-center shadow-sm active:scale-95"
                      >
                        <CalendarCheck className="h-3.5 w-3.5" />
                        <span>Book Now</span>
                      </Link>
                      <Link
                        href="/booking?tab=advance&package=indoor-maternity-p1"
                        className="w-full py-2.5 px-3 rounded-lg text-xs font-semibold uppercase tracking-wider bg-secondary hover:bg-secondary/80 text-foreground border border-gold/40 transition-all flex items-center justify-center gap-1.5 text-center active:scale-95"
                      >
                        <CreditCard className="h-3.5 w-3.5 text-gold" />
                        <span>Advance Booking</span>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Package 2 Card */}
                <div className="rounded-xl border border-border bg-card p-6 flex flex-col justify-between hover:border-gold/40 transition-all shadow-sm hover:shadow-md">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-secondary text-foreground font-sans">
                        Package 2
                      </span>
                      <span className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded">
                        Photoshoot Essential
                      </span>
                    </div>

                    <h3 className="font-serif text-xl font-bold text-foreground mb-4">
                      Photoshoot Only
                    </h3>

                    <div className="space-y-2.5 mb-6">
                      <div className="text-xs uppercase tracking-widest font-semibold text-muted-foreground">
                        Includes:
                      </div>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground/90">
                          <Check className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                          <span>Photoshoot only with professional studio lighting</span>
                        </li>
                        <li className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground/90">
                          <Check className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                          <span>One dress provided from studio collection</span>
                        </li>
                        <li className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground/90">
                          <Check className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                          <span>No makeup (natural or client self-prepared)</span>
                        </li>
                        <li className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground/90">
                          <Check className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                          <span>Digital edited photo gallery delivery</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border mt-auto">
                    <div className="mb-4">
                      <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold block">
                        {getPriceTypeLabel('indoor-maternity-p2', 'fixed')}
                      </span>
                      <span className="text-2xl font-bold text-gold">
                        {getPrice('indoor-maternity-p2', 'NPR 10,000')}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <Link
                        href="/booking?tab=booking&package=indoor-maternity-p2"
                        className="w-full py-2.5 px-3 rounded-lg text-xs font-bold uppercase tracking-wider bg-gold text-black hover:bg-gold/90 transition-all flex items-center justify-center gap-1.5 text-center shadow-sm active:scale-95"
                      >
                        <CalendarCheck className="h-3.5 w-3.5" />
                        <span>Book Now</span>
                      </Link>
                      <Link
                        href="/booking?tab=advance&package=indoor-maternity-p2"
                        className="w-full py-2.5 px-3 rounded-lg text-xs font-semibold uppercase tracking-wider bg-secondary hover:bg-secondary/80 text-foreground border border-border hover:border-gold/40 transition-all flex items-center justify-center gap-1.5 text-center active:scale-95"
                      >
                        <CreditCard className="h-3.5 w-3.5 text-gold" />
                        <span>Advance Booking</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Bottom CTA & Support Bar */}
        <section className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-20">
          <div className="rounded-2xl border border-gold/40 bg-card p-8 sm:p-10 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl pointer-events-none" />
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-foreground mb-2">
              Have Questions or Want a Custom Session?
            </h3>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto mb-6">
              Our studio team in Pokhara is happy to advise on wardrobes, themes, timing, and group reservations.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/#contact"
                className="py-2.5 px-5 rounded-lg text-xs font-semibold uppercase tracking-wider bg-gold text-black hover:bg-gold/90 transition-all shadow-md active:scale-95"
              >
                Contact Studio
              </Link>
              <Link
                href="/#services"
                className="py-2.5 px-5 rounded-lg text-xs font-semibold uppercase tracking-wider bg-secondary hover:bg-secondary/80 text-foreground border border-border transition-all active:scale-95"
              >
                View All Other Services
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
