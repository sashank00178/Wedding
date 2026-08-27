import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, service, date, message } = body ?? {};

    if (!name || !email || !phone || !service || !date) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const booking = await db.booking.create({
      data: {
        name: String(name),
        email: String(email),
        phone: String(phone),
        service: String(service),
        date: String(date),
        message: message ? String(message) : null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Booking received. We will contact you within 24 hours.",
      bookingId: booking.id,
    });
  } catch (err) {
    console.error("[POST /api/bookings] error:", err);
    return NextResponse.json(
      { success: false, message: "Server error while saving booking" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const bookings = await db.booking.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return NextResponse.json({ success: true, bookings });
  } catch (err) {
    console.error("[GET /api/bookings] error:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
