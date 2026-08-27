import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contactLimiter, getClientIp } from "@/lib/rate-limit"
import { rateLimitResponse } from "@/lib/security-headers";
import { sendContactNotification } from "@/lib/email";

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

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    await db.contactMessage.create({
      data: {
        name: String(name),
        email: String(email),
        subject: String(subject),
        message: String(message),
      },
    });

    // Notify admin via email (fire-and-forget)
    sendContactNotification({
      name: String(name),
      email: String(email),
      subject: String(subject),
      message: String(message),
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
