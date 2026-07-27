/**
 * UPI deep-link parsing for the QR Scanner.
 *
 * A UPI payment QR encodes a URI like:
 *   upi://pay?pa=merchant@bank&pn=Merchant%20Name&am=499.00&cu=INR&tn=Order%20123
 *
 * Fields (per NPCI UPI Linking spec):
 *   pa = payee address (VPA)   pn = payee name   am = amount
 *   cu = currency              tn = transaction note / message
 *
 * Critically: EVERY upi://pay link — real or fake — describes an outgoing
 * payment. There is no such thing as a UPI QR that "receives" money for the
 * scanner; if content claims otherwise, that claim itself is the scam. This
 * parser therefore never trusts surrounding text, only the URI's own fields.
 */

export interface UpiIntent {
  isUpi: true;
  payeeAddress: string | null;
  payeeName: string | null;
  amount: string | null;
  currency: string | null;
  note: string | null;
  raw: string;
}

export interface NonUpiContent {
  isUpi: false;
  raw: string;
}

export type DecodedQr = UpiIntent | NonUpiContent;

export function parseQrContent(raw: string): DecodedQr {
  const trimmed = raw.trim();
  if (!/^upi:\/\/pay\?/i.test(trimmed)) {
    return { isUpi: false, raw: trimmed };
  }

  try {
    // URL() needs a valid scheme with authority; upi:// has none, so parse
    // the query string manually instead of relying on the URL parser.
    const query = trimmed.slice(trimmed.indexOf("?") + 1);
    const params = new URLSearchParams(query);
    return {
      isUpi: true,
      payeeAddress: params.get("pa"),
      payeeName: params.get("pn"),
      amount: params.get("am"),
      currency: params.get("cu") ?? "INR",
      note: params.get("tn"),
      raw: trimmed,
    };
  } catch {
    return { isUpi: false, raw: trimmed };
  }
}

/** Turn a decoded UPI intent into the plain-text format the analyzer expects. */
export function describeUpiIntent(intent: UpiIntent): string {
  const parts = [
    "UPI QR code payment request (scanning and paying sends money OUT).",
    intent.payeeAddress && `Payee UPI ID: ${intent.payeeAddress}.`,
    intent.payeeName && `Payee name: ${intent.payeeName}.`,
    intent.amount && `Amount: ${intent.currency ?? "INR"} ${intent.amount}.`,
    intent.note && `Note: ${intent.note}.`,
  ].filter(Boolean);
  return parts.join(" ");
}
