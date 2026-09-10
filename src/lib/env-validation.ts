/**
 * Environment Variable Validation — Wedding Moment Nepal
 *
 * Validates all required environment variables at startup.
 * Called from next.config.ts and/or a startup script.
 * Fails fast with clear error messages if critical vars are missing.
 *
 * ⚡ Place in: src/lib/env-validation.ts
 */

interface EnvVarSpec {
  /** Environment variable name */
  name: string
  /** Whether this var is required in production */
  required: boolean
  /** Whether this var is required in development */
  requiredDev: boolean
  /** Human-readable description */
  description: string
  /** Example/placeholder value */
  example?: string
}

const ENV_SPECS: EnvVarSpec[] = [
  {
    name: 'DATABASE_URL',
    required: true,
    requiredDev: true,
    description: 'Database connection string (SQLite file path or PostgreSQL URL)',
    example: 'file:./db/custom.db',
  },
  {
    name: 'NEXTAUTH_SECRET',
    required: true,
    requiredDev: true,
    description: 'Secret used to sign NextAuth JWT tokens (min 32 chars recommended)',
    example: 'your-super-secret-random-string-at-least-32-chars',
  },
  {
    name: 'NEXTAUTH_URL',
    required: true,
    requiredDev: false,
    description: 'Base URL of your application (used for OAuth callbacks)',
    example: 'https://yourdomain.com',
  },
  {
    name: 'RESEND_API_KEY',
    required: true,
    requiredDev: false,
    description: 'Resend API key for transactional emails',
    example: 're_abcdef...',
  },
  {
    name: 'EMAIL_FROM',
    required: true,
    requiredDev: false,
    description: 'Sender email address for transactional emails',
    example: 'noreply@weddingmomentnepal.com',
  },
  {
    name: 'ADMIN_EMAIL',
    required: false,
    requiredDev: false,
    description: 'Admin email for notifications (optional, defaults to EMAIL_FROM)',
    example: 'admin@weddingmomentnepal.com',
  },
  {
    name: 'ADMIN_RECOVERY_PIN_HASH',
    required: false,
    requiredDev: false,
    description: 'Bcrypt hash of the owner secret recovery PIN for admin password resets',
    example: '$2b$10$... (generate via: npm run hash-pin <your-pin>)',
  },
]

export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
  missing: string[]
}

/**
 * Validate all environment variables.
 * Returns a result object with errors and warnings.
 */
export function validateEnv(): ValidationResult {
  const isDev = process.env.NODE_ENV !== 'production'
  const errors: string[] = []
  const warnings: string[] = []
  const missing: string[] = []

  for (const spec of ENV_SPECS) {
    const value = process.env[spec.name]
    const isRequired = isDev ? spec.requiredDev : spec.required

    if (!value) {
      if (isRequired) {
        errors.push(
          `❌ MISSING: ${spec.name}\n` +
          `   ${spec.description}\n` +
          `   Example: ${spec.example || '(see Stripe/Resend dashboard)'}\n` +
          `   Add it to your .env file.`
        )
        missing.push(spec.name)
      } else {
        warnings.push(
          `⚠️  Optional: ${spec.name} is not set.\n` +
          `   ${spec.description}`
        )
      }
      continue
    }

    // ── Value-specific validations ──────────────────────────────
    if (spec.name === 'NEXTAUTH_SECRET' && value.length < 16) {
      warnings.push(
        `⚠️  ${spec.name} is too short (${value.length} chars). ` +
        `Use at least 32 characters for production.`
      )
    }

    if (spec.name === 'STRIPE_SECRET_KEY' && !value.startsWith('sk_')) {
      errors.push(
        `❌ INVALID: ${spec.name}\n` +
        `   Must start with "sk_test_" or "sk_live_".\n` +
        `   Current value starts with: "${value.substring(0, 6)}"`
      )
      missing.push(spec.name)
    }

    if (spec.name === 'STRIPE_WEBHOOK_SECRET' && !value.startsWith('whsec_') && !value.startsWith('whsec_placeholder')) {
      errors.push(
        `❌ INVALID: ${spec.name}\n` +
        `   Must start with "whsec_".\n` +
        `   Get it from: stripe listen --forward-to localhost:3000/api/webhooks/stripe`
      )
      missing.push(spec.name)
    }

    if (spec.name === 'RESEND_API_KEY' && !value.startsWith('re_') && !value.startsWith('re_test_')) {
      errors.push(
        `❌ INVALID: ${spec.name}\n` +
        `   Must start with "re_".\n` +
        `   Get it from: https://resend.com/api-keys`
      )
      missing.push(spec.name)
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    missing,
  }
}

/**
 * Validate env and throw if critical vars are missing.
 * Call this at app startup.
 */
export function validateEnvOrThrow(): void {
  const result = validateEnv()

  // Print warnings
  for (const warning of result.warnings) {
    console.warn(warning)
  }

  // Throw on errors
  if (!result.valid) {
    const message =
      `\n\n${'='.repeat(60)}\n` +
      `  ENVIRONMENT VALIDATION FAILED\n` +
      `${'='.repeat(60)}\n\n` +
      result.errors.join('\n\n') +
      `\n\nPlease add these to your .env file and restart.\n` +
      `${'='.repeat(60)}\n`

    throw new Error(message)
  }
}

/**
 * Get a summary of the current environment configuration
 * (for the /api/health endpoint).
 */
export function getEnvSummary(): {
  nodeEnv: string
  hasDatabase: boolean
  hasAuth: boolean
  hasStripe: boolean
  hasEmail: boolean
  warnings: string[]
} {
  const hasDatabase = !!process.env.DATABASE_URL
  const hasAuth = !!process.env.NEXTAUTH_SECRET
  const hasStripe = !!(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET)
  const hasEmail = !!(process.env.RESEND_API_KEY && process.env.EMAIL_FROM)

  return {
    nodeEnv: process.env.NODE_ENV || 'development',
    hasDatabase,
    hasAuth,
    hasStripe,
    hasEmail,
    warnings: validateEnv().warnings,
  }
}
