/**
 * Email Service — Wedding Moment Nepal
 *
 * Transactional email service powered by Resend.
 * Handles all email sending: order confirmations, password resets,
 * admin notifications, etc.
 *
 * Usage:
 *   import { sendOrderConfirmation, sendPasswordReset } from '@/lib/email'
 *
 *   await sendOrderConfirmation({ to, orderNumber, items, total })
 *   await sendPasswordReset({ to, resetToken, name })
 *
 * ⚡ Place in: src/lib/email.ts
 */

import { Resend } from 'resend'

// ── Resend Client ───────────────────────────────────────────────────

let resendClient: Resend | null = null

function getResend(): Resend {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey || apiKey.startsWith('re_test_placeholder')) {
      console.warn('[EMAIL] RESEND_API_KEY not configured — emails will be logged only')
      return null!
    }
    resendClient = new Resend(apiKey)
  }
  return resendClient
}

const FROM_EMAIL = process.env.EMAIL_FROM || 'noreply@weddingmomentnepal.com'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.EMAIL_FROM || ''
const SITE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000'
const BRAND = 'Wedding Moment Nepal'

// ── Helpers ─────────────────────────────────────────────────────────

interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
}

async function sendEmail(params: {
  to: string
  subject: string
  html: string
  replyTo?: string
}): Promise<EmailResult> {
  const resend = getResend()

  if (!resend) {
    console.log(`[EMAIL-DRY-RUN] To: ${params.to}\n  Subject: ${params.subject}\n  (Resend not configured — email logged only)`)
    return { success: true, error: 'dry-run' }
  }

  try {
    const { data, error } = await resend.emails.send({
      from: `${BRAND} <${FROM_EMAIL}>`,
      to: [params.to],
      subject: params.subject,
      html: params.html,
      replyTo: params.replyTo || FROM_EMAIL,
    })

    if (error) {
      console.error('[EMAIL] Send failed:', error)
      return { success: false, error: error.message }
    }

    console.log(`[EMAIL] Sent: ${params.subject} → ${params.to} (ID: ${data?.id})`)
    return { success: true, messageId: data?.id }
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    console.error('[EMAIL] Exception:', msg)
    return { success: false, error: msg }
  }
}

// ── Shared Email Layout ────────────────────────────────────────────

function emailTemplate(bodyHtml: string, preview: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${preview}</title>
</head>
<body style="margin:0; padding:0; background-color:#f5f5f5; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5; padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background-color:#000000; padding:24px 32px; text-align:center;">
              <h1 style="margin:0; color:#D4AF37; font-size:24px; font-weight:700; letter-spacing:1px;">
                ${BRAND}
              </h1>
              <p style="margin:4px 0 0; color:#999999; font-size:13px; letter-spacing:2px;">
                CAPTURE YOUR PRECIOUS MOMENTS
              </p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              ${bodyHtml}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:#111111; padding:20px 32px; text-align:center;">
              <p style="margin:0; color:#888888; font-size:12px;">
                &copy; ${new Date().getFullYear()} ${BRAND}. All rights reserved.
              </p>
              <p style="margin:4px 0 0; color:#666666; font-size:11px;">
                Rainpauwa, Pokhara, Nepal &nbsp;|&nbsp; +977 9856010315
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

// ── 1. Order Confirmation Email ────────────────────────────────────

export interface OrderConfirmationData {
  to: string
  customerName: string
  orderNumber: string
  items: Array<{
    name: string
    variant: string
    price: number
    quantity: number
  }>
  subtotal: number
  discount: number
  tax: number
  shippingCost: number
  total: number
  shippingAddress: string
  status?: string
}

export async function sendOrderConfirmation(data: OrderConfirmationData): Promise<EmailResult> {
  const itemsRows = data.items.map(item => `
    <tr>
      <td style="padding:10px 0; border-bottom:1px solid #eee; font-size:14px;">
        ${item.name}${item.variant ? ` (${item.variant})` : ''}
      </td>
      <td style="padding:10px 0; border-bottom:1px solid #eee; text-align:center; font-size:14px;">
        ${item.quantity}
      </td>
      <td style="padding:10px 0; border-bottom:1px solid #eee; text-align:right; font-size:14px;">
        Rs. ${(item.price * item.quantity).toLocaleString()}
      </td>
    </tr>
  `).join('')

  const bodyHtml = `
    <h2 style="margin:0 0 8px; color:#333; font-size:22px;">Order Confirmed!</h2>
    <p style="margin:0 0 20px; color:#666; font-size:15px;">
      Thank you for your order, <strong>${data.customerName}</strong>!
      We've received your payment and will begin processing shortly.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="border-top:2px solid #000; margin:0 0 20px;">
      <thead>
        <tr style="color:#999; font-size:12px; text-transform:uppercase; letter-spacing:1px;">
          <th style="padding:10px 0; text-align:left; border-bottom:1px solid #ddd;">Item</th>
          <th style="padding:10px 0; text-align:center; border-bottom:1px solid #ddd;">Qty</th>
          <th style="padding:10px 0; text-align:right; border-bottom:1px solid #ddd;">Price</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRows}
      </tbody>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="float:right; width:auto; margin-left:auto;">
      <tr>
        <td style="padding:4px 0; color:#666; font-size:14px;">Subtotal</td>
        <td style="padding:4px 16px; text-align:right; font-size:14px;">Rs. ${data.subtotal.toLocaleString()}</td>
      </tr>
      ${data.discount > 0 ? `
      <tr>
        <td style="padding:4px 0; color:#D4AF37; font-size:14px;">Discount</td>
        <td style="padding:4px 16px; text-align:right; color:#D4AF37; font-size:14px;">- Rs. ${data.discount.toLocaleString()}</td>
      </tr>` : ''}
      ${data.tax > 0 ? `
      <tr>
        <td style="padding:4px 0; color:#666; font-size:14px;">Tax</td>
        <td style="padding:4px 16px; text-align:right; font-size:14px;">Rs. ${data.tax.toLocaleString()}</td>
      </tr>` : ''}
      ${data.shippingCost > 0 ? `
      <tr>
        <td style="padding:4px 0; color:#666; font-size:14px;">Shipping</td>
        <td style="padding:4px 16px; text-align:right; font-size:14px;">Rs. ${data.shippingCost.toLocaleString()}</td>
      </tr>` : ''}
      <tr style="border-top:2px solid #000;">
        <td style="padding:8px 0; font-weight:700; font-size:16px;">Total</td>
        <td style="padding:8px 16px; text-align:right; font-weight:700; font-size:16px; color:#D4AF37;">
          Rs. ${data.total.toLocaleString()}
        </td>
      </tr>
    </table>

    <div style="clear:both; padding-top:24px;">
      <h3 style="margin:0 0 8px; color:#333; font-size:15px;">Shipping Address</h3>
      <p style="margin:0 0 20px; color:#666; font-size:14px; white-space:pre-line;">${data.shippingAddress}</p>
    </div>

    <div style="background-color:#f9f9f9; border-radius:6px; padding:16px; margin-top:16px;">
      <p style="margin:0 0 4px; color:#333; font-size:14px;">
        <strong>Order Number:</strong> ${data.orderNumber}
      </p>
      <p style="margin:0 0 4px; color:#666; font-size:13px;">
        <strong>Status:</strong> ${data.status || 'Pending'}
      </p>
      <p style="margin:0; color:#999; font-size:12px;">
        You can track your order status on our website.
      </p>
    </div>

    <p style="margin:24px 0 0; color:#999; font-size:13px;">
      Questions? Reply to this email or contact us at +977 9856010315.
    </p>
  `

  return sendEmail({
    to: data.to,
    subject: `Order Confirmed — ${data.orderNumber} | ${BRAND}`,
    html: emailTemplate(bodyHtml, `Order ${data.orderNumber} confirmed`),
  })
}

// ── 2. Admin New Order Notification ────────────────────────────────

export interface AdminOrderNotificationData {
  orderNumber: string
  customerName: string
  customerEmail: string
  total: number
  itemCount: number
}

export async function sendAdminOrderNotification(data: AdminOrderNotificationData): Promise<EmailResult> {
  if (!ADMIN_EMAIL) {
    console.log('[EMAIL] ADMIN_EMAIL not set — skipping admin notification')
    return { success: false, error: 'ADMIN_EMAIL not configured' }
  }

  const bodyHtml = `
    <h2 style="margin:0 0 8px; color:#333; font-size:22px;">New Order Received</h2>
    <p style="margin:0 0 20px; color:#666; font-size:15px;">
      A new order has been placed and paid for.
    </p>

    <div style="background-color:#f9f9f9; border-radius:6px; padding:16px; margin-bottom:16px;">
      <table cellpadding="0" cellspacing="0" style="width:100%;">
        <tr>
          <td style="padding:6px 0; color:#999; font-size:12px; text-transform:uppercase;">Order Number</td>
          <td style="padding:6px 0; text-align:right; font-weight:700; font-size:15px;">${data.orderNumber}</td>
        </tr>
        <tr>
          <td style="padding:6px 0; color:#999; font-size:12px; text-transform:uppercase;">Customer</td>
          <td style="padding:6px 0; text-align:right; font-size:14px;">${data.customerName}</td>
        </tr>
        <tr>
          <td style="padding:6px 0; color:#999; font-size:12px; text-transform:uppercase;">Email</td>
          <td style="padding:6px 0; text-align:right; font-size:14px;">${data.customerEmail}</td>
        </tr>
        <tr>
          <td style="padding:6px 0; color:#999; font-size:12px; text-transform:uppercase;">Items</td>
          <td style="padding:6px 0; text-align:right; font-size:14px;">${data.itemCount}</td>
        </tr>
        <tr style="border-top:1px solid #ddd;">
          <td style="padding:10px 0; color:#D4AF37; font-weight:700; font-size:15px;">Total</td>
          <td style="padding:10px 0; text-align:right; font-weight:700; font-size:15px; color:#D4AF37;">
            Rs. ${data.total.toLocaleString()}
          </td>
        </tr>
      </table>
    </div>

    <p style="margin:0; color:#999; font-size:13px;">
      Log in to the admin panel to manage this order.
    </p>
  `

  return sendEmail({
    to: ADMIN_EMAIL,
    subject: `[New Order] ${data.orderNumber} — Rs. ${data.total.toLocaleString()}`,
    html: emailTemplate(bodyHtml, `New order ${data.orderNumber}`),
  })
}

// ── 3. Password Reset Email ────────────────────────────────────────

export interface PasswordResetData {
  to: string
  name: string
  resetToken: string
}

export async function sendPasswordReset(data: PasswordResetData): Promise<EmailResult> {
  const resetUrl = `${SITE_URL}/reset-password?token=${data.resetToken}`

  const bodyHtml = `
    <h2 style="margin:0 0 8px; color:#333; font-size:22px;">Reset Your Password</h2>
    <p style="margin:0 0 20px; color:#666; font-size:15px;">
      Hello ${data.name}, we received a request to reset your password.
      Click the button below to choose a new one.
    </p>

    <div style="text-align:center; margin:24px 0;">
      <a href="${resetUrl}"
         style="display:inline-block; background-color:#000; color:#D4AF37; padding:14px 32px;
                border-radius:6px; text-decoration:none; font-weight:700; font-size:15px; letter-spacing:0.5px;">
        Reset Password
      </a>
    </div>

    <p style="margin:20px 0 0; color:#999; font-size:13px;">
      If the button doesn't work, copy and paste this link into your browser:
    </p>
    <p style="margin:4px 0; color:#666; font-size:13px; word-break:break-all;">
      ${resetUrl}
    </p>

    <div style="margin-top:24px; padding-top:16px; border-top:1px solid #eee;">
      <p style="margin:0 0 4px; color:#999; font-size:12px;">
        This link expires in <strong>1 hour</strong>.
      </p>
      <p style="margin:0; color:#999; font-size:12px;">
        If you didn't request a password reset, you can safely ignore this email.
      </p>
    </div>
  `

  return sendEmail({
    to: data.to,
    subject: `Reset Your Password — ${BRAND}`,
    html: emailTemplate(bodyHtml, 'Reset your password'),
  })
}

// ── 4. Payment Failed Notification ──────────────────────────────────

export interface PaymentFailedData {
  to: string
  customerName: string
  orderNumber: string
}

export async function sendPaymentFailed(data: PaymentFailedData): Promise<EmailResult> {
  const bodyHtml = `
    <h2 style="margin:0 0 8px; color:#333; font-size:22px;">Payment Failed</h2>
    <p style="margin:0 0 20px; color:#666; font-size:15px;">
      Hello ${data.customerName}, your payment for order <strong>${data.orderNumber}</strong>
      could not be processed. This can happen if your card was declined or the payment timed out.
    </p>

    <div style="background-color:#fff8f0; border-left:4px solid #D4AF37; padding:16px; border-radius:0 6px 6px 0; margin:16px 0;">
      <p style="margin:0; color:#333; font-size:14px;">
        <strong>What to do:</strong> Please try checking out again. Your cart has been preserved.
        If the problem persists, contact us at +977 9856010315 or reply to this email.
      </p>
    </div>

    <p style="margin:20px 0 0; color:#999; font-size:13px;">
      You can retry your order at any time from your cart.
    </p>
  `

  return sendEmail({
    to: data.to,
    subject: `Payment Issue — Order ${data.orderNumber} | ${BRAND}`,
    html: emailTemplate(bodyHtml, `Payment failed for order ${data.orderNumber}`),
  })
}

// ── 5. Welcome Email ──────────────────────────────────────────────

export interface WelcomeEmailData {
  to: string
  name: string
}

export async function sendWelcomeEmail(data: WelcomeEmailData): Promise<EmailResult> {
  const bodyHtml = `
    <h2 style="margin:0 0 8px; color:#333; font-size:22px;">Welcome to ${BRAND}!</h2>
    <p style="margin:0 0 20px; color:#666; font-size:15px;">
      Hello ${data.name}, thank you for creating an account with us!
      We're excited to have you as part of the ${BRAND} family.
    </p>

    <div style="background-color:#f9f9f9; border-radius:6px; padding:16px; margin-bottom:16px;">
      <p style="margin:0 0 8px; color:#333; font-size:14px; font-weight:600;">What you can do:</p>
      <ul style="margin:0; padding-left:20px; color:#666; font-size:14px; line-height:1.8;">
        <li>Browse our photography packages and products</li>
        <li>Book sessions online</li>
        <li>Track your orders</li>
        <li>Leave reviews and ratings</li>
      </ul>
    </div>

    <p style="margin:0; color:#999; font-size:13px;">
      Questions? Reply to this email or call us at +977 9856010315.
    </p>
  `

  return sendEmail({
    to: data.to,
    subject: `Welcome to ${BRAND}!`,
    html: emailTemplate(bodyHtml, `Welcome ${data.name}`),
  })
}

// ── 6. Order Status Update Email ──────────────────────────────────
// Sent when admin updates order to "shipped" or "delivered"

export interface OrderStatusUpdateData {
  to: string
  customerName: string
  orderNumber: string
  newStatus: 'shipped' | 'delivered'
  trackingNumber?: string
  adminNote?: string
}

export async function sendOrderStatusUpdate(data: OrderStatusUpdateData): Promise<EmailResult> {
  const isShipped = data.newStatus === 'shipped'

  const statusConfig = {
    shipped: {
      title: 'Your Order Has Been Shipped!',
      subtitle: `Great news! Your order <strong>${data.orderNumber}</strong> is on its way to you.`,
      icon: '📦',
      color: '#D4AF37',
    },
    delivered: {
      title: 'Your Order Has Been Delivered!',
      subtitle: `Your order <strong>${data.orderNumber}</strong> has been delivered successfully.`,
      icon: '✅',
      color: '#28a745',
    },
  }

  const config = statusConfig[data.newStatus]

  const bodyHtml = `
    <h2 style="margin:0 0 8px; color:#333; font-size:22px;">${config.title}</h2>
    <p style="margin:0 0 20px; color:#666; font-size:15px;">
      Hello ${data.customerName}, ${config.subtitle}
    </p>

    <div style="background-color:#f9f9f9; border-radius:6px; padding:16px; margin-bottom:16px;">
      <table cellpadding="0" cellspacing="0" style="width:100%;">
        <tr>
          <td style="padding:6px 0; color:#999; font-size:12px; text-transform:uppercase;">Order Number</td>
          <td style="padding:6px 0; text-align:right; font-weight:700; font-size:15px;">${data.orderNumber}</td>
        </tr>
        <tr>
          <td style="padding:6px 0; color:#999; font-size:12px; text-transform:uppercase;">Status</td>
          <td style="padding:6px 0; text-align:right; font-weight:700; font-size:15px; color:${config.color};">
            ${data.newStatus.toUpperCase()}
          </td>
        </tr>
        ${data.trackingNumber ? `
        <tr>
          <td style="padding:6px 0; color:#999; font-size:12px; text-transform:uppercase;">Tracking Number</td>
          <td style="padding:6px 0; text-align:right; font-size:14px; word-break:break-all;">${data.trackingNumber}</td>
        </tr>` : ''}
      </table>
    </div>

    ${isShipped ? `
    <div style="border-left:4px solid ${config.color}; padding:12px 16px; background-color:#fffdf5; border-radius:0 6px 6px 0; margin-bottom:16px;">
      <p style="margin:0; color:#333; font-size:14px;">
        <strong>Estimated Delivery:</strong> Please allow 2-5 business days for your package to arrive
        (depending on your location within Nepal).
      </p>
    </div>` : `
    <div style="border-left:4px solid ${config.color}; padding:12px 16px; background-color:#f0fff4; border-radius:0 6px 6px 0; margin-bottom:16px;">
      <p style="margin:0; color:#333; font-size:14px;">
        <strong>Thank you for choosing ${BRAND}!</strong> We hope you love your purchase.
        If you have any questions, don't hesitate to reach out.
      </p>
    </div>`}

    ${data.adminNote ? `
    <div style="padding:12px 16px; background-color:#f5f5f5; border-radius:6px; margin-bottom:16px;">
      <p style="margin:0 0 4px; color:#999; font-size:12px; text-transform:uppercase;">Note from our team</p>
      <p style="margin:0; color:#666; font-size:14px; white-space:pre-line;">${data.adminNote}</p>
    </div>` : ''}

    <p style="margin:0; color:#999; font-size:13px;">
      Questions? Reply to this email or call us at +977 9856010315.
    </p>
  `

  return sendEmail({
    to: data.to,
    subject: `Order ${data.newStatus} — ${data.orderNumber} | ${BRAND}`,
    html: emailTemplate(bodyHtml, `Order ${data.orderNumber} ${data.newStatus}`),
  })
}

// ── 7. Contact Form Admin Notification ──────────────────────────────
// Sent to ADMIN_EMAIL whenever a customer submits the contact form

export interface ContactNotificationData {
  name: string
  email: string
  subject: string
  message: string
}

export async function sendContactNotification(data: ContactNotificationData): Promise<EmailResult> {
  if (!ADMIN_EMAIL) {
    console.log('[EMAIL] ADMIN_EMAIL not set — skipping contact notification')
    return { success: false, error: 'ADMIN_EMAIL not configured' }
  }

  const bodyHtml = `
    <h2 style="margin:0 0 8px; color:#333; font-size:22px;">New Contact Message</h2>
    <p style="margin:0 0 20px; color:#666; font-size:15px;">
      A customer has submitted a message through the website contact form.
    </p>

    <div style="background-color:#f9f9f9; border-radius:6px; padding:16px; margin-bottom:16px;">
      <table cellpadding="0" cellspacing="0" style="width:100%;">
        <tr>
          <td style="padding:6px 0; color:#999; font-size:12px; text-transform:uppercase;">From</td>
          <td style="padding:6px 0; text-align:right; font-weight:600; font-size:14px;">${data.name}</td>
        </tr>
        <tr>
          <td style="padding:6px 0; color:#999; font-size:12px; text-transform:uppercase;">Email</td>
          <td style="padding:6px 0; text-align:right; font-size:14px;">
            <a href="mailto:${data.email}" style="color:#D4AF37; text-decoration:none;">${data.email}</a>
          </td>
        </tr>
        <tr>
          <td style="padding:6px 0; color:#999; font-size:12px; text-transform:uppercase;">Subject</td>
          <td style="padding:6px 0; text-align:right; font-weight:600; font-size:14px;">${data.subject}</td>
        </tr>
      </table>
    </div>

    <div style="border-left:4px solid #D4AF37; padding:16px; background-color:#fffdf5; border-radius:0 6px 6px 0; margin-bottom:16px;">
      <p style="margin:0 0 4px; color:#999; font-size:12px; text-transform:uppercase;">Message</p>
      <p style="margin:0; color:#333; font-size:14px; white-space:pre-line; line-height:1.6;">${data.message}</p>
    </div>

    <p style="margin:0; color:#999; font-size:13px;">
      Reply directly to <a href="mailto:${data.email}" style="color:#D4AF37;">${data.email}</a> to respond.
    </p>
  `

  return sendEmail({
    to: ADMIN_EMAIL,
    subject: `[Contact] ${data.subject} — from ${data.name}`,
    html: emailTemplate(bodyHtml, `Contact form: ${data.subject}`),
    replyTo: data.email,
  })
}

// ── 8. Test Email — For development / debugging ────────────────────

export async function sendTestEmail(to: string): Promise<EmailResult> {
  const bodyHtml = `
    <h2 style="margin:0 0 8px; color:#333; font-size:22px;">Test Email — ${BRAND}</h2>
    <p style="margin:0 0 20px; color:#666; font-size:15px;">
      If you're seeing this, email sending is working correctly!
    </p>

    <div style="background-color:#f0fff4; border:1px solid #28a745; border-radius:6px; padding:16px; margin-bottom:16px;">
      <p style="margin:0; color:#28a745; font-weight:600; font-size:14px;">
        Email service is operational.
      </p>
      <p style="margin:4px 0 0; color:#666; font-size:13px;">
        Resend API Key: ${process.env.RESEND_API_KEY ? 'Configured' : 'Missing'}<br />
        From Email: ${FROM_EMAIL}<br />
        Admin Email: ${ADMIN_EMAIL || 'Not set'}<br />
        Site URL: ${SITE_URL}
      </p>
    </div>

    <p style="margin:0; color:#999; font-size:13px;">
      Timestamp: ${new Date().toISOString()}
    </p>
  `

  return sendEmail({
    to,
    subject: `Test Email — ${BRAND} Email Service`,
    html: emailTemplate(bodyHtml, 'Test email'),
  })
}
