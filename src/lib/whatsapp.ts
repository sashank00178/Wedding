/**
 * WhatsApp Link Utilities — Wedding Moment Nepal
 * Studio Phone: +977 9856010315
 */

export const STUDIO_WHATSAPP_NUMBER = '9779856010315'

export interface AdvanceWhatsAppParams {
  name: string
  phone: string
  service: string
  date?: string
  advanceAmount: number
  paymentMethod: string
  refId?: string
  transactionUuid?: string
  totalPrice?: string
}

export function createAdvanceBookingWhatsAppUrl(params: AdvanceWhatsAppParams): string {
  const lines: string[] = [
    '✨ *Advance Booking Confirmation*',
    'Wedding Moment Nepal',
    '',
    `👤 Customer Name: ${params.name}`,
    `📞 Mobile Number: ${params.phone}`,
    `📷 Service / Package: ${params.service}`,
  ]

  if (params.date) {
    lines.push(`📅 Preferred Date: ${params.date}`)
  }

  lines.push(
    `💰 Advance Paid: NPR ${Number(params.advanceAmount).toLocaleString()}`,
    `💳 Payment Gateway: ${params.paymentMethod.toUpperCase()}`
  )

  if (params.refId) {
    lines.push(`🔖 eSewa Reference ID: ${params.refId}`)
  }

  if (params.transactionUuid) {
    lines.push(`🆔 Transaction UUID: ${params.transactionUuid}`)
  }

  if (params.totalPrice) {
    lines.push(`🏷️ Total Package Rate: ${params.totalPrice}`)
  }

  lines.push('')
  lines.push('✅ Payment verified directly through official gateway checkout.')
  lines.push('Please confirm my reservation and schedule details. Thank you!')

  const message = lines.join('\n')
  return `https://wa.me/${STUDIO_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}
