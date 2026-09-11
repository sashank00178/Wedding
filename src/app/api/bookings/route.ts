import { NextRequest, NextResponse } from "next/server";
import { createBooking, getRecentBookings } from "@/services/bookingService";

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

    const booking = await createBooking({
      name,
      email,
      phone,
      service,
      date,
      message,
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
    const bookings = await getRecentBookings(50);
    return NextResponse.json({ success: true, bookings });
  } catch (err) {
    console.error("[GET /api/bookings] error:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

