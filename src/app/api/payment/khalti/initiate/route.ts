import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

/**
 * Khalti v2 ePayment initiation.
 *
 * In production: server-to-server call to https://a.khalti.com/api/v2/epayment/initiate/
 * with secret key, returns payment_url + pidx for redirect.
 *
 * In this sandbox: if KHALTI_SECRET_KEY is not set, returns demo mode response.
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

    const amountNpr = Math.round(Number(amount));
    const amountPaisa = amountNpr * 100;
    const purchaseOrderId = `order-${Date.now()}`;
    const pidx = `demo-pidx-${Date.now()}`;

    await db.paymentOrder.create({
      data: {
        gateway: "khalti",
        customerName: String(customerName || "Customer"),
        customerPhone: String(customerPhone || ""),
        packageName: String(packageName || "Photography Session"),
        amount: amountNpr,
        transactionUuid: purchaseOrderId,
        pidx,
        status: "initiated",
      },
    });

    const secretKey = process.env.KHALTI_SECRET_KEY;
    const backendUrl = process.env.BACKEND_URL || "";
    const frontendUrl = process.env.FRONTEND_URL || "";

    // DEMO MODE
    if (!secretKey) {
      console.warn(
        "[Khalti] DEMO MODE — KHALTI_SECRET_KEY not set. Returning mock success payload."
      );
      await db.paymentOrder.update({
        where: { transactionUuid: purchaseOrderId },
        data: { status: "paid", rawResponse: "demo_mode" },
      });
      return NextResponse.json({
        success: true,
        demo: true,
        message:
          "Demo mode: no Khalti secret key configured. Payment simulated as successful.",
        payment_url: null,
        pidx,
        transactionUuid: purchaseOrderId,
        amount: amountNpr,
      });
    }

    // PRODUCTION MODE — real Khalti call
    const khaltiPayload = {
      return_url: `${backendUrl}/api/payment/khalti/callback`,
      website_url: frontendUrl,
      amount: amountPaisa,
      purchase_order_id: purchaseOrderId,
      purchase_order_name: packageName || "Wedding Photography Session",
      customer_info: {
        name: customerName || "Valued Customer",
        email: "customer@example.com",
        phone: customerPhone || "9800000000",
      },
    };

    const initiateUrl =
      process.env.KHALTI_INITIATE_URL ||
      "https://a.khalti.com/api/v2/epayment/initiate/";

    const resp = await fetch(initiateUrl, {
      method: "POST",
      headers: {
        Authorization: `Key ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(khaltiPayload),
    });

    const data = await resp.json();

    if (!resp.ok) {
      console.error("[Khalti] initiate failed:", data);
      return NextResponse.json(
        { success: false, message: "Khalti initiation failed", details: data },
        { status: 502 }
      );
    }

    // Update pidx from real response
    await db.paymentOrder.update({
      where: { transactionUuid: purchaseOrderId },
      data: { pidx: data.pidx },
    });

    return NextResponse.json({
      success: true,
      payment_url: data.payment_url,
      pidx: data.pidx,
      transactionUuid: purchaseOrderId,
      amount: amountNpr,
    });
  } catch (err) {
    console.error("[POST /api/payment/khalti/initiate] error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to initiate Khalti payment" },
      { status: 500 }
    );
  }
}
