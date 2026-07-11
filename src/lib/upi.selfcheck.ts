/**
 * Minimal runnable self-check for upi.ts — no test framework, just asserts.
 * Run with: npx tsx src/lib/upi.selfcheck.ts
 */
import { parseQrContent, describeUpiIntent } from "./upi";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`FAILED: ${msg}`);
  console.log(`OK: ${msg}`);
}

// Real-looking UPI payment QR
const good = parseQrContent(
  "upi://pay?pa=merchant@okaxis&pn=Rahul%20Store&am=499.00&cu=INR&tn=Order%20123"
);
assert(good.isUpi === true, "detects upi:// scheme");
if (good.isUpi) {
  assert(good.payeeAddress === "merchant@okaxis", "extracts payee address");
  assert(good.payeeName === "Rahul Store", "decodes URL-encoded payee name");
  assert(good.amount === "499.00", "extracts amount");
  assert(describeUpiIntent(good).includes("499.00"), "description includes amount");
}

// Plain URL (not UPI) — e.g. a phishing site QR
const url = parseQrContent("http://sbi-verify.xyz/login");
assert(url.isUpi === false, "non-UPI content is not misparsed as UPI");

// Garbage / empty
const empty = parseQrContent("   ");
assert(empty.isUpi === false, "empty content handled without throwing");

// Malformed upi:// with no query
const malformed = parseQrContent("upi://pay?");
assert(malformed.isUpi === true, "malformed but valid-scheme still flagged as UPI");
if (malformed.isUpi) {
  assert(malformed.payeeAddress === null, "missing fields default to null, not throw");
}

console.log("\nAll upi.ts self-checks passed.");
