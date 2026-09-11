'use client'

import * as React from 'react'
import { cn } from '@/utils/common'

/**
 * Section wrapper that applies a subtle fade-up reveal when scrolled into view.
 * Pure CSS IntersectionObserver — no animation library required.
 */
export function Section({
  id,
  className,
  children,
  reveal = true,
}: {
  id?: string
  className?: string
  children: React.ReactNode
  reveal?: boolean
}) {
  const ref = React.useRef<HTMLElement | null>(null)
  const [visible, setVisible] = React.useState(!reveal)

  React.useEffect(() => {
    if (!reveal || !ref.current) return
    const el = ref.current
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true)
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [reveal])

  return (
    <section
      ref={ref}
      id={id}
      className={cn('scroll-mt-20', className)}
    >
      <div
        className={cn(
          'transition-all duration-700 ease-out',
          visible ? 'translate-y-0' : 'translate-y-6'
        )}
      >
        {children}
      </div>
    </section>
  )
}

export function SectionTitle({
  eyebrow,
  title,
  subtitle,
  align = 'center',
}: {
  eyebrow?: string
  title: string
  subtitle?: string
  align?: 'center' | 'left'
}) {
  return (
    <div
      className={cn(
        'mb-12 max-w-2xl',
        align === 'center' ? 'mx-auto text-center' : 'text-left'
      )}
    >
      {eyebrow && (
        <div
          className={cn(
            'flex items-center gap-3 mb-3',
            align === 'center' && 'justify-center'
          )}
        >
          <span className="h-px w-8 bg-gold" />
          <span className="text-xs uppercase tracking-[0.25em] text-gold font-medium">
            {eyebrow}
          </span>
          <span className="h-px w-8 bg-gold" />
        </div>
      )}
      <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
        {title}
      </h2>
      {subtitle && (
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
          {subtitle}
        </p>
      )}
      <div
        className={cn(
          'mt-6 gold-divider',
          align === 'center' ? 'mx-auto' : ''
        )}
      />
    </div>
  )
}
