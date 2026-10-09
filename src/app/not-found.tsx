import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-6xl font-extrabold text-gold mb-2 font-serif">404</h1>
        <h2 className="text-xl font-semibold mb-3">Page Not Found</h2>
        <p className="text-sm text-muted-foreground max-w-md mb-6">
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>
        <Button asChild className="bg-gold text-black hover:bg-gold/90 font-semibold text-sm">
          <Link href="/">Return Home</Link>
        </Button>
      </main>
      <Footer />
    </div>
  )
}
