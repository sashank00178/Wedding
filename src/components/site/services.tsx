'use client'

import * as React from 'react'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { Section, SectionTitle } from '@/components/site/section'
import { SERVICES, type ServiceInfo } from '@/lib/site'
import { cn } from '@/lib/utils'

const SERVICE_IMAGES: Record<string, string> = {
  portrait: '/gallery/portrait1.jpg',
  wedding: '/gallery/wedding1.jpg',
  commercial: '/gallery/commercial1.jpg',
  event: '/gallery/event1.jpg',
}

function ServiceCard({ service }: { service: ServiceInfo }) {
  const imageSrc = service.image || SERVICE_IMAGES[service.key] || '/gallery/wedding1.jpg'

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
        'group relative bg-card border border-border rounded-xl p-5 sm:p-6 transition-all duration-300',
        'hover:shadow-xl hover:border-gold/50 hover:-translate-y-1 flex flex-col justify-between'
      )}
    >
      <div>
        {/* Real photography image representing the service */}
        <div className="relative aspect-[16/10] w-full rounded-lg overflow-hidden mb-5 bg-secondary border border-border/60">
          <Image
            src={imageSrc}
            alt={service.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        <h3 className="font-serif text-xl font-bold text-foreground mb-2">
          {service.title}
        </h3>

        <p className="text-sm text-muted-foreground leading-relaxed mb-5">
          {service.description}
        </p>
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
        <button
          onClick={handleBook}
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-foreground/80 hover:text-gold transition-colors"
        >
          Book
          <ArrowRight className="h-3 w-3" />
        </button>
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
          subtitle="We offer a wide range of professional photography services tailored to capture every kind of moment."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {serviceList.map((service) => (
            <ServiceCard key={service.key} service={service} />
          ))}
        </div>
      </div>
    </Section>
  )
}
