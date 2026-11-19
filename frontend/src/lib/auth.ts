export const SESSION_COOKIE_NAME = "nara_session";
export const SESSION_MAX_AGE = 8 * 60 * 60; // 8 jam dalam detik

export interface SessionPayload {
  email: string;
  name: string;
  exp: number; // Unix timestamp dalam detik
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(str: string): Uint8Array {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function getHmacKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

/**
 * Menghasilkan token sesi bertanda tangan HMAC-SHA256 (format: payload.signature)
 */
export async function createSessionToken(
  data: Omit<SessionPayload, "exp">,
  secret: string
): Promise<string> {
  const payload: SessionPayload = {
    ...data,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE,
  };

  const enc = new TextEncoder();
  const payloadBytes = enc.encode(JSON.stringify(payload));
  const b64Payload = base64UrlEncode(payloadBytes);

  const key = await getHmacKey(secret);
  const signatureBytes = new Uint8Array(
    await crypto.subtle.sign("HMAC", key, enc.encode(b64Payload))
  );
  const b64Signature = base64UrlEncode(signatureBytes);

  return `${b64Payload}.${b64Signature}`;
}

/**
 * Memvalidasi token sesi bertanda tangan HMAC-SHA256
 */
export async function verifySessionToken(
  token: string,
  secret: string
): Promise<{ valid: boolean; payload?: SessionPayload }> {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) {
      return { valid: false };
    }

    const [b64Payload, b64Signature] = parts;
    const enc = new TextEncoder();
    const key = await getHmacKey(secret);

    const signatureBytes = base64UrlDecode(b64Signature);
    const isValidSignature = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBytes as BufferSource,
      enc.encode(b64Payload)
    );

    if (!isValidSignature) {
      return { valid: false };
    }

    const payloadBytes = base64UrlDecode(b64Payload);
    const dec = new TextDecoder();
    const payload = JSON.parse(dec.decode(payloadBytes)) as SessionPayload;

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      return { valid: false };
    }

    return { valid: true, payload };
  } catch {
    return { valid: false };
  }
}
