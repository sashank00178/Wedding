'use client'

import * as React from 'react'
import Image from 'next/image'
import { Section, SectionTitle } from '@/components/site/section'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Loader2, ExternalLink } from 'lucide-react'
import { SITE } from '@/lib/site'
import { SocialLinks } from '@/components/site/social-links'
import { WhatsAppButton } from '@/components/site/whatsapp-button'

export function Contact() {
  const [site, setSite] = React.useState(SITE)
  const [submitting, setSubmitting] = React.useState(false)
  const [form, setForm] = React.useState({
    email: '',
    message: '',
  })

  React.useEffect(() => {
    fetch('/api/site-data')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.site) setSite(data.site)
      })
      .catch(() => {})
  }, [])

  const update = (k: keyof typeof form, v: string) =>
    setForm((prev) => ({ ...prev, [k]: v }))

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.email || !form.message) {
      toast.error('Please enter your email and message.')
      return
    }
    setSubmitting(true)
    try {
      const resp = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await resp.json()
      if (resp.ok && data.success) {
        toast.success('Message sent successfully!', {
          description: data.message,
        })
        setForm({ email: '', message: '' })
      } else {
        toast.error(data.message || 'Failed to send message.')
      }
    } catch (err) {
      console.error(err)
      toast.error('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const emailSubject = encodeURIComponent(`Photography Inquiry - ${site.brand}`)
  const emailBody = encodeURIComponent(
    `Hi ${site.shortBrand} Team,\n\nI would like to inquire about your photography sessions and availability.\n\n`
  )
  const mailtoUrl = `mailto:${site.email}?subject=${emailSubject}&body=${emailBody}`
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
    site.email
  )}&su=${emailSubject}&body=${emailBody}`

  const handleEmailClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // If on desktop where mailto is frequently unregistered in Windows/browsers,
    // open Gmail Web Compose in a new tab so the customer can directly write their message.
    const isMobile =
      typeof navigator !== 'undefined' &&
      /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

    if (!isMobile) {
      e.preventDefault()
      window.open(gmailUrl, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <Section id="contact" className="py-20 sm:py-28 bg-background">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow="Get in touch"
          title="Visit Our Studio"
          subtitle="We welcome you to our professional photography studio in Pokhara, Nepal."
        />

        {/* Two Balanced, Symmetrically Sized Cards with compact gap */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 items-stretch w-full max-w-5xl mx-auto">
          {/* Left Card: Studio Location & Clean Map */}
          <div className="bg-card border border-border/80 rounded-2xl p-6 sm:p-7 shadow-sm flex flex-col justify-between">
            {/* Unified Location Header */}
            <div>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 shrink-0 flex items-center justify-center">
                    <Image
                      src="/logo.svg"
                      alt="Wedding Moment Logo"
                      width={40}
                      height={40}
                      className="h-9 w-9 object-contain drop-shadow-sm"
                    />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg sm:text-xl font-bold text-foreground leading-tight">
                      {site.brand}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {site.address}
                    </p>
                  </div>
                </div>

                <a
                  href={site.mapLinkUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-3.5 py-1.5 text-xs font-semibold text-gold hover:bg-gold/20 transition-all shrink-0 active:scale-95"
                >
                  <span>Open in Maps</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>

              {/* Clean Roadmap View (Proportional Height, No Popups) */}
              <div className="relative w-full h-[260px] sm:h-[280px] rounded-xl overflow-hidden border border-border/80 bg-muted/20 my-4 shadow-inner">
                <iframe
                  src={site.mapEmbedUrl}
                  title="Wedding Moment Nepal Location"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full border-0"
                />
              </div>
            </div>

            {/* Direct Address Caption */}
            <p className="text-xs text-muted-foreground leading-relaxed pt-1 border-t border-border/60">
              Located in the heart of Rainpauwa, Pokhara. Easy studio access with consultations and emergency sessions available on request.
            </p>
          </div>

          {/* Right Card: Direct Note & Connected Contacts */}
          <div className="bg-card border border-border/80 rounded-2xl p-6 sm:p-7 shadow-sm flex flex-col justify-between">
            <div>
              {/* Card Header */}
              <h3 className="font-serif text-lg sm:text-xl font-bold text-foreground">
                Send a Direct Note
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Have questions about session dates, pricing, or custom packages? Drop us a note below.
              </p>

              {/* Compact Form */}
              <form onSubmit={onSubmit} className="mt-4 space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="contact-email" className="text-xs font-medium text-foreground/80">
                    Your Email Address
                  </Label>
                  <Input
                    id="contact-email"
                    type="email"
                    placeholder="name@example.com"
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                    className="h-9 max-w-xs bg-background border-border text-xs focus-visible:ring-gold/50"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="contact-message" className="text-xs font-medium text-foreground/80">
                    Your Message
                  </Label>
                  <Textarea
                    id="contact-message"
                    rows={3}
                    placeholder="Tell us about your upcoming event, preferred dates, or questions..."
                    value={form.message}
                    onChange={(e) => update('message', e.target.value)}
                    className="max-w-xs bg-background border-border text-xs resize-none focus-visible:ring-gold/50"
                    required
                  />
                </div>

                <div className="pt-0.5 flex justify-end w-full">
                  <Button
                    type="submit"
                    disabled={submitting}
                    size="sm"
                    className="h-8 px-5 text-xs font-semibold uppercase tracking-wider bg-gold text-black hover:bg-gold/90 transition-transform active:scale-95"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Send Message'
                    )}
                  </Button>
                </div>
              </form>
            </div>

            {/* Connected Footer Block: Direct Contacts & Socials */}
            <div className="border-t border-border/70 pt-3.5 mt-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground uppercase tracking-wider font-semibold block text-[10px]">
                    Call Studio
                  </span>
                  <a
                    href={`tel:${site.phone.replace(/\s/g, '')}`}
                    className="font-semibold text-foreground hover:text-gold transition-colors text-xs"
                  >
                    {site.phone}
                  </a>
                </div>

                <div>
                  <span className="text-muted-foreground uppercase tracking-wider font-semibold block text-[10px]">
                    WhatsApp Chat
                  </span>
                  <WhatsAppButton variant="subtle" label="Chat with Admin" />
                </div>

                <div>
                  <span className="text-muted-foreground uppercase tracking-wider font-semibold block text-[10px]">
                    Email Studio
                  </span>
                  <a
                    href={mailtoUrl}
                    onClick={handleEmailClick}
                    title={`Send an email to ${site.email}`}
                    className="font-semibold text-foreground hover:text-gold transition-colors text-xs truncate block"
                  >
                    {site.email}
                  </a>
                </div>
              </div>

              <div className="pt-2 border-t border-border/50 flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                  Follow Our Work
                </span>
                <SocialLinks buttonClassName="h-8 w-8" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}
