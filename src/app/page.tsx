import { Header } from '@/components/layout/header'
import { Hero } from '@/components/hero/hero-section'
import { Services } from '@/components/services/services-showcase'
import { Gallery } from '@/components/gallery/gallery-grid'
import { Booking } from '@/components/booking/booking-form'
import { Contact } from '@/components/layout/contact'
import { Footer } from '@/components/layout/footer'
import { getDynamicHeroImages } from '@/services/galleryService'

export default function Home() {
  const heroImages = getDynamicHeroImages()

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <Hero initialImages={heroImages} />
        <Services />
        <Gallery />
        <Booking />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}

