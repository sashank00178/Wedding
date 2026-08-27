/**
 * Failed Login Tracker — Track and lock accounts after too many failures.
 *
 * What it does in plain language:
 *   - Every failed login is recorded with the email + IP
 *   - After 5 consecutive failures, the account is locked for 15 minutes
 *   - After 10 failures, locked for 30 minutes
 *   - After 20 failures, locked for 1 hour
 *   - A successful login resets the counter
 *   - Used by NextAuth's authorize() function
 *
 * ⚡ Place in: src/lib/failed-login.ts
 */

import { db } from '@/lib/db'

/** Lockout durations based on failure count (progressive lockout) */
const LOCKOUT_TIERS = [
  { failures: 5,  lockMinutes: 15 },   // 5 fails → 15 min lock
  { failures: 10, lockMinutes: 30 },  // 10 fails → 30 min lock
  { failures: 20, lockMinutes: 60 },  // 20 fails → 1 hour lock
]

/** Maximum failures before permanent lockout (admin must unlock) */
const MAX_FAILURES = 50

export interface FailedLoginResult {
  allowed: boolean
  attempts: number
  lockedUntil: Date | null
  message: string
}

/**
 * Record a failed login attempt.
 * Returns the updated state (whether the account is now locked).
 */
export async function recordFailedLogin(
  email: string,
  ip: string
): Promise<FailedLoginResult> {
  // Upsert the failed login record
  const record = await db.failedLogin.upsert({
    where: { email_ip: { email, ip } },
    create: { email, ip, attempts: 1 },
    update: {
      attempts: { increment: 1 },
      lastFailAt: new Date(),
    },
  })

  // Calculate lockout based on attempt count
  const lockout = getLockout(record.attempts)

  if (lockout) {
    // Update with lockout time
    await db.failedLogin.update({
      where: { id: record.id },
      data: { lockedUntil: lockout },
    })

    console.warn(
      `[AUTH] Account locked: ${email} (${record.attempts} failures, ` +
      `IP: ${ip}, locked until: ${lockout.toISOString()})`
    )

    return {
      allowed: false,
      attempts: record.attempts,
      lockedUntil: lockout,
      message: `Account temporarily locked due to too many failed login attempts. Please try again in ${getMinutesUntil(lockout)} minutes.`,
    }
  }

  // Warning for approaching lockout
  if (record.attempts >= 3) {
    console.warn(
      `[AUTH] Multiple failures: ${email} (${record.attempts} attempts, IP: ${ip})`
    )
  }

  return {
    allowed: true,
    attempts: record.attempts,
    lockedUntil: null,
    message: 'Invalid email or password',
  }
}

/**
 * Check if an account is currently locked (without recording a failure).
 */
export async function checkAccountLock(
  email: string,
  ip: string
): Promise<FailedLoginResult> {
  const record = await db.failedLogin.findUnique({
    where: { email_ip: { email, ip } },
  })

  if (!record || !record.lockedUntil) {
    return { allowed: true, attempts: 0, lockedUntil: null, message: 'OK' }
  }

  if (record.lockedUntil > new Date()) {
    return {
      allowed: false,
      attempts: record.attempts,
      lockedUntil: record.lockedUntil,
      message: `Account is locked. Please try again in ${getMinutesUntil(record.lockedUntil)} minutes.`,
    }
  }

  // Lockout has expired — reset the record
  await db.failedLogin.delete({ where: { id: record.id } })
  return { allowed: true, attempts: 0, lockedUntil: null, message: 'OK' }
}

/**
 * Clear failed login records after a successful login.
 */
export async function clearFailedLogins(
  email: string,
  ip: string
): Promise<void> {
  await db.failedLogin.deleteMany({
    where: { email, ip },
  })
}

/**
 * Clear ALL failed login records for an email (admin action).
 */
export async function clearAllFailedLogins(email: string): Promise<number> {
  const result = await db.failedLogin.deleteMany({ where: { email } })
  return result.count
}

/**
 * Get the lockout time for a given failure count.
 */
function getLockout(attempts: number): Date | null {
  for (let i = LOCKOUT_TIERS.length - 1; i >= 0; i--) {
    if (attempts >= LOCKOUT_TIERS[i].failures) {
      return new Date(
        Date.now() + LOCKOUT_TIERS[i].lockMinutes * 60 * 1000
      )
    }
  }

  if (attempts >= MAX_FAILURES) {
    // Permanent lockout — admin must manually unlock
    return new Date(Date.now() + 24 * 60 * 60 * 1000)
  }

  return null
}

/**
 * Calculate minutes until a given date.
 */
function getMinutesUntil(date: Date): number {
  const ms = date.getTime() - Date.now()
  return Math.max(0, Math.ceil(ms / 60000))
}
