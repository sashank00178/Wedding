/**
 * Health Check — GET /api/health
 *
 * What it does in plain language:
 *   Returns server health status including:
 *   - Server uptime
 *   - Database connectivity (quick query)
 *   - Environment validation status
 *   - Memory usage
 *   - Version info
 *
 *   Used by monitoring tools, load balancers, and CI/CD.
 *   Completely public (no auth required).
 *
 * ⚡ Place in: src/app/api/health/route.ts
 */

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { validateEnv, getEnvSummary } from '@/lib/env-validation'

const SERVER_START_TIME = Date.now()

export async function GET() {
  const startTime = Date.now()
  const checks: Record<string, { status: string; message?: string; latencyMs?: number }> = {}

  // ── 1. Database check ─────────────────────────────────────────
  try {
    const dbStart = Date.now()
    await db.$queryRaw`SELECT 1`
    checks.database = {
      status: 'ok',
      latencyMs: Date.now() - dbStart,
    }
  } catch (error) {
    checks.database = {
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
    }
  }

  // ── 2. Environment check ───────────────────────────────────────
  const envResult = validateEnv()
  checks.environment = {
    status: envResult.valid ? 'ok' : 'warning',
    message: envResult.errors.length > 0
      ? `${envResult.errors.length} error(s), ${envResult.warnings.length} warning(s)`
      : undefined,
  }

  // ── 3. Memory check ───────────────────────────────────────────
  try {
    const mem = process.memoryUsage()
    checks.memory = {
      status: 'ok',
      message: `RSS: ${Math.round(mem.rss / 1024 / 1024)}MB, Heap: ${Math.round(mem.heapUsed / 1024 / 1024)}MB / ${Math.round(mem.heapTotal / 1024 / 1024)}MB`,
    }
  } catch {
    checks.memory = { status: 'ok' }
  }

  // ── 4. Overall status ────────────────────────────────────────────
  const hasError = Object.values(checks).some((c) => c.status === 'error')
  const hasWarning = Object.values(checks).some((c) => c.status === 'warning')
  const overallStatus = hasError ? 'error' : hasWarning ? 'warning' : 'ok'

  const uptimeMs = Date.now() - SERVER_START_TIME
  const uptime = formatUptime(uptimeMs)
  const totalLatencyMs = Date.now() - startTime

  return NextResponse.json({
    status: overallStatus,
    uptime,
    uptimeMs,
    version: process.env.npm_package_version || 'unknown',
    node: process.version,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    latencyMs: totalLatencyMs,
    checks,
    env: getEnvSummary(),
  })
}

function formatUptime(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  const parts: string[] = []
  if (days > 0) parts.push(`${days}d`)
  if (hours > 0 || days > 0) parts.push(`${hours % 24}h`)
  parts.push(`${minutes % 60}m`)
  parts.push(`${seconds % 60}s`)

  return parts.join(' ')
}
