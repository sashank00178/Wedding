export { proxy } from '@/middleware/edgeProxy'

export const config = {
  matcher: [
    '/api/:path*',
  ],
}
