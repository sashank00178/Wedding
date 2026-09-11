import crypto from 'crypto'

/**
 * eSewa ePay v2 Helper & Verification Library
 *
 * Implements HMAC-SHA256 signature generation and server-side transaction
 * status check verification according to official eSewa ePay v2 specifications.
 */

export interface EsewaConfig {
  productCode: string
  secretKey: string
  paymentUrl: string
  statusCheckUrl: string
  isProduction: boolean
}

export function getEsewaConfig(): EsewaConfig {
  const isProduction = process.env.ESEWA_ENV === 'production'

  const productCode =
    process.env.ESEWA_PRODUCT_CODE || (isProduction ? '' : 'EPAYTEST')

  const secretKey =
    process.env.ESEWA_SECRET_KEY || (isProduction ? '' : '8gBm/:&EnhH.1/q')

  const paymentUrl =
    process.env.ESEWA_PAYMENT_URL ||
    (isProduction
      ? 'https://epay.esewa.com.np/api/epay/main/v2/form'
      : 'https://rc-epay.esewa.com.np/api/epay/main/v2/form')

  const statusCheckUrl =
    process.env.ESEWA_STATUS_CHECK_URL ||
    (isProduction
      ? 'https://esewa.com.np/api/epay/transaction/status/'
      : 'https://rc.esewa.com.np/api/epay/transaction/status/')

  return {
    productCode,
    secretKey,
    paymentUrl,
    statusCheckUrl,
    isProduction,
  }
}

/**
 * Generate HMAC-SHA256 Base64 signature for eSewa v2
 * Formula: HMAC-SHA256("total_amount=X,transaction_uuid=Y,product_code=Z", secretKey)
 */
export function generateEsewaSignature(
  totalAmount: string,
  transactionUuid: string,
  productCode: string,
  secretKey: string
): string {
  const dataString = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${productCode}`
  const hmac = crypto.createHmac('sha256', secretKey)
  hmac.update(dataString)
  return hmac.digest('base64')
}

export interface EsewaCallbackPayload {
  transaction_code?: string
  status?: string
  total_amount?: string | number
  transaction_uuid?: string
  product_code?: string
  signed_field_names?: string
  signature?: string
  [key: string]: unknown
}

/**
 * Safe Base64 decoding of eSewa callback data parameter
 */
export function decodeEsewaCallbackData(encodedData: string): EsewaCallbackPayload | null {
  try {
    const jsonStr = Buffer.from(encodedData, 'base64').toString('utf-8')
    return JSON.parse(jsonStr) as EsewaCallbackPayload
  } catch (err) {
    console.error('[eSewa] Failed to decode base64 callback data:', err)
    return null
  }
}

export interface EsewaStatusCheckResponse {
  product_code?: string
  transaction_uuid?: string
  total_amount?: number | string
  status?: string // "COMPLETE" | "PENDING" | "FAILED" | "NOT_FOUND"
  ref_id?: string
  [key: string]: unknown
}

export interface VerificationResult {
  isVerified: boolean
  status: string
  refId?: string
  rawResponse?: EsewaStatusCheckResponse | Record<string, unknown>
  error?: string
}

/**
 * Server-to-server transaction status check API
 * NEVER trust the client redirect alone.
 */
export async function verifyEsewaTransaction(params: {
  productCode: string
  totalAmount: string | number
  transactionUuid: string
}): Promise<VerificationResult> {
  const config = getEsewaConfig()
  const cleanAmount = String(Math.round(Number(params.totalAmount)))

  const checkUrl = new URL(config.statusCheckUrl)
  checkUrl.searchParams.set('product_code', params.productCode)
  checkUrl.searchParams.set('total_amount', cleanAmount)
  checkUrl.searchParams.set('transaction_uuid', params.transactionUuid)

  try {
    const response = await fetch(checkUrl.toString(), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(
        `[eSewa Status Check] HTTP ${response.status} from ${checkUrl.toString()}:`,
        errorText
      )
      return {
        isVerified: false,
        status: 'HTTP_ERROR',
        error: `eSewa Status Check returned HTTP ${response.status}: ${errorText}`,
      }
    }

    const data = (await response.json()) as EsewaStatusCheckResponse
    const rawStatus = (data.status || '').toUpperCase()

    const isVerified = rawStatus === 'COMPLETE'

    return {
      isVerified,
      status: rawStatus || 'UNKNOWN',
      refId: data.ref_id,
      rawResponse: data,
    }
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : 'Network error'
    console.error('[eSewa Status Check] Exception during verification:', err)
    return {
      isVerified: false,
      status: 'NETWORK_ERROR',
      error: errMsg,
    }
  }
}
