import { NextResponse } from 'next/server'
import os from 'os'

export async function GET() {
  try {
    const interfaces = os.networkInterfaces()
    const activeIps: { name: string; ip: string; mac?: string }[] = []

    for (const [name, addrs] of Object.entries(interfaces)) {
      if (!addrs) continue
      for (const addr of addrs) {
        // Only accept IPv4 and non-internal loopback addresses
        if (addr.family === 'IPv4' && !addr.internal) {
          // Ignore APIPA link-local addresses (169.254.x.x) if possible
          if (!addr.address.startsWith('169.254.')) {
            activeIps.push({
              name,
              ip: addr.address,
              mac: addr.mac,
            })
          }
        }
      }
    }

    // Prioritize standard home/office Wi-Fi subnets (192.168.x.x or 10.x.x.x)
    const primary =
      activeIps.find((item) => item.ip.startsWith('192.168.')) ||
      activeIps.find((item) => item.ip.startsWith('10.')) ||
      activeIps[0] || { name: 'localhost', ip: '127.0.0.1' }

    const port = Number(process.env.PORT) || 3000
    const localUrl = `http://${primary.ip}:${port}`

    return NextResponse.json({
      success: true,
      ip: primary.ip,
      port,
      url: localUrl,
      interfaceName: primary.name,
      allInterfaces: activeIps,
      message: 'Open this address on another device connected to the same Wi-Fi.',
      security: 'LAN Only (Local Wi-Fi). Public internet exposure is disabled.',
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        ip: '127.0.0.1',
        port: 3000,
        url: 'http://localhost:3000',
        message: 'Could not auto-detect network interface.',
      },
      { status: 500 }
    )
  }
}
