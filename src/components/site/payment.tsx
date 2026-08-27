'use client'

import * as React from 'react'
import { Section, SectionTitle } from '@/components/site/section'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { Loader2, Wallet, Smartphone, ShieldCheck, CheckCircle2 } from 'lucide-react'
import { SERVICES } from '@/lib/site'
import { cn } from '@/lib/utils'

type Gateway = 'esewa' | 'khalti'

const PACKAGES = SERVICES.map((s) => ({
  key: s.key,
  label: s.title,
  amount: s.priceFrom,
}))

export function Payment() {
  const [gateway, setGateway] = React.useState<Gateway>('esewa')
  const [submitting, setSubmitting] = React.useState(false)
  const [success, setSuccess] = React.useState<null | {
    gateway: Gateway
    amount: number
    ref: string
  }>(null)

  const [form, setForm] = React.useState({
    name: '',
    phone: '',
    packageKey: 'wedding',
  })

  const selectedPkg = React.useMemo(
    () => PACKAGES.find((p) => p.key === form.packageKey) ?? PACKAGES[1],
    [form.packageKey]
  )

  const update = (k: keyof typeof form, v: string) =>
    setForm((prev) => ({ ...prev, [k]: v }))

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.phone) {
      toast.error('Please enter your name and phone number.')
      return
    }
    setSubmitting(true)
    try {
      const resp = await fetch(`/api/payment/${gateway}/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: selectedPkg.amount,
          packageName: selectedPkg.label,
          customerName: form.name,
          customerPhone: form.phone,
        }),
      })
      const data = await resp.json()

      if (!resp.ok || !data.success) {
        toast.error(data.message || 'Failed to initiate payment.')
        setSubmitting(false)
        return
      }

      // DEMO MODE — no real gateway redirect
      if (data.demo) {
        await new Promise((r) => setTimeout(r, 600))
        setSuccess({
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
      setSubmitting(false)
    }
  }

  return (
    <Section id="payment" className="py-20 sm:py-28 bg-secondary/40">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow="Secure checkout"
          title="Advance Booking Payment"
          subtitle="Pay securely via eSewa or Khalti to confirm your photography session."
        />

        <div className="max-w-2xl mx-auto">
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            {/* Gateway tabs */}
            <div className="grid grid-cols-2 gap-3 p-4 sm:p-5 bg-secondary/60 border-b border-border">
              <GatewayTab
                active={gateway === 'esewa'}
                onClick={() => setGateway('esewa')}
                color="#60bb46"
                icon={<Wallet className="h-5 w-5" />}
                label="eSewa Wallet"
              />
              <GatewayTab
                active={gateway === 'khalti'}
                onClick={() => setGateway('khalti')}
                color="#5c2d91"
                icon={<Smartphone className="h-5 w-5" />}
                label="Khalti Wallet"
              />
            </div>

            {/* Form / Success */}
            <div className="p-6 sm:p-8">
              {success ? (
                <SuccessCard
                  gateway={success.gateway}
                  amount={success.amount}
                  ref={success.ref}
                  onReset={() => setSuccess(null)}
                />
              ) : (
                <form onSubmit={onSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="pay-name">Full Name</Label>
                    <Input
                      id="pay-name"
                      value={form.name}
                      onChange={(e) => update('name', e.target.value)}
                      placeholder="Your name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pay-phone">Phone Number</Label>
                    <Input
                      id="pay-phone"
                      type="tel"
                      value={form.phone}
                      onChange={(e) => update('phone', e.target.value)}
                      placeholder="+977 98XXXXXXXX"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pay-package">Select Service Package</Label>
                    <Select
                      value={form.packageKey}
                      onValueChange={(v) => update('packageKey', v)}
                    >
                      <SelectTrigger id="pay-package" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PACKAGES.map((p) => (
                          <SelectItem key={p.key} value={p.key}>
                            {p.label} (रु {p.amount.toLocaleString()})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pay-amount">Amount to Pay (NPR)</Label>
                    <Input
                      id="pay-amount"
                      value={selectedPkg.amount.toLocaleString()}
                      readOnly
                      className="bg-secondary font-bold text-base text-foreground"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className={cn(
                      'w-full h-12 font-semibold text-white border-0',
                      gateway === 'esewa'
                        ? 'bg-[#60bb46] hover:bg-[#54a93d]'
                        : 'bg-[#5c2d91] hover:bg-[#4a2475]'
                    )}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        {gateway === 'esewa' ? (
                          <Wallet className="h-4 w-4 mr-2" />
                        ) : (
                          <Smartphone className="h-4 w-4 mr-2" />
                        )}
                        Pay Rs. {selectedPkg.amount.toLocaleString()} with{' '}
                        {gateway === 'esewa' ? 'eSewa' : 'Khalti'}
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5 pt-2">
                    <ShieldCheck className="h-3.5 w-3.5 text-gold" />
                    Secured by 256-bit SSL encryption · Test mode active
                  </p>
                </form>
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
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  color: string
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex flex-col items-center justify-center gap-1.5 py-4 rounded-lg border-2 font-semibold transition-all',
        active
          ? 'border-current bg-background'
          : 'border-border bg-background/50 text-muted-foreground hover:bg-background'
      )}
      style={active ? { color } : undefined}
    >
      {icon}
      <span className="text-sm">{label}</span>
    </button>
  )
}

function SuccessCard({
  gateway,
  amount,
  ref,
  onReset,
}: {
  gateway: Gateway
  amount: number
  ref: string
  onReset: () => void
}) {
  return (
    <div className="text-center py-6">
      <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 mb-4">
        <CheckCircle2 className="h-8 w-8" />
      </div>
      <h3 className="font-serif text-2xl font-bold mb-2">Payment Successful</h3>
      <p className="text-muted-foreground mb-6">
        Your advance payment has been received. We&apos;ll contact you shortly
        to finalize your booking.
      </p>
      <div className="bg-secondary/60 border border-border rounded-lg p-4 mb-6 text-left text-sm space-y-2 max-w-sm mx-auto">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Gateway</span>
          <span className="font-semibold uppercase">{gateway}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Amount</span>
          <span className="font-semibold">NPR {amount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-muted-foreground">Reference</span>
          <span className="font-mono text-xs break-all text-right">{ref}</span>
        </div>
      </div>
      <Button
        onClick={onReset}
        variant="outline"
        className="border-gold text-gold hover:bg-gold/10"
      >
        Make Another Payment
      </Button>
    </div>
  )
}
