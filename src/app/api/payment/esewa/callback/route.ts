import { NextRequest, NextResponse } from "next/server";
import { db } from '@/database/client';
import {
  decodeEsewaCallbackData,
  verifyEsewaTransaction,
  getEsewaConfig,
} from '@/services/paymentService';
import {
  sendAdvanceBookingConfirmation,
  sendAdminAdvanceBookingNotification,
} from '@/services/emailService';

export const runtime = "nodejs";

/**
 * eSewa ePay v2 Redirect Callback Route
 *
 * eSewa redirects the customer's browser back to this route via GET:
 * - On success: ?data=<base64_encoded_json>
 * - On failure: ?status=failure or ?data=<base64_encoded_json>
 *
 * ⚠️ NEVER trust the redirect alone.
 * We decode the payload and execute a server-to-server transaction status check
 * against eSewa's verification API before updating order and booking records.
 */
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const rawData = searchParams.get("data");
  const statusParam = searchParams.get("status");

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    req.nextUrl.origin;

  // 1. Explicit failure or cancellation callback
  if (statusParam === "failure" && !rawData) {
    return NextResponse.redirect(
      new URL(
        "/booking/status?status=failure&reason=cancelled_by_user",
        baseUrl
      )
    );
  }

  // If no data parameter exists
  if (!rawData) {
    return NextResponse.redirect(
      new URL(
        "/booking/status?status=failure&reason=missing_callback_data",
        baseUrl
      )
    );
  }

  // 2. Decode the Base64 JSON payload from eSewa
  const decoded = decodeEsewaCallbackData(rawData);
  if (!decoded || !decoded.transaction_uuid) {
    console.error("[eSewa Callback] Could not decode base64 payload:", rawData);
    return NextResponse.redirect(
      new URL(
        "/booking/status?status=failure&reason=invalid_response_data",
        baseUrl
      )
    );
  }

  const {
    transaction_uuid,
    total_amount,
    product_code,
    transaction_code,
    status: callbackStatus,
  } = decoded;

  const esewaConfig = getEsewaConfig();
  const effectiveProductCode = product_code || esewaConfig.productCode;

  // 3. Find the matching PaymentOrder in the database
  const paymentOrder = await db.paymentOrder.findUnique({
    where: { transactionUuid: transaction_uuid },
  });

  if (!paymentOrder) {
    console.error(
      `[eSewa Callback] Order with transaction_uuid "${transaction_uuid}" not found in database.`
    );
    return NextResponse.redirect(
      new URL(
        `/booking/status?status=failure&reason=order_not_found&uuid=${encodeURIComponent(
          transaction_uuid
        )}`,
        baseUrl
      )
    );
  }

  // Parse any stored initiation metadata
  let metadata: {
    customerEmail?: string;
    bookingDate?: string;
    serviceDetails?: string;
    message?: string;
    [key: string]: unknown;
  } = {};

  if (paymentOrder.rawResponse) {
    try {
      metadata = JSON.parse(paymentOrder.rawResponse);
    } catch {
      metadata = {};
    }
  }

  // 4. Perform SERVER-SIDE VERIFICATION with eSewa's Status Check API
  // Do NOT rely solely on callbackStatus === "COMPLETE"
  const verification = await verifyEsewaTransaction({
    productCode: effectiveProductCode,
    totalAmount: total_amount || paymentOrder.amount,
    transactionUuid: transaction_uuid,
  });

  console.log(
    `[eSewa Callback] Verification for ${transaction_uuid}:`,
    verification
  );

  // If already paid previously, prevent duplicate booking creation
  if (paymentOrder.status === "paid") {
    const existingRef = paymentOrder.pidx || transaction_code || "";
    return NextResponse.redirect(
      new URL(
        `/booking/status?status=success&uuid=${encodeURIComponent(
          transaction_uuid
        )}&ref=${encodeURIComponent(existingRef)}`,
        baseUrl
      )
    );
  }

  // 5. Payment successfully verified by eSewa's Status Check API
  if (verification.isVerified) {
    const refId =
      verification.refId || transaction_code || `REF-${Date.now()}`;

    // A. Update PaymentOrder in DB
    await db.paymentOrder.update({
      where: { transactionUuid: transaction_uuid },
      data: {
        status: "paid",
        pidx: refId,
        rawResponse: JSON.stringify({
          ...metadata,
          eSewaCallback: decoded,
          eSewaVerification: verification.rawResponse,
          verifiedAt: new Date().toISOString(),
        }),
      },
    });

    // B. Create confirmed Booking record in DB
    let bookingId = "";
    try {
      const customerEmail =
        metadata.customerEmail?.trim() ||
        `${paymentOrder.customerPhone.replace(/[^0-9]/g, "")}@phone.weddingmomentnepal.com`;
      const bookingDate =
        metadata.bookingDate?.trim() ||
        new Date().toISOString().split("T")[0];
      const serviceLabel =
        metadata.serviceDetails?.trim() || paymentOrder.packageName;

      const booking = await db.booking.create({
        data: {
          name: paymentOrder.customerName,
          email: customerEmail,
          phone: paymentOrder.customerPhone,
          service: serviceLabel,
          date: bookingDate,
          status: "confirmed", // Automatically confirmed upon payment
          message: `[Advance Paid via eSewa] NPR ${paymentOrder.amount.toLocaleString()} | Ref: ${refId} | Txn: ${transaction_uuid}${
            metadata.message ? ` | Notes: ${metadata.message}` : ""
          }`,
        },
      });
      bookingId = booking.id;
    } catch (err) {
      console.error("[eSewa Callback] Error creating Booking record:", err);
    }

    // C. Trigger Customer & Admin Notifications
    try {
      if (metadata.customerEmail && metadata.customerEmail.includes("@")) {
        sendAdvanceBookingConfirmation({
          to: metadata.customerEmail,
          name: paymentOrder.customerName,
          phone: paymentOrder.customerPhone,
          service: metadata.serviceDetails || paymentOrder.packageName,
          date: metadata.bookingDate || "Scheduled Date",
          advanceAmount: paymentOrder.amount,
          refId,
          transactionUuid: transaction_uuid,
        }).catch((e) =>
          console.error("[eSewa Callback] Customer email send error:", e)
        );
      }

      sendAdminAdvanceBookingNotification({
        customerName: paymentOrder.customerName,
        customerPhone: paymentOrder.customerPhone,
        customerEmail: metadata.customerEmail || "Not provided",
        service: metadata.serviceDetails || paymentOrder.packageName,
        date: metadata.bookingDate || "Scheduled Date",
        advanceAmount: paymentOrder.amount,
        refId,
        transactionUuid: transaction_uuid,
      }).catch((e) =>
        console.error("[eSewa Callback] Admin email alert error:", e)
      );
    } catch (notificationErr) {
      console.error(
        "[eSewa Callback] Error launching notifications:",
        notificationErr
      );
    }

    // D. Redirect to clear success status screen
    const redirectUrl = new URL("/booking/status", baseUrl);
    redirectUrl.searchParams.set("status", "success");
    redirectUrl.searchParams.set("uuid", transaction_uuid);
    redirectUrl.searchParams.set("ref", refId);
    if (bookingId) {
      redirectUrl.searchParams.set("bookingId", bookingId);
    }

    return NextResponse.redirect(redirectUrl);
  }

  // 6. Verification failed or transaction status was not COMPLETE
  console.warn(
    `[eSewa Callback] Transaction ${transaction_uuid} failed verification. Status: ${verification.status}, Error: ${verification.error}`
  );

  await db.paymentOrder.update({
    where: { transactionUuid: transaction_uuid },
    data: {
      status: "failed",
      rawResponse: JSON.stringify({
        ...metadata,
        eSewaCallback: decoded,
        eSewaVerification: verification.rawResponse || null,
        error: verification.error || `eSewa status: ${verification.status}`,
        failedAt: new Date().toISOString(),
      }),
    },
  });

  const failureUrl = new URL("/booking/status", baseUrl);
  failureUrl.searchParams.set("status", "failure");
  failureUrl.searchParams.set("uuid", transaction_uuid);
  failureUrl.searchParams.set(
    "reason",
    verification.status.toLowerCase() || "unverified"
  );

  return NextResponse.redirect(failureUrl);
}
