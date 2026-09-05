'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * Official WhatsApp Brand SVG Icon
 * Exact geometry matching WhatsApp brand guidelines
 */
export function WhatsAppIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.23 8.23 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.45 0-2.87-.38-4.12-1.1l-.3-.17-3.12.82.83-3.04-.19-.3a8.21 8.21 0 0 1-1.26-4.45c0-4.54 3.7-8.24 8.24-8.24m-3.52 3.84c-.19 0-.5.07-.76.35-.26.29-1 1-1 2.43s1.02 2.82 1.16 3.01c.14.19 2 3.14 4.9 4.35.69.29 1.23.47 1.65.6.7.22 1.33.19 1.83.12.56-.08 1.72-.7 1.96-1.38.24-.68.24-1.26.17-1.38-.07-.12-.26-.19-.55-.34-.29-.14-1.72-.85-1.99-.95-.27-.1-.46-.14-.65.15-.19.29-.75.95-.92 1.14-.17.19-.34.22-.63.07-.29-.14-1.23-.45-2.34-1.44-.86-.77-1.44-1.72-1.61-2.01-.17-.29-.02-.45.13-.59.13-.13.29-.34.43-.51.14-.17.19-.29.29-.48.1-.19.05-.36-.02-.51-.07-.14-.65-1.57-.89-2.15-.24-.57-.48-.49-.66-.5z" />
    </svg>
  )
}

export const STUDIO_WHATSAPP_PHONE = '9779856010315'
export const STUDIO_WHATSAPP_DEFAULT_MESSAGE =
  "Hi, I'm interested in booking a photography session with WeddingMoment."

export function getWhatsAppUrl(
  phone: string = STUDIO_WHATSAPP_PHONE,
  message: string = STUDIO_WHATSAPP_DEFAULT_MESSAGE
) {
  const cleanPhone = phone.replace(/\D/g, '')
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
}

export interface WhatsAppButtonProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  phone?: string
  message?: string
  label?: string
  variant?: 'navbar' | 'primary' | 'outline' | 'floating' | 'subtle'
  scrolled?: boolean
  showIcon?: boolean
}

export function WhatsAppButton({
  phone = STUDIO_WHATSAPP_PHONE,
  message = STUDIO_WHATSAPP_DEFAULT_MESSAGE,
  label = "Let's Talk",
  variant = 'navbar',
  scrolled = false,
  showIcon = true,
  className,
  ...props
}: WhatsAppButtonProps) {
  const url = getWhatsAppUrl(phone, message)

  let variantStyles = ''

  switch (variant) {
    case 'navbar':
      variantStyles = cn(
        'h-9 px-3.5 rounded-full inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider transition-all border shrink-0 group',
        'border-gold/40 bg-gold/10 text-gold hover:bg-gold/20 hover:border-gold active:scale-95 shadow-sm'
      )
      break
    case 'primary':
      variantStyles =
        'h-10 px-5 rounded-full inline-flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider bg-gold text-black hover:bg-gold/90 shadow-md transition-all active:scale-95 group'
      break
    case 'outline':
      variantStyles =
        'h-9 px-4 rounded-full inline-flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider border border-gold/40 bg-gold/10 text-gold hover:bg-gold/20 hover:border-gold transition-all active:scale-95 group'
      break
    case 'floating':
      variantStyles =
        'fixed bottom-6 right-6 z-40 h-12 w-12 sm:h-12 sm:w-auto sm:px-4 rounded-full inline-flex items-center justify-center gap-2 text-xs font-semibold bg-gold text-black hover:bg-gold/90 shadow-2xl hover:scale-105 transition-all group'
      break
    case 'subtle':
      variantStyles =
        'inline-flex items-center gap-1.5 text-xs font-semibold text-gold hover:text-gold/80 transition-colors group'
      break
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${label} via WhatsApp`}
      className={cn(variantStyles, className)}
      {...props}
    >
      {showIcon && (
        <WhatsAppIcon className="h-3.5 w-3.5 text-gold group-hover:scale-110 transition-transform shrink-0" />
      )}
      {label && <span>{label}</span>}
    </a>
  )
}
