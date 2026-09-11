import { NextResponse } from 'next/server'
import { db } from '@/database/client'
import { requireAdmin, AuthError } from '@/middleware/auth'

export async function GET(req: Request) {
  try {
    await requireAdmin()
    const { searchParams } = new URL(req.url)
    const gateway = searchParams.get('gateway')
    const status = searchParams.get('status')

    const where: { gateway?: string; status?: string } = {}
    if (gateway && gateway !== 'all') where.gateway = gateway
    if (status && status !== 'all') where.status = status

    const payments = await db.paymentOrder.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(payments)
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    console.error('Payments GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    await requireAdmin()
    const body = await req.json()
    const { id, status } = body

    if (!id || !status) {
      return NextResponse.json(
        { error: 'Payment ID and status are required' },
        { status: 400 }
      )
    }

    const updated = await db.paymentOrder.update({
      where: { id },
      data: { status },
    })

    return NextResponse.json(updated)
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    console.error('Payments PATCH error:', error)
    return NextResponse.json({ error: 'Failed to update payment status' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    await requireAdmin()
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Payment ID is required' }, { status: 400 })
    }

    await db.paymentOrder.delete({
      where: { id },
    })

    return NextResponse.json({ success: true, message: 'Payment record deleted' })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    console.error('Payments DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete payment record' }, { status: 500 })
  }
}
