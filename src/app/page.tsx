import { Header } from '@/components/site/header'
import { Hero } from '@/components/site/hero'
import { Services } from '@/components/site/services'
import { Gallery } from '@/components/site/gallery'
import { Booking } from '@/components/site/booking'
import { Contact } from '@/components/site/contact'
import { Footer } from '@/components/site/footer'
import { getDynamicHeroImages } from '@/lib/gallery-loader'

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

