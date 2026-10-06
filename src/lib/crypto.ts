/**
 * Production PIN protection using Web Crypto API (PBKDF2-SHA-256).
 * Never stores raw Login PIN or Share PIN.
 * Salt is per-user / per-session and persisted with the hash.
 */

const PBKDF2_ITERATIONS = 120_000;
const HASH_BITS = 256;

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function fromHex(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

export async function generateSalt(): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return toHex(salt.buffer);
}

export async function derivePinHash(pin: string, saltHex: string): Promise<string> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(pin),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const salt = fromHex(saltHex);
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    HASH_BITS
  );
  return toHex(bits);
}

export async function verifyPin(
  pin: string,
  saltHex: string,
  expectedHash: string
): Promise<boolean> {
  if (!pin || !saltHex || !expectedHash) return false;
  const derived = await derivePinHash(pin, saltHex);
  if (derived.length !== expectedHash.length) return false;
  let diff = 0;
  for (let i = 0; i < derived.length; i++) {
    diff |= derived.charCodeAt(i) ^ expectedHash.charCodeAt(i);
  }
  return diff === 0;
}

export function buildShareQrPayload(session: {
  id: string;
  ownerId: string;
  expiresAt: string;
  ownerName?: string;
}): string {
  const base = `dogkey://share/${session.id}`;
  const params = new URLSearchParams({
    o: session.ownerId,
    e: session.expiresAt,
  });
  if (session.ownerName) params.set('n', session.ownerName);
  return `${base}?${params.toString()}`;
}

export function parseShareQrPayload(raw: string): {
  sessionId: string;
  ownerId: string;
  expiresAt: string;
  ownerName?: string;
} | null {
  try {
    const url = new URL(raw.replace('dogkey://', 'https://dogkey.local/'));
    const parts = url.pathname.split('/').filter(Boolean);
    if (parts[0] !== 'share' || !parts[1]) return null;
    return {
      sessionId: parts[1],
      ownerId: url.searchParams.get('o') || '',
      expiresAt: url.searchParams.get('e') || '',
      ownerName: url.searchParams.get('n') || undefined,
    };
  } catch {
    return null;
  }
}
