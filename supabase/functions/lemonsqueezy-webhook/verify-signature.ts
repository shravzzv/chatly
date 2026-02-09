import { timingSafeEqual } from "https://deno.land/std@0.177.0/crypto/timing_safe_equal.ts";
/**
 * Accepts:
 *  signatureHeader - the raw X-Signature header from LS
 *  body - the raw request body string
 *  secret - your LS webhook signing secret
 *
 * Returns true if valid.
 */ export async function verifySignature(signatureHeader, body, secret) {
  // LS may send the signature as plain hex or with "sha256=" prefix.
  const normalize = (s)=>s.replace(/^sha256=/, "").trim();
  const receivedHex = normalize(signatureHeader);
  if (!receivedHex) return false;
  // Compute HMAC-SHA256(body, secret) and produce hex
  const enc = new TextEncoder();
  const keyData = enc.encode(secret);
  const bodyData = enc.encode(body);
  const cryptoKey = await crypto.subtle.importKey("raw", keyData, {
    name: "HMAC",
    hash: "SHA-256"
  }, false, [
    "sign"
  ]);
  const sigBuf = await crypto.subtle.sign("HMAC", cryptoKey, bodyData);
  const expectedHex = Array.from(new Uint8Array(sigBuf)).map((b)=>b.toString(16).padStart(2, "0")).join("");
  // Timing-safe comparison
  const receivedBuf = new TextEncoder().encode(receivedHex);
  const expectedBuf = new TextEncoder().encode(expectedHex);
  if (receivedBuf.byteLength !== expectedBuf.byteLength) return false;
  return timingSafeEqual(receivedBuf, expectedBuf);
}
