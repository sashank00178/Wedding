/**
 * Seed Script — Create initial admin user and demo products
 *
 * Run with: bun run src/lib/seed.ts
 *
 * This creates:
 *   - 1 admin user (email from ADMIN_EMAIL env var, password: admin123)
 *   - 1 demo customer account
 *   - 4 categories matching your photography services
 *   - 4 products (Portrait, Wedding, Commercial, Event packages)
 *   - 1 coupon code: "WELCOME10" — 10% off
 *
 * ⚡ Place in: src/lib/seed.ts
 */

import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

const BCRYPT_ROUNDS = 12

async function main() {
  console.log('🌱 Seeding database...\n')

  // ── 1. Create Admin User ─────────────────────────────────────────
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@weddingmomentnepal.com'
  const existingAdmin = await db.user.findUnique({ where: { email: adminEmail } })

  if (!existingAdmin) {
    await db.user.create({
      data: {
        name: 'Wedding Moment Admin',
        email: adminEmail,
        passwordHash: await bcrypt.hash('admin123', BCRYPT_ROUNDS),
        role: 'admin',
      },
    })
    console.log(`✅ Admin created: ${adminEmail} / admin123`)
  } else {
    console.log(`⏭️  Admin already exists: ${adminEmail}`)
  }

  // ── 2. Create Demo Customer ─────────────────────────────────────
  const customerEmail = 'customer@demo.com'
  const existingCustomer = await db.user.findUnique({
    where: { email: customerEmail },
  })

  if (!existingCustomer) {
    await db.user.create({
      data: {
        name: 'Demo Customer',
        email: customerEmail,
        passwordHash: await bcrypt.hash('password123', BCRYPT_ROUNDS),
        role: 'customer',
      },
    })
    console.log(`✅ Demo customer: ${customerEmail} / password123`)
  } else {
    console.log(`⏭️  Demo customer already exists`)
  }

  // ── 3. Create Categories ────────────────────────────────────────
  const categories = [
    { name: 'Portrait', slug: 'portrait', description: 'Individual, family, and group portrait sessions' },
    { name: 'Wedding', slug: 'wedding', description: 'Complete wedding day photography coverage' },
  ]

  for (const cat of categories) {
    const existing = await db.category.findUnique({ where: { slug: cat.slug } })
    if (!existing) {
      await db.category.create({ data: cat })
      console.log(`✅ Category: ${cat.name}`)
    } else {
      console.log(`⏭️  Category exists: ${cat.name}`)
    }
  }

  // ── 4. Create Products ─────────────────────────────────────────
  const catMap = {
    portrait: 'portrait',
    wedding: 'wedding',
  } as const

  const products = [
    {
      name: 'Portrait Photography Package',
      slug: 'portrait-photography-package',
      description: 'Professional portrait session for individuals, couples, or families. Includes 1-hour studio session, 20 edited high-resolution photos, and online gallery delivery.',
      basePrice: 2999,
      categoryName: 'portrait',
      variantName: 'Standard Session',
      sku: 'PORTRAIT-STD',
    },
    {
      name: 'Wedding Photography Package',
      slug: 'wedding-photography-package',
      description: 'Full-day wedding coverage with two photographers. Includes pre-wedding consultation, 8-hour coverage, 300+ edited photos, album design, and online gallery.',
      basePrice: 14999,
      categoryName: 'wedding',
      variantName: 'Premium Coverage',
      sku: 'WEDDING-PRM',
    },
  ]

  for (const p of products) {
    const existing = await db.product.findUnique({ where: { slug: p.slug } })
    if (!existing) {
      const category = await db.category.findUnique({
        where: { slug: p.categoryName },
      })
      if (category) {
        await db.product.create({
          data: {
            name: p.name,
            slug: p.slug,
            description: p.description,
            basePrice: p.basePrice,
            categoryId: category.id,
            isFeatured: p.categoryName === 'wedding',
            stockCount: 50,
            images: `["/gallery/${p.categoryName}1.jpg"]`,
            variants: {
              create: {
                name: p.variantName,
                sku: p.sku,
                price: p.basePrice,
                stockCount: 50,
                attributes: JSON.stringify({ type: 'standard' }),
              },
            },
          },
        })
        console.log(`✅ Product: ${p.name} — रु ${p.basePrice.toLocaleString()}`)
      }
    } else {
      console.log(`⏭️  Product exists: ${p.name}`)
    }
  }

  // ── 5. Create Demo Coupon ───────────────────────────────────────
  const couponCode = 'WELCOME10'
  const existingCoupon = await db.coupon.findUnique({
    where: { code: couponCode },
  })

  if (!existingCoupon) {
    await db.coupon.create({
      data: {
        code: couponCode,
        type: 'percentage',
        value: 10,
        minOrder: 2000,
        maxUses: 100,
        isActive: true,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      },
    })
    console.log(`✅ Coupon: ${couponCode} — 10% off orders over रु 2,000`)
  } else {
    console.log(`⏭️  Coupon exists: ${couponCode}`)
  }

  console.log('\n🎉 Seeding complete!')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
