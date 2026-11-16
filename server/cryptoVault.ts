/**
 * DharmaWatch Cryptographic Vault & End-to-End Encryption Engine
 * Zero-Knowledge Whistleblower Intake Protocol
 * Standards: RSA-OAEP-256 (Asymmetric Envelope) + AES-256-GCM (Payload Cipher)
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const dataDir = process.env.DATA_DIR || path.resolve(import.meta.dirname, '..', 'data');
const keysDir = path.join(dataDir, 'keys');

if (!fs.existsSync(keysDir)) {
  fs.mkdirSync(keysDir, { recursive: true, mode: 0o700 });
}

const keyPath = path.join(keysDir, 'newsroom_vault_key.json');

interface KeyStore {
  publicKey: string;
  privateKey: string;
  fingerprint: string;
  createdAt: string;
}

let keyStore: KeyStore | null = null;

function computeFingerprint(pem: string): string {
  const clean = pem.replace(/-----[^\n]+-----/g, '').replace(/\s+/g, '');
  const hash = crypto.createHash('sha256').update(Buffer.from(clean, 'base64')).digest('hex');
  return hash.match(/.{1,4}/g)?.slice(0, 8).join(':').toUpperCase() || hash.substring(0, 32).toUpperCase();
}

export function initCryptoVault(): KeyStore {
  if (keyStore) return keyStore;

  if (fs.existsSync(keyPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
      if (data.publicKey && data.privateKey) {
        keyStore = data;
        return keyStore!;
      }
    } catch (e: any) {
      console.error('[CryptoVault] Failed to load key file, regenerating:', e.message);
    }
  }

  // Generate a dedicated 2048-bit RSA-OAEP keypair
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });

  const fingerprint = computeFingerprint(publicKey);
  const now = new Date().toISOString();

  keyStore = {
    publicKey,
    privateKey,
    fingerprint,
    createdAt: now,
  };

  fs.writeFileSync(keyPath, JSON.stringify(keyStore, null, 2), { mode: 0o600 });
  console.log(`[CryptoVault] Initialized new Newsroom RSA-OAEP Keypair (Fingerprint: ${fingerprint})`);
  return keyStore;
}

export function getNewsroomPublicKey() {
  const vault = initCryptoVault();
  return {
    pem: vault.publicKey,
    fingerprint: vault.fingerprint,
    algorithm: 'RSA-OAEP-256 + AES-256-GCM',
    version: 'DHARMAWATCH-E2EE-v2',
  };
}

export function hashReceiptToken(token: string): string {
  const normalized = token.trim().toUpperCase();
  return crypto.createHash('sha256').update(`DW_RECEIPT_SALT_2026_${normalized}`).digest('hex');
}

export function decryptTipEnvelope(envelope: any): {
  subject: string;
  department: string;
  urgency: string;
  message: string;
  contactHandle?: string;
  files?: string[];
  clientTimestamp?: string;
  isDecrypted: boolean;
} {
  const vault = initCryptoVault();

  // If envelope is a string, attempt parsing
  let parsed = envelope;
  if (typeof envelope === 'string') {
    try {
      // Remove any armor lines
      const cleanJson = envelope
        .replace(/-----BEGIN ENCRYPTED TIP ENVELOPE-----/g, '')
        .replace(/-----END ENCRYPTED TIP ENVELOPE-----/g, '')
        .trim();
      parsed = JSON.parse(cleanJson);
    } catch (err: any) {
      // Return as unencrypted or raw
      return {
        subject: 'Encrypted Submission',
        department: 'Investigative Desk',
        urgency: 'standard',
        message: envelope,
        isDecrypted: false,
      };
    }
  }

  if (!parsed || !parsed.encryptedKey || !parsed.iv || !parsed.ciphertext) {
    return {
      subject: parsed?.subject || 'Submission',
      department: parsed?.department || 'Investigative Desk',
      urgency: parsed?.urgency || 'standard',
      message: parsed?.message || JSON.stringify(parsed),
      isDecrypted: false,
    };
  }

  try {
    // 1. Decrypt ephemeral AES key using Newsroom RSA Private Key
    const encKeyBuf = Buffer.from(parsed.encryptedKey, 'base64');
    const aesKey = crypto.privateDecrypt(
      {
        key: vault.privateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
      },
      encKeyBuf
    );

    // 2. Decrypt AES-256-GCM payload
    const iv = Buffer.from(parsed.iv, 'base64');
    let ciphertextBuf = Buffer.from(parsed.ciphertext, 'base64');
    let authTagBuf: Buffer | null = null;

    if (parsed.tag) {
      authTagBuf = Buffer.from(parsed.tag, 'base64');
    } else if (ciphertextBuf.length > 16) {
      // In Web Crypto, AES-GCM appends the 16-byte tag to the ciphertext
      authTagBuf = ciphertextBuf.subarray(ciphertextBuf.length - 16);
      ciphertextBuf = ciphertextBuf.subarray(0, ciphertextBuf.length - 16);
    }

    const decipher = crypto.createDecipheriv('aes-256-gcm', aesKey, iv);
    if (authTagBuf) {
      decipher.setAuthTag(authTagBuf);
    }

    const decrypted = Buffer.concat([decipher.update(ciphertextBuf), decipher.final()]).toString('utf8');
    const payload = JSON.parse(decrypted);

    return {
      subject: payload.subject || 'Confidential Disclosure',
      department: payload.department || 'Investigative Projects Desk',
      urgency: payload.urgency || 'standard',
      message: payload.message || '',
      contactHandle: payload.contactHandle || undefined,
      files: Array.isArray(payload.files) ? payload.files : [],
      clientTimestamp: payload.clientTimestamp,
      isDecrypted: true,
    };
  } catch (decErr: any) {
    console.error('[CryptoVault Decrypt Error]:', decErr.message);
    return {
      subject: 'Decryption Error (Cipher Damaged)',
      department: 'Investigative Desk',
      urgency: 'standard',
      message: `[DECRYPTION ERROR: ${decErr.message}]\nRaw ciphertext preserved at rest.`,
      isDecrypted: false,
    };
  }
}
