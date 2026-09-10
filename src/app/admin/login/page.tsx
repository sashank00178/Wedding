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
  RefreshCw,
  Sparkles,
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

  // Login form state
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [showPassword, setShowPassword] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
  const [successBanner, setSuccessBanner] = React.useState<string | null>(null)

  // Forgot Password modal state (PIN-based recovery)
  const [forgotOpen, setForgotOpen] = React.useState(false)
  const [resetStep, setResetStep] = React.useState<'pin' | 'password'>('pin')
  const [recoveryPin, setRecoveryPin] = React.useState('')
  const [showRecoveryPin, setShowRecoveryPin] = React.useState(false)
  const [resetTicket, setResetTicket] = React.useState('')
  const [newPassword, setNewPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')
  const [showNewPassword, setShowNewPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)
  const [resetLoading, setResetLoading] = React.useState(false)
  const [resetError, setResetError] = React.useState<string | null>(null)

  const openForgotPassword = () => {
    setResetError(null)
    setResetStep('pin')
    setRecoveryPin('')
    setShowRecoveryPin(false)
    setResetTicket('')
    setNewPassword('')
    setConfirmPassword('')
    setForgotOpen(true)
  }

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessBanner(null)

    if (!email.trim()) {
      setErrorMessage('Please enter your admin email.')
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
        setErrorMessage(res.error || 'Invalid credentials. Please verify your email and password.')
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

  // STEP 1: Verify Master Recovery PIN
  const handleVerifyPin = async (e: React.FormEvent) => {
    e.preventDefault()
    setResetError(null)

    const cleanPin = recoveryPin.trim()
    if (!cleanPin) {
      setResetError('Please enter your secret recovery PIN.')
      return
    }

    setResetLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify-pin',
          pin: cleanPin,
          email: email.trim().toLowerCase() || undefined,
        }),
      })
      const data = await res.json()

      if (res.ok && data.resetTicket) {
        toast.success('Recovery PIN verified!')
        setResetTicket(data.resetTicket)
        if (data.adminEmail) {
          setEmail(data.adminEmail)
        }
        setResetStep('password')
        setResetError(null)
      } else {
        setResetError(data.error || 'Incorrect recovery PIN. Please try again.')
      }
    } catch {
      setResetError('Network error. Please check your connection and try again.')
    } finally {
      setResetLoading(false)
    }
  }

  // STEP 2: Set and confirm new password
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setResetError(null)

    if (newPassword.length < 6) {
      setResetError('New password must be at least 6 characters long.')
      return
    }

    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match. Please verify.')
      return
    }

    setResetLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resetTicket,
          password: newPassword,
          email: email.trim().toLowerCase() || undefined,
        }),
      })
      const data = await res.json()

      if (res.ok) {
        const targetEmail = data.email || email.trim().toLowerCase() || 'weddingmomentpkr@gmail.com'
        toast.success('Password updated successfully!')
        setSuccessBanner('Password updated successfully. Please log in with your new password.')
        setEmail(targetEmail)
        setPassword('')
        setForgotOpen(false)
        setResetStep('pin')
        setRecoveryPin('')
        setResetTicket('')
        setNewPassword('')
        setConfirmPassword('')
        setResetError(null)
      } else {
        setResetError(data.error || 'Failed to update password. Please try again.')
      }
    } catch {
      setResetError('Network error. Please check your connection and try again.')
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
          {/* Success Banner (e.g. after password reset) */}
          {successBanner && (
            <div className="mb-6 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3 text-sm text-emerald-400 animate-in fade-in-50">
              <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5 text-emerald-400" />
              <div>
                <p className="font-semibold text-foreground">Success</p>
                <p className="text-xs opacity-90 mt-0.5">{successBanner}</p>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-6 p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 flex items-start gap-3 text-sm text-destructive animate-in fade-in-50">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Access Denied</p>
                <p className="text-xs opacity-90 mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-5">
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
                  onClick={openForgotPassword}
                  className="text-xs text-gold hover:underline font-medium transition-colors cursor-pointer"
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 cursor-pointer"
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
              className="w-full h-11 bg-gold text-black hover:bg-gold/90 font-semibold tracking-wide shadow-md transition-all mt-2 cursor-pointer"
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

      {/* Forgot Password Modal (3-Step Verification Code Flow) */}
      {/* Forgot Password Modal (PIN-Based Recovery Flow) */}
      <Dialog
        open={forgotOpen}
        onOpenChange={(open) => {
          setForgotOpen(open)
          if (!open) {
            setResetError(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-md bg-card border-border shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-gold" />
              {resetStep === 'pin' && 'Enter Recovery PIN'}
              {resetStep === 'password' && 'Set New Password'}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {resetStep === 'pin' && (
                'Enter the secret master recovery PIN provided directly by the site owner to reset the administrator password.'
              )}
              {resetStep === 'password' && (
                'Choose a strong new password for your administrator account.'
              )}
            </DialogDescription>
          </DialogHeader>

          {/* Modal error notification */}
          {resetError && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-2.5 text-xs text-destructive animate-in fade-in-50">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{resetError}</span>
            </div>
          )}

          {/* ──────────────── STEP 1: Enter Secret Recovery PIN ──────────────── */}
          {resetStep === 'pin' && (
            <form onSubmit={handleVerifyPin} className="space-y-4 pt-1">
              {/* Target admin indicator */}
              <div className="p-2.5 rounded-lg bg-secondary/40 border border-border/80 text-xs flex items-center justify-between text-muted-foreground">
                <span>Account to recover:</span>
                <span className="font-mono text-foreground font-semibold">
                  {email.trim() || 'weddingmomentpkr@gmail.com'}
                </span>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="recovery-pin-input"
                  className="text-xs uppercase tracking-wider text-muted-foreground font-semibold"
                >
                  Secret Recovery PIN
                </Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="recovery-pin-input"
                    type={showRecoveryPin ? 'text' : 'password'}
                    placeholder="Enter secret recovery PIN"
                    value={recoveryPin}
                    onChange={(e) => setRecoveryPin(e.target.value)}
                    className="pl-9 pr-10 h-12 bg-background border-border focus-visible:ring-gold font-mono text-base tracking-wider"
                    autoFocus
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowRecoveryPin((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 cursor-pointer"
                    aria-label={showRecoveryPin ? 'Hide PIN' : 'Show PIN'}
                  >
                    {showRecoveryPin ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 pt-0.5">
                  <Shield className="h-3 w-3 text-gold shrink-0" />
                  Protected by brute-force lockout (locked for 15 minutes after 5 failed attempts).
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setForgotOpen(false)}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={resetLoading || !recoveryPin.trim()}
                  className="bg-gold text-black hover:bg-gold/90 font-semibold cursor-pointer shadow-md"
                >
                  {resetLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Verifying PIN...
                    </>
                  ) : (
                    'Verify Recovery PIN'
                  )}
                </Button>
              </div>
            </form>
          )}

          {/* ──────────────── STEP 2: Set New Password ──────────────── */}
          {resetStep === 'password' && (
            <form onSubmit={handleSavePassword} className="space-y-4 pt-1">
              <div className="space-y-2">
                <Label
                  htmlFor="new-password-field"
                  className="text-xs uppercase tracking-wider text-muted-foreground font-semibold"
                >
                  New Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="new-password-field"
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-9 pr-10 bg-background border-border focus-visible:ring-gold"
                    autoFocus
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 cursor-pointer"
                    aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="confirm-password-field"
                  className="text-xs uppercase tracking-wider text-muted-foreground font-semibold"
                >
                  Confirm New Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirm-password-field"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Re-enter your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-9 pr-10 bg-background border-border focus-visible:ring-gold"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 cursor-pointer"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Password Match & Length Helper */}
              {newPassword && confirmPassword && (
                <div className="text-xs flex items-center gap-1.5">
                  {newPassword === confirmPassword ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Passwords match
                    </span>
                  ) : (
                    <span className="text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" /> Passwords do not match
                    </span>
                  )}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setForgotOpen(false)}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    resetLoading ||
                    newPassword.length < 6 ||
                    newPassword !== confirmPassword
                  }
                  className="bg-gold text-black hover:bg-gold/90 font-semibold cursor-pointer"
                >
                  {resetLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Updating Password...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-1.5" />
                      Set New Password
                    </>
                  )}
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
