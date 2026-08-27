import { Header } from '@/components/site/header'
import { Hero } from '@/components/site/hero'
import { Services } from '@/components/site/services'
import { Gallery } from '@/components/site/gallery'
import { Booking } from '@/components/site/booking'
import { Payment } from '@/components/site/payment'
import { Contact } from '@/components/site/contact'
import { Footer } from '@/components/site/footer'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <Hero />
        <Services />
        <Gallery />
        <Booking />
        <Payment />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}
