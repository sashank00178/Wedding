'use client'

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Section, SectionTitle } from '@/components/site/section'
import { type GalleryItem } from '@/lib/site'
import { cn } from '@/lib/utils'

interface CategoryCard {
  title: string
  subtitle: string
  href: string
  imageSrc: string
}

export function Gallery() {
  const [galleryItems, setGalleryItems] = React.useState<GalleryItem[]>([])

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

  // Pick top representative featured photo from indoor collection
  const indoorFeatured = React.useMemo(() => {
    const found = galleryItems.find(
      (item) => item.category === 'portrait' && item.src.includes('DSC06372')
    )
    return found?.src || '/gallery/indoor/DSC06372.jpg'
  }, [galleryItems])

  // Pick top representative featured photo from wedding collection
  const weddingFeatured = React.useMemo(() => {
    const found = galleryItems.find(
      (item) => item.category === 'wedding' && (item.src.includes('reception') || item.src.includes('bridetobe1'))
    )
    return found?.src || '/gallery/weddings/reception.jpg'
  }, [galleryItems])

  const categories: CategoryCard[] = [
    {
      title: 'Indoor Photo Shoots',
      subtitle:
        'Explore our indoor photography collection — fine-art portraits, graduation milestones, couple sessions, and intimate studio moments.',
      href: '/gallery?category=indoor',
      imageSrc: indoorFeatured,
    },
    {
      title: 'Wedding Photo Shoots',
      subtitle:
        'Explore our wedding photography collection — sacred ceremonial rituals, radiant bridal moments, mehendi joy, and grand receptions.',
      href: '/gallery?category=wedding',
      imageSrc: weddingFeatured,
    },
  ]

  return (
    <Section id="gallery" className="py-20 sm:py-28 bg-secondary/40">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow="Visual Portfolio"
          title="Our Work"
          subtitle="Explore our curated photography across two signature realms. Select a category below to browse the full high-resolution gallery."
        />

        {/* Two Clean, Equal-Sized Category Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 mt-10">
          {categories.map((cat) => (
            <Link
              key={cat.title}
              href={cat.href}
              className="group relative block overflow-hidden rounded-2xl border border-border/80 bg-card shadow-lg hover:border-gold/60 hover:shadow-[0_12px_40px_rgba(212,175,55,0.18)] transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-gold/50"
            >
              {/* Image Container with Consistent Aspect Ratio */}
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
                <Image
                  src={cat.imageSrc}
                  alt={cat.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className={cn(
                    "object-cover transition-transform duration-700 ease-out group-hover:scale-105",
                    cat.href.includes('indoor') ? "object-top" : "object-center"
                  )}
                  priority={false}
                />

                {/* Subtle dark vignette & bottom gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:from-black/95 group-hover:via-black/60 transition-all duration-500" />

                {/* Bottom Details - Only title visible by default; description & CTA expand on hover */}
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 text-white flex flex-col justify-end">
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight group-hover:text-gold transition-colors duration-300 drop-shadow-sm">
                    {cat.title}
                  </h3>

                  {/* Description & CTA hidden by default — smoothly expands and fades in on hover */}
                  <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-out">
                    <div className="overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out">
                      <p className="text-xs sm:text-sm text-white/90 pt-3 line-clamp-2 sm:line-clamp-3 leading-relaxed max-w-xl">
                        {cat.subtitle}
                      </p>

                      {/* Interactive View Gallery CTA */}
                      <div className="mt-3.5 flex items-center gap-2 text-xs sm:text-sm font-semibold text-gold tracking-wide">
                        <span className="underline-offset-4 group-hover:underline">
                          View Gallery
                        </span>
                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View All Option */}
        <div className="mt-12 text-center">
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 text-xs sm:text-sm text-muted-foreground hover:text-gold transition-colors font-medium"
          >
            <span>Prefer to see everything combined?</span>
            <span className="text-gold font-semibold underline underline-offset-4 flex items-center gap-1">
              Browse All Photographs in Full Gallery
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        </div>
      </div>
    </Section>
  )
}
