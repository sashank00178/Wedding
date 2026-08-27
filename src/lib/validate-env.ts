/**
 * Environment Variable Validation — Runs at startup.
 *
 * What it does in plain language:
 *   Checks that all required environment variables are set
 *   and warns about insecure defaults in production.
 *   Called once when the server starts.
 *
 * ⚡ Place in: src/lib/validate-env.ts
 */

const REQUIRED_VARS = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
] as const

const OPTIONAL_BUT_RECOMMENDED = [
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'RESEND_API_KEY',
  'EMAIL_FROM',
  'ADMIN_EMAIL',
] as const

export interface EnvValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Validate all environment variables.
 * Returns errors (missing required) and warnings (insecure defaults).
 */
export function validateEnv(): EnvValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  const isProduction = process.env.NODE_ENV === 'production'

  // ── 1. Check required variables ────────────────────────────────
  for (const varName of REQUIRED_VARS) {
    if (!process.env[varName]) {
      errors.push(`Missing required env var: ${varName}`)
    }
  }

  // ── 2. Check for insecure defaults in production ────────────────
  if (isProduction) {
    // Weak NextAuth secret
    if (
      process.env.NEXTAUTH_SECRET &&
      (process.env.NEXTAUTH_SECRET.includes('change-in-production') ||
        process.env.NEXTAUTH_SECRET.length < 32)
    ) {
      errors.push(
        'NEXTAUTH_SECRET is insecure in production. Use a strong random string (openssl rand -base64 32)'
      )
    }

    // HTTP instead of HTTPS
    if (process.env.NEXTAUTH_URL && process.env.NEXTAUTH_URL.startsWith('http://')) {
      errors.push(
        'NEXTAUTH_URL should use HTTPS in production. Current: ' + process.env.NEXTAUTH_URL
      )
    }

    // Stripe test keys
    if (process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_')) {
      warnings.push(
        'STRIPE_SECRET_KEY is a test key. Use a live key in production.'
      )
    }

    // Placeholder keys
    const placeholders = ['your_key_here', 'xxxx']
    for (const varName of OPTIONAL_BUT_RECOMMENDED) {
      const value = process.env[varName]
      if (value && placeholders.some((p) => value.includes(p))) {
        warnings.push(
          `${varName} appears to be a placeholder. Set a real value in production.`
        )
      }
    }
  }

  // ── 3. Check optional but recommended variables ──────────────
  for (const varName of OPTIONAL_BUT_RECOMMENDED) {
    if (!process.env[varName]) {
      warnings.push(`Optional env var not set: ${varName} (some features may not work)`)
    }
  }

  // ── 4. Validate DATABASE_URL format ───────────────────────────
  const dbUrl = process.env.DATABASE_URL
  if (dbUrl) {
    if (dbUrl.startsWith('postgresql://') || dbUrl.startsWith('file:')) {
      // Valid
    } else {
      errors.push(
        `DATABASE_URL has unexpected format. Expected postgresql:// or file: prefix. Got: ${dbUrl.substring(0, 20)}...`
      )
    }
  }

  // ── 5. Log results ──────────────────────────────────────────
  if (errors.length > 0 || warnings.length > 0) {
    console.warn('╔══════════════════════════════════════════════════════════╗')
    console.warn('║           ENVIRONMENT VARIABLE VALIDATION                   ║')
    console.warn('╠══════════════════════════════════════════════════════════╣')

    for (const error of errors) {
      console.error(`║ ❌ ${error}`)
    }
    for (const warning of warnings) {
      console.warn(`║ ⚠️  ${warning}`)
    }

    console.warn('╚══════════════════════════════════════════════════════════╝')
  }

  if (errors.length === 0 && warnings.length === 0) {
    console.log('[ENV] All environment variables validated successfully.')
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}
