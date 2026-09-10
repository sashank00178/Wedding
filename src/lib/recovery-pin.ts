/**
 * Admin Recovery PIN Service — Wedding Moment Nepal
 *
 * Provides secure verification for the owner-controlled master recovery PIN:
 * - Checks submitted PIN against ADMIN_RECOVERY_PIN_HASH (bcrypt) from process.env.
 * - Brute-force protection: Locks out client IP after 5 failed attempts for 15 minutes.
 * - Informs client of remaining attempts before lockout.
 * - Never leaks the secret PIN to client or logs.
 */

import bcrypt from 'bcryptjs'

const MAX_FAILED_ATTEMPTS = 5
const LOCKOUT_DURATION_MS = 15 * 60 * 1000 // 15 minutes

interface PinAttemptRecord {
  attempts: number
  lockedUntil: number | null
  lastAttemptAt: number
}

// In-memory tracker for PIN attempts per IP address
const attemptStore = new Map<string, PinAttemptRecord>()

// Periodic cleanup of expired records every 10 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, record] of attemptStore.entries()) {
      if (record.lockedUntil && record.lockedUntil < now) {
        attemptStore.delete(key)
      } else if (now - record.lastAttemptAt > LOCKOUT_DURATION_MS) {
        attemptStore.delete(key)
      }
    }
  }, 10 * 60 * 1000)
}

export interface PinVerificationResult {
  success: boolean
  locked?: boolean
  remainingAttempts?: number
  remainingMinutes?: number
  error?: string
}

/**
 * Checks if recovery attempts from an IP are currently locked out.
 */
export function checkPinLockout(ip: string): { locked: boolean; remainingMinutes: number } {
  const record = attemptStore.get(ip)
  if (!record || !record.lockedUntil) {
    return { locked: false, remainingMinutes: 0 }
  }

  const now = Date.now()
  if (record.lockedUntil > now) {
    const remainingMinutes = Math.max(1, Math.ceil((record.lockedUntil - now) / 60000))
    return { locked: true, remainingMinutes }
  }

  // Lockout has expired — clear record
  attemptStore.delete(ip)
  return { locked: false, remainingMinutes: 0 }
}

/**
 * Records a failed PIN attempt and handles the 15-minute lockout logic.
 */
export function recordFailedPinAttempt(ip: string): PinVerificationResult {
  const now = Date.now()
  const record = attemptStore.get(ip) || { attempts: 0, lockedUntil: null, lastAttemptAt: now }

  record.attempts += 1
  record.lastAttemptAt = now

  if (record.attempts >= MAX_FAILED_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_DURATION_MS
    attemptStore.set(ip, record)
    return {
      success: false,
      locked: true,
      remainingAttempts: 0,
      remainingMinutes: 15,
      error: 'Too many failed recovery PIN attempts. Access is locked for 15 minutes to protect this account.',
    }
  }

  attemptStore.set(ip, record)
  const remaining = MAX_FAILED_ATTEMPTS - record.attempts
  return {
    success: false,
    locked: false,
    remainingAttempts: remaining,
    error: `Incorrect recovery PIN. You have ${remaining} attempt${remaining === 1 ? '' : 's'} remaining before a 15-minute lockout.`,
  }
}

/**
 * Clears failed PIN attempts for an IP (called upon successful verification).
 */
export function clearPinAttempts(ip: string): void {
  attemptStore.delete(ip)
}

/**
 * Verifies a submitted PIN against the configured ADMIN_RECOVERY_PIN_HASH (or ADMIN_RECOVERY_PIN)
 * with strict rate-limiting and brute-force lockout.
 */
export async function verifyAdminRecoveryPin(
  submittedPin: string,
  ip: string
): Promise<PinVerificationResult> {
  const cleanPin = String(submittedPin || '').trim()

  if (!cleanPin) {
    return {
      success: false,
      error: 'Please enter your recovery PIN.',
    }
  }

  // 1. Check if IP is locked out
  const lockStatus = checkPinLockout(ip)
  if (lockStatus.locked) {
    return {
      success: false,
      locked: true,
      remainingAttempts: 0,
      remainingMinutes: lockStatus.remainingMinutes,
      error: `Too many failed recovery PIN attempts. Access is locked for ${lockStatus.remainingMinutes} minute${lockStatus.remainingMinutes === 1 ? '' : 's'}.`,
    }
  }

  // 2. Read configured PIN from environment or .env file fallback
  let configuredHash = process.env.ADMIN_RECOVERY_PIN_HASH?.trim()?.replace(/^["']|["']$/g, '')
  let fallbackPlainPin = process.env.ADMIN_RECOVERY_PIN?.trim()?.replace(/^["']|["']$/g, '')

  // If hash is missing or was mangled/expanded by dotenv, read directly from .env file
  if (!configuredHash || (!configuredHash.startsWith('$2a$') && !configuredHash.startsWith('$2b$'))) {
    try {
      const fs = require('fs')
      const path = require('path')
      const envPath = path.resolve(process.cwd(), '.env')
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8')
        for (const line of content.split('\n')) {
          const matchHash = line.match(/^\s*ADMIN_RECOVERY_PIN_HASH\s*=\s*(.*)$/)
          if (matchHash) {
            configuredHash = matchHash[1].trim().replace(/^["']|["']$/g, '')
          }
          const matchPlain = line.match(/^\s*ADMIN_RECOVERY_PIN\s*=\s*(.*)$/)
          if (matchPlain) {
            fallbackPlainPin = matchPlain[1].trim().replace(/^["']|["']$/g, '')
          }
        }
      }
    } catch {
      // Ignore file reading errors
    }
  }

  if (!configuredHash && !fallbackPlainPin) {
    console.error('[RECOVERY-PIN] ADMIN_RECOVERY_PIN_HASH is not configured in .env!')
    return {
      success: false,
      error: 'Admin recovery PIN is not configured on the server. Please define ADMIN_RECOVERY_PIN_HASH in your .env file.',
    }
  }

  let isValid = false

  try {
    if (configuredHash) {
      // Check if configuredHash is a bcrypt hash (starts with $2a$ or $2b$)
      if (configuredHash.startsWith('$2a$') || configuredHash.startsWith('$2b$')) {
        isValid = await bcrypt.compare(cleanPin, configuredHash)
      } else {
        // Direct comparison fallback if user placed raw pin in HASH var
        isValid = cleanPin === configuredHash
      }
    } else if (fallbackPlainPin) {
      if (fallbackPlainPin.startsWith('$2a$') || fallbackPlainPin.startsWith('$2b$')) {
        isValid = await bcrypt.compare(cleanPin, fallbackPlainPin)
      } else {
        isValid = cleanPin === fallbackPlainPin
      }
    }
  } catch (err: any) {
    console.error('[RECOVERY-PIN] Verification error:', err)
    return {
      success: false,
      error: `Failed to verify recovery PIN: ${err?.message || err}`,
    }
  }

  if (!isValid) {
    return recordFailedPinAttempt(ip)
  }

  // Success: Clear failed attempts for this IP
  clearPinAttempts(ip)
  return {
    success: true,
    remainingAttempts: MAX_FAILED_ATTEMPTS,
  }
}
