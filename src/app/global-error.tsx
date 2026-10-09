'use client'

import * as React from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center bg-neutral-950 text-neutral-100 p-4">
        <div className="text-center space-y-4 max-w-md">
          <h2 className="text-2xl font-bold">Something went wrong</h2>
          <p className="text-sm text-neutral-400">
            {error?.message || 'An unexpected error occurred.'}
          </p>
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-amber-500 text-neutral-950 rounded-md text-sm font-semibold hover:bg-amber-400 transition-colors"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
