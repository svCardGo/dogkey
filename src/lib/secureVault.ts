/**
 * DogKey Secure Vault
 * - Data key stored in Android Keystore / iOS Keychain via @aparajita/capacitor-secure-storage
 * - Payload encryption: AES-256-GCM (Web Crypto)
 * - Web fallback: sessionStorage only (never localStorage for secrets)
 */
import { Capacitor } from '@capacitor/core';

const VAULT_KEY_ID = 'dogkey_data_key_v1';
const VAULT_META_ID = 'dogkey_vault_meta_v1';

function toB64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let s = '';
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s);
}

function fromB64(b64: string): Uint8Array {
  const s = atob(b64);
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
  return out;
}

async function importAesKey(raw: ArrayBuffer): Promise<CryptoKey> {
  return crypto.subtle.importKey('raw', raw, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
}

async function generateDataKey(): Promise<{ key: CryptoKey; rawB64: string }> {
  const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
  const raw = await crypto.subtle.exportKey('raw', key);
  return { key, rawB64: toB64(raw) };
}

async function secureSet(key: string, value: string): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    try {
      const { SecureStorage } = await import('@aparajita/capacitor-secure-storage');
      await SecureStorage.set(key, value);
      return;
    } catch (e) {
      console.warn('[DogKey vault] SecureStorage set failed, session-only fallback', e);
    }
  }
  sessionStorage.setItem(`dk_secure_${key}`, value);
}

async function secureGet(key: string): Promise<string | null> {
  if (Capacitor.isNativePlatform()) {
    try {
      const { SecureStorage } = await import('@aparajita/capacitor-secure-storage');
      const v = await SecureStorage.get(key);
      return (v as string | null) ?? null;
    } catch {
      /* fall through */
    }
  }
  return sessionStorage.getItem(`dk_secure_${key}`);
}

async function secureRemove(key: string): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    try {
      const { SecureStorage } = await import('@aparajita/capacitor-secure-storage');
      await SecureStorage.remove(key);
    } catch {
      /* ignore */
    }
  }
  sessionStorage.removeItem(`dk_secure_${key}`);
}

export async function encryptString(plaintext: string, key: CryptoKey): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder().encode(plaintext);
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc);
  return `${toB64(iv.buffer)}.${toB64(ct)}`;
}

export async function decryptString(payload: string, key: CryptoKey): Promise<string> {
  const [ivB64, ctB64] = payload.split('.');
  if (!ivB64 || !ctB64) throw new Error('Invalid ciphertext package');
  const iv = fromB64(ivB64);
  const ct = fromB64(ctB64);
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct);
  return new TextDecoder().decode(pt);
}

export async function encryptBytes(data: ArrayBuffer, key: CryptoKey): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data);
  return `${toB64(iv.buffer)}.${toB64(ct)}`;
}

let sessionDataKey: CryptoKey | null = null;

export async function unlockVault(_loginPinVerified: true): Promise<CryptoKey> {
  const existing = await secureGet(VAULT_KEY_ID);
  if (existing) {
    sessionDataKey = await importAesKey(fromB64(existing).buffer as ArrayBuffer);
    return sessionDataKey;
  }
  const { key, rawB64 } = await generateDataKey();
  await secureSet(VAULT_KEY_ID, rawB64);
  await secureSet(VAULT_META_ID, JSON.stringify({ createdAt: new Date().toISOString(), version: 1 }));
  sessionDataKey = key;
  return key;
}

export function getSessionDataKey(): CryptoKey | null {
  return sessionDataKey;
}

export function lockVault(): void {
  sessionDataKey = null;
}

export async function wipeVaultKeys(): Promise<void> {
  sessionDataKey = null;
  await secureRemove(VAULT_KEY_ID);
  await secureRemove(VAULT_META_ID);
}

export async function protectContent(plain: string): Promise<string> {
  const key = sessionDataKey;
  if (!key) return plain;
  return `enc:v1:${await encryptString(plain, key)}`;
}

export async function revealContent(stored: string): Promise<string> {
  if (!stored?.startsWith('enc:v1:')) return stored;
  const key = sessionDataKey;
  if (!key) throw new Error('Vault locked');
  return decryptString(stored.slice(7), key);
}
