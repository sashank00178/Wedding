'use client'

import * as React from 'react'
import {
  Wifi,
  Smartphone,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  QrCode,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface NetworkData {
  ip: string
  port: number
  url: string
  interfaceName: string
  message: string
  security: string
}

export function NetworkAccessCard({ className }: { className?: string }) {
  const [data, setData] = React.useState<NetworkData>({
    ip: '192.168.1.8',
    port: 3000,
    url: 'http://192.168.1.8:3000',
    interfaceName: 'WiFi 2',
    message: 'Open this address on another device connected to the same Wi-Fi.',
    security: 'LAN Only (Local Wi-Fi). Public internet exposure is disabled.',
  })
  const [copied, setCopied] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [showQr, setShowQr] = React.useState(false)

  const fetchNetworkInfo = () => {
    setLoading(true)
    fetch('/api/network-info')
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.url) {
          setData({
            ip: json.ip || '192.168.1.8',
            port: json.port || 3000,
            url: json.url || `http://${json.ip || '192.168.1.8'}:3000`,
            interfaceName: json.interfaceName || 'Local Wi-Fi',
            message: json.message || 'Open this address on another device connected to the same Wi-Fi.',
            security: json.security || 'LAN Only (Local Wi-Fi)',
          })
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  React.useEffect(() => {
    fetchNetworkInfo()
  }, [])

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(data.url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // QR Code URL using standard HTTPS QR image service for zero-dependency instant scannability
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
    data.url
  )}`

  return (
    <div
      className={cn(
        'bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-sm transition-all relative overflow-hidden',
        className
      )}
    >
      {/* Background Accent Gradient */}
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-gold/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gold/15 text-gold flex items-center justify-center shrink-0 border border-gold/30">
            <Wifi className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-lg font-bold text-foreground">
                Network Access
              </h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Local Wi-Fi
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Interface: <span className="text-foreground font-medium">{data.interfaceName}</span> • Port: <span className="text-foreground font-medium">{data.port}</span>
            </p>
          </div>
        </div>

        <button
          onClick={fetchNetworkInfo}
          disabled={loading}
          title="Refresh Network IP"
          className="h-8 w-8 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary flex items-center justify-center transition-colors disabled:opacity-50"
        >
          <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
        </button>
      </div>

      {/* Primary Instruction Message */}
      <div className="bg-secondary/40 border border-border/80 rounded-xl p-3.5 mb-4 flex items-start gap-2.5">
        <Smartphone className="h-4 w-4 text-gold shrink-0 mt-0.5" />
        <p className="text-xs sm:text-sm font-medium text-foreground leading-relaxed">
          {data.message}
        </p>
      </div>

      {/* Local Address & Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-4">
        <div className="flex-1 bg-background border border-border rounded-xl px-3.5 py-2.5 flex items-center justify-between font-mono text-xs sm:text-sm text-foreground overflow-x-auto select-all">
          <span>{data.url}</span>
          <span className="text-[10px] uppercase text-muted-foreground ml-2 shrink-0 font-sans font-semibold">
            LAN URL
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            onClick={handleCopy}
            size="sm"
            variant="outline"
            className="h-10 px-3.5 text-xs font-semibold gap-1.5 border-border"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy</span>
              </>
            )}
          </Button>

          <Button
            onClick={() => setShowQr((v) => !v)}
            size="sm"
            variant="outline"
            className={cn(
              'h-10 px-3.5 text-xs font-semibold gap-1.5 border-border',
              showQr && 'bg-gold/15 text-gold border-gold/40'
            )}
          >
            <QrCode className="h-3.5 w-3.5" />
            <span>{showQr ? 'Hide QR' : 'Scan QR'}</span>
          </Button>
        </div>
      </div>

      {/* Collapsible Mobile QR Code Viewer */}
      {showQr && (
        <div className="bg-secondary/30 border border-border rounded-xl p-4 mb-4 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left animate-in fade-in-0 duration-150">
          <div className="bg-white p-2 rounded-lg shadow-sm shrink-0 border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrCodeUrl}
              alt="Scan QR code to access website on phone"
              width={120}
              height={120}
              className="h-[120px] w-[120px] object-contain"
            />
          </div>
          <div>
            <h4 className="font-serif text-sm font-bold text-foreground mb-1">
              Scan with your phone&apos;s camera
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Make sure your phone is connected to the same Wi-Fi network (<strong>{data.interfaceName}</strong>). Point your camera at this code to open the site directly.
            </p>
          </div>
        </div>
      )}

      {/* Security Note */}
      <div className="flex items-center gap-2 pt-3 border-t border-border/60 text-[11px] text-muted-foreground">
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
        <span>{data.security}</span>
      </div>
    </div>
  )
}
