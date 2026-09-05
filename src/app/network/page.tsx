import * as React from 'react'
import Link from 'next/link'
import { Metadata } from 'next'
import { NetworkAccessCard } from '@/components/site/network-access-card'
import { ArrowLeft, Wifi, Shield, Laptop, Smartphone, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Local Network Access | Wedding Moment',
  description: 'Connect to the local development server from other devices on the same Wi-Fi network.',
}

export default function NetworkAccessPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto w-full">
        {/* Navigation back */}
        <div className="mb-6 flex items-center justify-between">
          <Button asChild variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
            <Link href="/">
              <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
              Back to Website
            </Link>
          </Button>

          <span className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5 text-emerald-500" />
            Private LAN Only
          </span>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-gold/15 text-gold border border-gold/30 mb-3 shadow-sm">
            <Wifi className="h-6 w-6" />
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Local Network Access
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-2 max-w-md mx-auto">
            Test and preview Wedding Moment on mobile phones, tablets, or other computers connected to the same Wi-Fi router.
          </p>
        </div>

        {/* Network Access Card */}
        <NetworkAccessCard className="mb-8" />

        {/* 3 Step Connection Guide */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="font-serif text-sm font-bold text-foreground mb-4 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-gold" />
            How to Connect from Your Phone or Other Device
          </h2>

          <ol className="space-y-3.5 text-xs text-muted-foreground">
            <li className="flex items-start gap-3">
              <span className="h-5 w-5 rounded-full bg-secondary border border-border font-bold text-foreground flex items-center justify-center shrink-0 text-[10px]">
                1
              </span>
              <div>
                <strong className="text-foreground font-semibold">Connect to the Same Wi-Fi:</strong> Ensure both your computer and testing phone/laptop are connected to the exact same Wi-Fi network.
              </div>
            </li>

            <li className="flex items-start gap-3">
              <span className="h-5 w-5 rounded-full bg-secondary border border-border font-bold text-foreground flex items-center justify-center shrink-0 text-[10px]">
                2
              </span>
              <div>
                <strong className="text-foreground font-semibold">Open Browser or Scan QR:</strong> On your phone, scan the QR code above or open Safari / Chrome and type the local address shown above.
              </div>
            </li>

            <li className="flex items-start gap-3">
              <span className="h-5 w-5 rounded-full bg-secondary border border-border font-bold text-foreground flex items-center justify-center shrink-0 text-[10px]">
                3
              </span>
              <div>
                <strong className="text-foreground font-semibold">Private &amp; Secure:</strong> Traffic is strictly contained to your local Wi-Fi router. The server is not exposed to the public internet.
              </div>
            </li>
          </ol>
        </div>
      </div>
    </div>
  )
}
