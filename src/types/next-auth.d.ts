/**
 * NextAuth type augmentation
 *
 * By default, NextAuth's session.user only has: name, email, image.
 * We extend it to include `id` and `role` so TypeScript doesn't complain
 * when you access session.user.role or session.user.id in your code.
 *
 * ⚡ Place in: src/types/next-auth.d.ts
 */

import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name: string
      email: string
      image?: string | null
      /** User role: "customer" or "admin" */
      role: string
    }
  }

  interface User {
    /** User role: "customer" or "admin" — set in authorize() and read in the jwt callback */
    role: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
  }
}
