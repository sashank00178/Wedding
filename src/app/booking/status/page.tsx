'use client'

import * as React from 'react'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import {
  CheckCircle2,
  XCircle,
  Clock,
  MessageCircle,
  ArrowRight,
  RotateCcw,
  Copy,
  Check,
  Calendar,
  Sparkles,
  ShieldCheck,
} from 'lucide-react'
import { createAdvanceBookingWhatsAppUrl } from '@/services/whatsappService'
import { formatBsDate, formatBsDateTime } from '@/utils/nepaliDate'

interface OrderDetails {
  id: string
  gateway: string
  customerName: string
  customerPhone: string
  customerEmail?: string | null
  bookingDate?: string | null
  packageName: string
  serviceDetails: string
  amount: number
  transactionUuid: string
  refId?: string | null
  status: string
  createdAt: string
}

function StatusContent() {
  const searchParams = useSearchParams()
  const statusParam = searchParams.get('status')
  const uuidParam = searchParams.get('uuid')
  const refParam = searchParams.get('ref')
  const reasonParam = searchParams.get('reason')

  const [order, setOrder] = React.useState<OrderDetails | null>(null)
  const [loading, setLoading] = React.useState(Boolean(uuidParam))
  const [copied, setCopied] = React.useState(false)

  React.useEffect(() => {
    if (!uuidParam) {
      setLoading(false)
      return
    }

    let isMounted = true
    fetch(`/api/payment/status?uuid=${encodeURIComponent(uuidParam)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data?.success && data?.order) {
          setOrder(data.order)
        }
      })
      .catch((err) => {
        console.error('Failed to fetch payment status:', err)
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [uuidParam])

  const copyRef = (text: string) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const isSuccess =
    statusParam === 'success' || (order && order.status === 'paid')

  const effectiveRefId =
    order?.refId || refParam || (order?.transactionUuid ? `REF-${order.transactionUuid.slice(-6)}` : '')

  const waUrl = order
    ? createAdvanceBookingWhatsAppUrl({
        name: order.customerName,
        phone: order.customerPhone,
        service: order.serviceDetails || order.packageName,
        date: order.bookingDate || undefined,
        advanceAmount: order.amount,
        paymentMethod: 'esewa',
        refId: effectiveRefId,
        transactionUuid: order.transactionUuid,
      })
    : `https://wa.me/9779856010315?text=${encodeURIComponent(
        `Hi Wedding Moment Nepal, I completed an advance payment via eSewa with Reference ID: ${effectiveRefId || uuidParam}. Please confirm my booking!`
      )}`

  if (loading) {
    return (
      <div className="max-w-xl mx-auto text-center py-20 px-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary/80 border border-border mb-6">
          <Clock className="w-8 h-8 text-gold animate-spin" />
        </div>
        <h1 className="font-serif text-2xl font-bold text-foreground mb-3">
          Verifying Payment with eSewa...
        </h1>
        <p className="text-sm text-muted-foreground">
          We are confirming your transaction status directly with eSewa. Please do not refresh or close this tab.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 md:py-12">
      {isSuccess ? (
        /* SUCCESS SCREEN */
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden animate-in fade-in-50 zoom-in-95 duration-300">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-gold to-emerald-500" />

          {/* Status Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 mb-4 shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Official eSewa Payment
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
              Booking Confirmed!
            </h1>
            <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
              Your advance deposit has been verified. Your session slot has been locked with the Wedding Moment Nepal photography team.
            </p>
          </div>

          {/* Receipt Card */}
          <div className="bg-secondary/40 border border-border/80 rounded-xl p-5 mb-6 space-y-3">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                Advance Deposit Paid
              </span>
              <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-serif">
                NPR {Number(order?.amount || 0).toLocaleString()}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
              <div>
                <span className="text-muted-foreground block text-[11px]">Customer Name</span>
                <span className="font-semibold text-foreground">{order?.customerName || 'Customer'}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Contact Mobile</span>
                <span className="font-semibold text-foreground">{order?.customerPhone || 'Provided'}</span>
              </div>
              {order?.bookingDate && (
                <div>
                  <span className="text-muted-foreground block text-[11px]">Reserved Date (BS)</span>
                  <span className="font-semibold text-foreground flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3 h-3 text-gold" />
                    {formatBsDate(order.bookingDate, { showAd: true })}
                  </span>
                </div>
              )}
              <div>
                <span className="text-muted-foreground block text-[11px]">Package</span>
                <span className="font-semibold text-foreground">
                  {order?.serviceDetails || order?.packageName || 'Photography Session'}
                </span>
              </div>
            </div>

            {/* Reference IDs */}
            <div className="pt-3 border-t border-border/60 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div>
                <span className="text-muted-foreground block text-[11px]">eSewa Ref Code</span>
                <span className="font-mono font-bold text-foreground">
                  {effectiveRefId || 'Verified'}
                </span>
              </div>
              {effectiveRefId && (
                <button
                  onClick={() => copyRef(effectiveRefId)}
                  className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground bg-background px-2.5 py-1 rounded border border-border transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-500" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" /> Copy Reference
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* WhatsApp Direct Notify Banner */}
          <div className="bg-[#25D366]/10 border border-[#25D366]/30 rounded-xl p-4 mb-6 text-center sm:text-left sm:flex sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-foreground flex items-center justify-center sm:justify-start gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-gold" />
                Notify Studio on WhatsApp (Recommended)
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Tap to send your pre-filled verification code directly to our team for immediate schedule alignment.
              </p>
            </div>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 sm:mt-0 shrink-0 inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm transition-transform active:scale-95"
            >
              <MessageCircle className="w-4 h-4" />
              Open WhatsApp
            </a>
          </div>

          {/* Action Links */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link href="/" className="flex-1">
              <Button variant="outline" className="w-full text-xs h-10 border-border">
                Return to Home
              </Button>
            </Link>
            <Link href="/gallery" className="flex-1">
              <Button className="w-full text-xs h-10 bg-gold text-black hover:bg-gold/90 font-semibold gap-1.5">
                View Studio Gallery <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        /* FAILURE / CANCELLED SCREEN */
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden animate-in fade-in-50 zoom-in-95 duration-300">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-destructive" />

          {/* Status Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/15 border border-destructive/30 text-destructive mb-4 shadow-inner">
              <XCircle className="w-9 h-9" />
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
              Payment Incomplete
            </h1>
            <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
              {reasonParam === 'cancelled_by_user'
                ? 'The payment session on eSewa was cancelled. No charges were made to your account.'
                : 'Your payment could not be verified by eSewa or the transaction was declined. No reservation was made.'}
            </p>
          </div>

          {/* Info Card */}
          <div className="bg-secondary/40 border border-border rounded-xl p-5 mb-6 text-xs text-muted-foreground space-y-2">
            <p className="font-medium text-foreground">What happens now?</p>
            <ul className="list-disc list-inside space-y-1 pl-1 text-[11px]">
              <li>No money was deducted from your eSewa wallet or bank account.</li>
              <li>Your dates are still available for booking on our schedule.</li>
              <li>You can retry the advance payment or contact our studio directly on WhatsApp.</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/booking?tab=advance" className="flex-1">
              <Button className="w-full text-xs h-10 bg-gold text-black hover:bg-gold/90 font-semibold gap-1.5">
                <RotateCcw className="w-3.5 h-3.5" /> Try Booking Again
              </Button>
            </Link>
            <a
              href="https://wa.me/9779856010315?text=Hi%20Wedding%20Moment%2C%20I%20had%20an%20issue%20with%20eSewa%20payment%20for%20advance%20booking.%20Can%20you%20help%3F"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1"
            >
              <Button variant="outline" className="w-full text-xs h-10 border-border gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" /> Chat on WhatsApp
              </Button>
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

export default function BookingStatusPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 pt-24 pb-16 flex items-center justify-center">
        <Suspense
          fallback={
            <div className="max-w-xl mx-auto text-center py-20 px-4">
              <Clock className="w-8 h-8 text-gold animate-spin mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Loading booking status...</p>
            </div>
          }
        >
          <StatusContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
