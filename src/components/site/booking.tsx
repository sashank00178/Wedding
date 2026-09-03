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
import {
  Loader2,
  CalendarCheck,
  CreditCard,
  CheckCircle2,
} from 'lucide-react'
import { SERVICES, SITE, type ServiceInfo } from '@/lib/site'
import { cn } from '@/lib/utils'

type TabMode = 'booking' | 'advance'
type Gateway = 'esewa' | 'khalti'

export function Booking() {
  const [activeTab, setActiveTab] = React.useState<TabMode>('booking')
  const [servicesList, setServicesList] = React.useState<ServiceInfo[]>(SERVICES)

  // Booking form state
  const [bookingSubmitting, setBookingSubmitting] = React.useState(false)
  const [bookingForm, setBookingForm] = React.useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    date: '',
    message: '',
  })

  // Payment form state
  const [gateway, setGateway] = React.useState<Gateway>('esewa')
  const [paymentSubmitting, setPaymentSubmitting] = React.useState(false)
  const [paymentSuccess, setPaymentSuccess] = React.useState<null | {
    gateway: Gateway
    amount: number
    ref: string
  }>(null)
  const [paymentForm, setPaymentForm] = React.useState({
    name: '',
    phone: '',
    packageKey: 'wedding',
  })

  // Load dynamic services if available
  React.useEffect(() => {
    fetch('/api/site-data')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.services?.length) {
          setServicesList(data.services)
        }
      })
      .catch(() => {})
  }, [])

  // Sync URL parameters, hash, and custom navigation events
  React.useEffect(() => {
    const syncFromUrl = () => {
      if (typeof window === 'undefined') return
      const urlParams = new URLSearchParams(window.location.search)
      const tabParam = urlParams.get('tab')
      const hash = window.location.hash

      if (
        tabParam === 'advance' ||
        hash === '#advance-booking' ||
        hash === '#payment' ||
        hash === '#advance'
      ) {
        handleTabChange('advance', false)
      } else if (tabParam === 'booking' || hash === '#booking') {
        handleTabChange('booking', false)
      }
    }

    const handleExternalSwitch = (e: Event) => {
      const customEvent = e as CustomEvent<TabMode>
      if (customEvent.detail) {
        handleTabChange(customEvent.detail, false)
      }
    }

    syncFromUrl()
    window.addEventListener('hashchange', syncFromUrl)
    window.addEventListener('booking-tab-change', handleExternalSwitch)
    return () => {
      window.removeEventListener('hashchange', syncFromUrl)
      window.removeEventListener('booking-tab-change', handleExternalSwitch)
    }
  }, [])

  // Sync Name and Phone between forms if empty to save user effort
  const handleTabChange = (tab: TabMode, broadcast = true) => {
    if (tab === 'advance') {
      setPaymentForm((prev) => ({
        ...prev,
        name: prev.name || bookingForm.name,
        phone: prev.phone || bookingForm.phone,
        packageKey: bookingForm.service || prev.packageKey || 'wedding',
      }))
    } else if (tab === 'booking') {
      setBookingForm((prev) => ({
        ...prev,
        name: prev.name || paymentForm.name,
        phone: prev.phone || paymentForm.phone,
      }))
    }
    setActiveTab(tab)

    if (broadcast && typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('booking-tab-change', { detail: tab })
      )
      const targetHash = tab === 'advance' ? '#advance-booking' : '#booking'
      history.replaceState(null, '', targetHash)
    }
  }

  const updateBooking = (k: keyof typeof bookingForm, v: string) =>
    setBookingForm((prev) => ({ ...prev, [k]: v }))

  const updatePayment = (k: keyof typeof paymentForm, v: string) =>
    setPaymentForm((prev) => ({ ...prev, [k]: v }))

  // Current package selected for payment
  const selectedPkg = React.useMemo(() => {
    const found = servicesList.find((s) => s.key === paymentForm.packageKey)
    if (found) {
      return {
        key: found.key,
        label: found.title,
        amount: found.priceFrom,
      }
    }
    const fallback = servicesList[0] || SERVICES[0]
    return {
      key: fallback.key,
      label: fallback.title,
      amount: fallback.priceFrom,
    }
  }, [servicesList, paymentForm.packageKey])

  // Submit standard booking
  const onBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!bookingForm.name || !bookingForm.email || !bookingForm.phone || !bookingForm.service || !bookingForm.date) {
      toast.error('Please fill in all required fields.')
      return
    }
    setBookingSubmitting(true)
    try {
      const resp = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingForm),
      })
      const data = await resp.json()
      if (resp.ok && data.success) {
        toast.success('Booking received!', {
          description:
            "Thank you! We'll contact you within 24 hours to confirm your session.",
        })
        setBookingForm({
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
      setBookingSubmitting(false)
    }
  }

  // Submit advance payment
  const onPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!paymentForm.name || !paymentForm.phone) {
      toast.error('Please enter your name and phone number.')
      return
    }
    setPaymentSubmitting(true)
    try {
      const resp = await fetch(`/api/payment/${gateway}/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: selectedPkg.amount,
          packageName: selectedPkg.label,
          customerName: paymentForm.name,
          customerPhone: paymentForm.phone,
        }),
      })
      const data = await resp.json()

      if (!resp.ok || !data.success) {
        toast.error(data.message || 'Failed to initiate payment.')
        setPaymentSubmitting(false)
        return
      }

      // DEMO MODE — no real gateway redirect
      if (data.demo) {
        await new Promise((r) => setTimeout(r, 600))
        setPaymentSuccess({
          gateway,
          amount: Number(data.amount),
          ref: data.transactionUuid || data.pidx,
        })
        toast.success('Payment successful (demo mode)', {
          description: `NPR ${Number(data.amount).toLocaleString()} • ${gateway.toUpperCase()} • ${data.transactionUuid || data.pidx}`,
        })
      } else if (data.payment_url) {
        // PRODUCTION — redirect to gateway
        window.location.href = data.payment_url
      }
    } catch (err) {
      console.error(err)
      toast.error('Network error. Please try again.')
    } finally {
      setPaymentSubmitting(false)
    }
  }

  return (
    <Section id="booking" className="py-20 sm:py-28 bg-background">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow="Reserve your date"
          title="Book a Session"
          subtitle="Schedule your photography session with us. We will get back to you within 24 hours."
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch w-full">
          {/* Left: Info Card (Matching right card in structure & padding) */}
          <div className="bg-card border border-border/80 rounded-2xl p-6 sm:p-7 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-foreground mb-3">
                Ready to Capture Your Moments?
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-3.5">
                Fill out the booking form or secure your date immediately with
                an advance payment. Our professional photography team will
                finalize every detail with you.
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-4">
                Our studio is equipped with state-of-the-art equipment, professional
                lighting setups, and artistic direction to ensure timeless results for your photoshoot.
              </p>

              {/* Service Highlights */}
              <div className="space-y-2.5 pt-4 border-t border-border/60 text-xs">
                <div className="flex items-center gap-2.5 text-foreground/90">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold shrink-0" />
                  <span>Studio and outdoor location coverage across Nepal</span>
                </div>
                <div className="flex items-center gap-2.5 text-foreground/90">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold shrink-0" />
                  <span>Color-graded high-resolution digital deliverables</span>
                </div>
                <div className="flex items-center gap-2.5 text-foreground/90">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold shrink-0" />
                  <span>Flexible rescheduling in case of weather changes</span>
                </div>
              </div>
            </div>

            {/* Connected Footer Info Block (Matching right card's footer) */}
            <div className="pt-4 mt-5 border-t border-border/70 space-y-3">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold block">
                    Response Time
                  </span>
                  <span className="text-xs font-semibold text-foreground mt-0.5 block">
                    Within 24 Hours
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold block">
                    Direct Studio Line
                  </span>
                  <a
                    href={`tel:${SITE.phone.replace(/\s/g, '')}`}
                    className="text-xs font-semibold text-gold hover:underline mt-0.5 block"
                  >
                    {SITE.phone}
                  </a>
                </div>
              </div>

              <div className="pt-2.5 border-t border-border/50 text-[11px] text-muted-foreground">
                Advance payments secured via <span className="font-semibold text-foreground">eSewa</span> &amp; <span className="font-semibold text-foreground">Khalti</span>
              </div>
            </div>
          </div>

          {/* Right: Unified Tabbed Card */}
          <div className="bg-card border border-border/80 rounded-2xl p-6 sm:p-7 shadow-sm flex flex-col justify-between">
            {/* Top Tab Navigation */}
            <div>
              <div className="flex border-b border-border mb-5">
                <button
                  type="button"
                  onClick={() => handleTabChange('booking')}
                  className={cn(
                    'relative pb-2.5 px-3 sm:px-4 text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-2',
                    activeTab === 'booking'
                      ? 'text-gold'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <CalendarCheck className="h-4 w-4" />
                  <span>Booking</span>
                  {activeTab === 'booking' && (
                    <span className="absolute -bottom-px left-0 right-0 h-[2px] bg-gold rounded-full transition-all" />
                  )}
                </button>

                <div
                  className={cn(
                    'relative pb-2.5 px-3 sm:px-4 text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-2',
                    activeTab === 'advance'
                      ? 'text-gold'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <button
                    type="button"
                    onClick={() => handleTabChange('advance')}
                    className="flex items-center gap-2 focus:outline-none"
                  >
                    <CreditCard className="h-4 w-4" />
                    <span>Advance Booking</span>
                  </button>

                  {/* Info Tooltip Icon */}
                  <AdvanceBookingTooltip />

                  {activeTab === 'advance' && (
                    <span className="absolute -bottom-px left-0 right-0 h-[2px] bg-gold rounded-full transition-all" />
                  )}
                </div>
              </div>

              {/* Tab 1: Standard Booking Form */}
              {activeTab === 'booking' && (
                <form
                  onSubmit={onBookingSubmit}
                  className="space-y-3.5 animate-in fade-in-50 duration-200"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <Label htmlFor="booking-name" className="text-xs font-medium text-foreground/80">
                        Full Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="booking-name"
                        value={bookingForm.name}
                        onChange={(e) => updateBooking('name', e.target.value)}
                        required
                        placeholder="Your full name"
                        className="h-9 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="booking-email" className="text-xs font-medium text-foreground/80">
                        Email Address <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="booking-email"
                        type="email"
                        value={bookingForm.email}
                        onChange={(e) => updateBooking('email', e.target.value)}
                        required
                        placeholder="you@example.com"
                        className="h-9 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="booking-phone" className="text-xs font-medium text-foreground/80">
                        Phone Number <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="booking-phone"
                        type="tel"
                        value={bookingForm.phone}
                        onChange={(e) => updateBooking('phone', e.target.value)}
                        required
                        placeholder="+977 98XXXXXXXX"
                        className="h-9 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="booking-service" className="text-xs font-medium text-foreground/80">
                        Service Type <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={bookingForm.service}
                        onValueChange={(v) => updateBooking('service', v)}
                      >
                        <SelectTrigger id="booking-service" className="w-full h-9 text-xs">
                          <SelectValue placeholder="Select a service" />
                        </SelectTrigger>
                        <SelectContent>
                          {servicesList.map((s) => (
                            <SelectItem key={s.key} value={s.key}>
                              {s.title} ({s.priceLabel})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <Label htmlFor="booking-date" className="text-xs font-medium text-foreground/80">
                        Preferred Date <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="booking-date"
                        type="date"
                        value={bookingForm.date}
                        onChange={(e) => updateBooking('date', e.target.value)}
                        required
                        className="h-9 text-xs"
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <Label htmlFor="booking-message" className="text-xs font-medium text-foreground/80">
                        Additional Details
                      </Label>
                      <Textarea
                        id="booking-message"
                        rows={3}
                        value={bookingForm.message}
                        onChange={(e) => updateBooking('message', e.target.value)}
                        placeholder="Tell us about your photography needs..."
                        className="text-xs resize-none"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={bookingSubmitting}
                    className="w-full bg-gold text-black hover:bg-gold/90 font-semibold h-9 px-6 text-xs uppercase tracking-wider transition-transform active:scale-95"
                  >
                    {bookingSubmitting ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> Submitting...
                      </>
                    ) : (
                      'Book Now'
                    )}
                  </Button>
                </form>
              )}

              {/* Tab 2: Advance Booking (Payment) */}
              {activeTab === 'advance' && (
                <div className="animate-in fade-in-50 duration-200">
                  {paymentSuccess ? (
                    <SuccessCard
                      gateway={paymentSuccess.gateway}
                      amount={paymentSuccess.amount}
                      refId={paymentSuccess.ref}
                      onReset={() => setPaymentSuccess(null)}
                    />
                  ) : (
                    <form onSubmit={onPaymentSubmit} className="space-y-3.5">
                      {/* Wallet Gateway Selector */}
                      <div className="grid grid-cols-2 gap-2.5 p-1.5 bg-secondary/60 border border-border rounded-xl">
                        <GatewayTab
                          active={gateway === 'esewa'}
                          onClick={() => setGateway('esewa')}
                          color="#60bb46"
                          label="eSewa Wallet"
                        />
                        <GatewayTab
                          active={gateway === 'khalti'}
                          onClick={() => setGateway('khalti')}
                          color="#5c2d91"
                          label="Khalti Wallet"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div className="space-y-1">
                          <Label htmlFor="pay-name" className="text-xs font-medium text-foreground/80">
                            Full Name <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="pay-name"
                            value={paymentForm.name}
                            onChange={(e) => updatePayment('name', e.target.value)}
                            placeholder="Your full name"
                            required
                            className="h-9 text-xs"
                          />
                        </div>

                        <div className="space-y-1">
                          <Label htmlFor="pay-phone" className="text-xs font-medium text-foreground/80">
                            Phone Number <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="pay-phone"
                            type="tel"
                            value={paymentForm.phone}
                            onChange={(e) => updatePayment('phone', e.target.value)}
                            placeholder="+977 98XXXXXXXX"
                            required
                            className="h-9 text-xs"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="pay-package" className="text-xs font-medium text-foreground/80">
                          Select Service Package
                        </Label>
                        <Select
                          value={paymentForm.packageKey}
                          onValueChange={(v) => updatePayment('packageKey', v)}
                        >
                          <SelectTrigger id="pay-package" className="w-full h-9 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {servicesList.map((s) => (
                              <SelectItem key={s.key} value={s.key}>
                                {s.title} ({s.priceLabel})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="pay-amount" className="text-xs font-medium text-foreground/80">
                          Advance Amount (NPR)
                        </Label>
                        <Input
                          id="pay-amount"
                          value={`रु ${selectedPkg.amount.toLocaleString()}`}
                          readOnly
                          className="bg-secondary font-bold text-sm text-foreground h-9"
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={paymentSubmitting}
                        className={cn(
                          'w-full h-9 font-semibold text-white border-0 transition-all text-xs uppercase tracking-wider active:scale-95',
                          gateway === 'esewa'
                            ? 'bg-[#60bb46] hover:bg-[#54a93d]'
                            : 'bg-[#5c2d91] hover:bg-[#4a2475]'
                        )}
                      >
                        {paymentSubmitting ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> Processing...
                          </>
                        ) : (
                          `Pay Rs. ${selectedPkg.amount.toLocaleString()} with ${gateway === 'esewa' ? 'eSewa' : 'Khalti'}`
                        )}
                      </Button>

                      <p className="text-[11px] text-muted-foreground text-center pt-0.5">
                        Secured with 256-bit encryption &bull; Direct Studio Verification
                      </p>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}

function GatewayTab({
  active,
  onClick,
  color,
  label,
}: {
  active: boolean
  onClick: () => void
  color: string
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center justify-center py-3 rounded-lg border-2 font-semibold transition-all',
        active
          ? 'border-current bg-background shadow-sm'
          : 'border-border bg-background/50 text-muted-foreground hover:bg-background'
      )}
      style={active ? { color } : undefined}
    >
      <span className="text-xs sm:text-sm font-bold">{label}</span>
    </button>
  )
}

function SuccessCard({
  gateway,
  amount,
  refId,
  onReset,
}: {
  gateway: Gateway
  amount: number
  refId: string
  onReset: () => void
}) {
  return (
    <div className="text-center py-6 animate-in fade-in-50">
      <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20 text-green-500 mb-4 border border-green-500/30">
        <CheckCircle2 className="h-8 w-8" />
      </div>
      <h3 className="font-serif text-2xl font-bold mb-2 text-foreground">Payment Successful</h3>
      <p className="text-muted-foreground text-sm mb-6">
        Your advance booking payment has been received. We&apos;ll contact you shortly
        to finalize your session.
      </p>
      <div className="bg-secondary/60 border border-border rounded-lg p-4 mb-6 text-left text-sm space-y-2 max-w-sm mx-auto">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Gateway</span>
          <span className="font-semibold uppercase text-foreground">{gateway}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Amount</span>
          <span className="font-semibold text-gold">NPR {amount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-muted-foreground">Reference</span>
          <span className="font-mono text-xs break-all text-right text-foreground">{refId}</span>
        </div>
      </div>
      <Button
        onClick={onReset}
        variant="outline"
        className="border-gold text-gold hover:bg-gold/10 text-xs font-semibold"
      >
        Make Another Payment
      </Button>
    </div>
  )
}

function AdvanceBookingTooltip() {
  const [open, setOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  // Close on click outside (mobile tap & desktop click)
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener('pointerdown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('pointerdown', handleClickOutside)
    }
  }, [open])

  // Close on Escape key
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    if (open) {
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open])

  return (
    <div
      ref={containerRef}
      className="relative inline-flex items-center"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-label="Advance Booking Information"
        title="Advance Booking: Instant spot guarantee upon payment"
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation()
          setOpen((prev) => !prev)
        }}
        onFocus={() => setOpen(true)}
        onBlur={(e) => {
          if (
            containerRef.current &&
            !containerRef.current.contains(e.relatedTarget as Node)
          ) {
            setOpen(false)
          }
        }}
        className={cn(
          'inline-flex items-center justify-center h-4 w-4 sm:h-4.5 sm:w-4.5 rounded-full border text-[10px] sm:text-[11px] font-bold transition-all focus:outline-none focus:ring-2 focus:ring-gold/50 cursor-pointer select-none ml-0.5',
          open
            ? 'border-gold bg-gold text-black shadow-sm scale-105'
            : 'border-gold/50 bg-gold/10 text-gold hover:border-gold hover:bg-gold hover:text-black'
        )}
      >
        <span className="leading-none select-none font-bold">?</span>
      </button>

      {/* Tooltip Popover Overlay */}
      {open && (
        <div
          role="tooltip"
          className="absolute z-50 top-full mt-2.5 right-[-8px] sm:right-[-12px] w-72 sm:w-80 max-w-[calc(100vw-3rem)] p-4 rounded-xl bg-card/95 backdrop-blur-md border border-gold/40 shadow-2xl text-foreground text-xs leading-relaxed whitespace-normal break-words text-left animate-in fade-in-0 zoom-in-95 duration-150"
        >
          {/* Arrow pointing up at the icon */}
          <span className="absolute -top-1.5 right-3 sm:right-4 h-3 w-3 bg-card border-t border-l border-gold/40 rotate-45" />

          <div className="space-y-1">
            <p className="font-semibold text-gold text-xs whitespace-normal">
              Instant Slot Guarantee
            </p>
            <p className="text-muted-foreground text-[11px] sm:text-xs leading-relaxed whitespace-normal break-words">
              Advance Booking instantly reserves your spot for the selected date and time with no admin approval needed. Unlike a regular booking request, this guarantees your slot immediately upon payment, even if the date shows as limited or unavailable elsewhere.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
