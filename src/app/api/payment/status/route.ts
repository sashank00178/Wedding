import { NextRequest, NextResponse } from "next/server";
import { db } from '@/database/client';

export const runtime = "nodejs";

/**
 * Public Payment Status Query API
 * Returns transaction & booking summary for the customer status page.
 */
export async function GET(req: NextRequest) {
  try {
    const uuid = req.nextUrl.searchParams.get("uuid");

    if (!uuid) {
      return NextResponse.json(
        { success: false, message: "Transaction UUID is required." },
        { status: 400 }
      );
    }

    const paymentOrder = await db.paymentOrder.findUnique({
      where: { transactionUuid: uuid },
      select: {
        id: true,
        gateway: true,
        customerName: true,
        customerPhone: true,
        packageName: true,
        amount: true,
        transactionUuid: true,
        pidx: true,
        status: true,
        rawResponse: true,
        createdAt: true,
      },
    });

    if (!paymentOrder) {
      return NextResponse.json(
        { success: false, message: "Transaction not found." },
        { status: 404 }
      );
    }

    let metadata: {
      customerEmail?: string;
      bookingDate?: string;
      serviceDetails?: string;
      message?: string;
    } = {};

    if (paymentOrder.rawResponse) {
      try {
        metadata = JSON.parse(paymentOrder.rawResponse);
      } catch {
        metadata = {};
      }
    }

    return NextResponse.json({
      success: true,
      order: {
        id: paymentOrder.id,
        gateway: paymentOrder.gateway,
        customerName: paymentOrder.customerName,
        customerPhone: paymentOrder.customerPhone,
        customerEmail: metadata.customerEmail || null,
        bookingDate: metadata.bookingDate || null,
        packageName: paymentOrder.packageName,
        serviceDetails: metadata.serviceDetails || paymentOrder.packageName,
        amount: paymentOrder.amount,
        transactionUuid: paymentOrder.transactionUuid,
        refId: paymentOrder.pidx,
        status: paymentOrder.status,
        createdAt: paymentOrder.createdAt,
      },
    });
  } catch (err) {
    console.error("[GET /api/payment/status] error:", err);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}
