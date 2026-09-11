import { NextRequest, NextResponse } from "next/server";
import { db } from '@/database/client';
import { contactLimiter, getClientIp } from '@/middleware/rateLimit'
import { rateLimitResponse } from '@/middleware/securityHeaders';
import { sendContactNotification } from '@/services/emailService';

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    // ── Rate limiting ──────────────────────────────────────────
    const ip = getClientIp(req)
    const rateResult = contactLimiter.check(ip)
    if (!rateResult.allowed) {
      return rateLimitResponse(rateResult.message, {
        remaining: rateResult.remaining,
        resetAt: rateResult.resetAt,
      })
    }

    const body = await req.json();
    const { name, email, subject, message } = body ?? {};

    if (!email || !message) {
      return NextResponse.json(
        { success: false, message: "Email and message are required" },
        { status: 400 }
      );
    }

    const senderName = name ? String(name).trim() : String(email).split('@')[0] || "Website Visitor";
    const msgSubject = subject ? String(subject).trim() : "Direct Website Inquiry";

    await db.contactMessage.create({
      data: {
        name: senderName,
        email: String(email).trim().toLowerCase(),
        subject: msgSubject,
        message: String(message).trim(),
      },
    });

    // Notify admin via email (fire-and-forget)
    sendContactNotification({
      name: senderName,
      email: String(email).trim().toLowerCase(),
      subject: msgSubject,
      message: String(message).trim(),
    }).catch((err) => {
      console.error("[CONTACT] Failed to send admin notification:", err);
    });

    return NextResponse.json({
      success: true,
      message: "Thanks for reaching out! We'll get back to you soon.",
    });
  } catch (err) {
    console.error("[POST /api/contact] error:", err);
    return NextResponse.json(
      { success: false, message: "Server error while sending message" },
      { status: 500 }
    );
  }
}
