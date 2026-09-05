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
  ShieldCheck,
  Video,
  Layers,
  MessageCircle,
} from 'lucide-react'
import { Header } from '@/components/site/header'
import { Footer } from '@/components/site/footer'
import { Button } from '@/components/ui/button'
import {
  WEDDING_CATEGORIES,
  SITE,
  type WeddingMainCategoryKey,
} from '@/lib/site'
import { cn } from '@/lib/utils'

const BRIDE_TO_BE_CONFIG = {
  title: 'Bride to Be',
  duration: '3–4 hours',
  price: 25000,
  priceLabel: 'NPR 25,000',
  priceType: 'Advance Price',
  image: '/gallery/bridetobe1.jpg',
  packageKey: 'wedding-bride-to-be',
  description:
    'Dedicated bridal preparation and pre-wedding photoshoot celebrating the bride in her radiant element. Intimate, candid, and high-fashion editorial portraits capturing every delicate ritual, dress, and jewelry detail.',
  deliverables: [
    '3–4 hours dedicated bridal photoshoot session',
    'Candid bridal preparation, makeup & getting-ready portraits',
    'Solo editorial portraits in bridal attire with jewelry styling',
    'Creative portraits with bridesmaids, sisters, and immediate family',
    '1 cinematic 4K social media teaser reel (9:16 vertical)',
    '40+ color-graded high-resolution master digital photographs',
    'Private cloud gallery portal with high-speed download access',
  ],
}

const MEHENDI_CONFIG = {
  title: 'Mehendi Photography & Videography',
  duration: 'TBD',
  price: 0,
  priceLabel: 'TBD',
  priceType: 'Price',
  image: '/gallery/mehendi.jpeg',
  packageKey: 'wedding-mehendi',
  description: [
    'Celebrate the colors, laughter, love, and beautiful traditions of your Mehendi ceremony with Wedding Moment. We capture every detail—from the intricate Mehendi designs and vibrant decorations to candid moments with family and friends.',
    'Our team focuses on natural emotions, creative portraits, candid photography, and cinematic videography so you can relive every beautiful moment of your Mehendi day for years to come.',
  ],
  deliverables: [
    'Candid & Traditional Photography',
    'Professional Videography',
    'Cinematic Highlight Video',
    'Instagram/Reels Videos',
    'Bride & Groom Portraits',
    'Family & Friends Moments',
    'Décor & Mehendi Detail Shots',
    'Full Event Coverage',
    'Professionally Edited Photos',
  ],
  closingLine:
    "Your Mehendi is more than a ceremony — it's the beginning of your wedding story. Let us capture it beautifully.",
}

const ENGAGEMENT_CONFIG = {
  title: 'Engagement Photography & Videography',
  image: '/gallery/engagement.jpg',
  description:
    'Your engagement is the beautiful beginning of a new chapter together. At Wedding Moment, we capture the happiness, excitement, emotions, and unforgettable moments of your special day through timeless photography and cinematic videography.',
  deliverables: [
    'Candid & Traditional Photography',
    'Professional Videography',
    'Ring Exchange Coverage',
    'Couple Portraits',
    'Family & Friends Moments',
    'Decoration & Detail Shots',
    'Cinematic Highlight Video',
    'Instagram/Reels Videos',
    'Professionally Edited Photos',
    'Full Event Coverage',
  ],
  categoryPricing: {
    bride: {
      crew: '1 Photographer, 1 Videographer',
      price: 35000,
      priceLabel: 'NPR 35,000',
      priceType: 'Advance Price',
      packageKey: 'wedding-engagement-bride',
      tag: 'Bride Side Coverage',
    },
    groom: {
      crew: '1 Photographer, 1 Videographer',
      price: 40000,
      priceLabel: 'NPR 40,000',
      priceType: 'Advance Price',
      packageKey: 'wedding-engagement-groom',
      tag: 'Groom Side Coverage',
    },
    combo: {
      crew: '2 Photographers, 2 Videographers',
      price: 50000,
      priceLabel: 'NPR 50,000',
      priceType: 'Advance Price',
      packageKey: 'wedding-engagement-combo',
      tag: 'Both Sides (Combo) Coverage',
    },
  },
}

const MARRIAGE_CONFIG = {
  title: 'Wedding Moment – Pokhara',
  image: '/gallery/wedding.jpg',
  description:
    'We offer complete wedding photography and cinematography packages designed to capture every beautiful moment of your special day.',
  deliverables: [
    'Professional Wedding Photography',
    'Cinematic Videography',
    'Full Wedding Highlight Video',
    'Wedding Reels',
    'Unlimited Edited Photos',
    'Raw Photos & Videos',
    'Premium Photo Album',
    'Family Photo Frame',
    'Drone Coverage',
    'Pendrive / Digital Delivery',
  ],
  closingLine: 'Your Love Story. Our Frames. Forever Your Memories.',
  categoryPricing: {
    bride: {
      duration: 'TBD',
      crew: 'TBD',
      price: 0,
      priceLabel: 'TBD',
      priceType: 'Price',
      packageKey: 'wedding-marriage-bride',
      tag: 'Bride Side Marriage Coverage',
    },
    groom: {
      duration: 'TBD',
      crew: 'TBD',
      price: 0,
      priceLabel: 'TBD',
      priceType: 'Price',
      packageKey: 'wedding-marriage-groom',
      tag: 'Groom Side Marriage Coverage',
    },
    combo: {
      duration: 'TBD',
      crew: 'TBD',
      price: 0,
      priceLabel: 'TBD',
      priceType: 'Price',
      packageKey: 'wedding-marriage-combo',
      tag: 'Both Sides (Combo) Marriage Coverage',
    },
  },
}

const RECEPTION_CONFIG = {
  title: 'Wedding Reception',
  image: '/gallery/reception.jpg',
  description:
    'Join us as we celebrate our new beginning with an evening filled with love, laughter, delicious food, music, and unforgettable moments shared with our family and friends.',
  deliverables: [
    'Wedding Celebration',
    'Music & Entertainment',
    'Dinner & Refreshments',
    'Photography & Memories',
    'Dance & Celebration',
    'Speeches & Toasts',
    'Cake Cutting',
    'Family & Friends Gathering',
    'Special Moments & Surprises',
  ],
  categoryPricing: {
    combo: {
      duration: 'TBD',
      crew: 'TBD',
      price: 0,
      priceLabel: 'TBD',
      priceType: 'Price',
      packageKey: 'wedding-reception-combo',
      tag: 'Both Sides (Combo) Reception Coverage',
    },
    groom: {
      duration: 'TBD',
      crew: 'TBD',
      price: 0,
      priceLabel: 'TBD',
      priceType: 'Price',
      packageKey: 'wedding-reception-groom',
      tag: 'Groom Side Reception Coverage',
    },
    bride: {
      duration: 'TBD',
      crew: 'TBD',
      price: 0,
      priceLabel: 'TBD',
      priceType: 'Price',
      packageKey: 'wedding-reception-bride',
      tag: 'Bride Side Reception Coverage',
    },
  },
}

const POST_SHOOT_CONFIG = {
  title: 'Post Shoot',
  image: '/gallery/postshoot.jpg',
  description:
    'A special photo session after the wedding, capturing beautiful, romantic, and natural moments of the newly married couple.',
  deliverables: [
    'Couple Photography',
    'Romantic & Candid Moments',
    'Outdoor Locations',
    'Creative Poses',
    'Photos & Videos',
    'Professional Editing',
  ],
  categoryPricing: {
    combo: {
      duration: 'TBD',
      crew: 'TBD',
      price: 0,
      priceLabel: 'TBD',
      priceType: 'Price',
      packageKey: 'wedding-post-shoot-combo',
      tag: 'Both Sides (Combo) Post Shoot',
    },
    groom: {
      duration: 'TBD',
      crew: 'TBD',
      price: 0,
      priceLabel: 'TBD',
      priceType: 'Price',
      packageKey: 'wedding-post-shoot-groom',
      tag: 'Groom Side Post Shoot',
    },
    bride: {
      duration: 'TBD',
      crew: 'TBD',
      price: 0,
      priceLabel: 'TBD',
      priceType: 'Price',
      packageKey: 'wedding-post-shoot-bride',
      tag: 'Bride Side Post Shoot',
    },
  },
}

export default function WeddingPhotographyPage() {
  const [activeMainCat, setActiveMainCat] = React.useState<WeddingMainCategoryKey>('combo')
  const [activeSubCat, setActiveSubCat] = React.useState<string>('All Included')

  const currentConfig = WEDDING_CATEGORIES[activeMainCat]

  // When switching main category, default to "All Included"
  const handleMainCategoryChange = (key: WeddingMainCategoryKey) => {
    setActiveMainCat(key)
    setActiveSubCat('All Included')
  }

  const isAllIncluded = activeSubCat === 'All Included'
  const isBrideToBe = activeSubCat === 'Bride to Be'
  const isMehendi = activeSubCat === 'Mehendi'
  const isEngagement = activeSubCat === 'Engagement'
  const isMarriage = activeSubCat === 'Marriage'
  const isReception = activeSubCat === 'Reception'
  const isPostShoot = activeSubCat === 'Post Shoot'
  const currentEngagement = ENGAGEMENT_CONFIG.categoryPricing[activeMainCat]
  const currentMarriage = MARRIAGE_CONFIG.categoryPricing[activeMainCat]
  const currentReception = RECEPTION_CONFIG.categoryPricing[activeMainCat]
  const currentPostShoot = POST_SHOOT_CONFIG.categoryPricing[activeMainCat]

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
        <section className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-12 sm:mb-16">
          <div className="relative rounded-2xl overflow-hidden border border-border/80 bg-card shadow-2xl">
            {/* Background Image with Dark Vignette */}
            <div className="relative h-[280px] sm:h-[400px] lg:h-[460px] w-full">
              <Image
                src="/gallery/wedding-photography.jpg"
                alt="Wedding Photography Ceremony Nepal"
                fill
                priority
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1280px"
                quality={85}
                className="object-cover object-[center_35%]"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
            </div>

            {/* Hero Overlay Content */}
            <div className="absolute inset-0 p-6 sm:p-10 lg:p-14 flex flex-col justify-end max-w-3xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/15 border border-gold/40 text-gold text-xs font-bold uppercase tracking-widest mb-3.5 w-fit backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Traditional &amp; Contemporary Wedding Coverage</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-tight mb-3 sm:mb-4">
                Wedding <span className="text-gold">Photography</span>
              </h1>

              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-6 max-w-2xl">
                Every Nepali wedding is a grand tapestry of sacred rituals, unconditional love, and timeless memories.
                Choose between tailored <strong>Bride Side</strong> coverage, energetic <strong>Groom Side</strong> ceremonies, 
                or our signature complete <strong>Combo</strong> package uniting both families in seamless storytelling.
              </p>

              {/* Quick Jump Stats */}
              <div className="flex flex-wrap gap-2 pt-1">
                <div className="px-3 py-1.5 rounded-lg text-xs font-medium bg-card/85 backdrop-blur-sm border border-border text-foreground/90 flex items-center gap-2">
                  <Camera className="h-3.5 w-3.5 text-gold" />
                  <span>Dual &amp; Triple Crew Teams</span>
                </div>
                <div className="px-3 py-1.5 rounded-lg text-xs font-medium bg-card/85 backdrop-blur-sm border border-border text-foreground/90 flex items-center gap-2">
                  <Video className="h-3.5 w-3.5 text-gold" />
                  <span>Cinematic Reels &amp; Drone Aerial</span>
                </div>
                <div className="px-3 py-1.5 rounded-lg text-xs font-medium bg-card/85 backdrop-blur-sm border border-border text-foreground/90 flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-gold" />
                  <span>72-Hour Highlight Delivery</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories & Dynamic Sub-Category Tabs Section */}
        <section className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Main Category Selector (Level 1) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-gold">
                  Step 1: Select Coverage Type
                </span>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-foreground mt-0.5">
                  Choose Your Wedding Category
                </h2>
              </div>
              <span className="text-xs text-muted-foreground hidden sm:block">
                Select a category to view specific ceremonial events
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {(Object.keys(WEDDING_CATEGORIES) as WeddingMainCategoryKey[]).map((key) => {
                const cat = WEDDING_CATEGORIES[key]
                const isSelected = activeMainCat === key

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleMainCategoryChange(key)}
                    className={cn(
                      'relative p-4 sm:p-5 rounded-xl text-left transition-all duration-200 border flex flex-col justify-between group cursor-pointer',
                      isSelected
                        ? 'bg-card border-gold shadow-lg shadow-gold/10 ring-1 ring-gold/40'
                        : 'bg-card/60 border-border hover:border-gold/50 hover:bg-card'
                    )}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-2">
                        {key === 'bride' && <Heart className={cn('h-4 w-4', isSelected ? 'text-gold' : 'text-muted-foreground')} />}
                        {key === 'combo' && <Sparkles className={cn('h-4 w-4', isSelected ? 'text-gold' : 'text-muted-foreground')} />}
                        {key === 'groom' && <Users className={cn('h-4 w-4', isSelected ? 'text-gold' : 'text-muted-foreground')} />}
                        <h3 className="font-serif text-lg font-bold text-foreground">
                          {cat.title}
                        </h3>
                      </div>
                      {cat.badge && (
                        <span
                          className={cn(
                            'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border',
                            isSelected
                              ? 'bg-gold/15 text-gold border-gold/30'
                              : 'bg-secondary text-muted-foreground border-border'
                          )}
                        >
                          {cat.badge}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3">
                      {cat.subtitle}
                    </p>

                    <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground font-medium">All Included:</span>
                      <span className="font-bold text-gold text-sm">{cat.priceLabel}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Nested Sub-Category Selector (Level 2) */}
          <div className="bg-card/70 border border-border rounded-xl p-3 sm:p-4 shadow-sm space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="h-3.5 w-3.5 text-gold" />
                <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                  {currentConfig.title} Ceremonial Events:
                </span>
              </div>
              <span className="text-[11px] text-muted-foreground">
                {currentConfig.subCategories.length} options • Scroll horizontally if needed
              </span>
            </div>

            {/* Horizontally scrollable row on mobile */}
            <div className="overflow-x-auto no-scrollbar scroll-smooth -mx-1 px-1 py-1">
              <div className="flex items-center gap-2 min-w-max sm:min-w-0 sm:flex-wrap">
                {currentConfig.subCategories.map((subCat) => {
                  const isCurrent = activeSubCat === subCat
                  const isAll = subCat === 'All Included'

                  return (
                    <button
                      key={subCat}
                      type="button"
                      onClick={() => setActiveSubCat(subCat)}
                      className={cn(
                        'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 flex items-center gap-1.5 shrink-0 cursor-pointer',
                        isCurrent
                          ? isAll
                            ? 'bg-gold text-black shadow-md font-bold'
                            : 'bg-primary/15 text-gold border border-gold/50 shadow-sm'
                          : 'bg-secondary/70 hover:bg-secondary text-foreground/80 border border-border/70 hover:border-border'
                      )}
                    >
                      {isAll && <Sparkles className="h-3 w-3" />}
                      <span>{subCat}</span>
                      {isAll && (
                        <span className={cn(
                          'text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-1',
                          isCurrent ? 'bg-black/20 text-black' : 'bg-gold/20 text-gold'
                        )}>
                          Full Package
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Active View Container */}
          <div className="relative">
            {isAllIncluded ? (
              /* =========================================================================
                 "ALL INCLUDED" ACTIVE VIEW: Full Package Details & Active Booking
                 ========================================================================= */
              <div className="bg-card border border-gold/40 rounded-2xl overflow-hidden shadow-xl ring-1 ring-gold/15">
                <div className="grid grid-cols-1 lg:grid-cols-12">
                  
                  {/* Left Column: Real Photography Visual */}
                  <div className="lg:col-span-5 relative min-h-[360px] sm:min-h-[440px] lg:min-h-full bg-secondary overflow-hidden">
                    <Image
                      src={currentConfig.image}
                      alt={`${currentConfig.title} Wedding Photography Nepal`}
                      fill
                      priority
                      unoptimized
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className={cn(
                        "object-cover transition-transform duration-700 hover:scale-105",
                        activeMainCat === 'bride'
                          ? "object-[center_12%]"
                          : activeMainCat === 'groom'
                          ? "object-[center_10%]"
                          : "object-[center_35%]"
                      )}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent lg:hidden pointer-events-none" />
                    
                    {/* Floating Status Pill */}
                    <div className="absolute top-4 left-4 z-10">
                      <span className="px-3 py-1 rounded-full bg-black/80 backdrop-blur-md text-gold text-xs font-bold uppercase tracking-wider border border-gold/40 shadow-sm flex items-center gap-1.5">
                        <Sparkles className="h-3 w-3" />
                        <span>All Included Package</span>
                      </span>
                    </div>

                    {/* Sleek Bottom overlay badge on image */}
                    <div className="absolute bottom-3.5 left-3.5 right-3.5 z-10 pointer-events-none">
                      <div className="bg-black/80 backdrop-blur-md rounded-xl px-3.5 py-2 border border-white/10 text-white shadow-lg flex items-center justify-between gap-2">
                        <div>
                          <div className="text-[10px] font-bold text-gold uppercase tracking-wider">
                            {currentConfig.title} Specialization
                          </div>
                          <div className="text-xs text-white/90 font-medium">
                            {currentConfig.allIncludedEvents.length} Ceremonies Covered in Full
                          </div>
                        </div>
                        <span className="text-[10px] font-semibold text-gold/90 px-2 py-0.5 rounded bg-gold/10 border border-gold/20 shrink-0">
                          HD Quality
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Complete Package Details */}
                  <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6">
                    <div>
                      {/* Section Eyebrow & Title */}
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-widest text-gold">
                          Complete Ceremonial Solution
                        </span>
                        <span className="text-xs font-bold text-muted-foreground px-2.5 py-0.5 rounded-md bg-secondary border border-border">
                          {currentConfig.title}
                        </span>
                      </div>

                      <h3 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
                        {currentConfig.title} — All Included Package
                      </h3>

                      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                        {currentConfig.allIncludedDescription}
                      </p>

                      {/* Included Ceremonies Pills */}
                      <div className="pt-4">
                        <span className="text-xs font-bold uppercase tracking-wider text-foreground block mb-2">
                          Ceremonial Events Included:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {currentConfig.allIncludedEvents.map((evt) => (
                            <span
                              key={evt}
                              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-lg bg-secondary text-foreground border border-border"
                            >
                              <Check className="h-3.5 w-3.5 text-gold shrink-0" />
                              <span>{evt}</span>
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Deliverables Checklist */}
                      <div className="pt-5 border-t border-border/70 mt-5">
                        <span className="text-xs font-bold uppercase tracking-wider text-foreground block mb-3">
                          What&apos;s Included in this Package:
                        </span>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {currentConfig.deliverables.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground/90">
                              <span className="h-4 w-4 rounded-full bg-gold/15 text-gold flex items-center justify-center shrink-0 mt-0.5">
                                <Check className="h-3 w-3" />
                              </span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Pricing & Dual Action Booking Buttons */}
                    <div className="pt-6 border-t border-border/80 space-y-4">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground block">
                            Package Price
                          </span>
                          <div className="flex items-baseline gap-2">
                            <span className="font-serif text-2xl sm:text-3xl font-bold text-gold">
                              {currentConfig.priceLabel}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              (All ceremonies &amp; deliverables included)
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[11px] text-muted-foreground block">Deposit Required:</span>
                          <span className="text-xs font-semibold text-foreground">Standard 20% or Fixed Advance</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <Button
                          asChild
                          className="flex-1 bg-gold text-black hover:bg-gold/90 font-bold text-xs uppercase tracking-wider shadow-md py-5 active:scale-95 transition-transform"
                        >
                          <Link href={`/booking?tab=booking&package=${currentConfig.allIncludedPackageKey}`}>
                            <CalendarCheck className="h-4 w-4 mr-2" />
                            Book Now
                          </Link>
                        </Button>

                        <Button
                          asChild
                          variant="outline"
                          className="flex-1 text-xs uppercase tracking-wider font-semibold border-gold/40 hover:border-gold hover:bg-gold/10 py-5 active:scale-95 transition-transform"
                        >
                          <Link href={`/booking?tab=advance&package=${currentConfig.allIncludedPackageKey}`}>
                            <CreditCard className="h-4 w-4 mr-2 text-gold" />
                            Advance Booking
                          </Link>
                        </Button>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            ) : isBrideToBe ? (
              /* =========================================================================
                 "BRIDE TO BE" ACTIVE VIEW: Populated Sub-Category with Real Image & Booking
                 ========================================================================= */
              <div className="bg-card border border-gold/40 rounded-2xl overflow-hidden shadow-xl ring-1 ring-gold/15">
                <div className="grid grid-cols-1 lg:grid-cols-12">
                  
                  {/* Left Column: Real Photography Visual */}
                  <div className="lg:col-span-5 relative min-h-[320px] lg:min-h-full bg-secondary">
                    <Image
                      src={BRIDE_TO_BE_CONFIG.image}
                      alt="Bride to Be Photoshoot Nepal"
                      fill
                      priority
                      quality={95}
                      unoptimized
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover object-top"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent lg:hidden" />
                    
                    {/* Floating Status Pill */}
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 rounded-full bg-black/80 backdrop-blur-md text-gold text-xs font-bold uppercase tracking-wider border border-gold/40 shadow-sm flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        <span>Duration: {BRIDE_TO_BE_CONFIG.duration}</span>
                      </span>
                    </div>

                    {/* Bottom overlay badge on image */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="bg-black/70 backdrop-blur-md rounded-xl p-3 border border-white/10 text-white">
                        <div className="text-[11px] font-semibold text-gold uppercase tracking-wider">
                          Dedicated Bridal Shoot
                        </div>
                        <div className="text-xs text-white/90 mt-0.5">
                          {currentConfig.title} &bull; {BRIDE_TO_BE_CONFIG.duration} Coverage
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Complete Package Details */}
                  <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6">
                    <div>
                      {/* Section Eyebrow & Duration Badge near Title */}
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-widest text-gold">
                          Bridal Pre-Wedding Ceremony &bull; {currentConfig.title}
                        </span>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary border border-border text-xs text-foreground/90 font-medium">
                          <Clock className="h-3.5 w-3.5 text-gold" />
                          <span>Duration: {BRIDE_TO_BE_CONFIG.duration}</span>
                        </div>
                      </div>

                      <h3 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
                        {BRIDE_TO_BE_CONFIG.title} Photoshoot
                      </h3>

                      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                        {BRIDE_TO_BE_CONFIG.description}
                      </p>

                      {/* Deliverables Checklist with subtle checkmark SVG icons - NO emojis */}
                      <div className="pt-5 border-t border-border/70 mt-5">
                        <span className="text-xs font-bold uppercase tracking-wider text-foreground block mb-3">
                          What&apos;s Included in this Package:
                        </span>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {BRIDE_TO_BE_CONFIG.deliverables.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground/90">
                              <span className="h-4 w-4 rounded-full bg-gold/15 text-gold flex items-center justify-center shrink-0 mt-0.5">
                                <Check className="h-3 w-3" />
                              </span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Pricing & Dual Action Booking Buttons */}
                    <div className="pt-6 border-t border-border/80 space-y-4">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground block">
                            {BRIDE_TO_BE_CONFIG.priceType}
                          </span>
                          <div className="flex items-baseline gap-2">
                            <span className="font-serif text-2xl sm:text-3xl font-bold text-gold">
                              {BRIDE_TO_BE_CONFIG.priceLabel}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              (Duration: {BRIDE_TO_BE_CONFIG.duration})
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[11px] text-muted-foreground block">Booking Type:</span>
                          <span className="text-xs font-semibold text-foreground">Standard or Advance Deposit</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <Button
                          asChild
                          className="flex-1 bg-gold text-black hover:bg-gold/90 font-bold text-xs uppercase tracking-wider shadow-md py-5 active:scale-95 transition-transform"
                        >
                          <Link href={`/booking?tab=booking&package=${BRIDE_TO_BE_CONFIG.packageKey}`}>
                            <CalendarCheck className="h-4 w-4 mr-2" />
                            Book Now
                          </Link>
                        </Button>

                        <Button
                          asChild
                          variant="outline"
                          className="flex-1 text-xs uppercase tracking-wider font-semibold border-gold/40 hover:border-gold hover:bg-gold/10 py-5 active:scale-95 transition-transform"
                        >
                          <Link href={`/booking?tab=advance&package=${BRIDE_TO_BE_CONFIG.packageKey}`}>
                            <CreditCard className="h-4 w-4 mr-2 text-gold" />
                            Advance Booking
                          </Link>
                        </Button>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            ) : isMehendi ? (
              /* =========================================================================
                 "MEHENDI" ACTIVE VIEW: Populated Sub-Category with Real Image & Booking
                 ========================================================================= */
              <div className="bg-card border border-gold/40 rounded-2xl overflow-hidden shadow-xl ring-1 ring-gold/15">
                <div className="grid grid-cols-1 lg:grid-cols-12">
                  
                  {/* Left Column: Real Photography Visual */}
                  <div className="lg:col-span-5 relative min-h-[320px] lg:min-h-full bg-secondary">
                    <Image
                      src={MEHENDI_CONFIG.image}
                      alt="Mehendi Photography &amp; Videography Nepal"
                      fill
                      sizes="(max-width: 1024px) 100vw, 40vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent lg:hidden" />
                    
                    {/* Floating Status Pill */}
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 rounded-full bg-black/80 backdrop-blur-md text-gold text-xs font-bold uppercase tracking-wider border border-gold/40 shadow-sm flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        <span>Duration: {MEHENDI_CONFIG.duration}</span>
                      </span>
                    </div>

                    {/* Bottom overlay badge on image */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="bg-black/70 backdrop-blur-md rounded-xl p-3 border border-white/10 text-white">
                        <div className="text-[11px] font-semibold text-gold uppercase tracking-wider">
                          Mehendi Celebration
                        </div>
                        <div className="text-xs text-white/90 mt-0.5">
                          {currentConfig.title} &bull; Photo &amp; Video Coverage
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Complete Package Details */}
                  <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6">
                    <div>
                      {/* Section Eyebrow & Duration Badge near Title */}
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-widest text-gold">
                          Ceremonial Celebration &bull; {currentConfig.title}
                        </span>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary border border-border text-xs text-foreground/90 font-medium">
                          <Clock className="h-3.5 w-3.5 text-gold" />
                          <span>Duration: {MEHENDI_CONFIG.duration}</span>
                        </div>
                      </div>

                      <h3 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
                        {MEHENDI_CONFIG.title}
                      </h3>

                      <div className="text-sm text-muted-foreground mt-2.5 leading-relaxed space-y-2">
                        {MEHENDI_CONFIG.description.map((paragraph, pIdx) => (
                          <p key={pIdx}>{paragraph}</p>
                        ))}
                      </div>

                      {/* Coverage Includes Checklist with subtle checkmark SVG icons - NO emojis */}
                      <div className="pt-5 border-t border-border/70 mt-5">
                        <span className="text-xs font-bold uppercase tracking-wider text-foreground block mb-3">
                          Coverage Includes:
                        </span>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {MEHENDI_CONFIG.deliverables.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground/90">
                              <span className="h-4 w-4 rounded-full bg-gold/15 text-gold flex items-center justify-center shrink-0 mt-0.5">
                                <Check className="h-3 w-3" />
                              </span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>

                        {/* Subtle Tagline / Closing Line */}
                        <p className="mt-4 pt-3.5 border-t border-border/50 text-xs sm:text-sm italic text-gold/90 font-serif leading-relaxed">
                          &ldquo;{MEHENDI_CONFIG.closingLine}&rdquo;
                        </p>
                      </div>
                    </div>

                    {/* Pricing & Dual Action Booking Buttons */}
                    <div className="pt-6 border-t border-border/80 space-y-4">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground block">
                            {MEHENDI_CONFIG.priceType}
                          </span>
                          <div className="flex items-baseline gap-2">
                            <span className="font-serif text-2xl sm:text-3xl font-bold text-gold">
                              {MEHENDI_CONFIG.priceLabel}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              (Duration: {MEHENDI_CONFIG.duration})
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[11px] text-muted-foreground block">Booking Status:</span>
                          <span className="text-xs font-semibold text-foreground">Inquiries &amp; Advance Reservations Open</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <Button
                          asChild
                          className="flex-1 bg-gold text-black hover:bg-gold/90 font-bold text-xs uppercase tracking-wider shadow-md py-5 active:scale-95 transition-transform"
                        >
                          <Link href={`/booking?tab=booking&package=${MEHENDI_CONFIG.packageKey}`}>
                            <CalendarCheck className="h-4 w-4 mr-2" />
                            Book Now
                          </Link>
                        </Button>

                        <Button
                          asChild
                          variant="outline"
                          className="flex-1 text-xs uppercase tracking-wider font-semibold border-gold/40 hover:border-gold hover:bg-gold/10 py-5 active:scale-95 transition-transform"
                        >
                          <Link href={`/booking?tab=advance&package=${MEHENDI_CONFIG.packageKey}`}>
                            <CreditCard className="h-4 w-4 mr-2 text-gold" />
                            Advance Booking
                          </Link>
                        </Button>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            ) : isEngagement && currentEngagement ? (
              /* =========================================================================
                 "ENGAGEMENT" ACTIVE VIEW: Shared Content Block with Dynamic Crew & Pricing
                 ========================================================================= */
              <div className="bg-card border border-gold/40 rounded-2xl overflow-hidden shadow-xl ring-1 ring-gold/15">
                <div className="grid grid-cols-1 lg:grid-cols-12">
                  
                  {/* Left Column: Real Photography Visual */}
                  <div className="lg:col-span-5 relative min-h-[320px] lg:min-h-full bg-secondary">
                    <Image
                      src={ENGAGEMENT_CONFIG.image}
                      alt="Engagement Photography &amp; Videography Nepal"
                      fill
                      sizes="(max-width: 1024px) 100vw, 40vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent lg:hidden" />
                    
                    {/* Floating Status Pill */}
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 rounded-full bg-black/80 backdrop-blur-md text-gold text-xs font-bold uppercase tracking-wider border border-gold/40 shadow-sm flex items-center gap-1.5">
                        <Users className="h-3 w-3" />
                        <span>Crew: {currentEngagement.crew}</span>
                      </span>
                    </div>

                    {/* Bottom overlay badge on image */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="bg-black/70 backdrop-blur-md rounded-xl p-3 border border-white/10 text-white">
                        <div className="text-[11px] font-semibold text-gold uppercase tracking-wider">
                          Engagement Celebration
                        </div>
                        <div className="text-xs text-white/90 mt-0.5">
                          {currentConfig.title} &bull; {currentEngagement.crew}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Complete Package Details */}
                  <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6">
                    <div>
                      {/* Section Eyebrow & Crew Badge near Title */}
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-widest text-gold">
                          Ceremonial Celebration &bull; {currentConfig.title}
                        </span>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary border border-border text-xs text-foreground/90 font-medium">
                          <Users className="h-3.5 w-3.5 text-gold" />
                          <span>Crew: {currentEngagement.crew}</span>
                        </div>
                      </div>

                      <h3 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
                        {ENGAGEMENT_CONFIG.title}
                      </h3>

                      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                        {ENGAGEMENT_CONFIG.description}
                      </p>

                      {/* Coverage Includes Checklist with subtle checkmark SVG icons - NO emojis */}
                      <div className="pt-5 border-t border-border/70 mt-5">
                        <span className="text-xs font-bold uppercase tracking-wider text-foreground block mb-3">
                          Coverage Includes:
                        </span>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {ENGAGEMENT_CONFIG.deliverables.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground/90">
                              <span className="h-4 w-4 rounded-full bg-gold/15 text-gold flex items-center justify-center shrink-0 mt-0.5">
                                <Check className="h-3 w-3" />
                              </span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Pricing & Dual Action Booking Buttons */}
                    <div className="pt-6 border-t border-border/80 space-y-4">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground block">
                            {currentEngagement.priceType}
                          </span>
                          <div className="flex items-baseline gap-2">
                            <span className="font-serif text-2xl sm:text-3xl font-bold text-gold">
                              {currentEngagement.priceLabel}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              ({currentEngagement.tag})
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[11px] text-muted-foreground block">Assigned Crew:</span>
                          <span className="text-xs font-semibold text-foreground">{currentEngagement.crew}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <Button
                          asChild
                          className="flex-1 bg-gold text-black hover:bg-gold/90 font-bold text-xs uppercase tracking-wider shadow-md py-5 active:scale-95 transition-transform"
                        >
                          <Link href={`/booking?tab=booking&package=${currentEngagement.packageKey}`}>
                            <CalendarCheck className="h-4 w-4 mr-2" />
                            Book Now
                          </Link>
                        </Button>

                        <Button
                          asChild
                          variant="outline"
                          className="flex-1 text-xs uppercase tracking-wider font-semibold border-gold/40 hover:border-gold hover:bg-gold/10 py-5 active:scale-95 transition-transform"
                        >
                          <Link href={`/booking?tab=advance&package=${currentEngagement.packageKey}`}>
                            <CreditCard className="h-4 w-4 mr-2 text-gold" />
                            Advance Booking
                          </Link>
                        </Button>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            ) : isMarriage && currentMarriage ? (
              /* =========================================================================
                 "MARRIAGE" ACTIVE VIEW: Populated Sub-Category with Real Image & Booking
                 ========================================================================= */
              <div className="bg-card border border-gold/40 rounded-2xl overflow-hidden shadow-xl ring-1 ring-gold/15">
                <div className="grid grid-cols-1 lg:grid-cols-12">
                  
                  {/* Left Column: Real Photography Visual */}
                  <div className="lg:col-span-5 relative min-h-[320px] lg:min-h-full bg-secondary">
                    <Image
                      src={MARRIAGE_CONFIG.image}
                      alt="Wedding Moment Pokhara Marriage Photography Nepal"
                      fill
                      sizes="(max-width: 1024px) 100vw, 40vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent lg:hidden" />
                    
                    {/* Floating Duration Pill */}
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 rounded-full bg-black/80 backdrop-blur-md text-gold text-xs font-bold uppercase tracking-wider border border-gold/40 shadow-sm flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        <span>Duration: {currentMarriage.duration}</span>
                      </span>
                    </div>

                    {/* Bottom overlay badge on image */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="bg-black/70 backdrop-blur-md rounded-xl p-3 border border-white/10 text-white">
                        <div className="text-[11px] font-semibold text-gold uppercase tracking-wider">
                          Marriage Ceremony
                        </div>
                        <div className="text-xs text-white/90 mt-0.5">
                          {currentConfig.title} &bull; Photography &amp; Cinematography
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Complete Package Details */}
                  <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6">
                    <div>
                      {/* Section Eyebrow & Duration Badge near Title */}
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-widest text-gold">
                          Marriage Day Coverage &bull; {currentConfig.title}
                        </span>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary border border-border text-xs text-foreground/90 font-medium">
                          <Clock className="h-3.5 w-3.5 text-gold" />
                          <span>Duration: {currentMarriage.duration}</span>
                        </div>
                      </div>

                      <h3 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
                        {MARRIAGE_CONFIG.title}
                      </h3>

                      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                        {MARRIAGE_CONFIG.description}
                      </p>

                      {/* Package Includes Checklist with subtle checkmark SVG icons - NO emojis */}
                      <div className="pt-5 border-t border-border/70 mt-5">
                        <span className="text-xs font-bold uppercase tracking-wider text-foreground block mb-3">
                          Package Includes:
                        </span>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {MARRIAGE_CONFIG.deliverables.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground/90">
                              <span className="h-4 w-4 rounded-full bg-gold/15 text-gold flex items-center justify-center shrink-0 mt-0.5">
                                <Check className="h-3 w-3" />
                              </span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>

                        {/* Subtle Closing Line */}
                        <p className="mt-4 pt-3.5 border-t border-border/50 text-xs sm:text-sm italic text-gold/90 font-serif leading-relaxed">
                          &ldquo;{MARRIAGE_CONFIG.closingLine}&rdquo;
                        </p>
                      </div>
                    </div>

                    {/* Pricing & Dual Action Booking Buttons */}
                    <div className="pt-6 border-t border-border/80 space-y-4">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground block">
                            {currentMarriage.priceType}
                          </span>
                          <div className="flex items-baseline gap-2">
                            <span className="font-serif text-2xl sm:text-3xl font-bold text-gold">
                              {currentMarriage.priceLabel}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              (Duration: {currentMarriage.duration})
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[11px] text-muted-foreground block">Booking Status:</span>
                          <span className="text-xs font-semibold text-foreground">Inquiries &amp; Advance Reservations Open</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <Button
                          asChild
                          className="flex-1 bg-gold text-black hover:bg-gold/90 font-bold text-xs uppercase tracking-wider shadow-md py-5 active:scale-95 transition-transform"
                        >
                          <Link href={`/booking?tab=booking&package=${currentMarriage.packageKey}`}>
                            <CalendarCheck className="h-4 w-4 mr-2" />
                            Book Now
                          </Link>
                        </Button>

                        <Button
                          asChild
                          variant="outline"
                          className="flex-1 text-xs uppercase tracking-wider font-semibold border-gold/40 hover:border-gold hover:bg-gold/10 py-5 active:scale-95 transition-transform"
                        >
                          <Link href={`/booking?tab=advance&package=${currentMarriage.packageKey}`}>
                            <CreditCard className="h-4 w-4 mr-2 text-gold" />
                            Advance Booking
                          </Link>
                        </Button>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            ) : isReception && currentReception ? (
              /* =========================================================================
                 "RECEPTION" ACTIVE VIEW: Populated Sub-Category with Real Image & Booking
                 ========================================================================= */
              <div className="bg-card border border-gold/40 rounded-2xl overflow-hidden shadow-xl ring-1 ring-gold/15">
                <div className="grid grid-cols-1 lg:grid-cols-12">
                  
                  {/* Left Column: Real Photography Visual */}
                  <div className="lg:col-span-5 relative min-h-[320px] lg:min-h-full bg-secondary">
                    <Image
                      src={RECEPTION_CONFIG.image}
                      alt="Wedding Reception Photography Nepal"
                      fill
                      sizes="(max-width: 1024px) 100vw, 40vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent lg:hidden" />
                    
                    {/* Floating Duration Pill */}
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 rounded-full bg-black/80 backdrop-blur-md text-gold text-xs font-bold uppercase tracking-wider border border-gold/40 shadow-sm flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        <span>Duration: {currentReception.duration}</span>
                      </span>
                    </div>

                    {/* Bottom overlay badge on image */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="bg-black/70 backdrop-blur-md rounded-xl p-3 border border-white/10 text-white">
                        <div className="text-[11px] font-semibold text-gold uppercase tracking-wider">
                          Reception Celebration
                        </div>
                        <div className="text-xs text-white/90 mt-0.5">
                          {currentConfig.title} &bull; Evening Party &amp; Memories
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Complete Package Details */}
                  <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6">
                    <div>
                      {/* Section Eyebrow & Duration Badge near Title */}
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-widest text-gold">
                          Evening Celebration &bull; {currentConfig.title}
                        </span>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary border border-border text-xs text-foreground/90 font-medium">
                          <Clock className="h-3.5 w-3.5 text-gold" />
                          <span>Duration: {currentReception.duration}</span>
                        </div>
                      </div>

                      <h3 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
                        {RECEPTION_CONFIG.title}
                      </h3>

                      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                        {RECEPTION_CONFIG.description}
                      </p>

                      {/* Package Includes Checklist with subtle checkmark SVG icons - NO emojis */}
                      <div className="pt-5 border-t border-border/70 mt-5">
                        <span className="text-xs font-bold uppercase tracking-wider text-foreground block mb-3">
                          Reception Includes:
                        </span>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {RECEPTION_CONFIG.deliverables.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground/90">
                              <span className="h-4 w-4 rounded-full bg-gold/15 text-gold flex items-center justify-center shrink-0 mt-0.5">
                                <Check className="h-3 w-3" />
                              </span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Pricing & Dual Action Booking Buttons */}
                    <div className="pt-6 border-t border-border/80 space-y-4">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground block">
                            {currentReception.priceType}
                          </span>
                          <div className="flex items-baseline gap-2">
                            <span className="font-serif text-2xl sm:text-3xl font-bold text-gold">
                              {currentReception.priceLabel}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              (Duration: {currentReception.duration})
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[11px] text-muted-foreground block">Booking Status:</span>
                          <span className="text-xs font-semibold text-foreground">Inquiries &amp; Advance Reservations Open</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <Button
                          asChild
                          className="flex-1 bg-gold text-black hover:bg-gold/90 font-bold text-xs uppercase tracking-wider shadow-md py-5 active:scale-95 transition-transform"
                        >
                          <Link href={`/booking?tab=booking&package=${currentReception.packageKey}`}>
                            <CalendarCheck className="h-4 w-4 mr-2" />
                            Book Now
                          </Link>
                        </Button>

                        <Button
                          asChild
                          variant="outline"
                          className="flex-1 text-xs uppercase tracking-wider font-semibold border-gold/40 hover:border-gold hover:bg-gold/10 py-5 active:scale-95 transition-transform"
                        >
                          <Link href={`/booking?tab=advance&package=${currentReception.packageKey}`}>
                            <CreditCard className="h-4 w-4 mr-2 text-gold" />
                            Advance Booking
                          </Link>
                        </Button>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            ) : isPostShoot && currentPostShoot ? (
              /* =========================================================================
                 "POST SHOOT" ACTIVE VIEW: Populated Sub-Category with Real Image & Booking
                 ========================================================================= */
              <div className="bg-card border border-gold/40 rounded-2xl overflow-hidden shadow-xl ring-1 ring-gold/15">
                <div className="grid grid-cols-1 lg:grid-cols-12">
                  
                  {/* Left Column: Real Photography Visual */}
                  <div className="lg:col-span-5 relative min-h-[320px] lg:min-h-full bg-secondary">
                    <Image
                      src={POST_SHOOT_CONFIG.image}
                      alt="Post Shoot Photography Nepal"
                      fill
                      priority
                      quality={95}
                      unoptimized
                      sizes="(max-width: 1024px) 100vw, 40vw"
                      className="object-cover object-top"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent lg:hidden" />
                    
                    {/* Floating Duration Pill */}
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 rounded-full bg-black/80 backdrop-blur-md text-gold text-xs font-bold uppercase tracking-wider border border-gold/40 shadow-sm flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        <span>Duration: {currentPostShoot.duration}</span>
                      </span>
                    </div>

                    {/* Bottom overlay badge on image */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="bg-black/70 backdrop-blur-md rounded-xl p-3 border border-white/10 text-white">
                        <div className="text-[11px] font-semibold text-gold uppercase tracking-wider">
                          Post Wedding Shoot
                        </div>
                        <div className="text-xs text-white/90 mt-0.5">
                          {currentConfig.title} &bull; Romantic Couple Session
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Complete Package Details */}
                  <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6">
                    <div>
                      {/* Section Eyebrow & Duration Badge near Title */}
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-widest text-gold">
                          Newly Married Couple &bull; {currentConfig.title}
                        </span>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary border border-border text-xs text-foreground/90 font-medium">
                          <Clock className="h-3.5 w-3.5 text-gold" />
                          <span>Duration: {currentPostShoot.duration}</span>
                        </div>
                      </div>

                      <h3 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
                        {POST_SHOOT_CONFIG.title}
                      </h3>

                      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                        {POST_SHOOT_CONFIG.description}
                      </p>

                      {/* Package Includes Checklist with subtle checkmark SVG icons - NO emojis */}
                      <div className="pt-5 border-t border-border/70 mt-5">
                        <span className="text-xs font-bold uppercase tracking-wider text-foreground block mb-3">
                          Includes:
                        </span>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {POST_SHOOT_CONFIG.deliverables.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground/90">
                              <span className="h-4 w-4 rounded-full bg-gold/15 text-gold flex items-center justify-center shrink-0 mt-0.5">
                                <Check className="h-3 w-3" />
                              </span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Pricing & Dual Action Booking Buttons */}
                    <div className="pt-6 border-t border-border/80 space-y-4">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground block">
                            {currentPostShoot.priceType}
                          </span>
                          <div className="flex items-baseline gap-2">
                            <span className="font-serif text-2xl sm:text-3xl font-bold text-gold">
                              {currentPostShoot.priceLabel}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              (Duration: {currentPostShoot.duration})
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[11px] text-muted-foreground block">Booking Status:</span>
                          <span className="text-xs font-semibold text-foreground">Inquiries &amp; Reservations Open</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <Button
                          asChild
                          className="flex-1 bg-gold text-black hover:bg-gold/90 font-bold text-xs uppercase tracking-wider shadow-md py-5 active:scale-95 transition-transform"
                        >
                          <Link href={`/booking?tab=booking&package=${currentPostShoot.packageKey}`}>
                            <CalendarCheck className="h-4 w-4 mr-2" />
                            Book Now
                          </Link>
                        </Button>

                        <Button
                          asChild
                          variant="outline"
                          className="flex-1 text-xs uppercase tracking-wider font-semibold border-gold/40 hover:border-gold hover:bg-gold/10 py-5 active:scale-95 transition-transform"
                        >
                          <Link href={`/booking?tab=advance&package=${currentPostShoot.packageKey}`}>
                            <CreditCard className="h-4 w-4 mr-2 text-gold" />
                            Advance Booking
                          </Link>
                        </Button>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            ) : (
              /* =========================================================================
                 STANDALONE SUB-CATEGORY EVENT VIEW: Placeholder Card (Details coming soon)
                 ========================================================================= */
              <div className="bg-card border border-border/80 rounded-2xl p-6 sm:p-10 lg:p-12 shadow-md relative overflow-hidden">
                <div className="max-w-2xl mx-auto text-center space-y-5">
                  
                  {/* Category breadcrumb */}
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-xs font-semibold text-muted-foreground border border-border">
                    <span>{currentConfig.title}</span>
                    <span>&rarr;</span>
                    <span className="text-foreground">{activeSubCat}</span>
                  </div>

                  {/* Status icon & title */}
                  <div className="h-14 w-14 rounded-2xl bg-gold/10 border border-gold/30 text-gold flex items-center justify-center mx-auto shadow-sm">
                    <Clock className="h-7 w-7" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
                      {activeSubCat} Coverage ({currentConfig.title})
                    </h3>
                    <div className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-gold text-xs font-bold uppercase tracking-wider">
                      Details Coming Soon
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed max-w-lg mx-auto">
                    Specific single-event package rates, deliverables, and timeline schedules for <strong>{activeSubCat}</strong> are currently being prepared. 
                    In the meantime, this ceremony is fully covered in our <strong>All Included</strong> package.
                  </p>

                  {/* Guidance Card with Switch to All Included & WhatsApp */}
                  <div className="bg-secondary/40 border border-border rounded-xl p-5 text-left space-y-3 mt-4">
                    <div className="flex items-start gap-3">
                      <Sparkles className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                      <div className="text-xs space-y-1">
                        <span className="font-bold text-foreground block">
                          Want comprehensive coverage for your wedding?
                        </span>
                        <p className="text-muted-foreground">
                          Our {currentConfig.title} <strong>All Included</strong> package covers {activeSubCat} along with all other key ceremonies for <strong>{currentConfig.priceLabel}</strong>.
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-wrap items-center gap-3">
                      <Button
                        type="button"
                        onClick={() => setActiveSubCat('All Included')}
                        className="bg-gold text-black hover:bg-gold/90 font-bold text-xs"
                      >
                        <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                        View All Included ({currentConfig.priceLabel})
                      </Button>

                      <Button
                        asChild
                        variant="outline"
                        className="text-xs border-border hover:border-gold/50"
                      >
                        <a
                          href={`https://wa.me/9779856010315?text=Hi%2C%20I%20would%20like%20a%20custom%20quote%20for%20${encodeURIComponent(currentConfig.title)}%20-%20${encodeURIComponent(activeSubCat)}.`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <MessageCircle className="h-3.5 w-3.5 mr-1.5 text-emerald-500" />
                          Inquire for Custom Quote
                        </a>
                      </Button>
                    </div>
                  </div>

                  {/* Explicitly Hidden / Disabled State for Single-Event Bookings as requested */}
                  <div className="pt-4 border-t border-border/60 text-xs text-muted-foreground flex items-center justify-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                    <span>Single-event online booking for &quot;{activeSubCat}&quot; will open soon. Please use &quot;All Included&quot; or WhatsApp above.</span>
                  </div>

                </div>
              </div>
            )}
          </div>

          {/* Bottom FAQ / Assurance Banner */}
          <div className="mt-16 bg-card border border-border/80 rounded-2xl p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-gold font-serif font-bold text-base">
                <Camera className="h-4 w-4" />
                <span>Professional Gear</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Full-frame Sony &amp; Canon bodies, prime lenses for low-light rituals, wireless audio systems, and DJI stabilized gimbals.
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-gold font-serif font-bold text-base">
                <Video className="h-4 w-4" />
                <span>Cinematic Reels</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Social media teaser reels formatted in 9:16 vertical 4K, color graded to match your aesthetic and ready to share within 72 hours.
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-gold font-serif font-bold text-base">
                <ShieldCheck className="h-4 w-4" />
                <span>Reliable Booking</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Secure your wedding date online using eSewa or Khalti with digital contract confirmation and prompt direct support.
              </p>
            </div>
          </div>

        </section>
      </main>

      <Footer />
    </div>
  )
}
