'use client'

import * as React from 'react'
import { Section, SectionTitle } from '@/components/site/section'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Loader2, MapPin, Phone, Mail, ExternalLink } from 'lucide-react'
import { SITE } from '@/lib/site'
import { SocialLinks } from '@/components/site/social-links'

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
        toast.success('Message sent!', {
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

  return (
    <Section id="contact" className="py-20 sm:py-28 bg-background">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow="Get in touch"
          title="Contact Us"
          subtitle="Get in touch with Wedding Moment Nepal. We would love to hear from you."
        />

        {/* Single Unified Contact & Location Card */}
        <div className="max-w-2xl sm:max-w-3xl mx-auto">
          <div className="bg-card border border-border rounded-2xl p-6 sm:p-9 shadow-sm">
            {/* Studio Info Header */}
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-foreground mb-2">
              {site.brand}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              Visit our professional photography studio located in Pokhara, Nepal.
            </p>

            <div className="space-y-6">
              {/* Address */}
              <ContactRow
                icon={<MapPin className="h-4 w-4" />}
                title="Address"
                lines={[site.address]}
              />

              {/* Map Block */}
              <div className="rounded-xl border border-border/70 bg-muted/30 p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">
                      See our location
                    </h4>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {site.locationLabel}
                    </p>
                  </div>
                  <a
                    href={site.mapLinkUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3.5 py-1.5 text-xs sm:text-sm font-medium text-gold transition-colors hover:bg-gold/20 self-start sm:self-auto"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Open in Maps
                  </a>
                </div>

                <div className="mt-3.5 overflow-hidden rounded-lg border border-border">
                  <iframe
                    src={site.mapEmbedUrl}
                    title="Wedding Moment Nepal location"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="h-48 sm:h-56 w-full border-0"
                  />
                </div>
              </div>

              {/* Embedded Compact Contact Form */}
              <form onSubmit={onSubmit} className="pt-6 border-t border-border/70 space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                    Send a Message
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Have a quick question or inquiry? Leave your email and note below.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="contact-email" className="text-xs text-muted-foreground">
                    Your Email
                  </Label>
                  <Input
                    id="contact-email"
                    type="email"
                    placeholder="name@example.com"
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                    className="h-10 bg-background border-border text-sm focus-visible:ring-gold/50"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="contact-message" className="text-xs text-muted-foreground">
                    Message
                  </Label>
                  <Textarea
                    id="contact-message"
                    rows={3}
                    placeholder="How can we help with your photography session?"
                    value={form.message}
                    onChange={(e) => update('message', e.target.value)}
                    className="bg-background border-border text-sm resize-none focus-visible:ring-gold/50"
                    required
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <Button
                    type="submit"
                    disabled={submitting}
                    size="sm"
                    className="h-9 px-5 text-xs font-semibold uppercase tracking-wider bg-gold text-black hover:bg-gold/90 transition-transform active:scale-95"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Send Message'
                    )}
                  </Button>
                </div>
              </form>

              {/* Direct Studio Contact Details */}
              <div className="pt-6 border-t border-border/70 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ContactRow
                  icon={<Phone className="h-4 w-4" />}
                  title="Phone"
                  lines={[site.phone]}
                  href={`tel:${site.phone.replace(/\s/g, '')}`}
                />
                <ContactRow
                  icon={<Mail className="h-4 w-4" />}
                  title="Email"
                  lines={[site.email]}
                  href={`mailto:${site.email}`}
                />
              </div>

              {/* Social Channels */}
              <div className="pt-5 border-t border-border/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                  Connect With Us
                </p>
                <SocialLinks />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}

function ContactRow({
  icon,
  title,
  lines,
  href,
}: {
  icon: React.ReactNode
  title: string
  lines: string[]
  href?: string
}) {
  const content = (
    <div className="flex items-start gap-3.5">
      <span className="h-9 w-9 rounded-full bg-gold/15 text-gold flex items-center justify-center shrink-0">
        {icon}
      </span>
      <div>
        <h4 className="text-[11px] uppercase tracking-widest text-muted-foreground mb-0.5 font-semibold">
          {title}
        </h4>
        {lines.map((l, i) => (
          <p key={i} className="text-foreground text-sm font-medium">
            {l}
          </p>
        ))}
      </div>
    </div>
  )

  if (href) {
    return (
      <a href={href} className="block hover:opacity-80 transition-opacity">
        {content}
      </a>
    )
  }
  return content
}
