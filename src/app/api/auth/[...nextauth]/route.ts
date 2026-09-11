/**
 * NextAuth Catch-All Route
 *
 * This single file handles ALL NextAuth endpoints:
 *   POST /api/auth/signin       → login
 *   POST /api/auth/signout      → logout
 *   GET  /api/auth/session      → current session
 *   POST /api/auth/token        → refresh token
 *
 * The [...nextauth] folder name creates a catch-all route at /api/auth/*.
 * Next-Auth automatically maps each HTTP verb to its internal handler.
 */

import NextAuth from 'next-auth'
import { authOptions } from '@/services/authService'

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
