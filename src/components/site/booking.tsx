'use client'

import * as React from 'react'
import { Section, SectionTitle } from '@/components/site/section'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { Loader2, CalendarCheck, Phone } from 'lucide-react'
import { SERVICES, SITE } from '@/lib/site'

export function Booking() {
  const [submitting, setSubmitting] = React.useState(false)
  const [form, setForm] = React.useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    date: '',
    message: '',
  })

  const update = (k: keyof typeof form, v: string) =>
    setForm((prev) => ({ ...prev, [k]: v }))

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.phone || !form.service || !form.date) {
      toast.error('Please fill in all required fields.')
      return
    }
    setSubmitting(true)
    try {
      const resp = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await resp.json()
      if (resp.ok && data.success) {
        toast.success('Booking received!', {
          description:
            "Thank you! We'll contact you within 24 hours to confirm your session.",
        })
        setForm({
          name: '',
          email: '',
          phone: '',
          service: '',
          date: '',
          message: '',
        })
      } else {
        toast.error(data.message || 'Failed to submit booking.')
      }
    } catch (err) {
      console.error(err)
      toast.error('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Section id="booking" className="py-20 sm:py-28 bg-background">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow="Reserve your date"
          title="Book a Session"
          subtitle="Schedule your photography session with us — we'll get back to you within 24 hours."
        />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-stretch">
          {/* Left: info */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h3 className="font-serif text-2xl font-bold mb-3">
                Ready to Capture Your Moments?
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Fill out the form to book a session with our professional
                photographers. We&apos;ll get back to you within 24 hours to
                confirm your booking.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Our studio is equipped with state-of-the-art equipment and
                professional lighting to ensure the best results for your
                photoshoot.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                For urgent bookings, you can also call us directly at{' '}
                <a
                  href={`tel:${SITE.phone.replace(/\s/g, '')}`}
                  className="font-semibold text-gold hover:underline"
                >
                  {SITE.phone}
                </a>
                .
              </p>
            </div>

            <div className="bg-secondary/60 border border-border rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-3 text-foreground">
                <span className="h-10 w-10 rounded-full bg-gold/15 text-gold flex items-center justify-center">
                  <CalendarCheck className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    Response time
                  </p>
                  <p className="text-sm font-semibold">Within 24 hours</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-foreground">
                <span className="h-10 w-10 rounded-full bg-gold/15 text-gold flex items-center justify-center">
                  <Phone className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    Direct line
                  </p>
                  <p className="text-sm font-semibold">{SITE.phone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: form */}
          <form
            onSubmit={onSubmit}
            className="lg:col-span-3 bg-card border border-border rounded-xl p-6 sm:p-8 shadow-sm"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="booking-name">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="booking-name"
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                  required
                  placeholder="Your full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="booking-email">
                  Email Address <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="booking-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  required
                  placeholder="you@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="booking-phone">
                  Phone Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="booking-phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => update('phone', e.target.value)}
                  required
                  placeholder="+977 98XXXXXXXX"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="booking-service">
                  Service Type <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={form.service}
                  onValueChange={(v) => update('service', v)}
                >
                  <SelectTrigger id="booking-service" className="w-full">
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                  <SelectContent>
                    {SERVICES.map((s) => (
                      <SelectItem key={s.key} value={s.key}>
                        {s.title} ({s.priceLabel})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="booking-date">
                  Preferred Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="booking-date"
                  type="date"
                  value={form.date}
                  onChange={(e) => update('date', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="booking-message">Additional Details</Label>
                <Textarea
                  id="booking-message"
                  rows={4}
                  value={form.message}
                  onChange={(e) => update('message', e.target.value)}
                  placeholder="Tell us about your photography needs..."
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="mt-6 w-full sm:w-auto bg-gold text-black hover:bg-gold/90 font-semibold h-12 px-8"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting...
                </>
              ) : (
                'Book Now'
              )}
            </Button>
          </form>
        </div>
      </div>
    </Section>
  )
}
