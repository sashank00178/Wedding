'use client'

import * as React from 'react'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Header } from '@/components/site/header'
import { Booking } from '@/components/site/booking'
import { Footer } from '@/components/site/footer'

function BookingContent() {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab')

  React.useEffect(() => {
    if (tabParam === 'advance') {
      window.dispatchEvent(
        new CustomEvent('booking-tab-change', { detail: 'advance' })
      )
    } else if (tabParam === 'booking') {
      window.dispatchEvent(
        new CustomEvent('booking-tab-change', { detail: 'booking' })
      )
    }
  }, [tabParam])

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 pt-24 pb-12">
        <Booking />
      </main>
      <Footer />
    </div>
  )
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <BookingContent />
    </Suspense>
  )
}
