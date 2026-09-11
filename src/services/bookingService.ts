import { db } from '@/database/client'

export interface CreateBookingParams {
  name: string
  email: string
  phone: string
  service: string
  date: string
  message?: string | null
  time?: string | null
  nepaliDate?: string | null
  location?: string | null
  price?: number | null
  advancePaid?: number | null
  paymentMethod?: string | null
  paymentRef?: string | null
}

export async function createBooking(data: CreateBookingParams) {
  return await db.booking.create({
    data: {
      name: String(data.name).trim(),
      email: String(data.email).trim().toLowerCase(),
      phone: String(data.phone).trim(),
      service: String(data.service),
      date: String(data.date),
      message: data.message ? String(data.message) : null,
      status: 'pending',
    },
  })
}

export async function getRecentBookings(limit = 50) {
  return await db.booking.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
}

export async function getBookingById(id: string) {
  return await db.booking.findUnique({
    where: { id },
  })
}

export async function updateBookingStatus(id: string, status: string) {
  return await db.booking.update({
    where: { id },
    data: { status },
  })
}
