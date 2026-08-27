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

export function Contact() {
  const [submitting, setSubmitting] = React.useState(false)
  const [form, setForm] = React.useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })

  const update = (k: keyof typeof form, v: string) =>
    setForm((prev) => ({ ...prev, [k]: v }))

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.subject || !form.message) {
      toast.error('Please fill in all fields.')
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
        setForm({ name: '', email: '', subject: '', message: '' })
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
          subtitle="Get in touch with Wedding Moment Nepal — we'd love to hear from you."
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
          {/* Left: info */}
          <div className="bg-card border border-border rounded-xl p-7 sm:p-9">
            <h3 className="font-serif text-2xl font-bold mb-3">
              {SITE.brand}
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Visit our professional photography studio located in Pokhara,
              Nepal.
            </p>

            <div className="space-y-6">
              <ContactRow
                icon={<MapPin className="h-4 w-4" />}
                title="Address"
                lines={[SITE.address]}
              />

              <div className="rounded-lg border border-border/70 bg-muted/40 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">
                      See our location
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {SITE.locationLabel}
                    </p>
                  </div>
                  <a
                    href={SITE.mapLinkUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-2 text-sm font-medium text-gold transition-colors hover:bg-gold/20"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open in Maps
                  </a>
                </div>

                <div className="mt-4 overflow-hidden rounded-lg border border-border">
                  <iframe
                    src={SITE.mapEmbedUrl}
                    title="Wedding Moment Nepal location"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="h-56 w-full border-0"
                  />
                </div>
              </div>
              <ContactRow
                icon={<Phone className="h-4 w-4" />}
                title="Phone"
                lines={[SITE.phone]}
                href={`tel:${SITE.phone.replace(/\s/g, '')}`}
              />
              <ContactRow
                icon={<Mail className="h-4 w-4" />}
                title="Email"
                lines={[SITE.email]}
                href={`mailto:${SITE.email}`}
              />
            </div>
          </div>

          {/* Right: form */}
          <form
            onSubmit={onSubmit}
            className="bg-card border border-border rounded-xl p-7 sm:p-9 shadow-sm"
          >
            <h3 className="font-serif text-2xl font-bold mb-6">
              Send us a Message
            </h3>
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="contact-name">Name</Label>
                  <Input
                    id="contact-name"
                    value={form.name}
                    onChange={(e) => update('name', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-email">Email</Label>
                  <Input
                    id="contact-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-subject">Subject</Label>
                <Input
                  id="contact-subject"
                  value={form.subject}
                  onChange={(e) => update('subject', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-message">Message</Label>
                <Textarea
                  id="contact-message"
                  rows={5}
                  value={form.message}
                  onChange={(e) => update('message', e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto bg-gold text-black hover:bg-gold/90 font-semibold h-12 px-8"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Message'
                )}
              </Button>
            </div>
          </form>
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
    <div className="flex items-start gap-4">
      <span className="h-10 w-10 rounded-full bg-gold/15 text-gold flex items-center justify-center shrink-0">
        {icon}
      </span>
      <div>
        <h4 className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
          {title}
        </h4>
        {lines.map((l, i) => (
          <p key={i} className="text-foreground font-medium">
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
