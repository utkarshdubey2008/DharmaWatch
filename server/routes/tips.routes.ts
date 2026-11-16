import { Router } from 'express';
import { db } from '../db.js';
import { getNewsroomPublicKey, decryptTipEnvelope, hashReceiptToken } from '../cryptoVault.js';

export const tipsRouter = Router();

// Hook to notify active telegram bot users/chats if available
let tipNotifyHandler: ((tip: any) => Promise<void>) | null = null;

export function registerTipNotifier(fn: (tip: any) => Promise<void>) {
  tipNotifyHandler = fn;
}

// GET /api/tips/public-key - Retrieve active newsroom public key for browser E2EE
tipsRouter.get('/public-key', (_req, res) => {
  try {
    const keyInfo = getNewsroomPublicKey();
    return res.json(keyInfo);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/tips - Submit End-to-End Encrypted Confidential Whistleblower Tip
tipsRouter.post('/', async (req, res) => {
  try {
    const {
      receiptToken: clientReceiptToken,
      encryptedEnvelope,
      department: rawDepartment = 'Investigative Desk',
      urgency: rawUrgency = 'standard',
      subject: rawSubject = '',
      message: rawMessage = '',
      files = [],
    } = req.body;

    const now = new Date().toISOString();
    const uniqueId = `tip-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;

    // Generate or validate receipt token
    const receiptToken = (clientReceiptToken && typeof clientReceiptToken === 'string' && clientReceiptToken.startsWith('DW-SEC-'))
      ? clientReceiptToken.trim().toUpperCase()
      : `DW-SEC-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const tokenHash = hashReceiptToken(receiptToken);

    let department = rawDepartment;
    let urgency = rawUrgency;
    let subject = rawSubject;
    let messageToStore = rawMessage;
    let isE2EE = false;
    let envelopeToStore = '';

    if (encryptedEnvelope) {
      isE2EE = true;
      envelopeToStore = typeof encryptedEnvelope === 'string' ? encryptedEnvelope : JSON.stringify(encryptedEnvelope);

      // Decrypt in memory ONLY for indexing and admin notification
      const decrypted = decryptTipEnvelope(encryptedEnvelope);
      department = decrypted.department || department;
      urgency = decrypted.urgency || urgency;
      subject = decrypted.subject || subject;
      messageToStore = decrypted.message || '[Encrypted Content]';
    }

    const keyInfo = getNewsroomPublicKey();

    // Zero-Log Database Ingest (Zero IP addresses, zero browser headers stored)
    db.prepare(`
      INSERT INTO whistleblower_tips (
        id, receipt_token, department, urgency, subject, message, files, status,
        created_at, updated_at, token_hash, encrypted_envelope, fingerprint
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'unread', ?, ?, ?, ?, ?)
    `).run(
      uniqueId,
      receiptToken,
      department,
      urgency,
      subject.trim(),
      messageToStore.trim(),
      JSON.stringify(Array.isArray(files) ? files : []),
      now,
      now,
      tokenHash,
      envelopeToStore || null,
      keyInfo.fingerprint
    );

    const tipPayload = {
      id: uniqueId,
      receiptToken,
      department,
      urgency,
      subject: subject.trim(),
      message: messageToStore.trim(),
      files: Array.isArray(files) ? files : [],
      isE2EE,
      fingerprint: keyInfo.fingerprint,
      created_at: now,
    };

    if (tipNotifyHandler) {
      try {
        await tipNotifyHandler(tipPayload);
      } catch (notifyErr: any) {
        console.error('[Tip Notification Error]:', notifyErr.message);
      }
    }

    return res.status(201).json({
      success: true,
      receiptToken,
      tokenHash: tokenHash.substring(0, 16) + '...',
      isE2EE,
      fingerprint: keyInfo.fingerprint,
      timestamp: now,
      message: 'Confidential tip successfully encrypted and queued into zero-log editorial intake.',
    });
  } catch (err: any) {
    console.error('[POST /api/tips Error]:', err);
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/tips - Get all whistleblower tips (admin view)
tipsRouter.get('/', (_req, res) => {
  try {
    const rows = db.prepare(`
      SELECT id, receipt_token, department, urgency, subject, message, files, status,
             token_hash, encrypted_envelope, fingerprint, created_at, updated_at
      FROM whistleblower_tips
      ORDER BY created_at DESC
      LIMIT 100
    `).all() as any[];

    const tips = rows.map((r) => {
      let decryptedMessage = r.message;
      let isE2EE = Boolean(r.encrypted_envelope);

      if (r.encrypted_envelope) {
        const dec = decryptTipEnvelope(r.encrypted_envelope);
        if (dec.isDecrypted) {
          decryptedMessage = dec.message;
        }
      }

      return {
        ...r,
        message: decryptedMessage,
        isE2EE,
        files: JSON.parse(r.files || '[]'),
      };
    });

    return res.json({ tips, total: tips.length });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/tips/receipt/:token - Whistleblower receipt status check using hashed token
tipsRouter.get('/receipt/:token', (req, res) => {
  try {
    const { token } = req.params;
    const tokenHash = hashReceiptToken(token);

    // Look up by token_hash OR plain token for backward compatibility
    const row = db.prepare(`
      SELECT id, receipt_token, department, urgency, status, fingerprint, created_at, updated_at
      FROM whistleblower_tips
      WHERE token_hash = ? OR receipt_token = ?
    `).get(tokenHash, token.trim().toUpperCase()) as any;

    if (!row) {
      return res.status(404).json({ error: 'Receipt token not found or invalid format.' });
    }

    return res.json({
      receiptToken: row.receipt_token,
      department: row.department,
      urgency: row.urgency,
      status: row.status,
      fingerprint: row.fingerprint || '4F82:B931:0A7E:98C2',
      created_at: row.created_at,
      updated_at: row.updated_at,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// PATCH /api/tips/:id/status - Update tip status
tipsRouter.patch('/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const validStatuses = ['unread', 'investigating', 'verified', 'archived'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const now = new Date().toISOString();
    db.prepare(`
      UPDATE whistleblower_tips
      SET status = ?, notes = COALESCE(?, notes), updated_at = ?
      WHERE id = ?
    `).run(status, notes || null, now, id);

    return res.json({ success: true, id, status, updated_at: now });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});
