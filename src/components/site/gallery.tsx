'use client'

import * as React from 'react'
import Image from 'next/image'
import { Section, SectionTitle } from '@/components/site/section'
import { GALLERY_ITEMS, type GalleryCategory, type GalleryItem } from '@/lib/site'
import { cn } from '@/lib/utils'

type Filter = 'all' | GalleryCategory

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'portrait', label: 'Portrait' },
  { key: 'wedding', label: 'Wedding' },
  { key: 'commercial', label: 'Commercial' },
  { key: 'event', label: 'Event' },
]

export function Gallery() {
  const [filter, setFilter] = React.useState<Filter>('all')
  const [galleryItems, setGalleryItems] = React.useState<GalleryItem[]>(GALLERY_ITEMS)

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

  const items = React.useMemo(() => {
    if (filter === 'all') return galleryItems
    return galleryItems.filter((item) => item.category === filter)
  }, [filter, galleryItems])

  return (
    <Section id="gallery" className="py-20 sm:py-28 bg-secondary/40">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow="Selected work"
          title="Our Portfolio"
          subtitle="Explore our collection of stunning photography work from sessions across Nepal."
        />

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                'px-5 py-2 rounded-full text-sm font-medium tracking-wide transition-all border',
                filter === f.key
                  ? 'bg-gold text-black border-gold shadow-md'
                  : 'bg-card text-foreground/70 border-border hover:border-gold/50 hover:text-foreground'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item, idx) => (
            <figure
              key={`${item.src}-${idx}`}
              className={cn(
                'group relative overflow-hidden rounded-xl border border-border bg-card shadow-sm',
                'hover:shadow-2xl transition-all duration-300'
              )}
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-foreground/10">
                <Image
                  src={item.src}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {/* Strong bottom gradient guarantees white caption text is
                    readable on any photo — including bright wedding shots
                    that previously washed out in light/day mode. */}
                <div
                  className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent transition-opacity duration-300"
                  aria-hidden
                />
                <figcaption className="absolute bottom-0 left-0 right-0 p-5 text-white drop-shadow-md">
                  <span className="text-[10px] uppercase tracking-[0.25em] text-gold">
                    {item.category}
                  </span>
                  <h3 className="font-serif text-lg font-semibold mt-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-white/85 mt-1 max-h-0 opacity-0 group-hover:max-h-24 group-hover:opacity-100 transition-all duration-300 overflow-hidden">
                    {item.description}
                  </p>
                </figcaption>
              </div>
            </figure>
          ))}
        </div>
      </div>
    </Section>
  )
}
