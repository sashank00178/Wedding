import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import crypto from "crypto";

export const runtime = "nodejs";

/**
 * eSewa v2 payment initiation.
 *
 * In production: signs a HMAC-SHA256 payload and returns the eSewa form data
 * for the frontend to POST to https://rc-epay.esewa.com.np/api/epay/main/v2/form
 *
 * In this sandbox: if ESEWA_SECRET_KEY is not set, returns a demo response
 * so the UI flow can be tested without real credentials.
 */
export async function POST(req: NextRequest) {
  try {
    const { amount, packageName, customerName, customerPhone } = await req.json();

    if (!amount || Number(amount) <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid payment amount" },
        { status: 400 }
      );
    }

    const totalAmount = String(Math.round(Number(amount)));
    const transactionUuid = `order-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const productCode = process.env.ESEWA_PRODUCT_CODE || "EPAYTEST";
    const backendUrl = process.env.BACKEND_URL || "";

    // Persist order row (status: initiated)
    await db.paymentOrder.create({
      data: {
        gateway: "esewa",
        customerName: String(customerName || "Customer"),
        customerPhone: String(customerPhone || ""),
        packageName: String(packageName || "Photography Session"),
        amount: Number(amount),
        transactionUuid,
        status: "initiated",
      },
    });

    const secretKey = process.env.ESEWA_SECRET_KEY;

    // DEMO MODE: no secret key configured
    if (!secretKey) {
      console.warn(
        "[eSewa] DEMO MODE — ESEWA_SECRET_KEY not set. Returning mock success payload."
      );
      // Mark as paid in demo mode so the dashboard / success UI works
      await db.paymentOrder.update({
        where: { transactionUuid },
        data: { status: "paid", rawResponse: "demo_mode" },
      });
      return NextResponse.json({
        success: true,
        demo: true,
        message:
          "Demo mode: no eSewa secret key configured. Payment simulated as successful.",
        payment_url: null,
        formData: null,
        transactionUuid,
        amount: totalAmount,
      });
    }

    // PRODUCTION MODE
    const signatureString = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${productCode}`;
    const hmac = crypto.createHmac("sha256", secretKey);
    hmac.update(signatureString);
    const signature = hmac.digest("base64");

    const formData = {
      amount: totalAmount,
      tax_amount: "0",
      total_amount: totalAmount,
      transaction_uuid: transactionUuid,
      product_code: productCode,
      product_service_charge: "0",
      product_delivery_charge: "0",
      success_url: `${backendUrl}/api/payment/esewa/callback`,
      failure_url: `${backendUrl}/api/payment/esewa/callback?status=failure`,
      signed_field_names: "total_amount,transaction_uuid,product_code",
      signature,
    };

    return NextResponse.json({
      success: true,
      payment_url:
        process.env.ESEWA_PAYMENT_URL ||
        "https://rc-epay.esewa.com.np/api/epay/main/v2/form",
      formData,
      transactionUuid,
      amount: totalAmount,
    });
  } catch (err) {
    console.error("[POST /api/payment/esewa/initiate] error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to initiate eSewa payment" },
      { status: 500 }
    );
  }
}
