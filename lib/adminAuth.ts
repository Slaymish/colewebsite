/**
 * Auth utilities using Web Crypto API — works in both Edge (middleware) and Node.js runtimes.
 */

export const ADMIN_COOKIE = "admin_session";
const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function getSecret(): string {
  return process.env.ADMIN_SECRET || "dev-secret-change-in-production";
}

async function getKey(): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    enc.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

function bufToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function createSessionToken(): Promise<string> {
  const payload = Date.now().toString();
  const key = await getKey();
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return `${payload}.${bufToHex(sig)}`;
}

export async function verifySessionToken(token: string): Promise<boolean> {
  try {
    const dotIdx = token.indexOf(".");
    if (dotIdx === -1) return false;
    const payload = token.slice(0, dotIdx);
    const sigHex = token.slice(dotIdx + 1);

    const ts = parseInt(payload, 10);
    if (isNaN(ts) || Date.now() - ts > SESSION_MAX_AGE_MS) return false;

    const key = await getKey();
    const expectedSig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
    const expectedHex = bufToHex(expectedSig);

    // Constant-time comparison
    if (expectedHex.length !== sigHex.length) return false;
    let ok = true;
    for (let i = 0; i < expectedHex.length; i++) {
      if (expectedHex[i] !== sigHex[i]) ok = false;
    }
    return ok;
  } catch {
    return false;
  }
}

export function getCookieOptions(maxAge: number = SESSION_MAX_AGE_MS / 1000) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}
