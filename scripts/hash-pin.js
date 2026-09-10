#!/usr/bin/env node

/**
 * Hash PIN Utility — Wedding Moment Nepal
 *
 * Usage:
 *   node scripts/hash-pin.js <YOUR_SECRET_PIN>
 *   npm run hash-pin <YOUR_SECRET_PIN>
 *
 * Example:
 *   npm run hash-pin WMN#Recovery2026!
 *
 * Generates a bcrypt hash of your chosen secret recovery PIN.
 * Copy the generated hash and set it in your .env file:
 *   ADMIN_RECOVERY_PIN_HASH="<generated_hash>"
 */

const bcrypt = require('bcryptjs')

const pin = process.argv[2]

if (!pin) {
  console.log('\n❌ Error: Please provide the recovery PIN you want to hash.')
  console.log('\nUsage:')
  console.log('  npm run hash-pin <YOUR_SECRET_PIN>')
  console.log('\nExample:')
  console.log('  npm run hash-pin WMN#Secure2026!')
  console.log('\nRecommendations:')
  console.log('  - Choose at least 6–8 characters or digits (ideally alphanumeric + symbols).')
  console.log('  - Avoid obvious sequences like "123456".\n')
  process.exit(1)
}

if (pin.length < 6) {
  console.warn('\n⚠️ Warning: Your PIN is fewer than 6 characters. We strongly recommend at least 6–8 characters for security.')
}

try {
  const saltRounds = 10
  const hash = bcrypt.hashSync(pin, saltRounds)

  console.log('\n✅ Secret Recovery PIN hashed successfully!')
  console.log('------------------------------------------------------------')
  console.log('Plaintext PIN (keep this secret!):', pin)
  console.log('Bcrypt Hash:', hash)
  console.log('------------------------------------------------------------')
  console.log('\nAdd this line to your .env file:\n')
  console.log(`ADMIN_RECOVERY_PIN_HASH='${hash}'\n`)
  console.log('Keep this PIN safe. Share it verbally or via direct message with the admin when recovery is needed.\n')
} catch (err) {
  console.error('Failed to hash PIN:', err)
  process.exit(1)
}
