'use client'

import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Shield,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Loader2,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  KeyRound,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

function AdminLoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/admin/dashboard'

  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [showPassword, setShowPassword] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  // Forgot Password modal state
  const [forgotOpen, setForgotOpen] = React.useState(false)
  const [resetEmail, setResetEmail] = React.useState('')
  const [resetKey, setResetKey] = React.useState('')
  const [newPassword, setNewPassword] = React.useState('')
  const [resetStep, setResetStep] = React.useState<'request' | 'reset'>('request')
  const [resetLoading, setResetLoading] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!email.trim()) {
      setErrorMessage('Please enter your admin email or username.')
      return
    }

    if (!password) {
      setErrorMessage('Please enter your password.')
      return
    }

    setLoading(true)

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email: email.trim().toLowerCase(),
        password,
      })

      if (res?.error) {
        setErrorMessage('Invalid credentials. Please verify your email and password.')
        toast.error('Authentication failed')
      } else {
        toast.success('Welcome back, Admin!')
        router.push(callbackUrl)
        router.refresh()
      }
    } catch (err) {
      console.error('Login error:', err)
      setErrorMessage('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resetEmail.trim()) {
      toast.error('Please enter your email.')
      return
    }

    setResetLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail.trim() }),
      })
      const data = await res.json()

      if (res.ok) {
        toast.success('Reset instructions sent / generated')
        if (data.token) {
          setResetKey(data.token)
        }
        setResetStep('reset')
      } else {
        toast.error(data.error || 'Failed to process request')
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setResetLoading(false)
    }
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resetKey.trim() || !newPassword.trim()) {
      toast.error('Please fill in all reset fields.')
      return
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters.')
      return
    }

    setResetLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: resetKey.trim(),
          password: newPassword,
        }),
      })
      const data = await res.json()

      if (res.ok) {
        toast.success('Password updated successfully! You can now log in.')
        setForgotOpen(false)
        setResetStep('request')
        setResetKey('')
        setNewPassword('')
      } else {
        toast.error(data.error || 'Invalid or expired reset token.')
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setResetLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative luxury gold ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gold/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-72 h-72 bg-gold/5 rounded-full blur-2xl pointer-events-none" />

      {/* Back to site link */}
      <div className="absolute top-6 left-6 z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-muted-foreground hover:text-gold transition-colors py-2 px-3 rounded-full bg-secondary/50 border border-border"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Website
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-3 group">
            <div className="relative h-12 w-12 shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Image
                src="/logo.svg"
                alt="Wedding Moment Logo"
                width={48}
                height={48}
                className="h-11 w-11 object-contain drop-shadow-sm"
              />
            </div>
            <span className="font-serif text-2xl font-bold tracking-tight text-foreground">
              Wedding<span className="text-gold">Moment</span>
            </span>
          </Link>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs font-semibold tracking-wider uppercase mb-2">
            <Shield className="h-3 w-3" />
            Admin Portal
          </div>
          <p className="text-sm text-muted-foreground">
            Sign in to manage bookings, services, gallery &amp; studio content.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-card border border-border rounded-2xl shadow-xl p-6 sm:p-8 relative">
          {errorMessage && (
            <div className="mb-6 p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 flex items-start gap-3 text-sm text-destructive animate-in fade-in-50">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Access Denied</p>
                <p className="text-xs opacity-90 mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email field */}
            <div className="space-y-2">
              <Label htmlFor="admin-email" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="admin-email"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@weddingmomentnepal.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 h-11 bg-background border-border focus-visible:ring-gold"
                  required
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="admin-password" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                  Password
                </Label>
                <button
                  type="button"
                  onClick={() => setForgotOpen(true)}
                  className="text-xs text-gold hover:underline font-medium"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-10 h-11 bg-background border-border focus-visible:ring-gold"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-gold text-black hover:bg-gold/90 font-semibold tracking-wide shadow-md transition-all mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Authenticating...
                </>
              ) : (
                'Sign In to Dashboard'
              )}
            </Button>
          </form>

          {/* Helper hint for default credentials */}
          <div className="mt-6 pt-5 border-t border-border/80 text-center">
            <p className="text-xs text-muted-foreground">
              Default Admin: <span className="font-mono text-foreground font-medium">weddingmomentpkr@gmail.com</span>
            </p>
          </div>
        </div>
      </div>

      {/* Forgot Password Dialog */}
      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-gold" />
              Reset Admin Password
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {resetStep === 'request'
                ? 'Enter your registered administrator email to initiate a password reset.'
                : 'Enter your reset recovery key and choose a new password.'}
            </DialogDescription>
          </DialogHeader>

          {resetStep === 'request' ? (
            <form onSubmit={handleResetRequest} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="reset-email" className="text-xs uppercase tracking-wider text-muted-foreground">
                  Admin Email
                </Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="weddingmomentpkr@gmail.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="bg-background border-border"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setForgotOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={resetLoading}
                  className="bg-gold text-black hover:bg-gold/90 font-semibold"
                >
                  {resetLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                  ) : null}
                  Continue
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handlePasswordUpdate} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="reset-token" className="text-xs uppercase tracking-wider text-muted-foreground">
                  Reset Token / Recovery Key
                </Label>
                <Input
                  id="reset-token"
                  placeholder="Paste reset token here"
                  value={resetKey}
                  onChange={(e) => setResetKey(e.target.value)}
                  className="bg-background border-border font-mono text-xs"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-pass" className="text-xs uppercase tracking-wider text-muted-foreground">
                  New Password (min 6 characters)
                </Label>
                <Input
                  id="new-pass"
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-background border-border"
                  required
                />
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setResetStep('request')}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  &larr; Back
                </button>
                <Button
                  type="submit"
                  disabled={resetLoading}
                  className="bg-gold text-black hover:bg-gold/90 font-semibold"
                >
                  {resetLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                  ) : null}
                  Set New Password
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-background" />}>
      <AdminLoginForm />
    </React.Suspense>
  )
}
