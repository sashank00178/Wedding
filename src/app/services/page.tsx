'use client'

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Camera,
  Heart,
  CheckCircle2,
  Sparkles,
  Clock,
  ShieldCheck,
  ArrowRight,
  HelpCircle,
} from 'lucide-react'
import { Header } from '@/components/site/header'
import { Footer } from '@/components/site/footer'
import { Button } from '@/components/ui/button'
import { SERVICES, SITE, type ServiceInfo } from '@/lib/site'
import { WhatsAppButton } from '@/components/site/whatsapp-button'
import { cn } from '@/lib/utils'

interface ServiceDetail extends ServiceInfo {
  tagline: string
  deliverables: string[]
  idealFor: string
  duration: string
}

const SERVICE_DETAILS: Record<string, { tagline: string; deliverables: string[]; idealFor: string; duration: string }> = {
  wedding: {
    tagline: 'Comprehensive ceremonial coverage with dedicated Bride Side, Groom Side, and Combo packages',
    deliverables: [
      'Bride Side, Groom Side & Grand Combo packages',
      'Dual & triple senior photographer crew coverage',
      'Cinematic 4K teaser reels delivered within 72 hours',
      'High-resolution color-graded digital master gallery',
      'Drone aerial venue & procession photography',
      'Custom luxury heirloom photobook & framed portraits',
    ],
    idealFor: 'Traditional Nepali weddings, multi-day celebrations, receptions, and destination ceremonies.',
    duration: 'Single-event or multi-day coverage (NPR 35,000 - NPR 50,000)',
  },
  portrait: {
    tagline: 'Premium indoor studio sessions featuring Couple, Family, Graduation, and Maternity photoshoots',
    deliverables: [
      'Dedicated indoor studio backdrops & artistic lighting',
      'Couple Portrait / Pre-Wedding (1h or 3h packages with prints & reels)',
      'Family Photoshoot (20 edited photos, 1 reel, framed print)',
      'Graduation Photoshoot with university gowns (PU, TU, KU)',
      'Maternity Photoshoot with wardrobe & makeup options',
    ],
    idealFor: 'Couples, expectant mothers, graduating students, and multi-generational families.',
    duration: '1 to 3 hours based on selected package',
  },
}

const FAQS = [
  {
    q: 'How do I secure our photoshoot date?',
    a: 'You can reserve your date online with an advance deposit through eSewa, Khalti, or bank transfer via our booking system, or contact our admin team directly on WhatsApp.',
  },
  {
    q: 'Do you travel outside of Pokhara?',
    a: 'Yes! While our primary studio is based in Pokhara (Simalchour & Lakeside), our team regularly travels throughout Gandaki province, Kathmandu, Chitwan, and destination venues across Nepal.',
  },
  {
    q: 'When and how will we receive our photographs?',
    a: 'You will receive teaser highlights within 48-72 hours. Your complete color-graded collection is delivered via a private online digital gallery within 2 to 3 weeks.',
  },
  {
    q: 'Can we customize our photography package?',
    a: 'Absolutely. Every event is unique. If our standard packages don\'t match your exact timeline or specific needs, reach out to us and we will prepare a tailored quote for you.',
  },
]

export default function ServicesPage() {
  const [services, setServices] = React.useState<ServiceInfo[]>(SERVICES)

  React.useEffect(() => {
    fetch('/api/site-data')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.services?.length) {
          setServices(data.services)
        }
      })
      .catch(() => {})
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 pt-14 sm:pt-16 pb-16">
        {/* Page Hero Header */}
        <section className="relative py-7 sm:py-9 bg-secondary/30 border-b border-border/80">
          <div className="container mx-auto max-w-4xl px-4 sm:px-6 text-center">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gold/15 border border-gold/30 text-gold text-[11px] font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="h-3 w-3" />
              Professional Photography Services
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground mb-2.5">
              Capturing Every Moment with{' '}
              <span className="text-gold italic">Artistry &amp; Precision</span>
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Based in Pokhara, Nepal, Wedding Moment Studio offers comprehensive photography packages tailored for weddings and bespoke indoor portraits.
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
              <Button asChild size="sm" className="h-8 px-3.5 bg-gold text-black hover:bg-gold/90 font-semibold text-xs">
                <Link href="/#booking">
                  Book a Session
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Link>
              </Button>
              <WhatsAppButton variant="outline" className="text-xs h-8 border-border px-3" />
            </div>
          </div>
        </section>

        {/* Detailed Service Cards */}
        <section className="py-8 sm:py-12">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="space-y-10">
              {services.map((service, index) => {
                const details = SERVICE_DETAILS[service.key] || {
                  tagline: service.description,
                  deliverables: [
                    'Professional camera & lighting setup',
                    'High-resolution digital files',
                    'Artistic color grading & retouching',
                    'Online client gallery delivery',
                  ],
                  idealFor: 'Clients seeking professional studio & location photography in Nepal.',
                  duration: 'Tailored per session',
                }

                const isEven = index % 2 === 0

                return (
                  <article
                    key={service.key}
                    id={service.key}
                    className="bg-card border border-border/80 rounded-2xl p-5 sm:p-7 lg:p-8 shadow-sm transition-all hover:border-gold/40 hover:shadow-md"
                  >
                    <div className={cn(
                      'grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center',
                      !isEven && 'lg:grid-flow-dense'
                    )}>
                      {/* Image Preview */}
                      <div className={cn('lg:col-span-5 relative', !isEven && 'lg:col-start-8')}>
                        <div className="relative aspect-[4/3] sm:aspect-[16/10] lg:aspect-[4/3] w-full rounded-xl overflow-hidden bg-secondary border border-border shadow-sm">
                          <Image
                            src={service.key === 'portrait' ? '/gallery/indoor/IMG_7952.JPG' : (service.image || '/gallery/wedding-photography.jpg')}
                            alt={service.title}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 40vw"
                            quality={80}
                            className={cn(
                              "object-cover",
                              service.key === 'portrait' ? "object-[center_30%]" : "object-[center_35%]"
                            )}
                          />
                        </div>
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1 rounded-full bg-black/75 backdrop-blur-md text-gold text-xs font-bold uppercase tracking-wider border border-gold/40 shadow-sm">
                            {service.key === 'portrait'
                              ? '4 Studio Sessions • From NPR 5,000'
                              : service.key === 'wedding'
                              ? '3 Ceremony Categories • From NPR 35,000'
                              : (service.priceLabel || `Starting ${service.priceFrom}`)}
                          </span>
                        </div>
                      </div>

                      {/* Content Details */}
                      <div className={cn('lg:col-span-7 space-y-5', !isEven && 'lg:col-start-1')}>
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-widest text-gold">
                            Package Overview
                          </span>
                          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground mt-1">
                            {service.key === 'portrait' ? (
                              <Link
                                href="/services/indoor-photography"
                                className="hover:text-gold transition-colors"
                              >
                                {service.title}
                              </Link>
                            ) : service.key === 'wedding' ? (
                              <Link
                                href="/services/wedding-photography"
                                className="hover:text-gold transition-colors"
                              >
                                {service.title}
                              </Link>
                            ) : (
                              service.title
                            )}
                          </h2>
                          <p className="text-sm sm:text-base text-muted-foreground mt-2 leading-relaxed">
                            {details.tagline}
                          </p>
                        </div>

                        {/* Indoor Sub-service Tags */}
                        {service.key === 'portrait' && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {['Couple / Pre-Wedding', 'Family Photoshoot', 'Graduation Photoshoot', 'Maternity Photoshoot'].map((tag) => (
                              <span
                                key={tag}
                                className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-secondary text-foreground/85 border border-border"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Wedding Category Tags */}
                        {service.key === 'wedding' && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {['Bride Side (NPR 35k)', 'Combo Complete (NPR 50k)', 'Groom Side (NPR 40k)'].map((tag) => (
                              <span
                                key={tag}
                                className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-secondary text-foreground/85 border border-border"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Deliverables Checklist */}
                        <div className="pt-2">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground mb-3">
                            What&apos;s Included in this Package:
                          </h3>
                          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {details.deliverables.map((item, i) => (
                              <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-foreground/90">
                                <CheckCircle2 className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Metadata pills */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border/60 text-xs">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-4 w-4 text-gold shrink-0" />
                            <span><strong>Session Duration:</strong> {details.duration}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <ShieldCheck className="h-4 w-4 text-gold shrink-0" />
                            <span><strong>Guaranteed Delivery:</strong> Private Cloud Portal</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-4 flex flex-wrap items-center gap-3">
                          {service.key === 'portrait' ? (
                            <>
                              <Button asChild className="bg-gold text-black hover:bg-gold/90 font-semibold text-xs shadow-md active:scale-95">
                                <Link href="/services/indoor-photography">
                                  View Details &amp; Packages
                                  <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                                </Link>
                              </Button>
                              <Button asChild variant="outline" className="text-xs border-border hover:border-gold/50">
                                <Link href="/booking?tab=advance&package=indoor-couple-p1">
                                  Book Advance Deposit
                                </Link>
                              </Button>
                            </>
                          ) : service.key === 'wedding' ? (
                            <>
                              <Button asChild className="bg-gold text-black hover:bg-gold/90 font-semibold text-xs shadow-md active:scale-95">
                                <Link href="/services/wedding-photography">
                                  View Details &amp; Packages
                                  <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                                </Link>
                              </Button>
                              <Button asChild variant="outline" className="text-xs border-border hover:border-gold/50">
                                <Link href="/booking?tab=advance&package=wedding-combo-all">
                                  Book Advance Deposit
                                </Link>
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button asChild className="bg-gold text-black hover:bg-gold/90 font-semibold text-xs">
                                <Link href={`/#booking?service=${service.key}`}>
                                  Book {service.title}
                                  <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                                </Link>
                              </Button>
                              <Button asChild variant="outline" className="text-xs border-border">
                                <Link href="/gallery">
                                  View Portfolio Samples
                                </Link>
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        {/* Why Choose Us & Equipment Standards */}
        <section className="py-16 bg-secondary/20 border-y border-border/70">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="text-xs font-bold uppercase tracking-widest text-gold">The Studio Standard</span>
              <h2 className="font-serif text-3xl font-bold mt-1">Why Clients Trust Wedding Moment</h2>
              <p className="text-sm text-muted-foreground mt-2">
                We combine top-tier gear, decades of creative experience, and a deep love for Nepali culture to deliver photographs that stand the test of time.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm text-center">
                <div className="h-12 w-12 rounded-full bg-gold/15 text-gold flex items-center justify-center mx-auto mb-4">
                  <Camera className="h-6 w-6" />
                </div>
                <h3 className="font-serif text-lg font-bold mb-2">Cinema-Grade Equipment</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Dual-card backup recording on full-frame sensors and G-Master prime lenses ensure your irreplaceable memories are safe and razor-sharp.
                </p>
              </div>

              <div className="bg-card border border-border rounded-xl p-6 shadow-sm text-center">
                <div className="h-12 w-12 rounded-full bg-gold/15 text-gold flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-6 w-6" />
                </div>
                <h3 className="font-serif text-lg font-bold mb-2">Fast Highlight Delivery</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Receive curated social media teaser shots within 48 to 72 hours of your ceremony, so you can share your joy without waiting weeks.
                </p>
              </div>

              <div className="bg-card border border-border rounded-xl p-6 shadow-sm text-center">
                <div className="h-12 w-12 rounded-full bg-gold/15 text-gold flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-6 w-6" />
                </div>
                <h3 className="font-serif text-lg font-bold mb-2">Scenic Local Knowledge</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  We guide you to Pokhara&apos;s most breathtaking, secluded locations—from tranquil Phewa Lake shorelines to golden Sarangkot mountain views.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-16 sm:py-20">
          <div className="container mx-auto max-w-4xl px-4 sm:px-6">
            <div className="text-center mb-10">
              <span className="text-xs font-bold uppercase tracking-widest text-gold">Common Inquiries</span>
              <h2 className="font-serif text-3xl font-bold mt-1">Frequently Asked Questions</h2>
            </div>

            <div className="space-y-4">
              {FAQS.map((faq, idx) => (
                <div key={idx} className="bg-card border border-border rounded-xl p-5 shadow-sm">
                  <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-gold shrink-0" />
                    {faq.q}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-2 pl-6 leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-12 bg-card border-t border-border">
          <div className="container mx-auto max-w-4xl px-4 text-center">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-3">Ready to Reserve Your Shoot?</h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto mb-6">
              Our studio schedule fills quickly during wedding and peak travel seasons. Secure your date now or chat with our team.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button asChild className="bg-gold text-black hover:bg-gold/90 font-semibold text-sm">
                <Link href="/#booking">
                  Go to Booking Form
                </Link>
              </Button>
              <WhatsAppButton variant="navbar" className="text-sm" />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
