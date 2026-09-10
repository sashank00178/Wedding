'use client'

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Sparkles,
  ArrowRight,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Calendar,
  Layers,
  Camera,
  HeartHandshake,
} from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { Header } from '@/components/site/header'
import { Footer } from '@/components/site/footer'
import { Button } from '@/components/ui/button'
import {
  GALLERY_ITEMS,
  GALLERY_CATEGORY_LABELS,
  GALLERY_SUBCATEGORY_LABELS,
  INDOOR_SUBCATEGORIES,
  WEDDING_SUBCATEGORIES,
  type GalleryCategory,
  type GalleryItem,
} from '@/lib/site'
import { WhatsAppButton } from '@/components/site/whatsapp-button'
import { cn } from '@/lib/utils'

type Filter = 'all' | GalleryCategory

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All Work' },
  { key: 'wedding', label: 'Wedding Photo Shoots' },
  { key: 'portrait', label: 'Indoor Photo Shoots' },
]

function GalleryContent() {
  const searchParams = useSearchParams()
  const categoryParam = searchParams.get('category')?.toLowerCase()

  const [filter, setFilter] = React.useState<Filter>(() => {
    if (categoryParam === 'indoor' || categoryParam === 'portrait') return 'portrait'
    if (categoryParam === 'wedding' || categoryParam === 'weddings') return 'wedding'
    return 'all'
  })

  // Sub-category filters
  const [indoorSubcategory, setIndoorSubcategory] = React.useState<string>('all')
  const [weddingSubcategory, setWeddingSubcategory] = React.useState<string>('all-included')

  // Synchronize if user navigates between query parameters
  React.useEffect(() => {
    if (categoryParam === 'indoor' || categoryParam === 'portrait') {
      setFilter('portrait')
    } else if (categoryParam === 'wedding' || categoryParam === 'weddings') {
      setFilter('wedding')
    } else if (categoryParam === 'all') {
      setFilter('all')
    }
  }, [categoryParam])

  const [galleryItems, setGalleryItems] = React.useState<GalleryItem[]>(GALLERY_ITEMS)
  const [activePhotoIndex, setActivePhotoIndex] = React.useState<number | null>(null)

  React.useEffect(() => {
    fetch('/api/site-data')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.gallery && data.gallery.length > 0) {
          setGalleryItems(data.gallery)
        }
      })
      .catch(() => {})
  }, [])

  const filteredItems = React.useMemo(() => {
    if (filter === 'all') return galleryItems

    const catItems = galleryItems.filter((item) => item.category === filter)

    if (filter === 'portrait') {
      if (indoorSubcategory === 'all') return catItems
      return catItems.filter((item) => item.subcategory === indoorSubcategory)
    }

    if (filter === 'wedding') {
      if (weddingSubcategory === 'all-included') return catItems
      return catItems.filter((item) => item.subcategory === weddingSubcategory)
    }

    return catItems
  }, [filter, indoorSubcategory, weddingSubcategory, galleryItems])

  // Keyboard navigation for lightbox
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activePhotoIndex === null) return
      if (e.key === 'Escape') setActivePhotoIndex(null)
      if (e.key === 'ArrowRight') {
        setActivePhotoIndex((prev) =>
          prev !== null ? (prev + 1) % filteredItems.length : null
        )
      }
      if (e.key === 'ArrowLeft') {
        setActivePhotoIndex((prev) =>
          prev !== null
            ? (prev - 1 + filteredItems.length) % filteredItems.length
            : null
        )
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activePhotoIndex, filteredItems.length])

  const currentPhoto = activePhotoIndex !== null ? filteredItems[activePhotoIndex] : null

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 pt-14 sm:pt-16 pb-16">
        {/* Gallery Hero Banner */}
        <section className="py-7 sm:py-9 bg-secondary/30 border-b border-border/80 text-center">
          <div className="container mx-auto max-w-3xl px-4 sm:px-6">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gold/15 border border-gold/30 text-gold text-[11px] font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="h-3 w-3" />
              Full Portfolio Collection
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground mb-2.5">
              Our Visual Portfolio &amp;{' '}
              <span className="text-gold italic">Stories</span>
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Explore authentic wedding moments and fine-art indoor portraits photographed across Pokhara and throughout Nepal.
            </p>

            {/* Main Category Filter Pills */}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-1.5">
              {FILTERS.map((f) => {
                const count =
                  f.key === 'all'
                    ? galleryItems.length
                    : galleryItems.filter((item) => item.category === f.key).length

                return (
                  <button
                    key={f.key}
                    onClick={() => {
                      setFilter(f.key)
                      setActivePhotoIndex(null)
                      if (f.key === 'portrait') setIndoorSubcategory('all')
                      if (f.key === 'wedding') setWeddingSubcategory('all-included')
                    }}
                    className={cn(
                      'px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all border flex items-center gap-1.5',
                      filter === f.key
                        ? 'bg-gold text-black border-gold shadow-sm font-bold scale-[1.02]'
                        : 'bg-card text-foreground/80 border-border hover:border-gold/50 hover:text-foreground'
                    )}
                  >
                    <span>{f.label}</span>
                    <span
                      className={cn(
                        'text-[10px] px-1.5 py-0.2 rounded-full font-bold',
                        filter === f.key
                          ? 'bg-black/20 text-black'
                          : 'bg-secondary text-muted-foreground'
                      )}
                    >
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Sub-Category Pills for Indoor Photo Shoots */}
            {filter === 'portrait' && (
              <div className="mt-6 pt-5 border-t border-border/60 animate-in fade-in-50 duration-300">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Layers className="h-3.5 w-3.5 text-gold shrink-0" />
                  <span className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
                    Indoor Categories:
                  </span>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none sm:flex-wrap sm:justify-center px-1">
                  {INDOOR_SUBCATEGORIES.map((sub) => {
                    const isActive = indoorSubcategory === sub.key
                    const count =
                      sub.key === 'all'
                        ? galleryItems.filter((p) => p.category === 'portrait').length
                        : galleryItems.filter(
                            (p) => p.category === 'portrait' && p.subcategory === sub.key
                          ).length

                    return (
                      <button
                        key={sub.key}
                        onClick={() => {
                          setIndoorSubcategory(sub.key)
                          setActivePhotoIndex(null)
                        }}
                        className={cn(
                          'px-3.5 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all whitespace-nowrap shrink-0 border flex items-center gap-1.5 shadow-sm',
                          isActive
                            ? 'bg-gold text-black border-gold font-bold shadow-md scale-[1.02]'
                            : 'bg-card/85 text-foreground/85 border-border/80 hover:border-gold/50 hover:text-foreground hover:scale-[1.02]'
                        )}
                      >
                        <span>{sub.label}</span>
                        <span
                          className={cn(
                            'text-[10px] px-1.5 py-0.2 rounded-full font-bold',
                            isActive
                              ? 'bg-black/20 text-black'
                              : 'bg-secondary text-muted-foreground'
                          )}
                        >
                          {count}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Sub-Category Pills for Wedding Photo Shoots */}
            {filter === 'wedding' && (
              <div className="mt-6 pt-5 border-t border-border/60 animate-in fade-in-50 duration-300">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Layers className="h-3.5 w-3.5 text-gold shrink-0" />
                  <span className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
                    Wedding Ceremonial Events:
                  </span>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none sm:flex-wrap sm:justify-center px-1">
                  {WEDDING_SUBCATEGORIES.map((sub) => {
                    const isActive = weddingSubcategory === sub.key
                    const isAllIncluded = sub.key === 'all-included'
                    const count = isAllIncluded
                      ? galleryItems.filter((p) => p.category === 'wedding').length
                      : galleryItems.filter(
                          (p) => p.category === 'wedding' && p.subcategory === sub.key
                        ).length

                    return (
                      <button
                        key={sub.key}
                        onClick={() => {
                          setWeddingSubcategory(sub.key)
                          setActivePhotoIndex(null)
                        }}
                        className={cn(
                          'px-3.5 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all whitespace-nowrap shrink-0 border flex items-center gap-1.5 shadow-sm',
                          isActive
                            ? 'bg-gold text-black border-gold font-bold shadow-md scale-[1.02]'
                            : isAllIncluded
                            ? 'bg-card/90 text-foreground border-gold/40 hover:border-gold hover:text-foreground hover:scale-[1.02]'
                            : 'bg-card/85 text-foreground/85 border-border/80 hover:border-gold/50 hover:text-foreground hover:scale-[1.02]'
                        )}
                      >
                        <span>{sub.label}</span>
                        {sub.badge && (
                          <span
                            className={cn(
                              'text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded-full',
                              isActive
                                ? 'bg-black/25 text-black'
                                : 'bg-gold/20 text-gold border border-gold/30'
                            )}
                          >
                            {sub.badge}
                          </span>
                        )}
                        <span
                          className={cn(
                            'text-[10px] px-1.5 py-0.2 rounded-full font-bold',
                            isActive
                              ? 'bg-black/20 text-black'
                              : 'bg-secondary text-muted-foreground'
                          )}
                        >
                          {count}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Gallery Grid */}
        <section className="py-8 sm:py-12">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 transition-all duration-300">
              {filteredItems.map((photo, index) => (
                <div
                  key={`${photo.src}-${index}`}
                  onClick={() => setActivePhotoIndex(index)}
                  className="group relative cursor-pointer overflow-hidden rounded-2xl bg-card border border-border/80 shadow-sm hover:shadow-xl hover:border-gold/50 transition-all duration-300"
                >
                  <div className="relative aspect-[4/5] w-full overflow-hidden bg-secondary">
                    <Image
                      src={photo.src}
                      alt={photo.title}
                      fill
                      loading="lazy"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />

                    {/* Quick zoom icon */}
                    <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="h-7 w-7 rounded-full bg-black/60 text-white flex items-center justify-center">
                        <Maximize2 className="h-3.5 w-3.5" />
                      </div>
                    </div>

                    {/* Bottom details */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <h3 className="font-serif text-base sm:text-lg font-bold leading-tight">
                        {photo.title}
                      </h3>
                      <p className="text-xs text-white/80 line-clamp-2 mt-1 leading-relaxed">
                        {photo.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredItems.length === 0 && (
              <div className="text-center py-16 px-4 max-w-md mx-auto my-8 bg-card/60 rounded-2xl border border-dashed border-border/80">
                <Layers className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                <h3 className="font-serif text-lg font-semibold text-foreground mb-1">
                  No photos in this category yet
                </h3>
                <p className="text-xs text-muted-foreground mb-5 leading-relaxed">
                  We haven't uploaded photographs for this specific session yet. Browse our other collections or check back soon!
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (filter === 'portrait') setIndoorSubcategory('all')
                    if (filter === 'wedding') setWeddingSubcategory('all-included')
                    if (filter === 'all') setFilter('all')
                  }}
                  className="border-gold/40 text-gold hover:bg-gold/10 text-xs"
                >
                  Show All {filter === 'wedding' ? 'Wedding' : 'Indoor'} Photos
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Shooting Locations Guide */}
        <section className="py-16 bg-secondary/20 border-t border-border/70">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold uppercase tracking-widest text-gold">Pokhara Backdrops</span>
              <h2 className="font-serif text-3xl font-bold mt-1">Our Favorite Shoot Locations</h2>
              <p className="text-sm text-muted-foreground mt-2">
                We know every hidden angle and golden hour spot across the valley to make your photographs extraordinary.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { title: 'Phewa Lake Shoreline', desc: 'Serene reflections, wooden boats, and misty mountain horizons.' },
                { title: 'Sarangkot Sunrise', desc: 'Breathtaking dawn light casting golden hues over the Annapurnas.' },
                { title: 'Begnas Lake & Pame', desc: 'Tranquil countryside, lush green terraces, and quiet waters.' },
                { title: 'Lakeside Indoor Studio', desc: 'Controlled editorial strobes, luxury textured backdrops, and privacy.' },
              ].map((loc, i) => (
                <div key={i} className="bg-card border border-border rounded-xl p-5 shadow-sm">
                  <h3 className="font-serif text-base font-bold text-foreground mb-1">{loc.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{loc.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-16 bg-card border-t border-border text-center">
          <div className="container mx-auto max-w-3xl px-4">
            <h2 className="font-serif text-3xl font-bold mb-3">Like What You See?</h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto mb-8 leading-relaxed">
              Every photograph begins with a conversation. Let us create timeless memories of your wedding or personal session.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button asChild className="bg-gold text-black hover:bg-gold/90 font-semibold text-sm">
                <Link href="/#booking">
                  Reserve Your Date
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </Link>
              </Button>
              <WhatsAppButton variant="navbar" className="text-sm" />
            </div>
          </div>
        </section>
      </main>

      {/* Lightbox Modal */}
      {currentPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in-0 duration-200"
          onClick={() => setActivePhotoIndex(null)}
        >
          {/* Close button */}
          <button
            onClick={() => setActivePhotoIndex(null)}
            className="absolute top-5 right-5 z-50 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            aria-label="Close lightbox"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Prev button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              setActivePhotoIndex((prev) =>
                prev !== null ? (prev - 1 + filteredItems.length) % filteredItems.length : null
              )
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-50 h-11 w-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            aria-label="Previous photograph"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          {/* Next button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              setActivePhotoIndex((prev) =>
                prev !== null ? (prev + 1) % filteredItems.length : null
              )
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-50 h-11 w-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            aria-label="Next photograph"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Center photo container */}
          <div
            className="max-w-4xl w-full max-h-[90vh] flex flex-col items-center justify-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] max-h-[70vh] rounded-xl overflow-hidden shadow-2xl border border-white/10">
              <Image
                src={currentPhoto.src}
                alt={currentPhoto.title}
                fill
                sizes="100vw"
                className="object-contain"
                priority
              />
            </div>

            <div className="w-full text-center text-white px-4">
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="text-[10px] uppercase font-bold tracking-widest text-gold px-2.5 py-0.5 rounded bg-gold/20">
                  {GALLERY_CATEGORY_LABELS[currentPhoto.category] || currentPhoto.category}
                </span>
                {currentPhoto.subcategory && (
                  <span className="text-[10px] uppercase font-bold tracking-widest text-black bg-gold px-2.5 py-0.5 rounded shadow-sm">
                    {GALLERY_SUBCATEGORY_LABELS[currentPhoto.subcategory] || currentPhoto.subcategory}
                  </span>
                )}
                <h2 className="font-serif text-xl font-bold">{currentPhoto.title}</h2>
              </div>
              <p className="text-xs sm:text-sm text-white/80 max-w-xl mx-auto leading-relaxed">
                {currentPhoto.description}
              </p>
              <div className="mt-4 flex items-center justify-center gap-3">
                <Button asChild size="sm" className="bg-gold text-black hover:bg-gold/90 font-semibold text-xs">
                  <Link href="/#booking">
                    Book a Shoot Like This
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}

export default function GalleryPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-background" />}>
      <GalleryContent />
    </React.Suspense>
  )
}
