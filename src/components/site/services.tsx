'use client'

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Section, SectionTitle } from '@/components/site/section'
import { SERVICES, type ServiceInfo } from '@/lib/site'
import { cn } from '@/lib/utils'

const SERVICE_IMAGES: Record<string, string> = {
  portrait: '/gallery/indoor/IMG_7952.JPG',
  wedding: '/gallery/wedding-photography.jpg',
}

function ServiceCard({ service }: { service: ServiceInfo }) {
  const isIndoor = service.key === 'portrait'
  const isWedding = service.key === 'wedding'
  const imageSrc = service.image || SERVICE_IMAGES[service.key] || '/gallery/wedding-photography.jpg'

  const handleBook = (e: React.MouseEvent) => {
    e.preventDefault()
    window.dispatchEvent(
      new CustomEvent('booking-select-service', { detail: service.key })
    )
    const el = document.getElementById('booking')
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 70
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }

  return (
    <article
      className={cn(
        'group relative bg-card border rounded-xl p-5 sm:p-6 transition-all duration-300 flex flex-col justify-between',
        isIndoor || isWedding
          ? 'border-gold/60 shadow-lg shadow-gold/5 ring-1 ring-gold/20 hover:border-gold hover:shadow-xl hover:-translate-y-1'
          : 'border-border hover:border-gold/50 hover:shadow-xl hover:-translate-y-1'
      )}
    >
      <div>
        {/* Real photography image */}
        <div className="relative aspect-[4/3] sm:aspect-[16/10] w-full rounded-lg overflow-hidden mb-5 bg-secondary border border-border/60">
          <Image
            src={imageSrc}
            alt={service.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            quality={80}
            className={cn(
              "object-cover group-hover:scale-105 transition-transform duration-500",
              isIndoor ? "object-[center_30%]" : "object-[center_35%]"
            )}
          />
          {isIndoor && (
            <div className="absolute top-2.5 right-2.5 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-gold border border-gold/40 flex items-center gap-1 shadow-md">
              <Sparkles className="h-3 w-3" />
              4 Sessions
            </div>
          )}
          {isWedding && (
            <div className="absolute top-2.5 right-2.5 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-gold border border-gold/40 flex items-center gap-1 shadow-md">
              <Sparkles className="h-3 w-3" />
              3 Categories
            </div>
          )}
        </div>

        <h3 className="font-serif text-xl font-bold text-foreground mb-2">
          {isIndoor ? (
            <Link
              href="/services/indoor-photography"
              className="hover:text-gold transition-colors"
            >
              {service.title}
            </Link>
          ) : isWedding ? (
            <Link
              href="/services/wedding-photography"
              className="hover:text-gold transition-colors"
            >
              {service.title}
            </Link>
          ) : (
            service.title
          )}
        </h3>

        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          {service.description}
        </p>

        {isIndoor && (
          <div className="mb-4 flex flex-wrap gap-1.5">
            {['Couple / Pre-Wedding', 'Family', 'Graduation', 'Maternity'].map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-secondary text-foreground/80 border border-border"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {isWedding && (
          <div className="mb-4 flex flex-wrap gap-1.5">
            {['Bride Side', 'Combo (Complete)', 'Groom Side'].map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-secondary text-foreground/80 border border-border"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div>
          <span className="block text-[10px] uppercase tracking-widest text-muted-foreground">
            Starting from
          </span>
          <span className="text-lg font-bold text-gold">
            {service.priceLabel}
          </span>
        </div>

        {isIndoor ? (
          <Link
            href="/services/indoor-photography"
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide bg-gold text-black hover:bg-gold/90 px-3.5 py-1.5 rounded-lg transition-all shadow-md active:scale-95"
          >
            <span>View Details</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        ) : isWedding ? (
          <Link
            href="/services/wedding-photography"
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide bg-gold text-black hover:bg-gold/90 px-3.5 py-1.5 rounded-lg transition-all shadow-md active:scale-95"
          >
            <span>View Details</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        ) : (
          <button
            onClick={handleBook}
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-foreground/80 hover:text-gold transition-colors cursor-pointer"
          >
            <span>Book</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        )}
      </div>
    </article>
  )
}

export function Services() {
  const [serviceList, setServiceList] = React.useState<ServiceInfo[]>(SERVICES)

  React.useEffect(() => {
    fetch('/api/site-data')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.services && data.services.length > 0) {
          setServiceList(data.services)
        }
      })
      .catch(() => {})
  }, [])

  return (
    <Section id="services" className="py-20 sm:py-28 bg-background">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow="What we offer"
          title="Our Services"
          subtitle="From bespoke indoor studio shoots to full-day wedding coverage, we craft timeless memories tailored to your story."
        />

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {serviceList.map((service) => (
            <ServiceCard key={service.key} service={service} />
          ))}
        </div>
      </div>
    </Section>
  )
}
