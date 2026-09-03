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

  return (
    <Section id="contact" className="py-20 sm:py-28 bg-background">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow="Get in touch"
          title="Visit Our Studio"
          subtitle="We welcome you to our professional photography studio in Pokhara, Nepal."
        />

        {/* Cohesive Editorial Split Grid: 7 cols Location / 5 cols Contact */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          {/* Left: Prominent Map & Location Showcase (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            {/* Prominent Edge-to-Edge Map Canvas */}
            <div className="relative w-full h-[360px] sm:h-[430px] rounded-2xl overflow-hidden border border-border/80 shadow-md bg-muted/20">
              <iframe
                src={site.mapEmbedUrl}
                title="Wedding Moment Nepal Location"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full border-0"
              />
            </div>

            {/* Location & Navigation Bar below Map */}
            <div className="mt-5 p-5 sm:p-6 rounded-2xl bg-card border border-border/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="relative h-11 w-11 shrink-0 flex items-center justify-center">
                  <Image
                    src="/logo.svg"
                    alt="Wedding Moment Logo"
                    width={44}
                    height={44}
                    className="h-10 w-10 object-contain drop-shadow-sm"
                  />
                </div>
                <div>
                  <h4 className="font-serif text-base sm:text-lg font-bold text-foreground leading-tight">
                    {site.brand}
                  </h4>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                    {site.address}
                  </p>
                </div>
              </div>

              <a
                href={site.mapLinkUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-2 text-xs sm:text-sm font-semibold text-gold hover:bg-gold/20 transition-colors self-start sm:self-auto shrink-0 active:scale-95"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Open in Maps</span>
              </a>
            </div>
          </div>

          {/* Right: Studio Concierge & Quick Note (5 Cols) */}
          <div className="lg:col-span-5">
            <div className="bg-card border border-border/80 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col justify-between h-full">
              {/* Header */}
              <div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-foreground">
                  Send a Direct Note
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 leading-relaxed">
                  Have questions about session dates, pricing, or custom packages? Send us a message and our team will get back to you.
                </p>

                {/* Form */}
                <form onSubmit={onSubmit} className="mt-6 space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="contact-email" className="text-xs font-medium text-foreground/80">
                      Your Email Address
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
                    <Label htmlFor="contact-message" className="text-xs font-medium text-foreground/80">
                      Your Message
                    </Label>
                    <Textarea
                      id="contact-message"
                      rows={4}
                      placeholder="Tell us about your upcoming event, preferred date, or questions..."
                      value={form.message}
                      onChange={(e) => update('message', e.target.value)}
                      className="bg-background border-border text-sm resize-none focus-visible:ring-gold/50"
                      required
                    />
                  </div>

                  <div className="pt-1 flex justify-end">
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="h-9 px-6 text-xs font-semibold uppercase tracking-wider bg-gold text-black hover:bg-gold/90 transition-transform active:scale-95"
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
              </div>

              {/* Direct Reach & Social Channels */}
              <div className="mt-8 pt-6 border-t border-border/70 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                  <div>
                    <span className="text-muted-foreground uppercase tracking-wider font-semibold block text-[10px]">
                      Call Studio
                    </span>
                    <a
                      href={`tel:${site.phone.replace(/\s/g, '')}`}
                      className="font-semibold text-foreground hover:text-gold transition-colors text-sm"
                    >
                      {site.phone}
                    </a>
                  </div>

                  <div>
                    <span className="text-muted-foreground uppercase tracking-wider font-semibold block text-[10px]">
                      Email Studio
                    </span>
                    <a
                      href={`mailto:${site.email}`}
                      className="font-semibold text-foreground hover:text-gold transition-colors text-sm"
                    >
                      {site.email}
                    </a>
                  </div>
                </div>

                <div className="pt-3 border-t border-border/50 flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">
                    Follow Our Work
                  </span>
                  <SocialLinks />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}
