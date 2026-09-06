import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getEsewaConfig, generateEsewaSignature } from "@/lib/esewa";

export const runtime = "nodejs";

/**
 * eSewa ePay v2 Payment Initiation API
 *
 * Generates signed payload for eSewa's v2 checkout form and saves an
 * initiated PaymentOrder in the database with customer & booking metadata.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      amount,
      packageName,
      customerName,
      customerPhone,
      customerEmail,
      bookingDate,
      serviceDetails,
      message,
    } = body ?? {};

    if (!amount || Number(amount) <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid payment amount." },
        { status: 400 }
      );
    }

    if (!customerName || !customerPhone) {
      return NextResponse.json(
        { success: false, message: "Name and phone number are required." },
        { status: 400 }
      );
    }

    const totalAmount = String(Math.round(Number(amount)));
    // Alphanumeric + hyphen transaction UUID
    const transactionUuid = `WMN-ESEWA-${Date.now()}-${Math.floor(
      1000 + Math.random() * 9000
    )}`;

    const esewaConfig = getEsewaConfig();

    // Determine application base URL for callback redirects
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXTAUTH_URL ||
      req.nextUrl.origin;

    // Metadata payload stored in rawResponse
    const metadata = {
      customerEmail: String(customerEmail || ""),
      bookingDate: String(bookingDate || ""),
      serviceDetails: String(serviceDetails || packageName || ""),
      message: message ? String(message) : "",
      initiatedAt: new Date().toISOString(),
    };

    // 1. Persist order in DB (status: initiated)
    await db.paymentOrder.create({
      data: {
        gateway: "esewa",
        customerName: String(customerName).trim(),
        customerPhone: String(customerPhone).trim(),
        packageName: String(packageName || "Photography Session").trim(),
        amount: Number(totalAmount),
        transactionUuid,
        status: "initiated",
        rawResponse: JSON.stringify(metadata),
      },
    });

    // 2. Generate HMAC-SHA256 signature
    const signature = generateEsewaSignature(
      totalAmount,
      transactionUuid,
      esewaConfig.productCode,
      esewaConfig.secretKey
    );

    // 3. Build standard eSewa v2 form fields
    const formData = {
      amount: totalAmount,
      tax_amount: "0",
      total_amount: totalAmount,
      transaction_uuid: transactionUuid,
      product_code: esewaConfig.productCode,
      product_service_charge: "0",
      product_delivery_charge: "0",
      success_url: `${baseUrl}/api/payment/esewa/callback`,
      failure_url: `${baseUrl}/api/payment/esewa/callback?status=failure`,
      signed_field_names: "total_amount,transaction_uuid,product_code",
      signature,
    };

    return NextResponse.json({
      success: true,
      payment_url: esewaConfig.paymentUrl,
      formData,
      transactionUuid,
      amount: totalAmount,
    });
  } catch (err) {
    console.error("[POST /api/payment/esewa/initiate] error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to initiate eSewa payment." },
      { status: 500 }
    );
  }
}
