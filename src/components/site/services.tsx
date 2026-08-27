'use client'

import * as React from 'react'
import { Camera, Heart, Briefcase, Video, ArrowRight } from 'lucide-react'
import { Section, SectionTitle } from '@/components/site/section'
import { SERVICES, type ServiceInfo } from '@/lib/site'
import { cn } from '@/lib/utils'

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  camera: Camera,
  heart: Heart,
  briefcase: Briefcase,
  video: Video,
}

function ServiceCard({ service }: { service: ServiceInfo }) {
  const Icon = ICONS[service.icon] ?? Camera

  const handleBook = (e: React.MouseEvent) => {
    e.preventDefault()
    const select = document.querySelector<HTMLSelectElement>('#booking-service')
    if (select) {
      select.value = service.key
      select.dispatchEvent(new Event('change', { bubbles: true }))
    }
    const el = document.querySelector('#booking')
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 70
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }

  return (
    <article
      className={cn(
        'group relative bg-card border border-border rounded-xl p-7 transition-all duration-300',
        'hover:shadow-xl hover:border-gold/50 hover:-translate-y-1'
      )}
    >
      <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-full bg-gold/10 text-gold border border-gold/20 group-hover:bg-gold group-hover:text-black transition-all">
        <Icon className="h-6 w-6" />
      </div>

      <h3 className="font-serif text-xl font-bold text-foreground mb-3">
        {service.title}
      </h3>

      <p className="text-sm text-muted-foreground leading-relaxed mb-5">
        {service.description}
      </p>

      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div>
          <span className="block text-[10px] uppercase tracking-widest text-muted-foreground">
            Starting from
          </span>
          <span className="text-lg font-bold text-gold">
            {service.priceLabel}
          </span>
        </div>
        <button
          onClick={handleBook}
          className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-foreground/80 hover:text-gold transition-colors"
        >
          Book
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>
    </article>
  )
}

export function Services() {
  return (
    <Section id="services" className="py-20 sm:py-28 bg-background">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow="What we offer"
          title="Our Services"
          subtitle="We offer a wide range of professional photography services tailored to capture every kind of moment."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SERVICES.map((service) => (
            <ServiceCard key={service.key} service={service} />
          ))}
        </div>
      </div>
    </Section>
  )
}
